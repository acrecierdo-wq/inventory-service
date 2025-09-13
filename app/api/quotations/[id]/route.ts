// app/api/quotations/[id]/route.ts

import { db } from "@/db/drizzle";
import { quotations, quotation_items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

interface QuotationItemInput {
  itemName: string;
  scopeOfWork: string;
  materials: string;
  quantity: number | string;
  unitPrice: number | string;
  totalPrice: number | string;
}

interface QuotationUpdateBody {
  delivery?: string;
  warranty?: string;
  validity?: string;
  notes?: string;
  status?: string;
  items: QuotationItemInput[];
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body: QuotationUpdateBody = await req.json();
    const quotationId = Number(params.id);
    
    const [updatedQuotation] = await db
      .update(quotations)
      .set({
        delivery: body.delivery,
        warranty: body.warranty,
        validity: body.validity ? new Date(body.validity) : null,
        notes: body.notes,
        overallTotal: body.items.reduce(
          (sum: number, i) => sum + parseFloat(i.totalPrice.toString() || "0"),
          0
        ),
        status: body.status || "Draft",
      })
      .where(eq(quotations.id, quotationId))
      .returning();

    await db.delete(quotation_items).where(eq(quotation_items.quotationId, quotationId));

    if (body.items && body.items.length > 0) {
      await db.insert(quotation_items).values(
        body.items.map((item) => ({
          quotationId,
          itemName: item.itemName,
          scopeOfWork: item.scopeOfWork,
          materials: item.materials,
          quantity: typeof item.quantity === "string" ? parseInt(item.quantity) : item.quantity,
          unitPrice: typeof item.unitPrice === "string" ? parseFloat(item.unitPrice) : item.unitPrice,
          totalPrice: typeof item.totalPrice === "string" ? parseFloat(item.totalPrice) : item.totalPrice,
        }))
      );
    }

    return NextResponse.json({ success: true, data: updatedQuotation });
  } catch (err: unknown) {
    console.error("Error updating quotation:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
