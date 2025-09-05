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
import { eq, desc } from "drizzle-orm";

export async function POST(req: Request) {
  console.log("🔵 POST /api/issuances hit");

  try {
    const data = await req.json();
    console.log("🟢 Incoming POST /api/issuances payload:", data);

    const {
      clientName,
      dispatcherName,
      issuedAt,
      customerPoNumber,
      prfNumber,
      items: issuedItems,
      drNumber,
      saveAsDraft,
    } = data;

    const status = saveAsDraft ? "Draft" : "Issued";

    let finalIssuedAt: Date | null = null;
    if (status === "Issued") {
      finalIssuedAt = issuedAt ? new Date(issuedAt) : new Date();
    }

    const warning: string[] = [];

    // ➤ Insert issuance record
    const [newIssuance] = await db
      .insert(itemIssuances)
      .values({
        clientName,
        dispatcherName,
        issuedAt: finalIssuedAt,
        customerPoNumber,
        prfNumber,
        drNumber,
        status,
        saveAsDraft,
      })
      .returning();

    const issuanceId = newIssuance.id;

    // ➤ Loop through issued items
    for (const item of issuedItems) {
      const { itemId, sizeId, variantId, quantity } = item;

      const itemData = await db.query.items.findFirst({
        where: eq(itemsTable.id, itemId),
      });

      if (!itemData) {
        throw new Error(`Item with ID ${itemId} not found.`);
      }

      const resolvedUnitId = itemData.unitId;

      // ➤ Insert into issuance items table
      await db.insert(itemIssuanceItems).values({
        issuanceId: issuanceId,
        itemId: parseInt(itemId),
        sizeId: sizeId ? parseInt(sizeId) : null,
        variantId: variantId ? parseInt(variantId) : null,
        unitId: resolvedUnitId,
        quantity: parseInt(quantity),
      });

      if (status === "Issued") {
        const parsedQuantity = parseInt(quantity);
        const newStock = itemData.stock - parsedQuantity;

        if (newStock < 0) {
            throw new Error(
            `❌ Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${parsedQuantity}`
            );
        }

        if (itemData.stock < parsedQuantity) {
          return NextResponse.json(
            {
              error: `❌ Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${parsedQuantity}`,
            },
            { status: 400 }
          );
        }

        // ➤ Determine stock status
        let stockStatus = "In Stock";
        if (newStock === 0) {
            stockStatus = "No Stock";
        } else if (newStock <= itemData.criticalLevel) {
            stockStatus = "Critical Level";
            warning.push(`❗ ${itemData.name} is now below critical level.`);
        } else if (newStock <= itemData.reorderLevel) {
            stockStatus = "Reorder Level";
            warning.push(`⚠️ ${itemData.name} is now at reorder level.`);
        } else if (newStock > itemData.ceilingLevel) {
            stockStatus = "Overstock";
        }

        // ➤ Update stock AND status in one go
        await db
            .update(itemsTable)
            .set({ stock: newStock, status: stockStatus })
            .where(eq(itemsTable.id, itemId));
        }

    }

    console.log("✅ Issuance success", { issuanceId, warning });

    return NextResponse.json({
      message: "Item issuance recorded successfully.",
      issuanceId,
      warning,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Issuance POST error:", error.message);
      console.error("❌ Stack:", error.stack);

    return NextResponse.json(
      { error: "Failed to process issuance." },
      { status: 400 }
    );
  } else {
    console.error("❌ Unknown error:", error);
    return NextResponse.json(
      { error: "Unknown error occurred." },
      { status: 500 }
    );
  }
}
}

export async function GET() {
  try {
    const issuanceRecords = await db
      .select()
      .from(itemIssuances)
      .orderBy(desc(itemIssuances.issuedAt));

    const results = [];

    for (const issuance of issuanceRecords) {
      const issuedItems = await db
        .select({
          itemId: itemIssuanceItems.itemId,
          itemName: itemsTable.name,
          quantity: itemIssuanceItems.quantity,
          sizeName: sizes.name,
          variantName: variants.name,
          unit: units.name,
        })
        .from(itemIssuanceItems)
        .where(eq(itemIssuanceItems.issuanceId, issuance.id))
        .leftJoin(itemsTable, eq(itemIssuanceItems.itemId, itemsTable.id))
        .leftJoin(sizes, eq(itemIssuanceItems.sizeId, sizes.id))
        .leftJoin(variants, eq(itemIssuanceItems.variantId, variants.id))
        .leftJoin(units, eq(itemIssuanceItems.unitId, units.id));

      results.push({
        ...issuance,
        items: issuedItems,
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