// // app/api/admin/users/route.ts
// import { NextResponse, NextRequest } from "next/server";
// import { currentUser } from '@clerk/nextjs/server';
// import { clerkClient } from '@clerk/clerk-sdk-node'; // import the constructor
// import crypto from "crypto";

// console.log('typeof clerkClient:', typeof clerkClient);

// export async function POST(req: NextRequest) {
//   try {
//     // ensure caller is admin
//     const admin = await currentUser();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     if (admin.publicMetadata?.role !== "admin")
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     // parse body
//     const body = await req.json().catch(() => null);
//     if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

//     const { username, email, role } = body;

//     if (!email || !role) {
//       return NextResponse.json({ error: "Missing fields(email, role are erquired)" }, { status: 400 });
//     }
//     const allowedRoles = ["warehouseman", "sales"];
//     if (!allowedRoles.includes(role)) {
//       return NextResponse.json({ error: "Invalid role" }, { status: 400 });
//     }

//     // generate a secure random password
//     const tempPassword = crypto.randomBytes(12).toString("hex");

//     console.log({ username, email, tempPassword });

//     // create the user in clerk
//     const normalizedUsername = username.toUpperCase();
//     const prefix = role ==="warehouseman" ? "W-" : "S-";
//     const finalUsername = `${prefix}${normalizedUsername}`

//     console.log({ finalUsername, email, tempPassword });

//     const user = await clerkClient.users.createUser({
//   username: finalUsername,
//   emailAddress: [email],
//   password: tempPassword,
//   publicMetadata: {
//     employeeCode: normalizedUsername,
//     role,
//     mustChangePassword: true,
//   },
// });

//     // return everthing needed
//     return NextResponse.json({
//       success: true,
//       userId: user.id,
//       username: user.username,
//       email,
//       tempPassword,
//     });
//   } catch (error) {
//     console.error("[POST /api/admin/users] create staff error:", JSON.stringify(error, null, 2));
//     return NextResponse.json({ error: "Server error while creating user" }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
    
//     const admin = await currentUser();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     if (admin.publicMetadata?.role !== "admin")
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     //const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY! });
//     const users = await clerkClient.users.getUserList({ limit: 200 }); // increase limit if needed

//     const staff = users.data
//       .filter((u) => ["warehouseman", "sales"].includes(u.publicMetadata?.role as string))
//       .map((u) => ({
//         id: u.id,
//         username: u.publicMetadata?.employeeCode ?? u.username,
//         // backend user object has emailAddresses array
//         email: u.emailAddresses?.[0]?.emailAddress ?? null,
//         role: u.publicMetadata?.role ?? null,
//         status: u.publicMetadata?.status ?? "active",
//       }));

//     return NextResponse.json({ staff });
//   } catch (err) {
//     console.error("[GET /api/admin/users] list staff error:", err);
//     return NextResponse.json({ error: "Service error" }, { status: 500 });
//   }
// }

// app/api/admin/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import crypto from "crypto";
import { db } from "@/db/drizzle";
import { personnelAccounts, audit_logs } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    // 🔒 Check if the requester is admin
    const admin = await currentUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.publicMetadata?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 🧾 Parse request
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { username, email, role } = body;
    if (!email || !role || !username)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // 🧩 Allowable roles
    const allowedRoles = ["warehouseman", "sales", "purchasing", "admin"];
    if (!allowedRoles.includes(role))
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // 🔐 Generate a secure temporary password
    const tempPassword = crypto.randomBytes(12).toString("hex");

    // 🏷️ Normalize username
    const normalizedUsername = username.toUpperCase();
    let prefix = "";
    switch (role) {
      case "warehouseman":
        prefix = "W-";
        break;
      case "sales":
        prefix = "S-";
        break;
      case "purchasing":
        prefix = "P-";
        break;
      case "admin":
        prefix = "A-";
        break;
    }
    const finalUsername = `${prefix}${normalizedUsername}`;

    // 👤 Create the user in Clerk
    const user = await clerkClient.users.createUser({
      username: finalUsername,
      emailAddress: [email],
      password: tempPassword,
      publicMetadata: {
        employeeCode: normalizedUsername,
        role,
        mustChangePassword: true,
      },
    });

    // 🗃️ Insert into local personnel_accounts
    await db.insert(personnelAccounts).values({
      clerkId: user.id,
      personnelId: body.personnelId ?? undefined,
      // username: finalUsername,
      // email: email,
      role: role,
      // status: "Active",
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
      email,
      tempPassword,
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
    const personnel = await db.select().from(personnelAccounts);

    return NextResponse.json({ staff: personnel });
  } catch (err) {
    console.error("[GET /api/admin/users] Error:", err);
    return NextResponse.json({ error: "Service error" }, { status: 500 });
  }
}
