import { NextResponse } from "next/server";
import { db } from "@/db/drizzle"; // adjust if your db file is in a different path
import { customer_profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// GET profile
export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    return NextResponse.json(rows[0] ?? null, { status: 200 });
  } catch (err) {
    console.error("GET /api/customer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST (create/update) profile
export async function POST(req: Request) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, email, address, phone } = body ?? {};

    if (!email || !address || !phone) {
      return NextResponse.json(
        { error: "Missing required fields (email, address, phone)" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(customer_profile)
        .set({
          fullName: fullName ?? existing[0].fullName,
          email,
          address,
          phone,
        })
        .where(eq(customer_profile.clerkId, userId));
    } else {
      await db.insert(customer_profile).values({
        clerkId: userId,
        fullName: fullName ?? "",
        email,
        address,
        phone,
      });
    }

    return NextResponse.json(
      { success: true, message: "Profile saved" },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/customer error:", err);
    return NextResponse.json(
      { error: String(err) || "Internal server error" },
      { status: 500 }
    );
  }
}
