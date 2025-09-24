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
    let newQuotationItemId: string | undefined;

    try {
      // 1. Insert into the main `quotations` table.
      // We will now use a direct insert without a transaction.
      const [newQuotation] = await db
        .insert(quotations)
        .values({
          requestId: data.requestId,
          quotationNumber: data.quotationNumber,
          revisionNumber: data.revisionNumber,
          baseQuotationId: data.baseQuotationId,
          projectName: data.projectName,
          mode: data.mode,
          status: data.status?? "draft",
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

      // 2. Iterate and insert into `quotationItems`.
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
        newQuotationItemId = newItem.id;

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

    } catch (innerError: any) {
      // 5. Rollback logic: Clean up any records created if a later step fails.
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
  } catch (error: any) {
    console.error("Error saving quotation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save quotation. " + error.message,
      },
      { status: 500 }
    );
  }
}