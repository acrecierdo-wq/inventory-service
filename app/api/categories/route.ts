// app/api/categories/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body.name.trim();

  try {

    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name));

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Category already exists" });
    }

    const newCategory = await db
      .insert(categories)
      .values({ name })
      .returning(); // <-- good to have, returns the inserted row

    return NextResponse.json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Category POST error:", error);
    return NextResponse.json({ success: false, message: "Category already exists" }, { status: 500});
  }
}

export async function GET() {
  try {
    const allCategories = await db.select().from(categories);
    return NextResponse.json({ success: true, data: allCategories });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}
