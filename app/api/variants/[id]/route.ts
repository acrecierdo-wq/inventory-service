// app/api/variants/[id]/route.ts
import { db } from '@/db/drizzle';
import { items, variants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

type RouteContext = { 
  params: Promise <{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext ) {
  const { id } = await  context.params;
  const body = await req.json();
  const variantsId = Number(id);

  if (isNaN(variantsId)) {
    return NextResponse.json({ success: false, message: 'Invalid variant ID' }, { status: 400 });
  }

  try {
    const result = await db
      .update(variants)
      .set({ name: body.name })
      .where(eq(variants.id, variantsId))
      .returning();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext ) {
  const { id } = await context.params;
  const variantsId = Number(id);

  if(isNaN(variantsId)) {
    return NextResponse.json({ success: false, message: 'Invalid variant ID' }, { status: 400 });
  }

  try {
    // Check if any items are using this variant
    const inUse = await db.select().from(items).where(eq(items.variantId, variantsId)).limit(1);

    if (inUse.length > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete: Variant is in use." },
        { status: 400 }
      );
    }

    const deleted = await db.delete(variants).where(eq(variants.id, variantsId)).returning();
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

