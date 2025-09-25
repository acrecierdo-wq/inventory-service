// app/api/admin/users/send-credentials/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sendCredentialsEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
    try {
        const admin = await currentUser();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (admin.publicMetadata?.role !== "admin")
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { email, username, tempPassword } = await req.json();
        if (!email || !username || !tempPassword)
            return NextResponse.json({ error: "Missing fields" } , { status: 400 });

        await sendCredentialsEmail(email, username, tempPassword);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[send-credentials] error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
