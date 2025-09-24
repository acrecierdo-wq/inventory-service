import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { quotation_requests } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET one request by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = parseInt(params.id, 10);

    const results = await db
      .select()
      .from(quotation_requests)
      .where(eq(quotation_requests.id, requestId));

    if (!results.length) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    console.error("Error fetching quotation request by ID:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
