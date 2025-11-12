// app/api/purchasing/suppliers/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { currentUser } from "@clerk/nextjs/server";
import { suppliers, audit_logs } from '@/db/schema';

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = user.publicMetadata?.role;
        if (role !== "purchasing" && role !== "admin") {
            return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });
        }

        const body = await req.json();
        const now = new Date();

        const safeBody = {
            ...body,
            createdAt: body.createdAt ? new Date(body.createdAt) : now,
            updatedAt: now,
        };

        const [newSupplier] = await db
        .insert(suppliers)
        .values(safeBody)
        .returning();

        await db.insert(audit_logs).values({
            entity: "Supplier",
            entityId: newSupplier.id?.toString(),
            action: "ADD",
            description: `Supplier "${newSupplier.supplierName}" was addded.`,
            actorId: user.id,
            actorName: user.fullName || user.firstName || user.emailAddresses[0].emailAddress || "System",
            actorRole: role || "purchasing",
            module: "Purchasing - Suppliers",
            timestamp: now,
        })
        return NextResponse.json(newSupplier);
    } catch (error) {
        console.error("Error creating supplier:", error);
        return NextResponse.json({ error: "Failed to create supplier." }, { status: 500 });
    }
}

export async function GET() {
    try {
        const data = await db
        .select()
        .from(suppliers);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Errir fetching suppliers:", error);
        return NextResponse.json({ error: "Failed to fetch suppliers." }, { status: 500 });
    }
}