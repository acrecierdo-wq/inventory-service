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

import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  quotation_requests,
  customer_profile,
  quotation_request_files,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch all requests + customer info
    const requests = await db
      .select({
        id: quotation_requests.id,
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
      .orderBy(quotation_requests.created_at);

    // Fetch all files once
    const files = await db
      .select({
        id: quotation_request_files.id,
        request_id: quotation_request_files.request_id,
        path: quotation_request_files.path,
      })
      .from(quotation_request_files);

    // Attach files to each request
    const formatted = requests.map((r) => {
      const relatedFiles = files.filter((f) => f.request_id === r.id);
      return {
        id: r.id,
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
        files: relatedFiles,
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching quotation requests:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
