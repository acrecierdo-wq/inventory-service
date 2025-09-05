// api/autocomplete/item-variant/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { variants } from "@/db/schema";
import { ilike } from "drizzle-orm";

// GET /api/autocomplete/item-name?query=pla
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") ?? "";

    if (!query || query.length < 1) {
        return NextResponse.json([]);
    }

    const suggestions = await db
    .selectDistinct({ name: variants.name })
    .from(variants)
    .where(ilike(variants.name, `%${query}%`))
    .limit(50); // limit to 50 suggestions

    const uniqueVariants = Array.from(
        new Set(suggestions.map((s) => s.name.toLowerCase()))
    ).map((lowerName) => 
    suggestions.find((s) => s.name.toLowerCase() === lowerName)
);

uniqueVariants.sort((a, b) => a!.name.localeCompare(b!.name));

    return NextResponse.json(uniqueVariants.slice(0, 10));
}