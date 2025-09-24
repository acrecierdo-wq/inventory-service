import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { quotation_requests } from "@/db/schema";

export async function GET() {
  try {
    const results = await db.select().from(quotation_requests).orderBy(quotation_requests.created_at);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching quotation requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
