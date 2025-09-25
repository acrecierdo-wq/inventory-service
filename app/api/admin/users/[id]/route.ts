// app/api/admin/users/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

type RouteContext = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await currentUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.publicMetadata?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const userId = params.id;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { action, newRole } = body as { action?: string; newRole?: string };

    // fetch current user first so we can merge metadata
    const existing = await clerkClient.users.getUser(userId);
    const currentMetadata = existing.publicMetadata || {};

    if (action === "deactivate") {
      // mark status as deactivated
      await clerkClient.users.updateUser(userId, {
        publicMetadata: { ...currentMetadata, status: "deactivated" },
      });
    } else if (action === "activate") {
      // mark status as active
      await clerkClient.users.updateUser(userId, {
        publicMetadata: { ...currentMetadata, status: "active" },
      });
    } else if (action === "changeRole") {
      if (!newRole) return NextResponse.json({ error: "newRole is required" }, { status: 400 });
      const allowedRoles = ["warehouseman", "sales"];
      if (!allowedRoles.includes(newRole))
        return NextResponse.json({ error: "Invalid newRole" }, { status: 400 });

      await clerkClient.users.updateUser(userId, {
        publicMetadata: { ...currentMetadata, role: newRole },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[PUT /api/admin/users/${params?.id}] update staff error:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

