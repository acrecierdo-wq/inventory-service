// api/inventory-options/route.ts

import { db } from "@/db/drizzle";
import { items, sizes, variants, units } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
        return new Response(JSON.stringify({ sizes: [], variants: [], units: []}), { status: 200 });
    }

    // GEt all matching items
    const rows = await db
    .select({
        sizeId: items.sizeId,
        sizeName: sizes.name,
        variantId: items.variantId,
        variantName: variants.name,
        unitId: items.unitId,
        unitName: units.name,
    })
    .from(items)
    .leftJoin(sizes, eq(items.sizeId, sizes.id))
    .leftJoin(variants, eq(items.variantId, variants.id))
    .leftJoin(units, eq(items.unitId, units.id))
    .where(eq(items.name, itemId));

    // deduplicate options
    const sizesSet = new Map<number, string>();
    const variantsSet = new Map<number, string>();
    const unitsSet = new Map<number, string>();

    rows.forEach(r => {
        if (r.sizeId) sizesSet.set(r.sizeId, r.sizeName || "");
        if (r.variantId) variantsSet.set(r.variantId, r.variantName || "");
        if (r.unitId) unitsSet.set(r.unitId, r.unitName || "");
    });

    return new Response(JSON.stringify({
        sizes: Array.from(sizesSet, ([id, name]) => ({ id, name })),
        variants: Array.from(variantsSet, ([id, name]) => ({ id, name })),
        units: Array.from(unitsSet, ([id, name]) => ({ id, name })),
    }), { status: 200 });
}