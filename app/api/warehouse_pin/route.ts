// app/api/warehouse_pin/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
        }
    
        const [appUser] = await db
            .select()
            .from(appUsers)
            .where(eq(appUsers.clerkId, user.id));

        return NextResponse.json({ 
            hasPin: !!appUser?.pinHash, 
            createdAt: appUser?.createdAt || null,
            updatedAt: appUser?.updatedAt || null,

        });
    } catch (err) {
        console.error("PIN check error:", err);
        return NextResponse.json({ error: "Failed to check PIN." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
        }

        const { pin } = await req.json();
        console.log("received pin:", pin);
        

        if (!pin) {
            return NextResponse.json({ error: "PIN is required."}, { status: 400 });
        }
        
        const [appUser] = await db
            .select()
            .from(appUsers)
            .where(eq(appUsers.clerkId, user.id));
        
        if (!appUser || !appUser.pinHash) {
            return NextResponse.json({ error: "No PIN set. Please set a PIN first."}, { status: 400 });
        }

        const isValid = await bcrypt.compare(pin, appUser.pinHash);

        if (!isValid) {
            return NextResponse.json({ error: "Invalid PIN."}, { status: 401 });
        }

        return NextResponse.json({ message: "PIN verified successfully."});
    } catch (err) {
        console.error("PIN verification error:", err);
        return NextResponse.json({ error: "Failed to verify PIN."}, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPin } = await req.json();

    if (!/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ error: "PIN must be 4 digits." }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPin, 10);

    // check if tehre is already an appuser row for the current clerk user
    const [appUser] = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.clerkId, user.id));

      const clerkEmail = user.emailAddresses[0]?.emailAddress || "";
      const clerkName = user.fullName || user.firstName || "";

      if (!appUser) {
        // no record yet -> create one
        await db.insert(appUsers).values({
            clerkId: user.id,
            email: clerkEmail,
            fullName: clerkName,
            pinHash: hash,
            updatedAt: new Date(),
        });
      } else {
        // record exists -> update pin
        await db
          .update(appUsers)
          .set({ pinHash: hash, updatedAt: new Date() })
          .where(eq(appUsers.clerkId, user.id));
      }

    return NextResponse.json({ message: "PIN updated successfully." });
  } catch (err) {
    console.error("PIN update error:", err);
    return NextResponse.json({ error: "Failed to update PIN." }, { status: 500 });
  }
}
