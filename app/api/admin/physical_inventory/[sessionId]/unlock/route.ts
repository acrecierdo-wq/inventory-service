// app/api/admin/physical_inventory/[sessionId]/unlock/route.ts

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse, NextRequest } from "next/server";

// type RouteContext = {
//   params: Promise<{ sessionId: string }>;
// };

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password, itemId } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    // Fetch user
    const user = await clerkClient.users.getUser(userId);

    // Check if password login is enabled
    if (!user.passwordEnabled) {
      return NextResponse.json(
        {
          error: "This account does not support password verification.",
        },
        { status: 400 }
      );
    }

    // Verify password
    const verify = await clerkClient.users.verifyPassword({
      userId,
      password,
    });

    if (!verify || !verify.verified) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: "Password verified. Item unlocked.",
      itemId,
    });
  } catch (err) {
    console.error("UNLOCK ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
