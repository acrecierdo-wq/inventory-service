// app/api/suggestions/route.ts

import { db } from "@/db/drizzle";
import { items, sizes, variants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    // fetch all items ( includes joins for sizes and variants )
    const allItems = await db
    .select({
        name: items.name,
        size: sizes.name,
        variants: variants.name,
    })
    .from(items)
    .leftJoin(sizes, eq(items.sizeId, sizes.id))
    .leftJoin(variants, eq(items.variantId, variants.id));

    // remove duplicates from each field
    const uniqueNames = [...new Set(allItems.map(i => i.name).filter(Boolean))];
    const uniqueSizes = [...new Set(allItems.map(i => i.size).filter(Boolean))];
    const uniqueVariants = [...new Set(allItems.map(i => i.variants).filter(Boolean))];

    return NextResponse.json({
        names: uniqueNames,
        sizes: uniqueSizes,
        variants: uniqueVariants,
    });
}
