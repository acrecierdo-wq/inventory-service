import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { materials } from "@/db/schema";
import { eq, sql, and, not } from "drizzle-orm";

// PUT: Update material
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { materialName, specifications, pricePerKg } = body;
    const materialId = parseInt(id);

    if (isNaN(materialId)) {
      return NextResponse.json(
        { success: false, error: "Invalid material ID" },
        { status: 400 }
      );
    }

    if (!materialName || !pricePerKg) {
      return NextResponse.json(
        { success: false, error: "Material name and price are required" },
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

    // ✅ Check for duplicate material name (excluding current material)
    const normalizedName = materialName.trim().toLowerCase();
    const existingMaterial = await db
      .select()
      .from(materials)
      .where(
        and(
          sql`LOWER(TRIM(${materials.materialName})) = ${normalizedName}`,
          not(eq(materials.id, materialId))
        )
      )
      .limit(1);

    if (existingMaterial.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Material "${materialName.trim()}" already exists`,
        },
        { status: 409 }
      );
    }

    const [updatedMaterial] = await db
      .update(materials)
      .set({
        materialName: materialName.trim(), // ✅ Trim whitespace
        specifications: specifications?.trim() || null,
        pricePerKg: price.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(materials.id, materialId))
      .returning();

    if (!updatedMaterial) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      material: updatedMaterial,
      message: "Material updated successfully",
    });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update material" },
      { status: 500 }
    );
  }
}

// DELETE: Delete material
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialId = parseInt(id);

    if (isNaN(materialId)) {
      return NextResponse.json(
        { success: false, error: "Invalid material ID" },
        { status: 400 }
      );
    }

    await db.delete(materials).where(eq(materials.id, materialId));

    return NextResponse.json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete material" },
      { status: 500 }
    );
  }
}