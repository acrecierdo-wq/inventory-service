// app/api/items/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { items, categories, units, variants, sizes } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const [newItem] = await db
      .insert(items)
      .values({
        name: body.name,
        categoryId: body.categoryId,
        unitId: body.unitId,
        variantId: body.variantId,
        sizeId: body.sizeId,
        stock: body.stock ?? 0,
        reorderLevel: body.reorderLevel ?? 30,
        criticalLevel: body.criticalLevel ?? 20,
        ceilingLevel: body.ceilingLevel ?? 100,
        status: body.status ?? 'No Stock',
        isActive: true,
      })
      .returning();

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error('Insert error in POST /api/items:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create item', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET
export async function GET() {
  try {
    const allItems = await db
      .select({
        id: items.id,
        name: items.name,
        category: categories,
        unit: units,
        variant: variants,
        size: sizes,
        stock: items.stock,
        status: items.status,
        reorderLevel: items.reorderLevel,
        criticalLevel: items.criticalLevel,
        ceilingLevel: items.ceilingLevel,
      })
      .from(items)
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .leftJoin(units, eq(items.unitId, units.id))
      .leftJoin(variants, eq(items.variantId, variants.id))
      .leftJoin(sizes, eq(items.sizeId, sizes.id));

    return NextResponse.json({ success: true, data: allItems });
  } catch (error) {
    console.error('Fetch error in GET /api/items:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch items', error: (error as Error).message },
      { status: 500 }
    );
  }
}
