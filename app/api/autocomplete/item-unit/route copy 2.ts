// api/autocomplete/item-unit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { units } from "@/db/schema";
import { ilike } from "drizzle-orm";

// GET /api/autocomplete/item-name?query=pla
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") ?? "";

    if (!query || query.length < 1) {
        return NextResponse.json([]);
    }

    const suggestions = await db
    .selectDistinct({ id: units.id, name: units.name })
    .from(units)
    .where(ilike(units.name, `%${query}%`))
    .limit(50); // limit to 50 suggestions

    const uniqueUnits = Array.from(
        new Set(suggestions.map((s) => s.name.toLowerCase()))
    ).map((lowerName) => 
    suggestions.find((s) => s.name.toLowerCase() === lowerName)
);

uniqueUnits.sort((a, b) => a!.name.localeCompare(b!.name));

    return NextResponse.json(uniqueUnits.slice(0, 10));
}