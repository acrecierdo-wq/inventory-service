// api/replenishment/[id]/route.ts

import { db } from "@/db/drizzle";
import {
  itemReplenishments,
  replenishmentItems,
  items as itemsTable,
  sizes, variants, units,
} from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const replenishmentId = Number(id);

    if (!replenishmentId || isNaN(replenishmentId)) {
      return NextResponse.json({ error: "Invalid replenishment ID." }, { status: 400 });
    }

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid or missing items array." }, { status: 400 });
    }

    const {
      supplier,
      poRefNum,
      drRefNum,
      remarks,
      items: updatedItems,
      recordedBy,
    } = body;

    // normalize saveAsDraft
    const rawIsDraft = body.isDraft;
    const isDraft = rawIsDraft === true || String(rawIsDraft).toLowerCase() === "draft";
      console.log(`[PUT /api/replenishment] isDraft computed:`, isDraft);


    console.log("Incoming PUT /api/replenishment payload:", {
      replenishmentId,
      supplier,
      poRefNum,
      drRefNum,
      remarks,
      items: updatedItems,
      recordedBy,
    });

    console.log(`[PUT /api/replenishment] raw isDraft from body:`, body.isDraft);
    console.log(`[PUT /api/replenishment] computed isDraft boolean:`, isDraft);

    const warning: string[] = [];
    const validatedItems: Map<string, typeof itemsTable.$inferSelect> = new Map();

    // Validate items
    const mismatchesOverall: Record<string, { field: string; expected: unknown; received: unknown }[]> = {};

    for (const item of updatedItems) {
      const itemData = await db.query.items.findFirst({
        where: eq(itemsTable.id, item.itemId),
      });

      if (!itemData) {
        mismatchesOverall[item.itemId] = [
          {field: "itemId", expected: item.itemId, received: "Not found in DB",},
        ];
        continue;
      }

      const mismatches: { field: string; expected: unknown; received: unknown }[] = [];

      const sizeId =
        item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
      const variantId =
        item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
      const unitId =
        item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

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
      return NextResponse.json(
        { error: "Item ID validation failed.", details: mismatchesOverall },
        { status: 400 }
      );
    }

    // Update main replenishment record
    await db.update(itemReplenishments)
      .set({
        supplier,
        poRefNum,
        drRefNum,
        remarks,
        status: isDraft ? "Draft" : "Replenished",
        replenishedAt: isDraft ? null : new Date(),
        recordedBy,
      })
      .where(eq(itemReplenishments.id, replenishmentId));

    // Clear old replenishment items
    await db.delete(replenishmentItems).where(eq(replenishmentItems.replenishmentId, replenishmentId));

    // Insert new replenishment items + stock updates
    for (const item of updatedItems) {
      const itemData = validatedItems.get(item.itemId);
      if (!itemData) continue;

      const sizeId =
        item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
      const variantId =
        item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
      const unitId =
        item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

      console.log(`[PUT] inserting replenishment item ${item.itemId} qty=${item.quantity}`);
        await db.insert(replenishmentItems).values({
        replenishmentId,
        itemId: item.itemId,
        sizeId,
        variantId,
        unitId,
        quantity: item.quantity,
      });

      console.log(`[Replenishment PUT] item ${item.itemId} currentStock=${itemData.stock}, quantity=${item.quantity}, isDraft=${isDraft}`);

      if (!isDraft) {
        const newStock = itemData.stock + item.quantity;

        console.log(`[Replenishment PUT] updating stock for item ${item.itemId} to ${newStock}`);

        let stockStatus = "In Stock";
            if (newStock > itemData.ceilingLevel) {
          stockStatus = "Overstock";
          warning.push(`⚠️${itemData.name} is now overstocked.`);
        }

        console.log(`[PUT] updating stock for ${item.itemId} ${itemData.stock} -> ${newStock}`);
        await db.update(itemsTable)
          .set({ stock: newStock, status: stockStatus })
          .where(eq(itemsTable.id, item.itemId));
      } else {
    console.log(`[PUT] draft mode - no stock update for ${item.itemId}`);
  }
    }

    // Fetch items after update
    const itemsWithDetails = await db
      .select({
        id: replenishmentItems.id,
        quantity: replenishmentItems.quantity,
        itemId: itemsTable.id,
        itemName: itemsTable.name,
        sizeId: replenishmentItems.sizeId,
        sizeName: sizes.name,
        variantId: replenishmentItems.variantId,
        variantName: variants.name,
        unitId: replenishmentItems.unitId,
        unitName: units.name,
      })
      .from(replenishmentItems)
      .innerJoin(itemsTable, eq(itemsTable.id, replenishmentItems.itemId))
      .innerJoin(sizes, eq(sizes.id, replenishmentItems.sizeId))
      .innerJoin(variants, eq(variants.id, replenishmentItems.variantId))
      .innerJoin(units, eq(units.id, replenishmentItems.unitId))
      .where(eq(replenishmentItems.replenishmentId, replenishmentId));

    return NextResponse.json(
      {
        message: isDraft ? "Replenishment updated as draft." : "Replenishment updated successfully!",
        warning,
        replenishmentId,
        status: isDraft ? "Draft" : "Replenished",
        items: itemsWithDetails,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Replenishment PUT error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


// DELETE — Archive/Delete replenishment
export async function DELETE(_req: NextRequest, context: RouteContext ) {
    try {
      const { id } = await context.params;
      // const body = await req.jason(); req is _
      const replenishmentId = Number(id);

        // Delete line items
       // await db.delete(itemIssuanceItems)
       //     .where(eq(itemIssuanceItems.issuanceId, issuanceId)).returning();

        // Delete header
        await db.update(itemReplenishments)
            .set({ status: "Archived" })
            .where(eq(itemReplenishments.id, replenishmentId)).returning();

        return NextResponse.json({ message: "Replenishment archived successfully." });
    } catch (error) {
        console.error("DELETE /api/replenishment/[id] error:", error);
        return NextResponse.json({ error: "Failed to archive replenishment." }, { status: 500 });
    }
}

// GET - Fetch Replenishment by ID (including line items + item details)
export async function GET(_req: NextRequest, context: RouteContext ) {
  try {
    const { id } = await context.params;
    const replenishmentId = Number(id);

    // Fetch replenishment header
    const [replenishment] = await db
      .select()
      .from(itemReplenishments)
      .where(eq(itemReplenishments.id, replenishmentId));

    if (!replenishment) {
      return NextResponse.json({ error: "Replenishment not found." }, { status: 404 });
    }

    // Fetch line items with joins
    const itemsWithDetails = await db
      .select({
        id: replenishmentItems.id,
        quantity: replenishmentItems.quantity,

        // join main item
        itemId: itemsTable.id,
        itemName: itemsTable.name,
        stock: itemsTable.stock,

        // join optional references
        sizeId: replenishmentItems.sizeId,
        sizeName: sizes.name,
        variantId: replenishmentItems.variantId,
        variantName: variants.name,
        unitId: replenishmentItems.unitId,
        unitName: units.name,
      })
      .from(replenishmentItems)
      .innerJoin(itemsTable, eq(itemsTable.id, replenishmentItems.itemId))
      .leftJoin(sizes, eq(sizes.id, replenishmentItems.sizeId))
      .leftJoin(variants, eq(variants.id, replenishmentItems.variantId))
      .leftJoin(units, eq(units.id, replenishmentItems.unitId))
      .where(eq(replenishmentItems.replenishmentId, replenishmentId));

    const isDraft = replenishment.status?.toLowerCase() === "draft";

    return NextResponse.json({
      ...replenishment,
      isDraft,
      items: itemsWithDetails,
    });
  } catch (error) {
    console.error("GET /api/replenishment/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch replenishment." },
      { status: 500 }
    );
  }
}