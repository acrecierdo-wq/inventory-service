// app/api/sales/customer_request/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import {
  quotation_requests,
  quotation_request_files,
  customer_profile,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    // ✅ Build base query
    const baseQuery = db
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
        tinNumber: customer_profile.tinNumber,
        email: customer_profile.email,
        phone: customer_profile.phone,
        address: customer_profile.address,
      })
      .from(quotation_requests)
      .leftJoin(
        customer_profile,
        eq(customer_profile.id, quotation_requests.customer_id)
      );

    // ✅ Add condition dynamically before executing
    const requests = await (customerId
      ? baseQuery
          .where(eq(quotation_requests.customer_id, Number(customerId)))
          .orderBy(asc(quotation_requests.created_at))
      : baseQuery.orderBy(asc(quotation_requests.created_at)));

    // ✅ Fetch all files once
    const files = await db
      .select({
        id: quotation_request_files.id,
        request_id: quotation_request_files.request_id,
        path: quotation_request_files.path,
      })
      .from(quotation_request_files);

    // ✅ Attach files to each request
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
              tinNumber: r.tinNumber,
            }
          : null,
        files: relatedFiles,
      };
    });

    // ✅ If filtering by customerId, return combined info
    if (customerId && formatted.length > 0) {
      const customer = formatted[0].customer;
      return NextResponse.json({
        customer,
        requests: formatted.map((r) => ({
          id: r.id,
          status: r.status,
          project_name: r.project_name,
          created_at: r.created_at,
        })),
      });
    }

    // ✅ Return all requests
    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching quotation requests:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
