// app/api/units/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { units } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body.name.trim();

  try {

    const existing = await db
      .select()
      .from(units)
      .where(eq(units.name, name));

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Unit already exists.' });
    }

    const newUnit = await db
      .insert(units) 
      .values({ name })
      .returning(); // <-- good to have, returns the inserted row

    return NextResponse.json({ success: true, data: newUnit });
  } catch (error) {
    console.error('Unit POST error:', error);
    return NextResponse.json({ success: false, message: "Unit already exists." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allUnits = await db.select().from(units);
    return NextResponse.json({ success: true, data: allUnits });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
  }
}
