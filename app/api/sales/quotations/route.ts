// app/api/sales/quotations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  quotations,
  quotationItems,
  quotationMaterials,
  quotationFiles,
  quotation_requests,
  customer_profile,
  audit_logs,
} from "@/db/schema";
import { eq, and, inArray, } from "drizzle-orm";
import { validateQuotation, DraftInput, SentInput } from "@/lib/quotationSchema";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { currentUser } from "@clerk/nextjs/server";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility: check quotations status for a request
async function getQuotationStatusByRequestId(requestId: number) {
  const quotationsForRequest = await db.query.quotations.findMany({
    where: eq(quotations.requestId, requestId),
    columns: { id: true, status: true },
  });
  const hasSent = quotationsForRequest.some((q) => q.status === "sent");
  return { hasSent, quotations: quotationsForRequest };
}

// Helper to upload any file to Cloudinary
async function uploadToCloudinary(file: { base64?: string; filePath?: string; fileName: string }, folder = "quotations") {
  try {
    if (file.base64 && file.base64.startsWith("data:")) {
      const upload = await cloudinary.uploader.upload(file.base64, {
        folder,
        public_id: `${Date.now()}_${file.fileName}`,
        resource_type: "auto",
        overwrite: false,
      });
      return upload.secure_url;
    } else if (file.filePath) {
      const upload = await cloudinary.uploader.upload(file.filePath, {
        folder,
        public_id: `${Date.now()}_${file.fileName}`,
        resource_type: "auto",
        overwrite: false,
      });
      return upload.secure_url;
    } else {
      throw new Error("No valid file to upload");
    }
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return file.filePath || ""; // fallback: store original path
  }
}

// Utility: convert deliveryDeadline string -> Date
function parseDeliveryDeadline(val?: string | null): Date | null {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d;
}

// Utility: safe string for numeric DB columns
const safeString = (v: number | string | undefined | null, fallback = "0") =>
  v === undefined || v === null ? fallback : String(v);

// ---------------- POST ----------------
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    let data: DraftInput | SentInput;

    // Validate input
    try {
      data = validateQuotation(json);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: err.flatten().fieldErrors }, { status: 400 });
      }
      throw err;
    }

    // Get current user
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = user.publicMetadata?.role;
    if (role !== "sales" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });
    }

    let quotationId = "";

    // Validate linked request & customer
    const [request] = await db.select().from(quotation_requests).where(eq(quotation_requests.id, data.requestId));
    if (!request) return NextResponse.json({ success: false, error: "Invalid requestId" }, { status: 400 });

    const [customer] = await db.select().from(customer_profile).where(eq(customer_profile.id, request.customer_id));
    if (!customer?.clientCode) return NextResponse.json({ success: false, error: "Missing client code in customer profile." }, { status: 400 });
    const clientCode = customer.clientCode;

    const quotationStatus: "draft" | "sent" = data.status === "sent" ? "sent" : "draft";

    // ---------------- Case 1: Revision ----------------
    if (data.baseQuotationId) {
      const [baseQuotation] = await db.select().from(quotations).where(eq(quotations.id, data.baseQuotationId));
      if (!baseQuotation) return NextResponse.json({ success: false, error: "Base quotation not found." }, { status: 404 });

      const nextRevisionNumber = (baseQuotation.revisionNumber ?? 0) + 1;

      const [newRevision] = await db.insert(quotations).values({
        requestId: baseQuotation.requestId,
        projectName: data.projectName ?? baseQuotation.projectName,
        status: quotationStatus,
        payment: data.payment ?? baseQuotation.payment,
        delivery: data.delivery ?? baseQuotation.delivery,
        validity: data.validity ?? baseQuotation.validity,
        warranty: data.warranty ?? baseQuotation.warranty,
        quotationNotes: data.quotationNotes ?? baseQuotation.quotationNotes,
        cadSketch: null,
        vat: safeString(data.vat ?? baseQuotation.vat ?? 12),
        markup: safeString(data.markup ?? baseQuotation.markup ?? 5),
        quotationNumber: baseQuotation.quotationNumber,
        revisionNumber: nextRevisionNumber,
        deliveryType: data.deliveryType ?? baseQuotation.deliveryType ?? null,
        deliveryDeadline: parseDeliveryDeadline(data.deliveryDeadline?.toString() ?? baseQuotation.deliveryDeadline?.toString()) ?? null,
      }).returning({ id: quotations.id });

      quotationId = newRevision.id;

      // Upload cadSketch
      if (data.cadSketch) {
        const cadUrl = await uploadToCloudinary({ base64: data.cadSketch, fileName: `cad_${Date.now()}` }, "quotations/cad_sketch");
        await db.update(quotations).set({ cadSketch: cadUrl }).where(eq(quotations.id, quotationId));
      } else if (baseQuotation.cadSketch) {
        await db.update(quotations).set({ cadSketch: baseQuotation.cadSketch }).where(eq(quotations.id, quotationId));
      }

      // Insert items & materials
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const totalPrice = Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0);
          const [newItem] = await db.insert(quotationItems).values({
            quotationId,
            itemName: item.itemName ?? "(Untitled Item)",
            scopeOfWork: item.scopeOfWork ?? "(To be defined)",
            quantity: item.quantity ?? 0,
            unitPrice: safeString(item.unitPrice ?? 0),
            totalPrice: safeString(totalPrice.toFixed(2)),
          }).returning({ id: quotationItems.id });

          if (item.materials?.length) {
            for (const mat of item.materials) {
              await db.insert(quotationMaterials).values({
                quotationItemId: newItem.id,
                name: mat.name ?? "(Unnamed material)",
                specification: mat.specification ?? "",
                quantity: mat.quantity ?? 0,
              });
            }
          }
        }
      }

      // Upload attached files
      if (Array.isArray(data.attachedFiles)) {
        for (const file of data.attachedFiles) {
          const uploadedFilePath = await uploadToCloudinary(file);
          await db.insert(quotationFiles).values({
            quotationId,
            fileName: file.fileName,
            filePath: uploadedFilePath,
            uploadedAt: new Date(),
          });
        }
      }

      // Audit log
      await db.insert(audit_logs).values({
        entity: "Quotation",
        entityId: quotationId,
        action: "REVISION",
        description: `Created revision ${nextRevisionNumber} for quotation ${baseQuotation.quotationNumber} (request ${data.requestId})`,
        actorId: user.id,
        actorName: user.username || "Sales",
        actorRole: role || "Sales",
        timestamp: new Date(),
        module: "Sales / Quotation",
      });

      const refreshed = await db.query.quotations.findFirst({
        where: eq(quotations.id, quotationId),
        with: { items: { with: { materials: true } }, files: true },
      });

      return NextResponse.json({
        success: true,
        message: `Revision ${nextRevisionNumber} created successfully.`,
        data: {
          ...refreshed,
          revisionLabel: `REVISION-${String(nextRevisionNumber).padStart(2, "0")}`,
        },
      });
    }

    // ---------------- Case 2: Update existing ----------------
    if (data.id) {
      quotationId = data.id;

      // Update quotation
      await db.update(quotations).set({
        projectName: data.projectName ?? "",
        status: quotationStatus,
        payment: data.payment ?? "",
        delivery: data.delivery ?? "",
        validity: data.validity ?? "",
        warranty: data.warranty ?? "",
        quotationNotes: data.quotationNotes ?? "",
        cadSketch: null,
        vat: safeString(data.vat ?? 12),
        markup: safeString(data.markup ?? 5),
        updatedAt: new Date(),
        deliveryType: data.deliveryType ?? null,
        deliveryDeadline: parseDeliveryDeadline(data.deliveryDeadline) ?? null,
      }).where(eq(quotations.id, quotationId));

      // Upload cadSketch
      if (data.cadSketch) {
        const cadUrl = await uploadToCloudinary({ base64: data.cadSketch, fileName: `cad_${Date.now()}` }, "quotations/cad_sketch");
        await db.update(quotations).set({ cadSketch: cadUrl }).where(eq(quotations.id, quotationId));
      }

      // Delete old items/materials/files
      await db.delete(quotationMaterials).where(
        inArray(
          quotationMaterials.quotationItemId,
          db.select({ id: quotationItems.id }).from(quotationItems).where(eq(quotationItems.quotationId, quotationId))
        )
      );
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));
      if (Array.isArray(data.attachedFiles) && data.attachedFiles.length > 0) {
  // Only delete when user explicitly re-attaches files
  await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, quotationId));
}

      // Audit log
      await db.insert(audit_logs).values({
        entity: "Quotation",
        entityId: quotationId,
        action: data.status === "sent" ? "SENT" : "UPDATED",
        description: data.status === "sent"
          ? `Sent quotation for request ${data.requestId}`
          : `Updated quotation (draft) for request ${data.requestId}`,
        actorId: user.id,
        actorName: user.username || "Sales",
        actorRole: role || "Sales",
        timestamp: new Date(),
        module: "Sales / Quotation",
      });
    }

    // ---------------- Case 3: Create new ----------------
    if (!data.id && !data.baseQuotationId) {
      const [newQuotation] = await db.insert(quotations).values({
        requestId: data.requestId,
        projectName: data.projectName ?? "",
        status: quotationStatus,
        payment: data.payment ?? "",
        delivery: data.delivery ?? "",
        validity: data.validity ?? "",
        warranty: data.warranty ?? "",
        quotationNotes: data.quotationNotes ?? "",
        cadSketch: null,
        vat: safeString(data.vat ?? 12),
        markup: safeString(data.markup ?? 5),
        revisionNumber: 0,
        deliveryType: data.deliveryType ?? null,
        deliveryDeadline: parseDeliveryDeadline(data.deliveryDeadline) ?? null,
      }).returning({ id: quotations.id, quotationSeq: quotations.quotationSeq });

      quotationId = newQuotation.id;

      // Set formatted quotation number
      const formattedNumber = `CTIC-${clientCode}-${String(newQuotation.quotationSeq).padStart(8, "0")}`;
      await db.update(quotations).set({ quotationNumber: formattedNumber }).where(eq(quotations.id, quotationId));

      // Upload cadSketch
      if (data.cadSketch) {
        const cadUrl = await uploadToCloudinary({ base64: data.cadSketch, fileName: `cad_${Date.now()}` }, "quotations/cad_sketch");
        await db.update(quotations).set({ cadSketch: cadUrl }).where(eq(quotations.id, quotationId));
      }

      // Audit log
      await db.insert(audit_logs).values({
        entity: "Quotation",
        entityId: quotationId,
        action: "CREATE",
        description: `Created quotation ${formattedNumber} for request ${data.requestId}`,
        actorId: user.id,
        actorName: user.username || "Sales",
        actorRole: role || "Sales",
        timestamp: new Date(),
        module: "Sales / Quotation",
      });
    }

    // ---------------- Insert items & materials ----------------
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        const totalPrice = Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0);
        const [newItem] = await db.insert(quotationItems).values({
          quotationId,
          itemName: item.itemName ?? "(Untitled Item)",
          scopeOfWork: item.scopeOfWork ?? "(To be defined)",
          quantity: item.quantity ?? 0,
          unitPrice: safeString(item.unitPrice ?? 0),
          totalPrice: safeString(totalPrice.toFixed(2)),
        }).returning({ id: quotationItems.id });

        if (item.materials?.length) {
          for (const mat of item.materials) {
            await db.insert(quotationMaterials).values({
              quotationItemId: newItem.id,
              name: mat.name ?? "(Unnamed material)",
              specification: mat.specification ?? "",
              quantity: mat.quantity ?? 0,
            });
          }
        }
      }
    }

    // ---------------- Upload attached files ----------------
    if (Array.isArray(data.attachedFiles)) {
      for (const file of data.attachedFiles) {
        const uploadedFilePath = await uploadToCloudinary(file);
        await db.insert(quotationFiles).values({
          quotationId,
          fileName: file.fileName,
          filePath: uploadedFilePath,
          uploadedAt: new Date(),
        });
      }
    }

    // Fetch final quotation
    const refreshed = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: { items: { with: { materials: true } }, files: true, request: { with: { customer: true } } },
    });

    return NextResponse.json({
      success: true,
      message: data.id ? "Quotation updated successfully." : "Quotation created successfully!",
      data: {
        ...refreshed,
        revisionLabel: `REVISION-${String(refreshed?.revisionNumber ?? 0).padStart(2, "0")}`,
        customer: refreshed?.request?.customer ?? null,
      },
    });

  } catch (err) {
    console.error("Error saving quotation:", err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

// ---------------- GET ----------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const requestId = searchParams.get("requestId");

    // Check status shortcut
    if (searchParams.has("checkStatus") && requestId) {
      const result = await getQuotationStatusByRequestId(Number(requestId));
      return NextResponse.json({ success: true, ...result });
    }

    const conditions = [];
    if (status) {
      if (status === "draft") {
        conditions.push(inArray(quotations.status, ["draft", "restoring"]));
      } else {
        conditions.push(eq(quotations.status, status as typeof quotations.$inferSelect.status));
      }
    }
    if (requestId) conditions.push(eq(quotations.requestId, Number(requestId)));
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const allQuotations = await db.query.quotations.findMany({
      where: whereClause,
      with: {
        items: { with: { materials: true } },
        files: true,
        request: { with: { customer: true } },
      },
    });

    const normalized = allQuotations.map((q) => ({
      ...q,
      deliveryType: q.deliveryType ?? null,
      deliveryDeadline: q.deliveryDeadline ?? null,
      cadSketchFile:
        q.files?.length > 0
          ? q.files.map((f) => ({
              id: f.id,
              name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
              filePath: f.filePath, // Already Cloudinary URL from POST
            }))
          : q.cadSketch
          ? [{ name: q.cadSketch.split("/").pop() || "uploaded_file", filePath: q.cadSketch }]
          : [],
      revisionLabel: `REVISION-${String(q.revisionNumber ?? 0).padStart(2, "0")}`,
      customer: q.request?.customer
        ? {
            companyName: q.request.customer.companyName,
            contactPerson: q.request.customer.contactPerson,
            email: q.request.customer.email,
            address: q.request.customer.address,
            phone: q.request.customer.phone,
            clientCode: q.request.customer.clientCode,
            tinNumber: q.request.customer.tinNumber,
          }
        : null,
      vat: Number(q.vat) || 12,
      markup: Number(q.markup) || 5,
    }));

    return NextResponse.json({ success: true, quotations: normalized });
  } catch (err) {
    console.error("Error fetching quotations:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch quotations." }, { status: 500 });
  }
}

