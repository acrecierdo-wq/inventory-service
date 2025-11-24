import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  purchasingPurchaseOrders,
  purchaseOrderItems,
  suppliers,
  items as itemsTable,
  sizes,
  variants,
  units,
} from "@/db/schema";
import { eq, inArray, or } from "drizzle-orm";

export async function GET() {
  try {
    console.log("📦 Fetching available purchase orders...");

    const pos = await db
      .select({
        id: purchasingPurchaseOrders.id,
        poNumber: purchasingPurchaseOrders.poNumber,
        supplierId: purchasingPurchaseOrders.supplierId,
        terms: purchasingPurchaseOrders.terms,
        deliveryMode: purchasingPurchaseOrders.deliveryMode,
        projectName: purchasingPurchaseOrders.projectName,
        remarks: purchasingPurchaseOrders.remarks,
        status: purchasingPurchaseOrders.status,
        supplierName: suppliers.supplierName,
      })
      .from(purchasingPurchaseOrders)
      .leftJoin(
        suppliers,
        eq(purchasingPurchaseOrders.supplierId, suppliers.id)
      )
      .where(
        or(
          eq(purchasingPurchaseOrders.status, "Pending"),
          eq(purchasingPurchaseOrders.status, "Partial")
        )
      )
      .orderBy(purchasingPurchaseOrders.date);

    console.log(`✅ Found ${pos.length} POs with Pending/Partial status`);

    if (pos.length === 0) {
      return NextResponse.json([]);
    }

    const poIds = pos.map((po) => po.id);
    console.log("📋 Fetching items for PO IDs:", poIds);

    const poItemsData = await db
      .select({
        poId: purchaseOrderItems.purchasingPurchaseOrderId,
        itemId: purchaseOrderItems.itemId,
        itemName: itemsTable.name,
        sizeId: purchaseOrderItems.sizeId,
        sizeName: sizes.name,
        variantId: purchaseOrderItems.variantId,
        variantName: variants.name,
        unitId: purchaseOrderItems.unitId,
        unitName: units.name,
        quantity: purchaseOrderItems.quantity, // ✅ Expected Quantity
        receivedQuantity: purchaseOrderItems.receivedQuantity, // ✅ Already Received
        unitPrice: purchaseOrderItems.unitPrice,
      })
      .from(purchaseOrderItems)
      .leftJoin(itemsTable, eq(purchaseOrderItems.itemId, itemsTable.id))
      .leftJoin(sizes, eq(purchaseOrderItems.sizeId, sizes.id))
      .leftJoin(variants, eq(purchaseOrderItems.variantId, variants.id))
      .leftJoin(units, eq(purchaseOrderItems.unitId, units.id))
      .where(inArray(purchaseOrderItems.purchasingPurchaseOrderId, poIds));

    console.log(`✅ Found ${poItemsData.length} total items across all POs`);

    const result = pos.map((po) => {
      const items = poItemsData
        .filter((item) => item.poId === po.id)
        .map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName || "Unknown Item",
          sizeId: item.sizeId,
          sizeName: item.sizeName,
          variantId: item.variantId,
          variantName: item.variantName,
          unitId: item.unitId,
          unitName: item.unitName,
          quantity: item.quantity, // ✅ Expected Quantity
          receivedQuantity: item.receivedQuantity || 0, // ✅ Already Received
          remainingQuantity: item.quantity - (item.receivedQuantity || 0), // ✅ Still Needed
          unitPrice: Number(item.unitPrice) || 0,
        }));

      console.log(`  PO ${po.poNumber}: ${items.length} items`);

      return {
        id: po.id,
        poNumber: po.poNumber,
        supplierId: po.supplierId,
        supplierName: po.supplierName || "Unknown Supplier",
        terms: po.terms,
        deliveryMode: po.deliveryMode,
        projectName: po.projectName,
        remarks: po.remarks,
        status: po.status as "Pending" | "Partial" | "Complete",
        items,
      };
    });

    console.log(`📦 Returning ${result.length} purchase orders`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error fetching available purchase orders:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch purchase orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
