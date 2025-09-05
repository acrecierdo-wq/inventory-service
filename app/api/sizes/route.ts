// app/api/sizes/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { sizes } from '@/db/schema';

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newSize = await db.insert(sizes).values({
      name: body.name,
     }).returning(); // <-- good to have, returns the inserted row

    return NextResponse.json({ success: true, data: newSize });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message });
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
