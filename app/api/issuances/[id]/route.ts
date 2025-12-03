// api/issuances/[id]/route.ts

import { db } from "@/db/drizzle";
import {
  itemIssuances,
  itemIssuanceItems,
  items as itemsTable,
  sizes,
  variants,
  units,
} from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const issuanceId = Number(id);

    if (!issuanceId || isNaN(issuanceId)) {
      return NextResponse.json(
        { error: "Invalid issuance ID." },
        { status: 400 }
      );
    }

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing items array." },
        { status: 400 }
      );
    }

    const {
      clientName,
      clientAddress, // ✅ NEW
      referenceNumber, // ✅ NEW
      deliveryDate, // ✅ NEW
      customerPoNumber,

      drNumber,
      saveAsDraft,
      items: updatedItems,
    } = body;

    // normalize saveAsDraft
    const isDraft =
      saveAsDraft === true ||
      saveAsDraft === "draft" ||
      saveAsDraft === "Draft";

    console.log("Incoming PUT /api/issuances payload:", {
      issuanceId,
      clientName,
      customerPoNumber,
      drNumber,
      saveAsDraft,
      isDraft,
      items: updatedItems,
    });

    const warning: string[] = [];
    const validatedItems: Map<string, typeof itemsTable.$inferSelect> =
      new Map();

    // Validate items
    const mismatchesOverall: Record<
      string,
      { field: string; expected: unknown; received: unknown }[]
    > = {};

    for (const item of updatedItems) {
      const itemData = await db.query.items.findFirst({
        where: eq(itemsTable.id, item.itemId),
      });

      if (!itemData) {
        mismatchesOverall[item.itemId] = [
          {
            field: "itemId",
            expected: item.itemId,
            received: "Not found in DB",
          },
        ];
        continue;
      }

      const mismatches: {
        field: string;
        expected: unknown;
        received: unknown;
      }[] = [];

      const sizeId =
        item.sizeId !== undefined && Number(item.sizeId) !== 0
          ? Number(item.sizeId)
          : null;
      const variantId =
        item.variantId !== undefined && Number(item.variantId) !== 0
          ? Number(item.variantId)
          : null;
      const unitId =
        item.unitId !== undefined && Number(item.unitId) !== 0
          ? Number(item.unitId)
          : null;

      if (item.name && itemData.name !== item.name) {
        mismatches.push({
          field: "name",
          expected: itemData.name,
          received: item.name,
        });
      }

      if ((itemData.sizeId ?? null) !== sizeId) {
        mismatches.push({
          field: "sizeId",
          expected: itemData.sizeId,
          received: sizeId,
        });
      }

      if ((itemData.variantId ?? null) !== variantId) {
        mismatches.push({
          field: "variantId",
          expected: itemData.variantId,
          received: variantId,
        });
      }

      if ((itemData.unitId ?? null) !== unitId) {
        mismatches.push({
          field: "unitId",
          expected: itemData.unitId,
          received: unitId,
        });
      }

      if (mismatches.length > 0) {
        mismatchesOverall[item.itemId] = mismatches;
      }

      if (!isDraft && itemData.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${item.quantity}`,
          },
          { status: 400 }
        );
      } else {
        validatedItems.set(item.itemId, itemData);
      }
    }

    if (Object.keys(mismatchesOverall).length > 0) {
      console.log("Validation failed for items:", mismatchesOverall);
      return NextResponse.json(
        { error: "Item ID validation failed.", details: mismatchesOverall },
        { status: 400 }
      );
    }

    // Update main issuance record
    await db
      .update(itemIssuances)
      .set({
        clientName,
        customerPoNumber,
        drNumber,
        clientAddress,
        referenceNumber,
        deliveryDate,
        status: isDraft ? "Draft" : "Issued",
        // ❌ REMOVE: issuedAt from here - let database handle it via trigger or default
      })
      .where(eq(itemIssuances.id, issuanceId));

    // Clear old issuance items
    await db
      .delete(itemIssuanceItems)
      .where(eq(itemIssuanceItems.issuanceId, issuanceId));

    // Insert new issuance items + stock updates
    for (const item of updatedItems) {
      const itemData = validatedItems.get(item.itemId);
      if (!itemData) continue;

      const sizeId =
        item.sizeId !== undefined && Number(item.sizeId) !== 0
          ? Number(item.sizeId)
          : null;
      const variantId =
        item.variantId !== undefined && Number(item.variantId) !== 0
          ? Number(item.variantId)
          : null;
      const unitId =
        item.unitId !== undefined && Number(item.unitId) !== 0
          ? Number(item.unitId)
          : null;

      await db.insert(itemIssuanceItems).values({
        issuanceId,
        itemId: item.itemId,
        sizeId,
        variantId,
        unitId,
        quantity: item.quantity,
      });

      if (!isDraft) {
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

        await db
          .update(itemsTable)
          .set({ stock: newStock, status: stockStatus })
          .where(eq(itemsTable.id, item.itemId));
      }
    }

    // Fetch items after update
    const itemsWithDetails = await db
      .select({
        id: itemIssuanceItems.id,
        quantity: itemIssuanceItems.quantity,
        itemId: itemsTable.id,
        itemName: itemsTable.name,
        sizeId: itemIssuanceItems.sizeId,
        sizeName: sizes.name,
        variantId: itemIssuanceItems.variantId,
        variantName: variants.name,
        unitId: itemIssuanceItems.unitId,
        unitName: units.name,
      })
      .from(itemIssuanceItems)
      .innerJoin(itemsTable, eq(itemsTable.id, itemIssuanceItems.itemId))
      .innerJoin(sizes, eq(sizes.id, itemIssuanceItems.sizeId))
      .innerJoin(variants, eq(variants.id, itemIssuanceItems.variantId))
      .innerJoin(units, eq(units.id, itemIssuanceItems.unitId))
      .where(eq(itemIssuanceItems.issuanceId, issuanceId));

    return NextResponse.json(
      {
        message: isDraft
          ? "Issuance updated as draft."
          : "Issuance updated successfully!",
        warning,
        issuanceId,
        status: isDraft ? "Draft" : "Issued",
        items: itemsWithDetails,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Issuance PUT error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE — Archive/Delete Issuance
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    // const body = await req.jason(); req is _
    const issuanceId = Number(id);

    // Delete line items
    // await db.delete(itemIssuanceItems)
    //     .where(eq(itemIssuanceItems.issuanceId, issuanceId)).returning();

    // Delete header
    await db
      .update(itemIssuances)
      .set({ status: "Archived" })
      .where(eq(itemIssuances.id, issuanceId))
      .returning();

    return NextResponse.json({ message: "Issuance archived successfully." });
  } catch (error) {
    console.error("DELETE /api/issuances/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to archive issuance." },
      { status: 500 }
    );
  }
}

// GET - Fetch Issuance by ID (including line items + item details)
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const issuanceId = Number(id);

    // Fetch issuance header
    const [issuance] = await db
      .select()
      .from(itemIssuances)
      .where(eq(itemIssuances.id, issuanceId));

    if (!issuance) {
      return NextResponse.json(
        { error: "Issuance not found." },
        { status: 404 }
      );
    }

    // Fetch line items with joins
    const itemsWithDetails = await db
      .select({
        id: itemIssuanceItems.id,
        quantity: itemIssuanceItems.quantity,

        // join main item
        itemId: itemsTable.id,
        itemName: itemsTable.name,
        stock: itemsTable.stock,

        // join optional references
        sizeId: itemIssuanceItems.sizeId,
        sizeName: sizes.name,
        variantId: itemIssuanceItems.variantId,
        variantName: variants.name,
        unitId: itemIssuanceItems.unitId,
        unitName: units.name,
      })
      .from(itemIssuanceItems)
      .innerJoin(itemsTable, eq(itemsTable.id, itemIssuanceItems.itemId))
      .leftJoin(sizes, eq(sizes.id, itemIssuanceItems.sizeId))
      .leftJoin(variants, eq(variants.id, itemIssuanceItems.variantId))
      .leftJoin(units, eq(units.id, itemIssuanceItems.unitId))
      .where(eq(itemIssuanceItems.issuanceId, issuanceId));

    const isDraft = issuance.status?.toLowerCase() === "draft";

    return NextResponse.json({
      ...issuance,
      isDraft,
      items: itemsWithDetails,
    });
  } catch (error) {
    console.error("GET /api/issuances/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch issuance." },
      { status: 500 }
    );
  }
}

// Latest version - Sept.2

// additional function (10/31/25)

export async function PATCH(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const issuanceId = Number(id);

    if (!issuanceId || isNaN(issuanceId)) {
      return NextResponse.json(
        { error: "Invalid issuance ID." },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(itemIssuances)
      .where(eq(itemIssuances.id, issuanceId));

    if (!existing) {
      return NextResponse.json(
        { error: "Issuance not found." },
        { status: 404 }
      );
    }

    if (existing.status !== "Archived") {
      return NextResponse.json(
        { error: "Only archived issuances can be restored." },
        { status: 400 }
      );
    }

    await db
      .update(itemIssuances)
      .set({ status: "Issued" })
      .where(eq(itemIssuances.id, issuanceId))
      .returning();

    return NextResponse.json({ message: "Issuance restored successfully. " });
  } catch (error) {
    console.error("PATCH /api/issuances/[id] restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore issuance." },
      { status: 500 }
    );
  }
}
