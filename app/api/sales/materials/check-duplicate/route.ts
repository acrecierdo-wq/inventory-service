import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { materials } from "@/db/schema";
import { eq, and, not, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");
    const excludeId = searchParams.get("excludeId");

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Material name is required" },
        { status: 400 }
      );
    }

    // Trim and normalize the name (case-insensitive, trim whitespace)
    const normalizedName = name.trim().toLowerCase();

    // Build query conditions
    const conditions = [
      sql`LOWER(TRIM(${materials.materialName})) = ${normalizedName}`,
    ];

    // If excludeId provided (for edit mode), exclude that material
    if (excludeId) {
      conditions.push(not(eq(materials.id, parseInt(excludeId))));
    }

    const existingMaterial = await db
      .select()
      .from(materials)
      .where(and(...conditions))
      .limit(1);

    return NextResponse.json({
      success: true,
      isDuplicate: existingMaterial.length > 0,
      existingMaterial: existingMaterial[0] || null,
    });
  } catch (error) {
    console.error("Error checking duplicate material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check duplicate" },
      { status: 500 }
    );
  }
}