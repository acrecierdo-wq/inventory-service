// app/api/variants/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { variants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body.name.trim();

  try {
const existing = await db
    .select()
    .from(variants)
    .where(eq(variants.name, name));

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Variant alread exists." }, { status: 400 });
    }

    const newVariant = await db
      .insert(variants)
      .values({ name })
      .returning(); // <-- good to have, returns the inserted row

    return NextResponse.json({ success: true, data: newVariant });
  } catch (error) {
    console.error("Variant POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to add variant." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allVariants = await db.select().from(variants);
    return NextResponse.json({ success: true, data: allVariants });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}
