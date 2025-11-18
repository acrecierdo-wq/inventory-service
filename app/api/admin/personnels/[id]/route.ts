// app/api/admin/personnels/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { personnels } from '@/db/schema';
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
            .update(personnels)
            .set(safeBody)
            .where(eq(personnels.id, Number(id)))
            .returning();
        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Error updating personnels:", error);
        return NextResponse.json({ error: "Failed to update personnels." }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    try {
        await db.delete(personnels).where(eq(personnels.id, Number(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error delete personnels:", error);
        return NextResponse.json({ error: "Failed to delete personne" }, { status: 500 });
    }
}


// ✅ GET supplier details by ID
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const personnel = await db
      .select()
      .from(personnels)
      .where(eq(personnels.id, Number(id)))
      .limit(1);

    if (!personnel.length) {
      return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
    }

    return NextResponse.json(personnel[0]);
  } catch (error) {
    console.error("Error fetching personnel:", error);
    return NextResponse.json(
      { error: "Failed to fetch personnel details" },
      { status: 500 }
    );
  }
}
