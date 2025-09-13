// api/replenishment/route.ts

import { db } from "@/db/drizzle";
import {
  itemReplenishments,
  replenishmentItems,
  items as itemsTable,
  sizes,
  variants,
  units,
} from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid or missing items array."}, { status: 400 });
    }

    const {
      supplier,
      poRefNum,
      drRefNum,
      remarks,
      items: updatedItems,
      recordedBy,
    } = body;

    const rawIsDraft = body.isDraft;
    const isDraft = rawIsDraft === true || String(rawIsDraft).toLowerCase() === "draft";
    console.log("[POST /api/replenishment] isDraft computed:", isDraft);

    console.log("Incoming POST /api/replenishment payload:", {
      supplier,
      poRefNum,
      drRefNum,
      recordedBy,
      items: updatedItems,
    });

    console.log(`[PUT /api/replenishment] raw isDraft from body:`, body.isDraft);
    console.log(`[PUT /api/replenishment] computed isDraft boolean:`, isDraft);

    const warning: string[] = [];
    const validatedItems: Map<string, typeof itemsTable.$inferSelect> = new Map();

    // Validate all items BEFORE doing anything else
    const mismatchesOverall: Record<string, { field: string; expected: unknown; received: unknown }[]> = {};

    for (const item of updatedItems) {
      const itemData = await db.query.items.findFirst({
        where: eq(itemsTable.id, item.itemId),
      });

      if (!itemData) {
        mismatchesOverall[item.itemId] = [
          { field: "itemId", expected: item.itemId, received: "Not found in DB" },
        ];
        continue;
      }

      const mismatches: { field: string; expected: unknown; received: unknown }[] = [];

      // Normalize IDs: treat 0, undefined, or empty string as null
      const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
      const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
      const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

      // check name if provided
      if (item.name && itemData.name !== item.name) {
        mismatches.push({ field: "name", expected: itemData.name, received: item.name });
      }

      if ((itemData.sizeId ?? null) !== sizeId) {
        mismatches.push({ field: "sizeId", expected: itemData.sizeId, received: sizeId });
      }

      if ((itemData.variantId ?? null) !== variantId) {
        mismatches.push({ field: "variantId", expected: itemData.variantId, received: variantId });
      }

      if ((itemData.unitId ?? null) !== unitId) {
        mismatches.push({ field: "unitId", expected: itemData.unitId, received: unitId });
      }


      if (mismatches.length > 0) {
        mismatchesOverall[item.itemId] = mismatches;
        continue;
      } 

      validatedItems.set(item.itemId, itemData);
    }

    if (Object.keys(mismatchesOverall).length > 0) {
      console.log("Validation failed for items:", mismatchesOverall);
      return NextResponse.json({ error: "Item ID validation failed.", details: mismatchesOverall }, { status: 400 });
    }

    // Insert main replneishment record 
    const [newReplenishments] = await db
      .insert(itemReplenishments)
      .values({
        supplier,
        poRefNum,
        remarks,
        drRefNum,
        status: isDraft ? "Draft" : "Replenished",
        replenishedAt: isDraft ? null : new Date(),
        recordedBy,
      })
      .returning();

      // Insert replinishment items and update stock
      for (const item of updatedItems) {
        const itemData = validatedItems.get(item.itemId);
        if (!itemData) continue;

        const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
        const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
        const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

        console.log(`[POST inserting replenishment item ${item.itemId} qty=${item.quantity}]`);

        await db.insert(replenishmentItems).values({
          replenishmentId: newReplenishments.id,
          itemId: item.itemId,
          sizeId,
          variantId,
          unitId,
          quantity: item.quantity,
        });

        if (!isDraft) {
          const newStock = itemData.stock + item.quantity;

          let stockStatus = "In Stock";
        
            if (newStock > itemData.ceilingLevel) {
            stockStatus = "Overstock";
            warning.push(`⚠️${itemData.name} is now overstocked.`);
          }

          console.log(`[POST] updating stock for ${item.itemId} ${itemData.stock} -> ${newStock}`);
          await db
          .update(itemsTable)
          .set({ stock: newStock, status: stockStatus })
          .where(eq(itemsTable.id, item.itemId));

        }
      }

      return NextResponse.json({ message: isDraft ? "Replenishment saved as draft." : "Replenishment saved successfully!", warning, replenishmentId: newReplenishments.id, }, { status: 200 });
      
  } catch (error: unknown) {
    console.error("Replenishment POST error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred..", details: error instanceof Error ? error.message : String(error),}), { status: 500, headers: { "Content-Type": "application/json"},});
  }
}
export async function GET() {
  try {
    const replenishmentRecords = await db
      .select({
        id: itemReplenishments.id,
        supplier: itemReplenishments.supplier,
        poRefNum: itemReplenishments.poRefNum,
        drRefNum: itemReplenishments.drRefNum,
        status: itemReplenishments.status,
        remarks: itemReplenishments.remarks,
        replenishedAt: itemReplenishments.replenishedAt,
        createdAt: itemReplenishments.createdAt,
        recordedBy: itemReplenishments.recordedBy,
      })
      .from(itemReplenishments)
      .orderBy(sql`COALESCE(${itemReplenishments.replenishedAt}, ${itemReplenishments.createdAt}) DESC`);

    const results = [];

    for (const replenishments of replenishmentRecords) {
      const replenishedItems = await db
        .select({
          itemId: replenishmentItems.itemId,
          itemName: itemsTable.name,
          quantity: replenishmentItems.quantity,
          sizeId: replenishmentItems.sizeId,
          variantId: replenishmentItems.variantId,
          unitId: replenishmentItems.unitId,
          sizeName: sizes.name,
          variantName: variants.name,
          unitName: units.name,
        })
        .from(replenishmentItems)
        .where(eq(replenishmentItems.replenishmentId, replenishments.id))
        .leftJoin(itemsTable, eq(replenishmentItems.itemId, itemsTable.id))
        .leftJoin(sizes, eq(replenishmentItems.sizeId, sizes.id))
        .leftJoin(variants, eq(replenishmentItems.variantId, variants.id))
        .leftJoin(units, eq(replenishmentItems.unitId, units.id));

      // Normalize IDs: convert 0 > null
      const normalizedItems = replenishedItems.map((item) => ({
        ...item,
        sizeId: item.sizeId ?? null,
        variantId: item.variantId ?? null,
        unitId: item.unitId ?? null,
      }));

      results.push({
        ...replenishments,
        items: normalizedItems,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/replenishment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch replenishment records." },
      { status: 500 }
    );
  }
}
