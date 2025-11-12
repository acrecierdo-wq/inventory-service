// app/api/purchasing/purchase_orders/next/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { purchasingPurchaseOrders } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const latestPO = await db
    .select({ poNumber: purchasingPurchaseOrders.poNumber })
    .from(purchasingPurchaseOrders)
    .orderBy(sql`${purchasingPurchaseOrders.id} DESC`)
    .limit(1);

  let nextNumber = 1;
  if (latestPO.length > 0 && latestPO[0].poNumber) {
    const numeric = parseInt(latestPO[0].poNumber.replace(/\D/g, ""), 10);
    if (!isNaN(numeric)) nextNumber = numeric + 1;
  }

  const nextPoNumber = `No. ${String(nextNumber).padStart(7, "0")}`;
  return NextResponse.json({ nextPoNumber });
}
