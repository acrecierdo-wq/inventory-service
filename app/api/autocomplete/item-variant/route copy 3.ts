// api/autocomplete/item-variant/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { items, variants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const sizeId = searchParams.get("sizeId");

  if (!itemId || !sizeId) return NextResponse.json([]);

  const results = await db
    .selectDistinct({ id: variants.id, name: variants.name })
    .from(items)
    .leftJoin(variants, eq(items.variantId, variants.id))
    .where(and(eq(items.id, Number(itemId)), eq(items.sizeId, Number(sizeId))));
    
  return NextResponse.json(results.filter(r => r.id !== null));
}
