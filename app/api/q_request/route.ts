// app/api/q_request/route.ts

import { db } from "@/db/drizzle";
import { quotation_requests, quotation_request_files } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
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
    const project_name = formData.get("project_name")?.toString() || "";
    const mode = formData.get("mode")?.toString() || "";
    const message = formData.get("message")?.toString() || "";

    if (!project_name || !mode || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const [newRequest] = await db
      .insert(quotation_requests)
      .values({
        project_name,
        mode,
        message,
        status: "Pending",
        created_at: new Date(),
      })
      .returning();

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

// PATCH handler – update quotation request status (Accept / Reject / Cancel)
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required." }, { status: 400 });
    }

    // Update the status
    const updated = await db
      .update(quotation_requests)
      .set({ status })
      .where(eq(quotation_requests.id, id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: `Request ${status.toLowerCase()} successfully.`,
      data: updated[0],
    });
  } catch (err) {
    console.error("PATCH /api/q_request error:", err);
    return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
  }
}

// DELETE handler – only allow if status = Cancelled
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    const [request] = await db
      .select()
      .from(quotation_requests)
      .where(eq(quotation_requests.id, id));

    if (!request) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    if (request.status !== "Cancelled") {
      return NextResponse.json(
        { error: "Request must be cancelled before deletion." },
        { status: 400 }
      );
    }

    const files = await db
      .select()
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, id));

    for (const file of files) {
      const filePath = path.join(process.cwd(), "public", file.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.delete(quotation_request_files).where(eq(quotation_request_files.request_id, id));
    await db.delete(quotation_requests).where(eq(quotation_requests.id, id));

    return NextResponse.json({ message: "Request deleted successfully." });
  } catch (err) {
    console.error("DELETE /api/q_request error:", err);
    return NextResponse.json({ error: "Failed to delete request." }, { status: 500 });
  }
}
