// app/api/sales/quotations/[id]/route.ts

import { db } from "@/db/drizzle";
import { quotations, quotationItems, quotationMaterials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { quotationSchema, QuotationUpdateInput } from "@/lib/quotationSchema"

type RouteContext = {
  params: Promise<{ id: string }>;
}

// interface QuotationItemInput {
//   itemName: string;
//   scopeOfWork: string;
//   materials?: Array<{
//     name: string;
//     specification?: string;
//     quantity?: number | string;
//   }>;
//   quantity: number | string;
//   unitPrice: number | string;
//   totalPrice: number | string;
// }

// interface QuotationUpdateBody {
//   delivery?: string;
//   warranty?: string;
//   validity?: string;
//   notes?: string;
//   status?: "draft" | "sent" | "revision_requested" | "accepted" | "expired" | undefined;
//   items?: QuotationItemInput[];
// }

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const json = await req.json();
    //const body: QuotationUpdateBody = await req.json();
    //const quotationId = String(id);

    const parsed = quotationSchema.partial().safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const body: QuotationUpdateInput = parsed.data;
    const quotationId = String(id);

    // fetch current quotation
    const [current] = await db
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId));

    if (!current) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // auto-increment revision
    //const newRevision = (current.revisionNumber ?? 0) + 1;

    // update quotation main fields
    // const [updatedRow] = await db
    // .update(quotations)
    // .set({
    //   delivery: body.delivery ?? current.delivery,
    //   warranty: body.warranty ?? current.warranty,
    //   validity: body.validity ?? current.validity,
    //   quotationNotes: body.quotationNotes ?? current.quotationNotes,
    //   status: body.status || current.status,
    //   revisionNumber: newRevision,
    // })
    // .where(eq(quotations.id, quotationId))
    // .returning();

    // replace items
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));

    if (body.items && body.items.length > 0) {
      const materialsToInsert: typeof quotationMaterials.$inferInsert[] = [];

      for (const item of body.items) {
        //const qty = typeof item.quantity === "string" ? parseInt(item.quantity, 10) || 0 : item.quantity || 0;
        const qty = Number(item.quantity) || 0;
        const unit = Number(item.unitPrice) || 0;
        const total = qty * unit;

        const [newItem] = await db
        .insert(quotationItems)
        .values({
          quotationId: quotationId,
          itemName: item.itemName,
          scopeOfWork: item.scopeOfWork,
          quantity: qty,
          unitPrice: unit.toFixed(2),
          totalPrice: total.toFixed(2),
        })
        .returning({ id: quotationItems.id });

        if (item.materials && item.materials.length > 0) {
          for (const m of item.materials) {
            materialsToInsert.push({
              quotationItemId: newItem.id,
              name: m.name,
              specification: m.specification ?? "",
              quantity: typeof m.quantity === "string" ? parseInt(m.quantity, 10) || 0 : m.quantity || 0,
            });
          }
        }
      }

      if (materialsToInsert.length > 0) {
        await db.insert(quotationMaterials).values(materialsToInsert);
      }
    }

    const updatedQuotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: { items: true },
    });

    if (!updatedQuotation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...updatedQuotation,
        revisionLabel: `REVISION-${String(updatedQuotation.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketchFile : updatedQuotation.cadSketch
          ? [{ name: updatedQuotation.cadSketch, filePath: `/sales/uploads/${updatedQuotation.cadSketch}` }]
          : [],
      }, 
    });
} catch (err) {
  console.error("Error updating quotation:", err);
  return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest, context: RouteContext) {

  const { id } = await context.params;

  try {
    const quotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, id),
      with: { items: true },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...quotation,
        revisionLabel: `REVISION-${String(quotation.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketchFile: quotation.cadSketch
          ? [{  name: quotation.cadSketch, filePath: `/sales/uploads/${quotation.cadSketch}`, } ]
          : [],
      },
    });
  } catch (err) {
    console.error("Error fetching quotation:", err);
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

