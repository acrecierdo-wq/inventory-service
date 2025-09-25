// api/users/change-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function PUT(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { newPassword } = await req.json();

        if (!newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // try {
        //     await clerkClient.sessions.createSession({
        //         identifier: user.username ?? user.emailAddresses[0].emailAddress,
        //         password: currentPassword,
        //     });
        // } catch (error) {
        //     console.error("Current password os incorrect", error);
        //     return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        // }
        console.log("[PUT /api/users/change-password] called by user:", user.id);
        console.log("[PUT /api/users/change-password] clearing mustChangePassword");

        await clerkClient.users.updateUser(user.id, {
            password: newPassword,
            publicMetadata: {
                ...user.publicMetadata,
                mustChangePassword: false,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PUT /api/users/change-password] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500});
    }
}