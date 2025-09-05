// api/items-with-details/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { items, sizes, variants, units } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function GET() {
    try {
        const all = await db
        .select({
            itemId: items.id,
            itemName: items.name,
            sizeId: sizes.id,
            sizeName: sizes.name,
            variantId: variants.id,
            variantName: variants.name,
            unitId: units.id,
            unitName: units.name,
        })
        .from(items)
        .leftJoin(sizes, eq(items.sizeId, sizes.id))
        .leftJoin(variants, eq(items.variantId, variants.id))
        .leftJoin(units, eq(items.unitId, units.id));

        return NextResponse.json({ success: true, data: all });
    } catch {
        return NextResponse.json({ succesS: false, message: "Failed to fetch items." });
    }
}