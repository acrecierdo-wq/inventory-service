// app/api/categories/[id]/route.ts
import { db } from '@/db/drizzle';
import { items, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const body = await req.json();
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: 'Invalid category ID' }, { status: 400 });
  }

  try {
    const result = await db
      .update(categories)
      .set({ name: body.name })
      .where(eq(categories.id, id))
      .returning();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid category ID' },
      { status: 400 }
    );
  }

  try {
    console.log("Attempting to delete category with ID:", id);

    // Check if any items are using this category
    const inUse = await db
      .select()
      .from(items)
      .where(eq(items.categoryId, id))
      .limit(1);

    console.log("Items found using category:", inUse);

    if (inUse.length > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete: Category is in use." },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    console.log("Deleted category:", deleted);

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}