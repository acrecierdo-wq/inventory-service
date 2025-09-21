// import { NextResponse, NextRequest } from "next/server";
// import { clerkClient, currentUser } from "@clerk/nextjs/server";

// type RouteContext = {
//   params: { id: string };
// };

// export async function PUT(req: NextRequest, { params }: RouteContext) {
//   try {
//     const admin = await currentUser();
//     if (!admin) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     if (admin.publicMetadata?.role !== "admin") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const { action, newRole } = await req.json();
//     const userId = params.id;

//     if (action === "deactivate") {
//       await clerkClient.users.updateUser(userId, { banned: true });
//     } else if (action === "activate") {
//       await clerkClient.users.updateUser(userId, { banned: false });
//     } else if (action === "changeRole" && newRole) {
//       await clerkClient.users.updateUser(userId, {
//         publicMetadata: { role: newRole },
//       });
//     } else {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("update staff error", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// app/api/admin/users/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

console.log('typeof clerkClient:', typeof clerkClient);

type RouteContext = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    //const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY! });

    const admin = await currentUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.publicMetadata?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const userId = params.id;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { action, newRole } = body as { action?: string; newRole?: string };

    if (action === "deactivate") {
      // ban the user (server-side)
      await clerkClient.users.banUser(userId);
    } else if (action === "activate") {
      // unban
      await clerkClient.users.unbanUser(userId);
    } else if (action === "changeRole") {
      if (!newRole) return NextResponse.json({ error: "newRole is required" }, { status: 400 });
      const allowedRoles = ["warehouseman", "sales"];
      if (!allowedRoles.includes(newRole))
        return NextResponse.json({ error: "Invalid newRole" }, { status: 400 });

      // fetch existing user metadata, merge so we don't clobber other fields
      const existing = await clerkClient.users.getUser(userId);
      const mergedPublicMetadata = { ...(existing.publicMetadata || {}), role: newRole };

      await clerkClient.users.updateUser(userId, {
        publicMetadata: mergedPublicMetadata,
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(`[PUT /api/admin/users/${params?.id}] update staff error:`, err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

