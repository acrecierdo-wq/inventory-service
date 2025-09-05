// api/autocomplete/item-unit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { items, units } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const sizeId = searchParams.get("sizeId");
    const variantId = searchParams.get("variantId");

    if (!itemId || !sizeId || !variantId) return NextResponse.json([]);

    const results = await db
    .selectDistinct({ id: units.id, name: units.name })
    .from(items)
    .leftJoin(units, eq(items.unitId, units.id))
    .where(and(eq(items.id, Number(itemId)), eq(items.sizeId, Number(sizeId)), eq(items.variantId, Number(variantId))));

    return NextResponse.json(results.filter(r => r.id !== null));
}