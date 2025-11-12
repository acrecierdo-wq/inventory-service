// // app/api/admin/users/[id]/route.ts
// import { NextResponse, NextRequest } from "next/server";
// import { currentUser } from "@clerk/nextjs/server";
// import { clerkClient } from "@clerk/clerk-sdk-node";

// type RouteContext = { params: Promise<{ id: string }> };

// export async function PUT(req: NextRequest, context: RouteContext) {
//   const { id } = await context.params;

//   try {
//     const admin = await currentUser();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     if (admin.publicMetadata?.role !== "admin")
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     const userId = id;
//     const body = await req.json().catch(() => null);
//     if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

//     const { action, newRole } = body as { action?: string; newRole?: string };

//     // fetch current user first so we can merge metadata
//     const existing = await clerkClient.users.getUser(userId);
//     const currentMetadata = existing.publicMetadata || {};

//     if (action === "deactivate") {
//       // mark status as deactivated
//       await clerkClient.users.updateUser(userId, {
//         publicMetadata: { ...currentMetadata, status: "deactivated" },
//       });
//     } else if (action === "activate") {
//       // mark status as active
//       await clerkClient.users.updateUser(userId, {
//         publicMetadata: { ...currentMetadata, status: "active" },
//       });
//     } else if (action === "changeRole") {
//       if (!newRole) return NextResponse.json({ error: "newRole is required" }, { status: 400 });
//       const allowedRoles = ["warehouseman", "sales"];
//       if (!allowedRoles.includes(newRole))
//         return NextResponse.json({ error: "Invalid newRole" }, { status: 400 });

//       await clerkClient.users.updateUser(userId, {
//         publicMetadata: { ...currentMetadata, role: newRole },
//       });
//     } else {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error(`[PUT /api/admin/users/${id}] update staff error:`, error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { db } from "@/db/drizzle";
import { personnelAccounts, audit_logs } from "@/db/schema";
import { eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

interface UpdateRequestBody {
  action?: "deactivate" | "activate" | "changeRole";
  newRole?: "warehouseman" | "sales" | "admin" | "purchasing";
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    // 🔒 Verify admin
    const admin = await currentUser();
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.publicMetadata?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = (await req.json().catch(() => null)) as UpdateRequestBody | null;
    if (!body)
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { action, newRole } = body;

    const staffRecord = await db
      .select()
      .from(personnelAccounts)
      .where(eq(personnelAccounts.id, Number(id)));

    if (!staffRecord.length) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const clerkId = staffRecord[0].clerkId;

    // 🔍 Fetch user
    const targetUser = await clerkClient.users.getUser(clerkId);
    const currentMetadata = targetUser.publicMetadata || {};
    const userEmail =
      targetUser.emailAddresses?.[0]?.emailAddress ?? "Unknown";

    let description = "";
    let dbUpdates: Partial<typeof personnelAccounts.$inferInsert> = {};

    if (action === "deactivate") {
      // 🚫 Disable sign-in via Clerk
      await clerkClient.users.banUser(clerkId);
      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: { ...currentMetadata, status: "deactivated" },
      });

      dbUpdates = { status: "Inactive" };
      description = `Deactivated user ${userEmail}`;
    } else if (action === "activate") {
      // ✅ Re-enable sign-in
      await clerkClient.users.unbanUser(clerkId);
      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: { ...currentMetadata, status: "active" },
      });

      dbUpdates = { status: "Active" };
      description = `Activated user ${userEmail}`;
    } else if (action === "changeRole") {
      if (!newRole)
        return NextResponse.json({ error: "newRole is required" }, { status: 400 });

      const allowedRoles = ["warehouseman", "sales", "purchasing", "admin"];
      if (!allowedRoles.includes(newRole as string))
        return NextResponse.json({ error: "Invalid newRole" }, { status: 400 });

      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: { ...currentMetadata, role: newRole },
      });

      dbUpdates = { role: newRole as "warehouseman" | "sales" | "purchasing" | "admin" };
      description = `Changed role of ${userEmail} to ${newRole}`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // 🗃️ Update local database
   if (Object.keys(dbUpdates).length > 0) {
     await db
      .update(personnelAccounts)
      .set(dbUpdates)
      .where(eq(personnelAccounts.id, Number(id)));
   }

    // 🪵 Insert audit log
    await db.insert(audit_logs).values({
      entity: "Personnel Account",
      entityId: id,
      action: action?.toUpperCase() ?? "UPDATE",
      description,
      actorId: admin.id,
      actorName:
        `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || "Admin",
      actorRole: "admin",
      module: "Admin / User Management",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[PUT /api/admin/users/${id}] update staff error:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
