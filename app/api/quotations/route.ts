// app/api/quotations/route.ts

import { db } from "@/db/drizzle";
import { quotations, quotation_items } from "@/db/schema";
import { NextResponse } from "next/server";

interface Item {
  quotationId?: number; // assigned later when saving
  itemName: string;
  scopeOfWork: string;
  materials: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface QuotationRequest {
  requestId: number;
  status: string;
  delivery?: string;
  warranty?: string;
  validity?: string;
  notes?: string;
  items?: Item[];
  overallTotal: number;
}

export async function POST(req: Request) {
  try {
    const body: QuotationRequest = await req.json();

    const { requestId, status, delivery, warranty, validity, notes, items, overallTotal } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: "ID and status are required." }, { status: 400 });
    }

    // Insert quotation
    const [quotation] = await db
      .insert(quotations)
      .values({
        requestId,
        status,
        delivery,
        warranty,
        validity: validity ? new Date(validity) : null,
        notes,
        overallTotal,
      })
      .returning();

    if (items && items.length > 0) {
      await db.insert(quotation_items).values(
        items.map((item) => ({
          quotationId: quotation.id,
          itemName: item.itemName,
          scopeOfWork: item.scopeOfWork,
          materials: item.materials,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }))
      );
    }

    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
