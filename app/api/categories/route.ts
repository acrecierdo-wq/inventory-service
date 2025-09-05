// app/api/categories/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { categories } from '@/db/schema';

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const newCategory = await db.insert(categories).values({
      name: body.name,
    }).returning(); // <-- good to have, returns the inserted row

    return NextResponse.json({ success: true, data: newCategory });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
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
