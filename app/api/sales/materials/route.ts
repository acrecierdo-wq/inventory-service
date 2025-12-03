import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { materials } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

// GET: Fetch all materials with optional search
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim() || "";

    let query = db.select().from(materials);

    // ✅ Case-insensitive search using ILIKE (PostgreSQL)
    if (search) {
      query = query.where(
        sql`(
          LOWER(${materials.materialName}) LIKE LOWER(${`%${search}%`})
          OR 
          LOWER(${materials.specifications}) LIKE LOWER(${`%${search}%`})
        )`
      ) as typeof query;
    }

    const result = await query.orderBy(desc(materials.addedAt));

    return NextResponse.json({
      success: true,
      materials: result,
      count: result.length,
      searchQuery: search || null,
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

// POST: Add new material
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { materialName, specifications, pricePerKg, addedBy } = body;

    if (!materialName || !pricePerKg || !addedBy) {
      return NextResponse.json(
        {
          success: false,
          error: "Material name, price, and addedBy are required",
        },
        { status: 400 }
      );
    }

    const price = parseFloat(pricePerKg);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid price per kg" },
        { status: 400 }
      );
    }

    // ✅ Check for duplicate material name (case-insensitive)
    const normalizedName = materialName.trim().toLowerCase();
    const existingMaterial = await db
      .select()
      .from(materials)
      .where(sql`LOWER(TRIM(${materials.materialName})) = ${normalizedName}`)
      .limit(1);

    if (existingMaterial.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Material "${materialName.trim()}" already exists`,
        },
        { status: 409 } // 409 Conflict
      );
    }

    const [newMaterial] = await db
      .insert(materials)
      .values({
        materialName: materialName.trim(),
        specifications: specifications?.trim() || null,
        pricePerKg: price.toFixed(2),
        addedBy,
        addedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      material: newMaterial,
      message: "Material added successfully",
    });
  } catch (error) {
    console.error("Error adding material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add material" },
      { status: 500 }
    );
  }
}