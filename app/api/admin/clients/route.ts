// app/api/admin/clients/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { currentUser } from "@clerk/nextjs/server";
import { clients, audit_logs } from '@/db/schema';

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = user.publicMetadata?.role;
        if ( role !== "admin" ) {
            return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });
        }

        const body = await req.json();
        const now = new Date();

        const safeBody = {
            ...body,
            createdAt: body.createdAt ? new Date(body.createdAt) : now,
            updatedAt: now,
        };

        const [newClient] = await db
        .insert(clients)
        .values(safeBody)
        .returning();

        await db.insert(audit_logs).values({
            entity: "Clients",
            entityId: newClient.id?.toString(),
            action: "ADD",
            description: `Client "${newClient.clientName}" was addded.`,
            actorId: user.id,
            actorName: user.username || "Admin",
            actorRole: role || "Admin",
            module: "Admin / Clients",
            timestamp: now,
        })
        return NextResponse.json(newClient);
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Failed to create client." }, { status: 500 });
    }
}

export async function GET() {
    try {
        const data = await db
        .select()
        .from(clients);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json({ error: "Failed to fetch clients." }, { status: 500 });
    }
}