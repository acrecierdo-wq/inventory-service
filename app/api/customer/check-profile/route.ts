// app/api/customer/check-profile/route.ts

import { db } from "@/db/drizzle";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { customer_profile } from "@/db/schema";
import { eq } from "drizzle-orm"; 

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ complete: false });

        const [customer] = await db
            .select()
            .from(customer_profile)
            .where(eq(customer_profile.clerkId, userId));

        if (!customer) {
            return NextResponse.json({ complete: false });
        }

        const isComplete =
            !!customer.companyName &&
            !!customer.contactPerson &&
            !!customer.phone &&
            !!customer.address &&
            !!customer.clientCode;

        return NextResponse.json({ complete: isComplete });
    } catch (err) {
        console.error("check-profile error", err);
        return NextResponse.json({ complete: false });
    }
}