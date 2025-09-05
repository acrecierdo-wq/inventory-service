// app/api/variants/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { variants } from '@/db/schema';

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newVariant = await db.insert(variants).values({
      name: body.name,
     }).returning(); // <-- good to have, returns the inserted row

    return NextResponse.json({ success: true, data: newVariant });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
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
