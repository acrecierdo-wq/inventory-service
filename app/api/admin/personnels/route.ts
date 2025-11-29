// app/api/admin/personnels/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { currentUser } from "@clerk/nextjs/server";
import { personnels, audit_logs } from '@/db/schema';

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

        const [newPersonnels] = await db
        .insert(personnels)
        .values(safeBody)
        .returning();

        await db.insert(audit_logs).values({
            entity: "Personnels",
            entityId: newPersonnels.id?.toString(),
            action: "ADD",
            description: `Personnel "${newPersonnels.personnelName}" was addded.`,
            actorId: user.id,
            actorName: user.username || "Admin",
            actorRole: role || "Admin",
            module: "Admin / Personnels",
            timestamp: now,
        })
        return NextResponse.json(newPersonnels);
    } catch (error) {
        console.error("Error creating personnel:", error);
        return NextResponse.json({ error: "Failed to create personnel." }, { status: 500 });
    }
}

export async function GET() {
    try {
        const data = await db
        .select()
        .from(personnels);
        return NextResponse.json({ personnels: data });
    } catch (error) {
        console.error("Error fetching personnel:", error);
        return NextResponse.json({ error: "Failed to fetch personnel." }, { status: 500 });
    }
}