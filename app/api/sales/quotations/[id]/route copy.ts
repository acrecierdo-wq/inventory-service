// app/api/sales/quotations/[id]/route.ts

import { db } from "@/db/drizzle";
import { quotations, quotationItems, quotationMaterials, quotationFiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { validateQuotation } from "@/lib/quotationSchema";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * ✅ PUT — update quotation by ID
 * Used for marking draft as "restoring", "draft", or updating data.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const json = await req.json();
    const quotationId = String(id);

    let data;
    try {
      data = validateQuotation({
        ...json,
        status: json.status === "restoring" ? "restoring" : json.status,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: err.flatten().fieldErrors }, { status: 400 });
      }
      throw err;
    }

    const [current] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, quotationId));

    if (!current) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const validStatuses = ["draft", "restoring", "sent", "approved", "rejected"];
    if (data.status && !validStatuses.includes(data.status)) {
      console.log("Quotation status received:", data.status);
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
  
    await db
      .update(quotations)
      .set({
        projectName: data.projectName ?? current.projectName,
        quotationNotes: data.quotationNotes ?? current.quotationNotes,
        payment: data.payment ?? current.payment,
        delivery: data.delivery ?? current.delivery,
        warranty: data.warranty ?? current.warranty,
        validity: data.validity ?? current.validity,
        vat: String(data.vat ?? current.vat ?? 12),
        markup: String(data.markup ?? current.markup ?? 5),
        status: data.status ?? current.status,
        mode: data.mode ?? current.mode,
        cadSketch: data.cadSketch ?? current.cadSketch,
        updatedAt: new Date(),
      })
      .where(eq(quotations.id, quotationId))
      .returning();

    if (data.items) {
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));
      const materialsToInsert: typeof quotationMaterials.$inferInsert[] = [];

      for (const item of data.items) {
        const qty = Number(item.quantity) || 0;
        const unit = Number(item.unitPrice) || 0;
        const total = qty * unit;

        const [newItem] = await db
          .insert(quotationItems)
          .values({
            quotationId,
            itemName: item.itemName ?? "(Untitled Item)",
            scopeOfWork: item.scopeOfWork ?? "(To be defined)",
            quantity: qty,
            unitPrice: unit.toFixed(2),
            totalPrice: total.toFixed(2),
          })
          .returning({ id: quotationItems.id });

        if (item.materials?.length) {
          for (const m of item.materials) {
            materialsToInsert.push({
              quotationItemId: newItem.id,
              name: m.name ?? "(Unnamed material)",
              specification: m.specification ?? "",
              quantity: Number(m.quantity) || 0,
            });
          }
        }
      }

      if (materialsToInsert.length) {
        await db.insert(quotationMaterials).values(materialsToInsert);
      }
    }

    if (Array.isArray(data.attachedFiles) && data.attachedFiles.length > 0) {
      await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, quotationId));

      await db.insert(quotationFiles).values(
        data.attachedFiles.map((f) => ({
          quotationId,
          fileName: f.fileName,
          filePath: f.filePath,
          uploadedAt: new Date(),
        }))
      );
    }

    const refreshed = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: { 
        items: {with: { materials: true }}, 
        files: true,
      },
    });

    if (!refreshed) {
      return NextResponse.json({ error: "Quotation not found after update" }, { status: 404 });
    }

    const cadSketchFile =
  refreshed.files?.length > 0
    ? refreshed.files.map((f) => ({
        id: f.id,
        name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
        filePath: f.filePath.startsWith("/uploads/")
          ? f.filePath
          : `/uploads/${f.filePath.replace(/^\/+/, "")}`,
      }))
    : refreshed.cadSketch
    ? [
        {
          name: refreshed.cadSketch,
          filePath: refreshed.cadSketch.startsWith("/uploads/")
            ? refreshed.cadSketch
            : `/uploads/${refreshed.cadSketch.replace(/^\/+/, "")}`,
        },
      ]
    : [];

    return NextResponse.json({
      success: true,
      message: "Quotation updated successfully",
      data: {
        ...refreshed,
        revisionLabel: `REVISION-${String(refreshed.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketchFile,
      },
    });
  } catch (err) {
    console.error("Error updating quotation:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ GET — fetch quotation by ID
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const quotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, id),
      with: { 
        items: {with: { materials: true }}, 
        files: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

     const cadSketchFile =
  quotation.files?.length > 0
    ? quotation.files.map((f) => ({
        id: f.id,
        name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
        filePath: f.filePath.startsWith("/uploads/")
          ? f.filePath
          : `/uploads/${f.filePath.replace(/^\/+/, "")}`,
      }))
    : quotation.cadSketch
    ? [
        {
          name: quotation.cadSketch,
          filePath: quotation.cadSketch.startsWith("/uploads/")
            ? quotation.cadSketch
            : `/uploads/${quotation.cadSketch.replace(/^\/+/, "")}`,
        },
      ]
    : [];

    return NextResponse.json({
      success: true,
      data: {
        ...quotation,
        revisionLabel: `REVISION-${String(quotation.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketchFile,
      },
    });
  } catch (err) {
    console.error("Error fetching quotation:", err);
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 });
  }
}

/**
 * ✅ DELETE — delete quotation by ID
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    await db.delete(quotations).where(eq(quotations.id, String(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting quotation:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}

