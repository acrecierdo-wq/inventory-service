// app/api/sizes/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { sizes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body.name.trim();

  try {

    const existing = await db
      .select()
      .from(sizes)
      .where(eq(sizes.name, name));

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Size already exists." });
    }

    const newSize = await db
      .insert(sizes)
      .values({ name })
      .returning(); // <-- good to have, returns the inserted row

    return NextResponse.json({ success: true, data: newSize });
  } catch (error) {
    console.error("Size POST error:", error);
    return NextResponse.json({ success: false, message: "Size already exists." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allSizes = await db.select().from(sizes);
    return NextResponse.json({ success: true, data: allSizes });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}
