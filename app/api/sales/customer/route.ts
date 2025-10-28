// app/api/sales/customer/route.ts
import { db } from "@/db/drizzle";
import { customer_profile } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const customers = await db.select().from(customer_profile);
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
