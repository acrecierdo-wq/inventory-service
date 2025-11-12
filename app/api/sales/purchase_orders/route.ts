// app/api/sales/purchase_orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { purchase_orders, quotations, quotationItems } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {  currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


    const role = user.publicMetadata?.role;
    if (role !== "sales" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });
    }
    
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const requestId = searchParams.get("requestId");
    const quotationId = searchParams.get("quotationId");

    if (!requestId || !customerId) {
      return NextResponse.json({ success: false, error: "customerId is required" }, { status: 400 });
    }

    // Fetch POs
    const results = await db
      .select({
        id: purchase_orders.id,
        poNumber: purchase_orders.poNumber,
        fileName: purchase_orders.fileName,
        filePath: purchase_orders.filePath,
        status: purchase_orders.status,
        uploadedAt: purchase_orders.uploadedAt,
        uploadedBy: purchase_orders.uploadedBy,
        quotationId: purchase_orders.quotationId,
        quotationNumber: quotations.quotationNumber,
        
        subTotal: sql<number>`SUM(${quotationItems.totalPrice})`,

        markup: quotations.markup,
        vat: quotations.vat,

        projectAmount: sql<number>`
        SUM(${quotationItems.totalPrice})
        + (SUM(${quotationItems.totalPrice}) * (${quotations.markup} / 100))
        + (
        (SUM(${quotationItems.totalPrice}) + SUM(${quotationItems.totalPrice}) * (${quotations.markup} / 100))
        * (${quotations.vat} / 100)
        )`.as("projectAmount")
      })
      .from(purchase_orders)
      .leftJoin(quotations, eq(purchase_orders.quotationId, quotations.id))
      .leftJoin(quotationItems, eq(quotationItems.quotationId, quotations.id))
      .where(
        and(
          eq(purchase_orders.customerId, Number(customerId)),
          quotationId ? eq(purchase_orders.quotationId, quotationId) : sql`TRUE`,
          requestId ? eq(quotations.requestId, Number(requestId)) : sql`TRUE`
        )
      )
      .groupBy(
        purchase_orders.id,
        quotations.quotationNumber,
        quotations.markup,
        quotations.vat
      );

    return NextResponse.json({ success: true, purchaseOrders: results });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
