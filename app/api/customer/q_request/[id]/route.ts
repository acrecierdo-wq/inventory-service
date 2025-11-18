// app/api/customer/q_request/[id]/route.ts

import { db } from "@/db/drizzle";
import {
  quotation_requests,
  quotation_request_files,
  customer_profile,
  quotations,
  quotationItems,
  quotationMaterials,
  quotationFiles,
  purchase_orders,
} from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeUploadPath(filePath: string) {
  if (!filePath) return "";
  // remove leading /sales/uploads or duplicate /uploads/
  const stripped = filePath.replace(/^\/?(sales\/)?uploads\/+/, "");
  return `/uploads/${stripped}`;
}

// ✅ GET quotation request (with full quotation details)
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestId = Number(id); 

    // find customer
    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    // fetch request
    const [request] = await db
      .select()
      .from(quotation_requests)
      .where(
        and(
          eq(quotation_requests.id, requestId),
          eq(quotation_requests.customer_id, customer.id)
        )
      );

    if (!request) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    // fetch  request files
    const files = await db
      .select()
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, requestId));

    const normalizedRequestFiles = files.map((f) => ({
      id: f.id,
      name: f.path.split("/").pop() || "uplaoded_file",
      filePath: normalizeUploadPath(f.path),
    }));

    // ✅ fetch quotation + nested data
    const [quotation] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.requestId, requestId));

    let normalizedQuotation = null;

    // if (!quotation) {
    //   return NextResponse.json({ ...request, files, quotation: null, customer, });
    // }

    // // ✅ fetch quotation items + materials + quotation files
    // const items = await db
    //   .select()
    //   .from(quotationItems)
    //   .where(eq(quotationItems.quotationId, quotation.id));

    // const materials = await db
    //   .select()
    //   .from(quotationMaterials)

    // const qFiles = await db
    //   .select()
    //   .from(quotationFiles)
    //   .where(eq(quotationFiles.quotationId, quotation.id));

    // // ✅ merge materials into items
    // const mergedItems = items.map((item) => ({
    //   ...item,
    //   materials: materials.filter((m) => m.quotationItemId === item.id),
    // }));
    if (quotation) {
      const items = await db
        .select()
        .from(quotationItems)
        .where(eq(quotationItems.quotationId, quotation.id));

      const materials = await db.select().from(quotationMaterials);

      const mergedItems = items.map((item) => ({
        ...item,
        materials: materials.filter((m) => m.quotationItemId === item.id),
      }));

      const qFiles = await db
        .select()
        .from(quotationFiles)
        .where(eq(quotationFiles.quotationId, quotation.id));

      const normalizedQFiles = qFiles.map((f) => ({
        id: f.id,
        name: f.fileName || f.filePath.split("/").pop() || "uploaded_files",
        filePath: normalizeUploadPath(f.filePath),
      }));

      const cadSketchFile = quotation.cadSketch
        ? [
          {
            name: quotation.cadSketch.split("/").pop() || "uploaded_file",
            filePath: normalizeUploadPath(quotation.cadSketch),
          },
        ]
      : [];

      normalizedQuotation = {
        ...quotation,
        status: quotation.status,
        items: mergedItems,
        files: normalizedQFiles,
        cadSketch: cadSketchFile,
        revisionLabel: `REVISION-${String(quotation.revisionNumber ?? 0).padStart(2, "0")}`,
      };
    }

    const purchaseOrder = quotation
      ? await db.query.purchase_orders.findFirst({
          where: eq(purchase_orders.quotationId, quotation.id),
        })
      : null;


    return NextResponse.json({
      ...request,
      files: normalizedRequestFiles,
      quotation: normalizedQuotation,
      purchaseOrder,
      quotationStatus: normalizedQuotation?.status ?? request.status,
      customer: {
        id: customer.id,
        companyName: customer.companyName,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        clientCode: customer.clientCode,
        tinNumber: customer.tinNumber,
      },
    });
  } catch (err) {
    console.error(`GET /api/customer/q_request/${id} error:`, err);
    return NextResponse.json({ error: "Failed to fetch request." }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestId = Number(id);
    const body = await req.json();
    const { status } = body;

    const allowedStatuses = ["approved", "rejected", "revision_requested"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid or missing status." }, { status: 400 });
    }

    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
    }

    const [existingRequest] = await db
      .select()
      .from(quotation_requests)
      .where(
        and(
          eq(quotation_requests.id, requestId),
          eq(quotation_requests.customer_id, customer.id)
        )
      );

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    // const [updatedRequest] = await db
    //   .update(quotation_requests)
    //   .set({ status })
    //   .where(eq(quotation_requests.id, requestId))
    //   .returning();

    const now = new Date();

    const [updatedQuotation] = await db
      .update(quotations)
      .set({ 
        status,
        customerActionAt: now,
        updatedAt: now,
      })
      .where(eq(quotations.requestId, requestId))
      .returning()

    if (!updatedQuotation) {
      return NextResponse.json({ error: "Quotation not found for this request." }, { status: 404 });
    }
    
    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, updatedQuotation.id))

    const materials = await db
      .select()
      .from(quotationMaterials);

      // const qFiles = await db
      //   .select()
      //   .from(quotationFiles)
      //   .where(eq(quotationFiles.quotationId, updatedQuotation.id));

      const mergedItems = items.map((item) => ({
        ...item,
        materials: materials.filter((m) => m.quotationItemId === item.id),
      }));

    const qFiles = await db
      .select()
      .from(quotationFiles)
      .where(eq(quotationFiles.quotationId, updatedQuotation.id));
    
    const normalizedQFiles = qFiles.map((f) => ({
      id: f.id,
      name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
      filePath: normalizeUploadPath(f.filePath),
    }));

    const cadSketchFile = updatedQuotation.cadSketch
      ? [
        {
          name: updatedQuotation.cadSketch.split("/").pop() || "uploaded_file",
          filePath: normalizeUploadPath(updatedQuotation.cadSketch),
        },
      ]
    : [];

    const files = await db
      .select()
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, requestId));
    
    const normalizedRequestFiles = files.map((f) => ({
      id: f.id,
      name: f.path.split("/").pop() || "uploaded_file",
      filePath: normalizeUploadPath(f.path),
    }));

    return NextResponse.json({
//...updatedRequest,
      files: normalizedRequestFiles,
      quotation: {
        ...updatedQuotation,
        items: mergedItems,
        files: normalizedQFiles,
        cadSketch: cadSketchFile,
        revisionLabel: `REVISION-${String(quotations.revisionNumber ?? 0).padStart(2, "0")}`,
        // cadSketch: quotations.cadSketch
        // ? [{ name: quotations.cadSketch, filePath: `/sales/uploads/${quotations.cadSketch}` }]
        // : [] as { name: string; filePath: string}[],
      },
      customer: {
        id: customer.id,
        companyName: customer.companyName,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        clientCode: customer.clientCode,
        tinNumber: customer.tinNumber
      },
      success: true,
      //message: `Quotation ${status} successfully.`,
      timestamp: new Date().toISOString(),
      
    });
  } catch (err) {
    console.error(`PUT /api/customer/q_request/${id} error:`, err);
    return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
  }
}