// app/api/customer/route.ts

import { NextResponse, NextRequest } from "next/server";
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
      return NextResponse.json({ status: "unauthorized", error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    if (rows.length === 0) {
      return NextResponse.json({ status: "no-profile", error: "Customer profile not found"}, { status: 200 });
    }

    const profile = rows[0];

    const incomplete =
    !profile.companyName || !profile.contactPerson || !profile.phone || !profile.address || !profile.clientCode;

    if (incomplete) {
      return NextResponse.json({ status: "incomplete-profile", data: profile }, { status: 200 });
    }

    return NextResponse.json({ status: "ok", data: profile }, { status: 200 });
  } catch (err) {
    console.error("GET /api/customer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST (create/update) profile
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, contactPerson, email, address, phone, clientCode } = body ?? {};

    if (!companyName || !contactPerson || !email || !address || !phone || !clientCode) {
      return NextResponse.json(
        { error: "Missing required fields (companyname, contactPerson,email, address, phone, clientCode)" },
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
          companyName: body.companyname,
          contactPerson: contactPerson ?? existing[0].contactPerson,
          address: body.address,
          phone: body.phone,
          clientCode: body.clientCode,
        })
        .where(eq(customer_profile.clerkId, userId));
    } else {
      await db.insert(customer_profile).values({
        clerkId: userId,
        companyName,
        contactPerson: contactPerson ?? "",
        email,
        address,
        phone,
        clientCode: body.clientCode,
      });
    }

    return NextResponse.json(
      { success: true, message: "Profile saved!" },
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
