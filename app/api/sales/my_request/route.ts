// // /app/api/sales/my_request/route.ts
// import { NextResponse } from "next/server";
// import { db } from "@/db/drizzle";
// import { quotation_requests } from "@/db/schema";

// export async function GET() {
//   try {
//     const results = await db
//       .select()
//       .from(quotation_requests)
//       .orderBy(quotation_requests.created_at);

//     // return plain array
//     return NextResponse.json(results);
//   } catch (error) {
//     console.error("Error fetching quotation requests:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// /app/api/sales/my_request/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { quotation_requests, customer_profile } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Select requests and left-join customer_profile so we can return customer metadata
    const rows = await db
      .select({
        id: quotation_requests.id,
        //request_ref: quotation_requests.request_ref, // keep any fields you need
        project_name: quotation_requests.project_name,
        mode: quotation_requests.mode,
        status: quotation_requests.status,
        created_at: quotation_requests.created_at,
        // customer fields (may be null if no customer attached)
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
      .orderBy(quotation_requests.created_at);

    // Normalize rows to put a `customer` object on each request
    const formatted = rows.map((r) => ({
      id: r.id,
      //request_ref: r.request_ref,
      project_name: r.project_name,
      mode: r.mode,
      status: r.status,
      created_at: r.created_at,
      customer: r.customer_id
        ? {
            id: r.customer_id,
            companyName: r.companyName,
            contactPerson: r.contactPerson,
            clientCode: r.clientCode,
            email: r.email,
            phone: r.phone,
            address: r.address,
          }
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching quotation requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
