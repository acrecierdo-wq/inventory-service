// app/api/units/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { units } from '@/db/schema';

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newUnit = await db.insert(units).values({
      name: body.name,
     }).returning(); // <-- good to have, returns the inserted row

    return NextResponse.json({ success: true, data: newUnit });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
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
