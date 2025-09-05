// api/autocomplete/item-size/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { items, sizes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) return NextResponse.json([]);

    const results = await db
    .selectDistinct({ id: sizes.id, name: sizes.name })
    .from(items)
    .leftJoin(sizes, eq(items.sizeId, sizes.id))
    .where(eq(items.id, Number(itemId)));

    return NextResponse.json(results.filter(r => r.id !== null));
}