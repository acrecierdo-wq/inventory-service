// api/issuances/[id]/route.ts

import { db } from "@/db/drizzle";
import { itemIssuanceItems, itemIssuances, items as itemsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const {
      clientName,
      dispatcherName,
      customerPoNumber,
      prfNumber,
      drNumber,
      saveAsDraft,
      items: issuedItems,
    } = data;

    const warning: string[] = [];
    const issuanceId = Number(params.id);

    // Fetch old issuance
    const [oldIssuance] = await db.select().from(itemIssuances).where(eq(itemIssuances.id, issuanceId));

    if (!oldIssuance) {
      return NextResponse.json({ error: "Issuance not found." }, { status: 404 });
    }

    if (oldIssuance.status === "Issued" || oldIssuance.status === "Archived") {
      return NextResponse.json({ error: "Only draft issuances can be updated." }, { status: 400 });
    }

    if (!Array.isArray(issuedItems) || issuedItems.length === 0) {
      return NextResponse.json({ error: "Invalid or missing items array." }, { status: 400 });
    }

    //const warnings: string[] = [];
    const validatedItems: Map<string, typeof itemsTable.$inferSelect> = new Map();
    const mismatchesOverall: Record<string, { field: string; expected: unknown; received: unknown }[]> = {};

    const normalize = (val: unknown) => val ?? null;

    // ---- VALIDATE ITEMS ----
    for (const item of issuedItems) {
      const itemData = await db.query.items.findFirst({ where: eq(itemsTable.id, item.itemId) });
      if (!itemData) {
        mismatchesOverall[item.itemId] = [{ field: "itemId", expected: item.itemId, received: "Not found in DB" }];
        continue;
      }

      const mismatches: { field: string; expected: unknown; received: unknown }[] = [];
      const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
      const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
      const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

      if (normalize(itemData.sizeId) !== normalize(sizeId)) mismatches.push({ field: "sizeId", expected: itemData.sizeId, received: sizeId });
      if (normalize(itemData.variantId) !== normalize(variantId)) mismatches.push({ field: "variantId", expected: itemData.variantId, received: variantId });
      if (normalize(itemData.unitId) !== normalize(unitId)) mismatches.push({ field: "unitId", expected: itemData.unitId, received: unitId });

      if (!saveAsDraft && itemData.stock < item.quantity) {
        return NextResponse.json({
          error: `Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${item.quantity}`,
        }, { status: 400 });
      }

      if (mismatches.length > 0) {
        mismatchesOverall[item.itemId] = mismatches;
      } else {
        validatedItems.set(item.itemId, itemData);
      }
    }

    if (Object.keys(mismatchesOverall).length > 0) {
      return NextResponse.json({ error: "Item validation failed.", details: mismatchesOverall }, { status: 400 });
    }

    // ---- UPDATE ISSUANCE HEADER ----
    let newIssuedAt = oldIssuance.issuedAt;

    if (!saveAsDraft && oldIssuance.status === "Draft") {
        newIssuedAt = new Date();
    }
    await db.update(itemIssuances)
      .set({
        clientName,
        dispatcherName,
        customerPoNumber,
        prfNumber,
        drNumber,
        status: saveAsDraft ? "Draft" : "Issued",
        issuedAt: newIssuedAt,
      })
      .where(eq(itemIssuances.id, issuanceId));

    // ---- DELETE OLD ITEMS ----
    await db.delete(itemIssuanceItems).where(eq(itemIssuanceItems.issuanceId, issuanceId));

    // ---- INSERT UPDATED ITEMS & UPDATE STOCK ----
    for (const item of issuedItems) {
      const itemData = validatedItems.get(item.itemId);
      if (!itemData) continue;

      const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
      const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
      const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

      await db.insert(itemIssuanceItems).values({
        issuanceId,
        itemId: item.itemId,
        sizeId,
        variantId,
        unitId,
        quantity: item.quantity,
      });

      if (!saveAsDraft) {
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

    return NextResponse.json({ message: "Issuance updated successfully.", warning });
  } catch (error) {
    console.error("PUT /api/issuances/[id] error:", error);
    return NextResponse.json({ error: "Failed to update issuance." }, { status: 500 });
  }
}


// DELETE — Archive/Delete Issuance
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const issuanceId = Number(params.id);

        // Delete line items
       // await db.delete(itemIssuanceItems)
       //     .where(eq(itemIssuanceItems.issuanceId, issuanceId)).returning();

        // Delete header
        await db.update(itemIssuances)
            .set({ status: "Archived" })
            .where(eq(itemIssuances.id, issuanceId)).returning();

        return NextResponse.json({ message: "Issuance archived successfully." });
    } catch (error) {
        console.error("DELETE /api/issuances/[id] error:", error);
        return NextResponse.json({ error: "Failed to archive issuance." }, { status: 500 });
    }
}

// GET - Fetch Issuance by ID (including line items)
export async function GET(_req: Request, { params }: { params: { id: string }}) {
    try {
        const issuanceId = Number(params.id);

        // Fetch issuance header
        const [issuance] = await db
            .select()
            .from(itemIssuances)
            .where(eq(itemIssuances.id, issuanceId));

        if (!issuance) {
            return NextResponse.json({ error: "Issuance not found." }, { status: 404 });
        }

        // Fetch line items
        const items = await db
            .select()
            .from(itemIssuanceItems)
            .where(eq(itemIssuanceItems.issuanceId, issuanceId));
            
        return NextResponse.json({ ...issuance, items });
    } catch (error) {
        console.error("GET /api/issuances/[id] error:", error);
        return NextResponse.json({ error: "Failed to fetch issuance." }, { status: 500 });
    }
}
