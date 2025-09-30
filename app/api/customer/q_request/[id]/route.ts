// app/api/customer/q_request/[id]/route.ts

import { db } from "@/db/drizzle";
import { quotation_requests, quotation_request_files, customer_profile } from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ✅ GET request by ID
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("🔑 userId:", userId);



  //const { id } = await context.params;

  try {
    const requestId = Number(id);

    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

      if (!customer) {
        console.log("👤 customer:", customer);
        return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
      }

    // Fetch request by ID (serial -> number)
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
      console.log("📄 requestId:", requestId);

      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    // Fetch related files (request_id -> number)
    const files = await db
      .select()
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, requestId));

      return NextResponse.json({ 
      ...request, 
      files, 
      customer: {
        id: customer.id,
        companyName: customer.companyName,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.email,
        address: customer.address,
        clientCode: customer.clientCode,
      },
    });
  } catch (err) {
    console.error(`GET /api/customer/q_request/${id} error:`, err);
    return NextResponse.json({ error: "Failed to fetch request." }, { status: 500 });
  }
}
    

// ✅ PATCH request (update status)
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestId  = Number(id);
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }
    
    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    if (!customer) {
      return NextResponse.json({ error: "Cutsomer profile not found" }, { status: 404 });
    }

    // fetch existing request
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
      return NextResponse.json({ error: "Request not found."}, { status: 404 });
    }

    if (
      ["Pending", "Sent"].includes(status) &&
      (!customer?.phone || !customer?.address || !customer?.clientCode)
    ) {
      return NextResponse.json({ error: "Profile incomplete. Please set phone, address, and client code before updating status."}, { status: 403 });
    }

    // update request status
    const [updatedRequest] = await db
      .update(quotation_requests)
      .set({ status })
      .where(eq(quotation_requests.id, requestId))
      .returning();

    const files = await db
      .select()
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, requestId));
    
    return NextResponse.json({ 
      ...updatedRequest, 
      files, 
      customer 
    });
  } catch (err) {
    console.error(`PUT /api/customer/q_request/${id} error:`, err);
    return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
  }
}
