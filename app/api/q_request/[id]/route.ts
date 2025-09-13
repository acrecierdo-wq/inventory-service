// app/api/q_request/[id]/route.ts

import { db } from "@/db/drizzle";
import { quotation_requests, quotation_request_files } from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
  id: string;
};

// ✅ GET request by ID
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  

  try {
    // Fetch request by ID
    const [request] = await db
      .select()
      .from(quotation_requests)
      .where(eq(quotation_requests.id, Number(id)));

    if (!request) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    // Fetch related files
    const files = await db
      .select()
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, request.id));

    return NextResponse.json({ ...request, files });
  } catch (err) {
    console.error(`GET /api/q_request/${id} error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch request." },
      { status: 500 }
    );
  }
}

// ✅ PATCH request (update status, e.g. Cancel)
export async function PATCH(req: NextRequest, context: RouteContext ) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required." },
        { status: 400 }
      );
    }

    // Update the request status
    await db
      .update(quotation_requests)
      .set({ status })
      .where(eq(quotation_requests.id, Number(id)));

    return NextResponse.json({ success: true, id, status });
  } catch (err) {
    console.error(`PATCH /api/q_request/${id} error:`, err);
    return NextResponse.json(
      { error: "Failed to update request." },
      { status: 500 }
    );
  }
}
