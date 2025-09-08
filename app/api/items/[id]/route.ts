// app/api/items/[id]/route.ts

import { db } from '@/db/drizzle';
import { items } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse, NextRequest  } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
}

// PUT (Update item)
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await req.json();
  const itemId = Number(id);

  try {
    const result = await db
      .update(items)
      .set({
        name: body.name,
        categoryId: body.categoryId,
        unitId: body.unitId,
        variantId: body.variant,
        sizeId: body.size,
        stock: body.stock ?? 0,
        reorderLevel: body.reorderLevel ?? 30,
        criticalLevel: body.criticalLevel ?? 20,
        ceilingLevel: body.ceilingLevel ?? 100,
        status: body.status ?? 'No Stock',
        isActive: body.isActive,
      })
      .where(eq(items.id, itemId))
      .returning();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}

// DELETE (Delete item)
export async function DELETE(_req: NextRequest, context: RouteContext ) {
  const { id } = await context.params;
  const itemId = Number(id);

  try {
    const result = await db.delete(items).where(eq(items.id, itemId)).returning();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message });
  }
}
