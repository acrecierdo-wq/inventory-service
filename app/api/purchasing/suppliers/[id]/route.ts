// app/api/purchasing/suppliers/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { suppliers } from '@/db/schema';
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
            .update(suppliers)
            .set(safeBody)
            .where(eq(suppliers.id, Number(id)))
            .returning();
        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Error updating supplier:", error);
        return NextResponse.json({ error: "Failed to update supplier." }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    try {
        await db.delete(suppliers).where(eq(suppliers.id, Number(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error delete supplier:", error);
        return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
    }
}


// ✅ GET supplier details by ID
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, Number(id)))
      .limit(1);

    if (!supplier.length) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier[0]);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier details" },
      { status: 500 }
    );
  }
}
