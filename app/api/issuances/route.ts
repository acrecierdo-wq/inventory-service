// api/issuances/route.ts

import { db } from "@/db/drizzle";
import {
  itemIssuances,
  itemIssuanceItems,
  items as itemsTable,
  sizes,
  variants,
  units,
} from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      clientName,
      clientAddress,
      referenceNumber,
      deliveryDate,
      customerPoNumber,
      issuedBy, // ✅ ADD THIS
      items,
      drNumber,
      saveAsDraft,
    } = data;

    // ✅ ADD: Normalize saveAsDraft
    const isDraft =
      saveAsDraft === true ||
      saveAsDraft === "draft" ||
      saveAsDraft === "Draft";

    // Validation
    if (!clientName || !customerPoNumber) {
      return NextResponse.json(
        { error: "Client name and PO number are required." },
        { status: 400 }
      );
    }

    // ✅ ADD: Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing items array." },
        { status: 400 }
      );
    }

    // ✅ ADD: Validate and prepare items
    const warning: string[] = [];
    const validatedItems: Map<string, typeof itemsTable.$inferSelect> =
      new Map();

    // Validate all items
    for (const item of items) {
      const itemData = await db.query.items.findFirst({
        where: eq(itemsTable.id, item.itemId),
      });

      if (!itemData) {
        return NextResponse.json(
          { error: `Item with ID ${item.itemId} not found.` },
          { status: 400 }
        );
      }

      // Check stock if not draft
      if (!isDraft && itemData.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      validatedItems.set(item.itemId, itemData);
    }

    // Insert into database
    const [newIssuance] = await db
      .insert(itemIssuances)
      .values({
        clientName,
        clientAddress,
        referenceNumber,
        deliveryDate,
        customerPoNumber,
        issuedBy, // ✅ ADD THIS
        drNumber,
        status: isDraft ? "Draft" : "Issued",
        issuedAt: isDraft ? null : new Date(), // ✅ ADD THIS
        // createdAt will auto-populate via defaultNow()
      })
      .returning();

    const issuanceRef = `ISS-CTIC-${new Date().getFullYear()}-${String(
      newIssuance.id
    ).padStart(4, "0")}`;

    // Insert issuance items and update stock
    for (const item of items) {
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
        issuanceId: newIssuance.id,
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

    return NextResponse.json(
      {
        message: isDraft
          ? "Issuance saved as draft."
          : "Issuance saved successfully!",
        warning,
        issuanceId: newIssuance.id,
        issuanceRef,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Issuance POST error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
export async function GET() {
  try {
    const issuanceRecords = await db
      .select({
        id: itemIssuances.id,
        clientName: itemIssuances.clientName,
        clientAddress: itemIssuances.clientAddress, // ✅ NEW
        referenceNumber: itemIssuances.referenceNumber, // ✅ NEW
        deliveryDate: itemIssuances.deliveryDate, // ✅ NEW
        customerPoNumber: itemIssuances.customerPoNumber,
        // ❌ REMOVED: dispatcherName
        // ❌ REMOVED: prfNumber
        issuedBy: itemIssuances.issuedBy, // ✅ ADD THIS
        drNumber: itemIssuances.drNumber,
        status: itemIssuances.status,
        issuedAt: itemIssuances.issuedAt,
        createdAt: itemIssuances.createdAt,
      })
      .from(itemIssuances)
      .orderBy(
        sql`COALESCE(${itemIssuances.issuedAt}, ${itemIssuances.createdAt}) DESC`
      );

    const results = [];

    for (const issuance of issuanceRecords) {
      const issuedItems = await db
        .select({
          itemId: itemIssuanceItems.itemId,
          itemName: itemsTable.name,
          quantity: itemIssuanceItems.quantity,
          sizeId: itemIssuanceItems.sizeId,
          variantId: itemIssuanceItems.variantId,
          unitId: itemIssuanceItems.unitId,
          sizeName: sizes.name,
          variantName: variants.name,
          unitName: units.name,
        })
        .from(itemIssuanceItems)
        .where(eq(itemIssuanceItems.issuanceId, issuance.id))
        .leftJoin(itemsTable, eq(itemIssuanceItems.itemId, itemsTable.id))
        .leftJoin(sizes, eq(itemIssuanceItems.sizeId, sizes.id))
        .leftJoin(variants, eq(itemIssuanceItems.variantId, variants.id))
        .leftJoin(units, eq(itemIssuanceItems.unitId, units.id));

      const normalizedItems = issuedItems.map((item) => ({
        ...item,
        sizeId: item.sizeId ?? null,
        variantId: item.variantId ?? null,
        unitId: item.unitId ?? null,
      }));

      results.push({
        ...issuance,
        items: normalizedItems,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/issuances error:", error);
    return NextResponse.json(
      { error: "Failed to fetch issuance records." },
      { status: 500 }
    );
  }
}

// Latest version - Sept.2
