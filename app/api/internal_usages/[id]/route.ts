// api/internal_usages/[id]/route.ts

import { db } from "@/db/drizzle";
import {
  internalUsages,
  internalUsageItems,
  items as itemsTable,
  sizes, variants, units,
} from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT - Update internal usage
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const usageId = Number(id);

    if (!usageId || isNaN(usageId)) {
      return NextResponse.json({ error: "Invalid usage ID." }, { status: 400 });
    }

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid or missing items array." }, { status: 400 });
    }

    const {
      personnelName,
      purpose,
      items: updatedItems,
    } = body;

    console.log("Incoming PUT /api/internal_usages payload:", {
      usageId,
      personnelName,
      purpose,
      items: updatedItems,
    });

    const warning: string[] = [];
    const validatedItems: Map<string, typeof itemsTable.$inferSelect> = new Map();

    // Validate items
    for (const item of updatedItems) {
      const itemData = await db.query.items.findFirst({
        where: eq(itemsTable.id, item.itemId),
      });

      if (!itemData) {
        return NextResponse.json(
          { error: `Item with ID ${item.itemId} not found.` },
          { status: 400 }
        );
      }

      if (itemData.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${item.quantity}` },
          { status: 400 }
        );
      }

      validatedItems.set(item.itemId, itemData);
    }

    // Update main internal usage record
    await db.update(internalUsages)
      .set({
        personnelName,
        purpose,
        status: "Utilized",
        loggedAt: new Date(),
      })
      .where(eq(internalUsages.id, usageId));

    // Clear old usage items
    await db.delete(internalUsageItems).where(eq(internalUsageItems.usageId, usageId));

    // Insert new usage items + stock updates
    for (const item of updatedItems) {
      const itemData = validatedItems.get(item.itemId);
      if (!itemData) continue;

      await db.insert(internalUsageItems).values({
        usageId,
        itemId: item.itemId,
        sizeId: item.sizeId || null,
        variantId: item.variantId || null,
        unitId: item.unitId || null,
        quantity: item.quantity,
      });

      const newStock = itemData.stock - item.quantity;

      let stockStatus = "In Stock";
      if (newStock === 0) {
        stockStatus = "No Stock";
        warning.push(`❗${itemData.name} is now out of stock.`);
      } else if (newStock <= itemData.criticalLevel) {
        stockStatus = "Critical Level";
        warning.push(`❗${itemData.name} is now at critical level.`);
      } else if (newStock <= itemData.reorderLevel) {
        stockStatus = "Reorder Level";
        warning.push(`⚠️${itemData.name} is now at reorder level.`);
      } else if (newStock > itemData.ceilingLevel) {
        stockStatus = "Overstock";
        warning.push(`⚠️${itemData.name} is now overstocked.`);
      }

      await db.update(itemsTable)
        .set({ stock: newStock, status: stockStatus })
        .where(eq(itemsTable.id, item.itemId));
    }

    return NextResponse.json(
      {
        message: "Internal usage updated successfully!",
        warning,
        usageId,
        status: "Utilized",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Internal Usage PUT error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE — Archive Internal Usage
export async function DELETE(_req: NextRequest, context: RouteContext ) {
  try {
    const { id } = await context.params;
    const usageId = Number(id);

    await db.update(internalUsages)
      .set({ status: "Archived" })
      .where(eq(internalUsages.id, usageId)).returning();

    return NextResponse.json({ message: "Internal usage archived successfully." });
  } catch (error) {
    console.error("DELETE /api/internal_usages/[id] error:", error);
    return NextResponse.json({ error: "Failed to archive internal usage." }, { status: 500 });
  }
}

// GET - Fetch Internal Usage by ID (including line items + item details)
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const usageId = Number(id);

    // Fetch usage header
    const [usage] = await db
      .select()
      .from(internalUsages)
      .where(eq(internalUsages.id, usageId));

    if (!usage) {
      return NextResponse.json({ error: "Internal usage not found." }, { status: 404 });
    }

    // Fetch line items with joins
    const itemsWithDetails = await db
      .select({
        id: internalUsageItems.id,
        quantity: internalUsageItems.quantity,
        itemId: itemsTable.id,
        itemName: itemsTable.name,
        stock: itemsTable.stock,
        sizeId: internalUsageItems.sizeId,
        sizeName: sizes.name,
        variantId: internalUsageItems.variantId,
        variantName: variants.name,
        unitId: internalUsageItems.unitId,
        unitName: units.name,
      })
      .from(internalUsageItems)
      .innerJoin(itemsTable, eq(itemsTable.id, internalUsageItems.itemId))
      .leftJoin(sizes, eq(sizes.id, internalUsageItems.sizeId))
      .leftJoin(variants, eq(variants.id, internalUsageItems.variantId))
      .leftJoin(units, eq(units.id, internalUsageItems.unitId))
      .where(eq(internalUsageItems.usageId, usageId));

    return NextResponse.json({
      ...usage,
      items: itemsWithDetails,
    });
  } catch (error) {
    console.error("GET /api/internal_usages/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch internal usage." },
      { status: 500 }
    );
  }
}
