// /app/api/quotations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  quotations,
  quotationItems,
  quotationMaterials,
  quotationFiles,
} from "@/db/schema";
import { eq } from "drizzle-orm";

// Define the type for the data you expect from the front end.
type QuotationData = {
  requestId: number;
  quotationNumber: string;
  revisionNumber: number;
  baseQuotationId?: number;
  projectName: string;
  mode: string;
  validity: string;
  delivery: string;
  warranty: string;
  quotationNotes: string;
  cadSketch: string | null;
  vat: number;
  markup: number;
  status: "draft" | "sent";
  attachedFiles: Array<{
    fileName: string;
    filePath: string;
  }>;
  items: Array<{
    itemName: string;
    scopeOfWork: string;
    quantity: number;
    unitPrice: number;
    materials: Array<{
      name: string;
      specification: string;
      quantity: number;
    }>;
  }>;
};

export async function POST(req: NextRequest) {
  try {
    const data: QuotationData = await req.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Quotation must contain at least one item." },
        { status: 400 }
      );
    }

    let newQuotationId: string | undefined;

    try {
      // 1. Insert into the main quotations table.
      const [newQuotation] = await db
        .insert(quotations)
        .values({
          requestId: data.requestId,
          quotationNumber: data.quotationNumber,
          revisionNumber: data.revisionNumber,
          baseQuotationId: data.baseQuotationId,
          projectName: data.projectName,
          mode: data.mode,
          status: data.status ?? "draft",
          validity: data.validity,
          delivery: data.delivery,
          warranty: data.warranty,
          quotationNotes: data.quotationNotes,
          cadSketch: data.cadSketch,
          vat: data.vat.toFixed(2),
          markup: data.markup.toFixed(2),
        })
        .returning({ id: quotations.id });

      if (!newQuotation?.id) {
        throw new Error("Failed to create the quotation.");
      }
      newQuotationId = newQuotation.id;

      const quotationMaterialsToInsert: typeof quotationMaterials.$inferInsert[] = [];
      const quotationFilesToInsert: typeof quotationFiles.$inferInsert[] = [];

      // 2. Iterate and insert into quotationItems.
      for (const item of data.items) {
        const totalPrice = (item.quantity * item.unitPrice).toFixed(2);

        const [newItem] = await db
          .insert(quotationItems)
          .values({
            quotationId: newQuotationId,
            itemName: item.itemName,
            scopeOfWork: item.scopeOfWork,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
            totalPrice: totalPrice,
          })
          .returning({ id: quotationItems.id });

        if (!newItem?.id) {
          throw new Error("Failed to create a quotation item.");
        }

        // Prepare the materials for this item for a later batch insert.
        for (const material of item.materials) {
          quotationMaterialsToInsert.push({
            quotationItemId: newItem.id,
            name: material.name,
            specification: material.specification,
            quantity: material.quantity,
          });
        }
      }

      // 3. Prepare the file metadata for a batch insert.
      for (const file of data.attachedFiles) {
        quotationFilesToInsert.push({
          quotationId: newQuotationId,
          fileName: file.fileName,
          filePath: file.filePath,
        });
      }

      // 4. Perform efficient batch inserts for materials and files.
      if (quotationMaterialsToInsert.length > 0) {
        await db.insert(quotationMaterials).values(quotationMaterialsToInsert);
      }
      if (quotationFilesToInsert.length > 0) {
        await db.insert(quotationFiles).values(quotationFilesToInsert);
      }
    } catch (innerError: unknown) {
      console.error("Inner transaction failed, initiating rollback...", innerError);

      if (newQuotationId) {
        // Attempt to delete the quotation and all cascade-related items
        await db.delete(quotations).where(eq(quotations.id, newQuotationId));
      }

      throw innerError; // Rethrow the error to be caught by the outer try-catch
    }

    return NextResponse.json({
      success: true,
      message: "Quotation and all related data saved successfully.",
      quotation: { id: newQuotationId },
    });
  } catch (error: unknown) {
    console.error("Error saving quotation:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save quotation. " + message,
      },
      { status: 500 }
    );
  }
}


// // app/api/quotations/route.ts

// import { db } from "@/db/drizzle";
// import { quotations, quotation_items } from "@/db/schema";
// import { NextResponse } from "next/server";

// interface Item {
//   quotationId?: number; // assigned later when saving
//   itemName: string;
//   scopeOfWork: string;
//   materials: string;
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
// }

// interface QuotationRequest {
//   requestId: number;
//   status: string;
//   delivery?: string;
//   warranty?: string;
//   validity?: string;
//   notes?: string;
//   items?: Item[];
//   overallTotal: number;
// }

// export async function POST(req: Request) {
//   try {
//     const body: QuotationRequest = await req.json();

//     const { requestId, status, delivery, warranty, validity, notes, items, overallTotal } = body;

//     if (!requestId || !status) {
//       return NextResponse.json({ error: "ID and status are required." }, { status: 400 });
//     }

//     // Insert quotation
//     const [quotation] = await db
//       .insert(quotations)
//       .values({
//         requestId,
//         status,
//         delivery,
//         warranty,
//         validity: validity ? new Date(validity) : null,
//         notes,
//         overallTotal,
//       })
//       .returning();

//     if (items && items.length > 0) {
//       await db.insert(quotation_items).values(
//         items.map((item) => ({
//           quotationId: quotation.id,
//           itemName: item.itemName,
//           scopeOfWork: item.scopeOfWork,
//           materials: item.materials,
//           quantity: item.quantity,
//           unitPrice: item.unitPrice,
//           totalPrice: item.totalPrice,
//         }))
//       );
//     }

//     return NextResponse.json({ success: true, data: quotation });
//   } catch (error) {
//     console.error("POST error:", error);
//     return NextResponse.json({ error: String(error) }, { status: 500 });
//   }
// }

