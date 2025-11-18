// /app/api/sales/customer_request/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { quotation_requests, customer_profile, quotation_request_files } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    if (!rawId) {
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    const id = Number(rawId);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    // Fetch main request with customer info
    const [row] = await db
      .select({
        id: quotation_requests.id,
        project_name: quotation_requests.project_name,
        mode: quotation_requests.mode,
        status: quotation_requests.status,
        message: quotation_requests.message,
        created_at: quotation_requests.created_at,
        customer_id: customer_profile.id,
        companyName: customer_profile.companyName,
        contactPerson: customer_profile.contactPerson,
        clientCode: customer_profile.clientCode,
        email: customer_profile.email,
        phone: customer_profile.phone,
        address: customer_profile.address,
        tinNumber: customer_profile.tinNumber,
      })
      .from(quotation_requests)
      .leftJoin(customer_profile, eq(customer_profile.id, quotation_requests.customer_id))
      .where(eq(quotation_requests.id, id));

    if (!row) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // ✅ Fetch related files
    const relatedFiles = await db
      .select({
        id: quotation_request_files.id,
        path: quotation_request_files.path,
      })
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, id));

    // ✅ Combine everything
    const formatted = {
      id: row.id,
      project_name: row.project_name,
      mode: row.mode,
      status: row.status,
      message: row.message,
      created_at: row.created_at,
      customer: row.customer_id
        ? {
            id: row.customer_id,
            companyName: row.companyName,
            contactPerson: row.contactPerson,
            clientCode: row.clientCode,
            email: row.email,
            phone: row.phone,
            address: row.address,
            tinNumber: row.tinNumber,
          }
        : null,
      files: relatedFiles || [], // ✅ include files array
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching single quotation request:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: update status of a request
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = [
      "Pending",
      "Accepted",
      "Rejected",
      "Cancelled",
      "Cancel_Requested",
    ] as const;

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const [updated] = await db
      .update(quotation_requests)
      .set({ status })
      .where(eq(quotation_requests.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      request: updated,
    });
  } catch (err) {
    console.error("Error updating request:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// DELETE
export async function DELETE(_req: NextRequest, context: { params : Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const files = await db
      .select({
        path: quotation_request_files.path,
      })
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, id));

      await db.delete(quotation_requests).where(eq(quotation_requests.id, id));

      for (const file of files) {
        try {
          const filePath = path.join(process.cwd(), "public", file.path);
          await fs.unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (err) {
          console.warn(`Could not delete file: ${file.path}`, err);
        }
      }

      return NextResponse.json({ success: true, message: "Request and files deleted." });
  } catch (err) {
    console.error("Error deleting request:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}