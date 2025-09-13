// app/api/units/[id]/route.ts
import { db } from '@/db/drizzle';
import { units, items } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse, NextRequest  } from 'next/server';

type RouteContext = {
  params: Promise <{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext ) {
  const { id } = await context.params;
  const body = await req.json();
  const unitsId = Number(id);

  if (isNaN(unitsId)) {
    return NextResponse.json({ success: false, message: 'Invalid unit ID' }, { status: 400 });
  }

  try {
    const result = await db
      .update(units)
      .set({ name: body.name })
      .where(eq(units.id, unitsId))
      .returning();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const unitsId = Number(id);

  if(isNaN(unitsId)) {
    return NextResponse.json({ success: false, message: 'Invalid unit ID' }, { status: 400 });
  }

  try {
    // Check if any items are using this unit
    const inUse = await db.select().from(items).where(eq(items.unitId, unitsId)).limit(1);

    if (inUse.length > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete: Unit is in use." },
        { status: 400 }
      );
    }

    const deleted = await db.delete(units).where(eq(units.id, unitsId)).returning();
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

