// app/api/units/[id]/route.ts
import { db } from '@/db/drizzle';
import { units, items } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: 'Invalid unit ID' }, { status: 400 });
  }

  try {
    const result = await db
      .update(units)
      .set({ name: body.name })
      .where(eq(units.id, id))
      .returning();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  if(isNaN(id)) {
    return NextResponse.json({ success: false, message: 'Invalid unit ID' }, { status: 400 });
  }

  try {
    // Check if any items are using this unit
    const inUse = await db.select().from(items).where(eq(items.unitId, id)).limit(1);

    if (inUse.length > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete: Unit is in use." },
        { status: 400 }
      );
    }

    const deleted = await db.delete(units).where(eq(units.id, id)).returning();
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

