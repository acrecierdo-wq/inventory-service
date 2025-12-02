// app/api/sales/phase_updates/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { phase_updates } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

//POST
export async function POST(req: NextRequest) {
  try {
    const { requestId, phaseIndex, status, notes } = await req.json();

    if (!requestId || phaseIndex === undefined || !status) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const newUpdate = await db.insert(phase_updates).values({
      requestId,
      phaseIndex,
      status,
      notes,
    }).returning();

    return NextResponse.json({ success: true, data: newUpdate });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

//GET
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json({ success: false, error: "Missing requestId" }, { status: 400 });
    }

    const updates = await db
      .select()
      .from(phase_updates)
      .where(eq(phase_updates.requestId, Number(requestId)))
      .orderBy(desc(phase_updates.id));

      return NextResponse.json({ success: true, data: updates });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}