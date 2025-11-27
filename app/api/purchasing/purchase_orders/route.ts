// // app/api/purchasing/purchase_orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  purchasingPurchaseOrders,
  purchaseOrderItems,
  suppliers,
  audit_logs,
  items as itemsTable,
  sizes,
  variants,
  units,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

type PurchaseOrderItemInput = {
  itemId: number;
  sizeId?: number | null;
  variantId?: number | null;
  unitId?: number | null;
  quantity: number;
  unitPrice?: number | null;
  totalPrice?: number | null;
};

type PurchaseOrderInput = {
  poNumber: string;
  supplierId: number;
  terms?: string;
  deliveryMode?: string;
  projectName?: string;
  remarks?: string;
  accountName?: string;
  preparedBy: string;
  status?: "Pending" | "Partial" | "Complete";
  items?: PurchaseOrderItemInput[];
};

//
// ---------------------- GET ----------------------
//
export async function GET() {
  try {
    const purchaseOrders = await db
      .select({
        id: purchasingPurchaseOrders.id,
        poNumber: purchasingPurchaseOrders.poNumber,
        date: purchasingPurchaseOrders.date,
        supplierName: suppliers.supplierName,
        terms: purchasingPurchaseOrders.terms,
        deliveryMode: purchasingPurchaseOrders.deliveryMode,
        projectName: purchasingPurchaseOrders.projectName,
        remarks: purchasingPurchaseOrders.remarks,
        accountName: purchasingPurchaseOrders.accountName,
        preparedBy: purchasingPurchaseOrders.preparedBy,
        status: purchasingPurchaseOrders.status,
      })
      .from(purchasingPurchaseOrders)
      .leftJoin(suppliers, eq(purchasingPurchaseOrders.supplierId, suppliers.id))
      .orderBy(sql`${purchasingPurchaseOrders.date} DESC`);

    const results = [];

    for (const po of purchaseOrders) {
      const items = await db
        .select({
          itemId: purchaseOrderItems.itemId,
          itemName: itemsTable.name,
          sizeId: purchaseOrderItems.sizeId,
          sizeName: sizes.name,
          variantId: purchaseOrderItems.variantId,
          variantName: variants.name,
          unitId: purchaseOrderItems.unitId,
          unitName: units.name,
          quantity: purchaseOrderItems.quantity,
          unitPrice: purchaseOrderItems.unitPrice,
          totalPrice: purchaseOrderItems.totalPrice,
          receivedQuantity: purchaseOrderItems.receivedQuantity,
        })
        .from(purchaseOrderItems)
        .where(eq(purchaseOrderItems.purchasingPurchaseOrderId, po.id))
        .leftJoin(itemsTable, eq(purchaseOrderItems.itemId, itemsTable.id))
        .leftJoin(sizes, eq(purchaseOrderItems.sizeId, sizes.id))
        .leftJoin(variants, eq(purchaseOrderItems.variantId, variants.id))
        .leftJoin(units, eq(purchaseOrderItems.unitId, units.id));

      const normalizedItems = items.map((item) => ({
        ...item,
        sizeId: item.sizeId ?? null,
        variantId: item.variantId ?? null,
        unitId: item.unitId ?? null,
      }));

      results.push({
        ...po,
        items: normalizedItems,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json(
      { error: "Failed to load purchase orders" },
      { status: 500 }
    );
  }
}

//
// ---------------------- POST ----------------------
//
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = user.publicMetadata?.role;
    if (role !== "purchasing" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as PurchaseOrderInput;
    const now = new Date();

    // Validate items
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "No items provided for purchase order." },
        { status: 400 }
      );
    }

    // Fetch and validate items
    const validatedItems = new Map<number, typeof itemsTable.$inferSelect>();
    const mismatches: Record<number, { field: string; expected: unknown; received: unknown }[]> = {};

    for (const item of body.items) {
      const itemData = await db.query.items.findFirst({
        where: eq(itemsTable.id, item.itemId),
      });
      if (!itemData) {
        mismatches[item.itemId] = [{ field: "itemId", expected: "Existing item", received: "Not found" }];
        continue;
      }
      validatedItems.set(item.itemId, itemData);
    }

    if (Object.keys(mismatches).length > 0) {
      return NextResponse.json({ error: "Item validation failed.", details: mismatches }, { status: 400 });
    }

    // Generate next PO number
    const latestPO = await db
      .select({ poNumber: purchasingPurchaseOrders.poNumber })
      .from(purchasingPurchaseOrders)
      .orderBy(sql`${purchasingPurchaseOrders.id} DESC`)
      .limit(1);

    let nextNumber = 1;
    if (latestPO.length && latestPO[0].poNumber) {
      const numeric = parseInt(latestPO[0].poNumber.replace(/\D/g, ""), 10);
      if (!isNaN(numeric)) nextNumber = numeric + 1;
    }

    const formattedPoNumber = `No. ${String(nextNumber).padStart(7, "0")}`;

    // Insert main purchase order
    const [newPO] = await db
      .insert(purchasingPurchaseOrders)
      .values({
        poNumber: formattedPoNumber,
        date: now,
        supplierId: body.supplierId,
        terms: body.terms || "",
        deliveryMode: body.deliveryMode || "",
        projectName: body.projectName || "",
        remarks: body.remarks || "",
        accountName: body.accountName || "",
        preparedBy: body.preparedBy,
        status: body.status || "Pending",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Insert purchase order items
    await db.insert(purchaseOrderItems).values(
      body.items.map((item) => ({
        purchasingPurchaseOrderId: newPO.id,
        itemId: item.itemId,
        sizeId: item.sizeId ?? null,
        variantId: item.variantId ?? null,
        unitId: item.unitId ?? null,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice ?? 0),
        totalPrice: item.totalPrice ? String(item.totalPrice) : null,
        receivedQuantity: 0,
      }))
    );

    // Audit log
    await db.insert(audit_logs).values({
      entity: "Purchase Order",
      entityId: newPO.id.toString(),
      action: "ADD",
      description: `Purchase Order ${formattedPoNumber} created.`,
      actorId: user.id,
      actorName: user.username || "Purchasing",
      actorRole: role || "Purchasing",
      module: "Purchasing / Purchase Orders",
      timestamp: now,
    });

    return NextResponse.json({ message: "Purchase Order created successfully.", purchaseOrderId: newPO.id });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json({ error: "Failed to create purchase order", details: String(error) }, { status: 500 });
  }
}
