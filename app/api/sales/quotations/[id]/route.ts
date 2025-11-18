// app/api/sales/quotations/[id]/route.ts
import { db } from "@/db/drizzle";
import { quotations, quotationItems, quotationMaterials, quotationFiles } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { validateQuotation } from "@/lib/quotationSchema";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Route context type
type RouteContext = { params: Promise<{ id: string }> };

// ---------------- Helper ----------------
function parseDeliveryDeadline(val?: string | null): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

async function uploadFileToCloudinary(base64: string, folder: string, fileName: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    public_id: `${Date.now()}_${fileName}`,
    resource_type: "auto",
    overwrite: false,
  });
  return result.secure_url;
}

// ---------------- PUT — update quotation by ID ----------------
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const quotationId = String(id);
    const json = await req.json();

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

    const [current] = await db.select().from(quotations).where(eq(quotations.id, quotationId));
    if (!current) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    const validStatuses = ["draft", "restoring", "sent", "approved", "rejected"];
    if (data.status && !validStatuses.includes(data.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Handle restoring/sent logic
    if (data.status === "restoring") {
      await db.update(quotations).set({ status: "draft" }).where(
        and(
          eq(quotations.requestId, current.requestId),
          eq(quotations.status, "restoring"),
          not(eq(quotations.id, quotationId))
        )
      );
    }
    if (data.status === "sent") {
      await db.delete(quotations).where(
        and(
          eq(quotations.requestId, current.requestId),
          eq(quotations.status, "restoring"),
          not(eq(quotations.id, quotationId))
        )
      );
    }

    // ---------------- Update main quotation ----------------
    let cadSketchUrl = data.cadSketch ?? current.cadSketch;
    if (data.cadSketch?.startsWith("data:")) {
      cadSketchUrl = await uploadFileToCloudinary(data.cadSketch, "quotations/cad_sketch", "cadSketch");
    }

    await db.update(quotations).set({
      projectName: data.projectName ?? current.projectName,
      quotationNotes: data.quotationNotes ?? current.quotationNotes,
      payment: data.payment ?? current.payment,
      delivery: data.delivery ?? current.delivery,
      warranty: data.warranty ?? current.warranty,
      validity: data.validity ?? current.validity,
      vat: String(data.vat ?? current.vat ?? 12),
      markup: String(data.markup ?? current.markup ?? 5),
      status: data.status ?? current.status,
      cadSketch: cadSketchUrl,
      deliveryType: data.deliveryType ?? current.deliveryType,
      deliveryDeadline: parseDeliveryDeadline(data.deliveryDeadline) ?? current.deliveryDeadline,
      updatedAt: new Date(),
    }).where(eq(quotations.id, quotationId));

    // ---------------- Items & Materials ----------------
    if (data.items) {
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));
      const materialsToInsert: typeof quotationMaterials.$inferInsert[] = [];

      for (const item of data.items) {
        const qty = Number(item.quantity) || 0;
        const unit = Number(item.unitPrice) || 0;
        const total = qty * unit;

        const [newItem] = await db.insert(quotationItems).values({
          quotationId,
          itemName: item.itemName ?? "(Untitled Item)",
          scopeOfWork: item.scopeOfWork ?? "(To be defined)",
          quantity: qty,
          unitPrice: unit.toFixed(2),
          totalPrice: total.toFixed(2),
        }).returning({ id: quotationItems.id });

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
      if (materialsToInsert.length) await db.insert(quotationMaterials).values(materialsToInsert);
    }

// ---------------- Attached Files ----------------
if ("attachedFiles" in data) {
  // Only update if the array has files
  if (Array.isArray(data.attachedFiles) && data.attachedFiles.length > 0) {
    // Remove existing files for this quotation
    await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, quotationId));

    // Prepare new files to insert
    const filesToInsert: typeof quotationFiles.$inferInsert[] = [];

    for (const file of data.attachedFiles) {
      let fileUrl = file.filePath;

      // Upload if base64 is provided
      if (file.base64?.startsWith("data:")) {
        fileUrl = await uploadFileToCloudinary(file.base64, "quotations", file.fileName);
      }

      filesToInsert.push({
        quotationId,
        fileName: file.fileName,
        filePath: fileUrl,
        uploadedAt: new Date(),
      });
    }

    // Insert new files
    if (filesToInsert.length > 0) {
      await db.insert(quotationFiles).values(filesToInsert);
    }
  }

  // If attachedFiles is empty → DO NOTHING (keep existing DB files)
}

    // ---------------- Fetch updated quotation ----------------
    const refreshed = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: { items: { with: { materials: true } }, files: true },
    });
    if (!refreshed) return NextResponse.json({ error: "Quotation not found after update" }, { status: 404 });

const attachedFiles = refreshed.files?.length > 0
  ? refreshed.files.map((f) => ({ id: f.id, fileName: f.fileName, filePath: f.filePath, uploadedAt: f.uploadedAt }))
  : [];

const cadSketchFile =
  refreshed.cadSketch
    ? [{ name: refreshed.cadSketch.split("/").pop() || "cadSketch", filePath: refreshed.cadSketch }]
    : [];

return NextResponse.json({
  success: true,
  message: "Quotation updated successfully",
  data: {
    ...refreshed,
    revisionLabel: `REVISION-${String(refreshed.revisionNumber ?? 0).padStart(2, "0")}`,
    attachedFiles,    // <--- add this
    cadSketchFile,    // keep if needed (nullable)
  },
});


  } catch (err) {
    console.error("Error updating quotation:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

// ---------------- GET — fetch quotation by ID ----------------
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const quotationId = String(id);

  if (!quotationId || quotationId === "NaN") 
    return NextResponse.json({ success: false, error: "Invalid or missing quotation ID" }, { status: 400 });

  try {
    const quotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: { items: { with: { materials: true } }, files: true, request: { with: { customer: true } } },
    });

    if (!quotation) 
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    const revisionLabel = `REVISION-${String(quotation.revisionNumber ?? 0).padStart(2, "0")}`;

    // Map attachedFiles without id
    const attachedFiles = quotation.files?.length > 0
      ? quotation.files.map(f => ({
          fileName: f.fileName,
          filePath: f.filePath,
          uploadedAt: f.uploadedAt,
        }))
      : [];

    const cadSketchFile = quotation.cadSketch
      ? [{ name: quotation.cadSketch.split("/").pop() || "cadSketch", filePath: quotation.cadSketch }]
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...quotation,
        revisionLabel,
        cadSketchFile,
        attachedFiles,
        deliveryType: quotation.deliveryType ?? null,
        deliveryDeadline: quotation.deliveryDeadline ?? null,
        customer: quotation.request?.customer
          ? {
              id: quotation.request.customer.id,
              companyName: quotation.request.customer.companyName,
              contactPerson: quotation.request.customer.contactPerson,
              email: quotation.request.customer.email,
              phone: quotation.request.customer.phone,
              address: quotation.request.customer.address,
              clientCode: quotation.request.customer.clientCode,
              tinNumber: quotation.request.customer.tinNumber,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("Error fetching quotation:", err);
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 });
  }
}

// ---------------- DELETE — delete quotation by ID ----------------
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await db.delete(quotations).where(eq(quotations.id, String(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting quotation:", err);
    return NextResponse.json({ success: false, error: "Failed to delete quotation" }, { status: 500 });
  }
}
