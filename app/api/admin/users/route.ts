// app/api/admin/users/route.ts

import { NextResponse, NextRequest } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        // verify tha caller is logged in
        const admin = await currentUser();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // verify they have admin role
        if (admin.publicMetadata?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { username, email, password, role } = await req.json();

        if (!username || !email || !password || !role) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const allowedRoles = ["warehouseman", "sales"];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        

        const client = await clerkClient();

        // create the staff user in Clerk
        const user = await client.users.createUser({
            username,
            emailAddress: [email],
            password,
            publicMetadata: {
                role,
                mustChangePassword: true,
            },
        });

        return NextResponse.json({ success: true, userId: user.id });
    } catch (error) {
        console.error("create staff error");
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const admin = await currentUser();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (admin.publicMetadata?.role !== "admin")
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clerkClient();

    const users = await client.users.getUserList({ limit: 50 });

    const staff = users.data
        .filter(
            u =>
                u.publicMetadata?.role === "warehouseman" ||
                u.publicMetadata?.role === "sales"
        )
        .map(u => ({
            id: u.id,
            username: u.username,
            email: u.emailAddresses[0]?.emailAddress,
            role: u.publicMetadata?.role,
            status: u.banned ? "deactivated" : "active",
        }));

        return NextResponse.json({ staff });
    } catch (error) {
        console.error("list staff error");
        return NextResponse.json({ error: "Service error" }, { status: 500 });
    }
}