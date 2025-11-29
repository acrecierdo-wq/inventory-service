// // // app/api/admin/users/[id]/route.ts
// // import { NextResponse, NextRequest } from "next/server";
// // import { currentUser } from "@clerk/nextjs/server";
// // import { clerkClient } from "@clerk/clerk-sdk-node";

// // type RouteContext = { params: Promise<{ id: string }> };

// // export async function PUT(req: NextRequest, context: RouteContext) {
// //   const { id } = await context.params;

// //   try {
// //     const admin = await currentUser();
// //     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// //     if (admin.publicMetadata?.role !== "admin")
// //       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

// //     const userId = id;
// //     const body = await req.json().catch(() => null);
// //     if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

// //     const { action, newRole } = body as { action?: string; newRole?: string };

// //     // fetch current user first so we can merge metadata
// //     const existing = await clerkClient.users.getUser(userId);
// //     const currentMetadata = existing.publicMetadata || {};

// //     if (action === "deactivate") {
// //       // mark status as deactivated
// //       await clerkClient.users.updateUser(userId, {
// //         publicMetadata: { ...currentMetadata, status: "deactivated" },
// //       });
// //     } else if (action === "activate") {
// //       // mark status as active
// //       await clerkClient.users.updateUser(userId, {
// //         publicMetadata: { ...currentMetadata, status: "active" },
// //       });
// //     } else if (action === "changeRole") {
// //       if (!newRole) return NextResponse.json({ error: "newRole is required" }, { status: 400 });
// //       const allowedRoles = ["warehouseman", "sales"];
// //       if (!allowedRoles.includes(newRole))
// //         return NextResponse.json({ error: "Invalid newRole" }, { status: 400 });

// //       await clerkClient.users.updateUser(userId, {
// //         publicMetadata: { ...currentMetadata, role: newRole },
// //       });
// //     } else {
// //       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
// //     }

// //     return NextResponse.json({ success: true });
// //   } catch (error) {
// //     console.error(`[PUT /api/admin/users/${id}] update staff error:`, error);
// //     return NextResponse.json({ error: "Server error" }, { status: 500 });
// //   }
// // }

// import { NextResponse, NextRequest } from "next/server";
// import { currentUser } from "@clerk/nextjs/server";
// import { clerkClient } from "@clerk/clerk-sdk-node";
// import { db } from "@/db/drizzle";
// import { personnelAccounts, audit_logs } from "@/db/schema";
// import { eq } from "drizzle-orm";

// type RouteContext = { params: Promise<{ id: string }> };

// interface UpdateRequestBody {
//   action?: "deactivate" | "activate";
// }

// export async function PUT(req: NextRequest, context: RouteContext) {
//   const { id } = await context.params;

//   try {
//     // 🔒 Verify admin
//     const admin = await currentUser();
//     if (!admin)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     if (admin.publicMetadata?.role !== "admin")
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     const body = (await req.json().catch(() => null)) as UpdateRequestBody | null;
//     if (!body)
//       return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

//     const { action } = body;

//     const staffRecord = await db
//       .select()
//       .from(personnelAccounts)
//       .where(eq(personnelAccounts.id, Number(id)));

//     if (!staffRecord.length) {
//       return NextResponse.json({ error: "Staff not found" }, { status: 404 });
//     }

//     const clerkId = staffRecord[0].clerkId;

//     // 🔍 Fetch user
//     const targetUser = await clerkClient.users.getUser(clerkId);
//     const currentMetadata = targetUser.publicMetadata || {};
//     const userEmail =
//       targetUser.emailAddresses?.[0]?.emailAddress ?? "Unknown";

//     let description = "";
//     const dbUpdates: Partial<typeof personnelAccounts.$inferInsert> = {};

//     if (action === "deactivate") {
//       // 🚫 Disable sign-in via Clerk
//       await clerkClient.users.banUser(clerkId);
//       await clerkClient.users.updateUser(clerkId, {
//         publicMetadata: { ...currentMetadata, status: "deactivated" },
//       });

//       //dbUpdates = { status: "Inactive" };
//       description = `Deactivated user ${userEmail}`;
//     } else if (action === "activate") {
//       // ✅ Re-enable sign-in
//       await clerkClient.users.unbanUser(clerkId);
//       await clerkClient.users.updateUser(clerkId, {
//         publicMetadata: { ...currentMetadata, status: "active" },
//       });

//       //dbUpdates = { status: "Active" };
//       description = `Activated user ${userEmail}`;
//     } else {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     // 🗃️ Update local database
//    if (Object.keys(dbUpdates).length > 0) {
//      await db
//       .update(personnelAccounts)
//       .set(dbUpdates)
//       .where(eq(personnelAccounts.id, Number(id)));
//    }

//     // 🪵 Insert audit log
//     await db.insert(audit_logs).values({
//       entity: "Personnel Account",
//       entityId: id,
//       action: action?.toUpperCase() ?? "UPDATE",
//       description,
//       actorId: admin.id,
//       actorName:
//         `${admin.username || ""}`.trim() || "Admin",
//       actorRole: "admin",
//       module: "Admin / User Management",
//     });

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
  action?: "deactivate" | "activate";
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    // 🔒 Verify admin
    const admin = await currentUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = admin.publicMetadata?.role;
        if ( role !== "admin" ) {
            return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });
        }

    const body = (await req.json().catch(() => null)) as UpdateRequestBody | null;
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { action } = body;

    const staffRecord = await db
      .select()
      .from(personnelAccounts)
      .where(eq(personnelAccounts.id, Number(id)));

    if (!staffRecord.length) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const clerkId = staffRecord[0].clerkId;
    if (!clerkId) return NextResponse.json({ error: "Clerk ID not set for this user" }, { status: 400 });

    // 🔍 Fetch user from Clerk
    const targetUser = await clerkClient.users.getUser(clerkId);
    const currentMetadata = targetUser.publicMetadata || {};
    const userEmail = targetUser.emailAddresses?.[0]?.emailAddress ?? "unknown@example.com";

    let description = "";
    const dbUpdates: Partial<typeof personnelAccounts.$inferInsert> = {};

    if (action === "deactivate") {
      await clerkClient.users.banUser(clerkId);
      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: { ...currentMetadata, status: "deactivated" },
      });
      dbUpdates.status = "Inactive";
      description = `Deactivated user ${userEmail}`;
    } else if (action === "activate") {
      await clerkClient.users.unbanUser(clerkId);
      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: { ...currentMetadata, status: "active" },
      });
      dbUpdates.status = "Active";
      description = `Activated user ${userEmail}`;
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
    const actorName = `${admin.username ?? "Admin"}`.trim();
    await db.insert(audit_logs).values({
      entity: "Personnel Account",
      entityId: id,
      action: "UPDATE",
      description,
      actorId: admin.id,
      actorName,
      actorRole: role || "admin",
      module: "Admin / User Management",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[PUT /api/admin/users/${id}] update staff error:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
