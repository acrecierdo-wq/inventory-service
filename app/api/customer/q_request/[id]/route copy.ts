// // app/api/customer/q_request/[id]/route.ts

// import { db } from "@/db/drizzle";
// import { quotation_requests, quotation_request_files, customer_profile } from "@/db/schema";
// import { NextResponse, NextRequest } from "next/server";
// import { eq } from "drizzle-orm";

// type RouteContext = {
//   params: Promise<{ id: string }>;
//   id: string;
// };

// // ✅ GET request by ID
// export async function GET(req: NextRequest, context: RouteContext) {
//   const { id } = await context.params;

//   try {
//     // Fetch request by ID (serial -> number)
//     const [request] = await db
//       .select()
//       .from(quotation_requests)
//       .where(eq(quotation_requests.id, Number(id)));

//     if (!request) {
//       return NextResponse.json({ error: "Request not found." }, { status: 404 });
//     }

//     // Fetch related files (request_id -> number)
//     const files = await db
//       .select()
//       .from(quotation_request_files)
//       .where(eq(quotation_request_files.request_id, Number(id)));

//     // Fetch customer info if request has customer_id (uuid -> string)
//     let customer = null;
//     if ("customer_id" in request && request.customer_id) {
//       const [cust] = await db
//         .select()
//         .from(customer_profile)
//         .where(eq(customer_profile.id, String(request.customer_id)));
//       customer = cust || null;
//     }

//     return NextResponse.json({ ...request, files, customer });
//   } catch (err) {
//     console.error(`GET /api/customer/q_request/${id} error:`, err);
//     return NextResponse.json({ error: "Failed to fetch request." }, { status: 500 });
//   }
// }

// // ✅ PATCH request (update status)
// export async function PATCH(req: NextRequest, context: RouteContext) {
//   const { id } = await context.params;

//   try {
//     const body = await req.json();
//     const { status } = body;

//     if (!status) {
//       return NextResponse.json({ error: "Status is required." }, { status: 400 });
//     }

//     // Update the request status (serial -> number)
//     await db
//       .update(quotation_requests)
//       .set({ status })
//       .where(eq(quotation_requests.id, Number(id)));

//     // Fetch updated request + files + customer
//     const [updatedRequest] = await db
//       .select()
//       .from(quotation_requests)
//       .where(eq(quotation_requests.id, Number(id)));

//     const files = await db
//       .select()
//       .from(quotation_request_files)
//       .where(eq(quotation_request_files.request_id, Number(id)));

//     let customer = null;
//     if ("customer_id" in updatedRequest && updatedRequest.customer_id) {
//       const [cust] = await db
//         .select()
//         .from(customer_profile)
//         .where(eq(customer_profile.id, String(updatedRequest.customer_id)));
//       customer = cust || null;
//     }

//     return NextResponse.json({ ...updatedRequest, files, customer });
//   } catch (err) {
//     console.error(`PATCH /api/q_request/${id} error:`, err);
//     return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
//   }
// }
