import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { materials } from "@/db/schema";
import { sql } from "drizzle-orm";

interface BulkMaterialInput {
  materialName: string;
  specifications: string | null;
  pricePerKg: number;
  addedBy: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { materials: materialsToImport } = body as {
      materials: BulkMaterialInput[];
    };

    if (!Array.isArray(materialsToImport) || materialsToImport.length === 0) {
      return NextResponse.json(
        { success: false, error: "No materials provided" },
        { status: 400 }
      );
    }

    // Validate each material
    for (const material of materialsToImport) {
      if (!material.materialName || !material.pricePerKg || !material.addedBy) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid material data: missing required fields",
          },
          { status: 400 }
        );
      }

      if (isNaN(material.pricePerKg) || material.pricePerKg <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid price for ${material.materialName}`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ Check for duplicates in existing materials
    const normalizedNames = materialsToImport.map((m) =>
      m.materialName.trim().toLowerCase()
    );

    const existingMaterials = await db
      .select()
      .from(materials)
      .where(
        sql`LOWER(TRIM(${materials.materialName})) IN (${sql.join(
          normalizedNames.map((n) => sql`${n}`),
          sql`, `
        )})`
      );

    if (existingMaterials.length > 0) {
      const duplicateNames = existingMaterials
        .map((m) => m.materialName)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          error: `Duplicate materials found: ${duplicateNames}`,
        },
        { status: 409 }
      );
    }

    // ✅ Check for duplicates within the import batch itself
    const seenNames = new Set<string>();
    const batchDuplicates: string[] = [];

    for (const material of materialsToImport) {
      const normalized = material.materialName.trim().toLowerCase();
      if (seenNames.has(normalized)) {
        batchDuplicates.push(material.materialName);
      } else {
        seenNames.add(normalized);
      }
    }

    if (batchDuplicates.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Duplicate materials in import: ${batchDuplicates.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Bulk insert
    const insertedMaterials = await db
      .insert(materials)
      .values(
        materialsToImport.map((m) => ({
          materialName: m.materialName.trim(), // ✅ Trim whitespace
          specifications: m.specifications?.trim() || null,
          pricePerKg: m.pricePerKg.toFixed(2),
          addedBy: m.addedBy,
          addedAt: new Date(),
          updatedAt: new Date(),
        }))
      )
      .returning();

    return NextResponse.json({
      success: true,
      count: insertedMaterials.length,
      message: `Successfully imported ${insertedMaterials.length} materials`,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import materials" },
      { status: 500 }
    );
  }
}