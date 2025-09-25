// app/api/q_request/route.ts

import { db } from "@/db/drizzle";
import { quotation_requests, quotation_request_files, customer_profile } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc, eq, isNotNull } from "drizzle-orm";
import path from "path";
import fs from "fs";

// Directory to store uploaded files
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// GET handler – fetch all quotation requests or a single request by query ?id=
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const [request] = await db
        .select()
        .from(quotation_requests)
        .where(eq(quotation_requests.id, Number(id)));

      if (!request) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
      }

      const files = await db
        .select()
        .from(quotation_request_files)
        .where(eq(quotation_request_files.request_id, request.id));

      return NextResponse.json({ ...request, files });
    } else {
      const requests = await db
        .select()
        .from(quotation_requests)
        .orderBy(desc(quotation_requests.created_at));

      const requestsWithFiles = await Promise.all(
        requests.map(async (req) => {
          const files = await db
            .select()
            .from(quotation_request_files)
            .where(eq(quotation_request_files.request_id, req.id));

          return {
            id: req.id,
            project_name: req.project_name,
            mode: req.mode,
            message: req.message,
            status: req.status,
            created_at: req.created_at,
            files,
          };
        })
      );

      return NextResponse.json(requestsWithFiles);
    }
  } catch (err) {
    console.error("GET /api/q_request error:", err);
    return NextResponse.json(
      { error: "Failed to fetch quotation requests." },
      { status: 500 }
    );
  }
}

// POST handler – submit new quotation request
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract fields
    const project_name = formData.get("project_name")?.toString() || "";
    const mode = formData.get("mode")?.toString() || "";
    const message = formData.get("message")?.toString() || "";
    const requesterName = formData.get("requester_name")?.toString() || "";
    const requesterAddress = formData.get("requester_address")?.toString() || "";
    const requesterContact = formData.get("requester_contact")?.toString() || "";
    const requesterEmail = formData.get("requester_email")?.toString() || "";

    // Validate required fields
    if (!project_name || !mode || !message || !requesterName || !requesterAddress || !requesterContact || !requesterEmail) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Find existing customer by email
    let [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.email, requesterEmail));

    // If customer doesn't exist, create a new one
    if (!customer) {
      [customer] = await db
        .insert(customer_profile)
        .values({
          fullName: requesterName,
          email: requesterEmail,
          address: requesterAddress,
          phone: requesterContact,
          clerkId: requesterEmail,
          id: requesterEmail,
        })
        .returning();
    }

    // Insert quotation request
    const [newRequest] = await db
      .insert(quotation_requests)
      .values({
        project_name,
        mode,
        message,
        status: "Pending",
        customer_id: customer.id,
        created_at: new Date(),
      })
      .returning();

    // Handle multiple file uploads
    for (const [key, value] of formData.entries()) {
      if ((key === "files" || key === "file") && value instanceof File) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${value.name}`;
        const filePath = path.join(uploadDir, fileName);

        const buffer = Buffer.from(await value.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        await db.insert(quotation_request_files).values({
          request_id: newRequest.id,
          path: `/uploads/${fileName}`,
          uploaded_at: new Date(),
        });
      }
    }

    return NextResponse.json({
      message: "Quotation request submitted successfully.",
      data: newRequest,
    });
  } catch (err) {
    console.error("POST /api/q_request error:", err);
    return NextResponse.json({ error: "Failed to submit quotation request." }, { status: 500 });
  }
}
