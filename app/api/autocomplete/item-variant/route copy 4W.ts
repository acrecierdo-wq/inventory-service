// api/autocomplete/item-variant/route.ts

import { db } from "@/db/drizzle";
import { items, variants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
        return new Response(JSON.stringify([]), { status: 200 });
    }

    const results = await db
        .select({
            id: variants.id,
            name: variants.name,
        })
        .from(items)
        .leftJoin(variants, eq(items.variantId, variants.id))
        .where(eq(items.id, Number(itemId)));

    let formatted = results
        .filter(r => r.id !== null) // keep only valid variants
        .map(r => ({ id: r.id!, name: r.name! }));

    if (formatted.length === 0) {
        formatted = [{ id: 0, name: "(None)" }];
    }

    return new Response(JSON.stringify(formatted), { status: 200 });
}
