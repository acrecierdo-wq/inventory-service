// // app/api/admin/physical_inventory/[sessionId]/submit/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/drizzle";
// import { physicalInventorySessions, physicalInventoryItems } from "@/db/schema";
// import { audit_logs } from "@/db/schema";
// import { eq, and } from "drizzle-orm";
// import { currentUser } from "@clerk/nextjs/server";

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     const user = await currentUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const role = user.publicMetadata?.role;
//     if (role !== "admin" && role !== "warehouseman") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const { sessionId } = params;
//     const body = await req.json();
//     const { action, items: submittedItems }: { action: "submit"; items: { itemId: number; physicalQty: number }[] } = body;

//     if (action !== "submit") {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     // 1️⃣ Fetch session
//     const session = await db
//       .select()
//       .from(physicalInventorySessions)
//       .where(eq(physicalInventorySessions.id, sessionId))
//       .then(r => r[0]);

//     if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
//     if (session.status !== "pending") {
//       return NextResponse.json({ error: "Only pending sessions can be submitted" }, { status: 400 });
//     }

//     // 2️⃣ Update session status to submitted
//     await db.update(physicalInventorySessions)
//       .set({ status: "submitted", submittedAt: new Date() })
//       .where(eq(physicalInventorySessions.id, sessionId));

//     // 3️⃣ Update physical quantities in session items (no stock adjustment)
//     const existingItems = await db
//       .select()
//       .from(physicalInventoryItems)
//       .where(eq(physicalInventoryItems.sessionId, sessionId));

//     for (const submitted of submittedItems || []) {
//       const existing = existingItems.find(i => i.itemId === submitted.itemId);
//       if (!existing) continue;

//       await db.update(physicalInventoryItems)
//         .set({ physicalQty: submitted.physicalQty })
//         .where(and(
//           eq(physicalInventoryItems.sessionId, sessionId),
//           eq(physicalInventoryItems.itemId, submitted.itemId)
//         ));
//     }

//     // 4️⃣ Audit log for submission
//     await db.insert(audit_logs).values({
//       entity: "physical_inventory_session",
//       entityId: sessionId.toString(),
//       action: "SUBMIT",
//       description: "Session submitted for approval (stock not adjusted yet)",
//       actorId: user.id,
//       actorName: user.fullName,
//       actorRole: role,
//       module: "Inventory / Physical Inventory",
//     });

//     return NextResponse.json({ message: "Session submitted successfully" });

//   } catch (err) {
//     console.error("Submit session error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// app/api/admin/physical_inventory/[sessionId]/submit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { physicalInventorySessions, physicalInventoryItems } from "@/db/schema";
import { audit_logs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { sessionId } = await context.params;

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = user.publicMetadata?.role;
    if (role !== "admin" && role !== "warehouseman") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action, items: submittedItems }: { action: "submit"; items: { itemId: number; physicalQty: number }[] } = body;

    if (action !== "submit") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // 1️⃣ Fetch session
    const session = await db
      .select()
      .from(physicalInventorySessions)
      .where(eq(physicalInventorySessions.id, sessionId))
      .then(r => r[0]);

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.status !== "pending") {
      return NextResponse.json({ error: "Only pending sessions can be submitted" }, { status: 400 });
    }

    // 2️⃣ Update session status to submitted
    await db.update(physicalInventorySessions)
      .set({ status: "submitted", submittedAt: new Date() })
      .where(eq(physicalInventorySessions.id, sessionId));

    // 3️⃣ Update physical quantities and discrepancies in session items
    const existingItems = await db
      .select()
      .from(physicalInventoryItems)
      .where(eq(physicalInventoryItems.sessionId, sessionId));

    for (const submitted of submittedItems || []) {
      const existing = existingItems.find(i => i.itemId === submitted.itemId);
      if (!existing) continue;

      // Calculate discrepancy
      const discrepancy = submitted.physicalQty - existing.systemQty;

      await db.update(physicalInventoryItems)
        .set({ physicalQty: submitted.physicalQty, discrepancy })
        .where(and(
          eq(physicalInventoryItems.sessionId, sessionId),
          eq(physicalInventoryItems.itemId, submitted.itemId)
        ));
    }

    // 4️⃣ Audit log for submission
    await db.insert(audit_logs).values({
      entity: "physical_inventory_session",
      entityId: sessionId.toString(),
      action: "SUBMIT",
      description: "Session submitted for approval (stock not adjusted yet)",
      actorId: user.id,
      actorName: user.username || "Warehouseman",
      actorRole: role,
      module: "Inventory / Physical Inventory",
    });

    return NextResponse.json({ message: "Session submitted successfully" });

  } catch (err) {
    console.error("Submit session error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

