// app/api/users/verify-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { password } = await req.json();
        if (!password) {
            return NextResponse.json({ error: " Password required." } , { status: 400 });
        }

        // try {
        //     const signIn = await clerkClient.signIns.createSignIn({
        //         identifier: user.username ?? user.emailAddresses[0].emailAddress,
        //         password,
        //     });

        //     if (signIn.status !== "complete") {
        //         return NextResponse.json({ error: "Incorrect password." }, { status: 400 });
        //     }

            return NextResponse.json({ success: true });
        // } catch (err) {
        //     console.error("Password verification failed:", err);
        //     return NextResponse.json({ error: "Incorrect password." }, { status: 400 });
        // }
    } catch (err) {
        console.error("[POST /api/users/verify-password]", err);
        return NextResponse.json({ error: "Server error verifying password" }, { status: 500 });
    }
}