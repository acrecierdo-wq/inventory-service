// app/api/admin/clients/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { clients } from '@/db/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    const now = new Date();

    try {
        const body = await req.json();
        const safeBody = {
            ...body,
            createdAt: body.createdAt ? new Date(body.createdAt) : now,
            updatedAt: now,
        };

        const updated = await db
            .update(clients)
            .set(safeBody)
            .where(eq(clients.id, Number(id)))
            .returning();
        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Error updating clients:", error);
        return NextResponse.json({ error: "Failed to update clients." }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    try {
        await db.delete(clients).where(eq(clients.id, Number(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error delete clients:", error);
        return NextResponse.json({ error: "Failed to delete clients" }, { status: 500 });
    }
}


// ✅ GET supplier details by ID
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, Number(id)))
      .limit(1);

    if (!client.length) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client[0]);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client details" },
      { status: 500 }
    );
  }
}
