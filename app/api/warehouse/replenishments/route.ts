import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  itemReplenishments,
  replenishmentItems,
  items,
  purchasingPurchaseOrders,
  purchaseOrderItems,
  audit_logs,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      supplier,
      poRefNum,
      remarks,
      drRefNum,
      isDraft,
      recordedBy,
      items: incomingItems,
      draftId,
    } = body;

    // Validate input
    if (
      !supplier ||
      !poRefNum ||
      !Array.isArray(incomingItems) ||
      incomingItems.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Check if PO exists
    const [purchaseOrder] = await db
      .select()
      .from(purchasingPurchaseOrders)
      .where(eq(purchasingPurchaseOrders.poNumber, poRefNum));

    const poId = purchaseOrder?.id || null;

    // ✅ REMOVED TRANSACTION - Process sequentially instead
    let replenishmentId: number;

    if (draftId) {
      // Update existing draft
      await db
        .update(itemReplenishments)
        .set({
          supplier,
          poRefNum,
          remarks,
          drRefNum,
          isDraft,
          status: isDraft ? "Draft" : "Replenished",
          replenishedAt: isDraft ? null : new Date(),
          recordedBy,
        })
        .where(eq(itemReplenishments.id, draftId));

      await db
        .delete(replenishmentItems)
        .where(eq(replenishmentItems.replenishmentId, draftId));
      replenishmentId = draftId;
    } else {
      // Create new replenishment
      const [newReplenishment] = await db
        .insert(itemReplenishments)
        .values({
          supplier,
          poRefNum,
          remarks,
          drRefNum,
          isDraft,
          status: isDraft ? "Draft" : "Replenished",
          replenishedAt: isDraft ? null : new Date(),
          recordedBy,
        })
        .returning({ id: itemReplenishments.id });

      replenishmentId = newReplenishment.id;
    }

    // Insert replenishment items
    const itemsToInsert = incomingItems.map(
      (item: {
        itemId: number;
        sizeId: number | null;
        variantId: number | null;
        unitId: number | null;
        quantity: number;
      }) => ({
        replenishmentId,
        itemId: item.itemId,
        sizeId: item.sizeId || null,
        variantId: item.variantId || null,
        unitId: item.unitId || null,
        quantity: item.quantity,
      })
    );

    await db.insert(replenishmentItems).values(itemsToInsert);

    // Update stock if not draft
    if (!isDraft) {
      for (const item of incomingItems) {
        await db
          .update(items)
          .set({
            stock: sql`${items.stock} + ${item.quantity}`,
          })
          .where(
            and(
              eq(items.id, item.itemId),
              item.sizeId
                ? eq(items.sizeId, item.sizeId)
                : sql`${items.sizeId} IS NULL`,
              item.variantId
                ? eq(items.variantId, item.variantId)
                : sql`${items.variantId} IS NULL`,
              item.unitId
                ? eq(items.unitId, item.unitId)
                : sql`${items.unitId} IS NULL`
            )
          );
      }
    }

    // Update PO received quantities and status
    let poStatusSummary = null;
    if (poId && !isDraft) {
      // Update received quantities for each item
      for (const item of incomingItems) {
        await db
          .update(purchaseOrderItems)
          .set({
            receivedQuantity: sql`${purchaseOrderItems.receivedQuantity} + ${item.quantity}`,
          })
          .where(
            and(
              eq(purchaseOrderItems.purchasingPurchaseOrderId, poId),
              eq(purchaseOrderItems.itemId, item.itemId),
              item.sizeId
                ? eq(purchaseOrderItems.sizeId, item.sizeId)
                : sql`${purchaseOrderItems.sizeId} IS NULL`,
              item.variantId
                ? eq(purchaseOrderItems.variantId, item.variantId)
                : sql`${purchaseOrderItems.variantId} IS NULL`,
              item.unitId
                ? eq(purchaseOrderItems.unitId, item.unitId)
                : sql`${purchaseOrderItems.unitId} IS NULL`
            )
          );
      }

      // Get updated PO items to determine status
      const poItems = await db
        .select({
          itemId: purchaseOrderItems.itemId,
          itemName: items.name,
          sizeId: purchaseOrderItems.sizeId,
          variantId: purchaseOrderItems.variantId,
          unitId: purchaseOrderItems.unitId,
          expectedQty: purchaseOrderItems.quantity,
          receivedQty: purchaseOrderItems.receivedQuantity,
        })
        .from(purchaseOrderItems)
        .innerJoin(items, eq(purchaseOrderItems.itemId, items.id))
        .where(eq(purchaseOrderItems.purchasingPurchaseOrderId, poId));

      // Calculate PO status
      let allComplete = true;
      let anyPartial = false;
      const itemSummaries = [];

      for (const poItem of poItems) {
        const received = poItem.receivedQty || 0;
        const expected = poItem.expectedQty;

        if (received < expected) {
          allComplete = false;
          if (received > 0) {
            anyPartial = true;
          }
        }

        itemSummaries.push({
          itemName: poItem.itemName,
          expected: expected,
          received: received,
          remaining: expected - received,
        });
      }

      const newStatus = allComplete
        ? "Complete"
        : anyPartial
        ? "Partial"
        : "Pending";

      await db
        .update(purchasingPurchaseOrders)
        .set({ status: newStatus })
        .where(eq(purchasingPurchaseOrders.id, poId));

      console.log(`✅ Updated PO ${poRefNum} status to: ${newStatus}`);

      // Return summary for frontend
      poStatusSummary = {
        poNumber: poRefNum,
        status: newStatus,
        items: itemSummaries,
      };
    }

    // Audit log
    await db.insert(audit_logs).values({
      entity: "item_replenishment",
      entityId: String(replenishmentId),
      action: draftId ? "UPDATE" : "CREATE",
      description: `Replenishment ${
        isDraft ? "draft saved" : "logged"
      } for ${supplier} (PO: ${poRefNum})`,
      actorId: user.id,
      actorName: user.fullName || user.username || "Unknown",
      actorRole: "Warehouseman",
      module: "Warehouse - Replenishment",
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      replenishmentId,
      poStatusSummary,
    });
  } catch (error) {
    console.error("Replenishment error:", error);
    return NextResponse.json(
      { error: "Failed to save replenishment" },
      { status: 500 }
    );
  }
}
