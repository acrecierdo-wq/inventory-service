// // /app/api/sales/my_request/[id]/route.ts

// import { NextResponse, NextRequest } from "next/server";
// import { db } from "@/db/drizzle";
// import { quotation_requests } from "@/db/schema";
// import { eq } from "drizzle-orm";

// // GET one request by ID
// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const requestId = parseInt(params.id, 10);

//     const results = await db
//       .select()
//       .from(quotation_requests)
//       .where(eq(quotation_requests.id, requestId));

//     if (!results.length) {
//       return NextResponse.json({ error: "Request not found" }, { status: 404 });
//     }

//     return NextResponse.json(results[0]);
//   } catch (error) {
//     console.error("Error fetching quotation request by ID:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const requestId = parseInt(params.id, 10);
//     const { status } = await req.json();

//     // Update status
//     const updated = await db
//       .update(quotation_requests)
//       .set({ status })
//       .where(eq(quotation_requests.id, requestId))
//       .returning();

//     if (!updated.length) {
//       return NextResponse.json({ error: "Request not found" }, { status: 404 });
//     }

//     return NextResponse.json(updated[0]);
//   } catch (error) {
//     console.error("Error updating quotation request:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// /app/api/sales/my_request/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { quotation_requests, customer_profile } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params; // ✅ await params
    if (!rawId) {
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    const id = Number(rawId);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    // Select the request and left join customer_profile
    const [row] = await db
      .select({
        id: quotation_requests.id,
        //request_ref: quotation_requests.request_ref,
        project_name: quotation_requests.project_name,
        mode: quotation_requests.mode,
        status: quotation_requests.status,
        created_at: quotation_requests.created_at,
        customer_id: customer_profile.id,
        companyName: customer_profile.companyName,
        contactPerson: customer_profile.contactPerson,
        clientCode: customer_profile.clientCode,
        email: customer_profile.email,
        phone: customer_profile.phone,
        address: customer_profile.address,
      })
      .from(quotation_requests)
      .leftJoin(customer_profile, eq(customer_profile.id, quotation_requests.customer_id))
      .where(eq(quotation_requests.id, id));

    if (!row) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const formatted = {
      id: row.id,
      //request_ref: row.request_ref,
      project_name: row.project_name,
      mode: row.mode,
      status: row.status,
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
          }
        : null,
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

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
