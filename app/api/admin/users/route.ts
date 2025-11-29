// app/api/admin/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/db/drizzle";
import { personnelAccounts, audit_logs, personnels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // 🔒 Check if the requester is admin
    const admin = await currentUser();
    if (!admin) 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (admin.publicMetadata?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 🧾 Parse request
    const body = await req.json().catch(() => null);
    if (!body) 
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { username, email, role, personnelId } = body;

    if (!email || !role || !username || !personnelId)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // 🧩 Allowable roles
    const allowedRoles = ["warehouseman", "sales", "purchasing", "admin"];
    if (!allowedRoles.includes(role))
      return NextResponse.json({ error: "Please select a role" }, { status: 400 });

    // prevent duplicate account for the same personnel, one account for one personnel
    const existing = await db
      .select()
      .from(personnelAccounts)
      .where(eq(personnelAccounts.personnelId, personnelId));

    if (existing.length > 0) {
      return NextResponse.json({ error: "This personnel already has an account." }, { status: 400 });
    }

        // 🔍 Get personnelName from personnels table
const personnelRecord = await db
  .select({
    personnelName: personnels.personnelName,
  })
  .from(personnels)
  .where(eq(personnels.id, personnelId))
  .limit(1);

const personnelName = personnelRecord[0]?.personnelName || null;

if (!personnelName) {
  return NextResponse.json(
    { error: "Personnel not found in master list." },
    { status: 404 }
  );
}

    // 🔐 Generate a secure temporary password
    const tempPassword = crypto.randomBytes(6).toString("base64url");

    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    const rolePrefix: Record<string, string> = {
      warehouseman: "w",
      sales: "s",
      purchasing: "p",
      admin: "a",
    };

    let sanitized = username.toLowerCase().replace(/[^a-z0-9_\-]/g, "");

    if (sanitized.length < 2) {
      sanitized = crypto.randomBytes(3).toString("hex");
    }

    const finalUsername = `${rolePrefix[role]}_${sanitized}`;
  
    console.log("DEBUG Clerk Payload:", {
  username: finalUsername,
  emailAddress: [email],
  tempPassword,
});

    // 👤 Create the user in Clerk
  const user = await clerkClient.users.createUser({
    username: finalUsername,
    emailAddress: [email],
    password: tempPassword,
    publicMetadata: {
      employeeCode: sanitized,
      role,
      mustChangePassword: true,
    },
});

    // 🗃️ Insert into local personnel_accounts
    await db.insert(personnelAccounts).values({
      personnelId,
      username: finalUsername,
      email,
      passwordHash,
      role,
      status: "Active",
    });
    

    // 🪵 Log audit trail
    await db.insert(audit_logs).values({
      entity: "Personnel Account",
      entityId: user.id,
      action: "CREATE",
      description: `Created ${role} account for ${email}`,
      actorId: admin.id,
      actorName: `${admin.username || ""}`.trim() || "Admin",
      actorRole: "admin",
      module: "Admin / User Management",
    });

    return NextResponse.json({
  success: true,
  userId: user.id,
  username: finalUsername,
  personnelName,  // ✅ now this will have the actual name
  email,
  tempPassword,
  createdAt: new Date().toISOString(),
});

  } catch (error) {
    console.error("[POST /api/admin/users] Error:", error);
    return NextResponse.json(
      { error: "Server error while creating user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const admin = await currentUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.publicMetadata?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 🧾 Get all personnel from DB instead of Clerk
    const accounts = await db.select().from(personnelAccounts);

    return NextResponse.json({ staff: accounts });
  } catch (err) {
    console.error("[GET /api/admin/users] Error:", err);
    return NextResponse.json({ error: "Failed to fetch user accounts" }, { status: 500 });
  }
}
