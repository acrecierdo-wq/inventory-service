// // app/api/admin/physical_inventory/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/drizzle";
// import { physicalInventorySessions, physicalInventoryItems, items } from "@/db/schema";
// import { audit_logs } from "@/db/schema";
// import { eq, desc } from "drizzle-orm";
// import { currentUser } from "@clerk/nextjs/server";

// export async function POST(req: NextRequest) {
//   try {
//     const user = await currentUser();
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const role = user.publicMetadata?.role;
//       if ( role !== "admin" && role !== "warehouseman" ) {
//           return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });
//       }

//     const body = await req.json();

//     const {
//       items: countedItems = [],
//       remarks = null,
//     }: {
//       items?: { itemId: string; physicalQty: number }[];
//       remarks?: string | null;
//     } = body;

//     if (!countedItems ||countedItems.length === 0) {
//       return NextResponse.json(
//         { error: "No items submitted." },
//         { status: 400 }
//       );
//     }

//     // Create session
//     const [session] = await db
//       .insert(physicalInventorySessions)
//       .values({
//         createdBy: user.id,
//         status: "pending",
//         remarks: remarks ?? null,
//         submittedAt: new Date(),
//       })
//       .returning();

//     const sessionId = session.id;

//     if (!countedItems || countedItems.length === 0) {
//       // Audit: session created (pending)
//       await db.insert(audit_logs).values({
//         entity: "physical_inventory_session",
//         entityId: sessionId,
//         action: "CREATE",
//         description: `Warehouseman created a pending inevntory session.`,
//         actorId: user.id,
//         actorName: user.username || "Warehouseman",
//         actorRole: role,
//         module: "Inventory / Physical Inventory",
//       });
//       return NextResponse.json({ sessionId });
//     }

//     const existing = await db
//       .select({ status: physicalInventorySessions.status })
//       .from(physicalInventorySessions)
//       .where(eq(physicalInventorySessions.id, sessionId))
//       .limit(1)
//       .then((r) => r[0]);

//     if (!existing) {
//       return NextResponse.json({ error: "Session not found after create." }, { status: 404 });
//     }

//     if (existing.status === "submitted" || existing.status === "approved" || existing.status === "rejected") {
//       return NextResponse.json({ error: "Session already finalized." }, { status: 400 });
//     }

//     let insertedCount = 0;
//     // Process each counted item
//     for (const entry of countedItems) {
//       const dbItem = (
//         await db.select().from(items).where(eq(items.id, Number(entry.itemId))).limit(1)
//       )[0];

//       if (!dbItem) continue;

//       const systemQty = dbItem.stock ?? 0;
//       const discrepancy = (entry.physicalQty ?? 0) - systemQty;

//       let statusItem: "match" | "shortage" | "overage" = "match";
//       if (discrepancy < 0) statusItem = "shortage";
//       else if (discrepancy > 0) statusItem = "overage";

//       await db.insert(physicalInventoryItems).values({
//         sessionId,
//         itemId: Number(entry.itemId),
//         physicalQty: entry.physicalQty,
//         systemQty,
//         discrepancy,
//         status: statusItem,
//         comments: null,
//       });
//       insertedCount++;
//     }

//     await db
//       .update(physicalInventorySessions)
//       .set({ status: "submitted", submittedAt: new Date() })
//       .where(eq(physicalInventorySessions.id, sessionId));

//     // Audit Log
//     await db.insert(audit_logs).values({
//       entity: "physical_inventory_session",
//       entityId: sessionId,
//       action: "SUBMIT",
//       description: `Warehouseman submitted inventory session with ${insertedCount} items.`,
//       actorId: user.id,
//       actorName: user.username || "Warehouseman",
//       actorRole: role,
//       module: "Inventory / Physical Inventory",
//     });

//     return NextResponse.json({ sessionId });
//   } catch (err) {
//     console.error("Create/submit inventory session error:", err);
//     return NextResponse.json(
//       { error: "Internal server error." },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   try {
//     const user = await currentUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     // Fetch sessions
//     const sessions = await db
//       .select()
//       .from(physicalInventorySessions)
//       .orderBy(desc(physicalInventorySessions.createdAt));

//     // For each session, calculate totals
//     const sessionsWithTotals = await Promise.all(
//       sessions.map(async (s) => {
//         const itemsInSession = await db
//           .select({
//             physicalQty: physicalInventoryItems.physicalQty,
//             discrepancy: physicalInventoryItems.discrepancy,
//           })
//           .from(physicalInventoryItems)
//           .where(eq(physicalInventoryItems.sessionId, s.id));

//         const totalItems = itemsInSession.length;
//         const totalDiscrepancy = itemsInSession.reduce(
//           (acc, i) => acc + (i.discrepancy ?? 0),
//           0
//         );

//         return {
//           ...s,
//           totalItems: totalItems || 0,
//           totalDiscrepancy: totalItems > 0 ? totalDiscrepancy : "-", // show "-" if no items
//         };
//       })
//     );

//     return NextResponse.json({ sessions: sessionsWithTotals });
//   } catch (error) {
//     console.error("GET sessions error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// app/api/admin/physical_inventory/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { physicalInventorySessions, physicalInventoryItems, items } from "@/db/schema";
import { audit_logs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

// POST /api/admin/physical_inventory
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = user.publicMetadata?.role;
    if (role !== "admin" && role !== "warehouseman")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { items: countedItems = [], remarks = null }: { items?: { itemId: string; physicalQty: number }[]; remarks?: string | null } = await req.json();

    if (!countedItems || countedItems.length === 0)
      return NextResponse.json({ error: "No items submitted." }, { status: 400 });

    // 1️⃣ Check if a pending session already exists for this user
    let session = await db
      .select()
      .from(physicalInventorySessions)
      .where(
        eq(physicalInventorySessions.createdBy, user.username || user.id)
      )
      .then(res => res.find(s => s.status === "pending"));

    // 2️⃣ If not, create a new pending session
    if (!session) {
      [session] = await db
        .insert(physicalInventorySessions)
        .values({ createdBy: user.username || user.id, status: "pending", remarks })
        .returning();
    } else {
      // 3️⃣ If exists, just update remarks
      await db.update(physicalInventorySessions)
        .set({ remarks })
        .where(eq(physicalInventorySessions.id, session.id));
    }

    const sessionId = session.id;

    // 4️⃣ Insert or update counted items
    for (const entry of countedItems) {
      const dbItem = await db.select().from(items).where(eq(items.id, Number(entry.itemId))).limit(1).then(r => r[0]);
      if (!dbItem) continue;

      const systemQty = dbItem.stock ?? 0;
      const discrepancy = (entry.physicalQty ?? 0) - systemQty;

      let statusItem: "match" | "shortage" | "overage" = "match";
      if (discrepancy < 0) statusItem = "shortage";
      else if (discrepancy > 0) statusItem = "overage";

      // Check if item already exists in session
      const existingItem = await db.select().from(physicalInventoryItems)
        .where(eq(physicalInventoryItems.sessionId, sessionId))
        .then(r => r.find(i => i.itemId === Number(entry.itemId)));

      if (existingItem) {
        await db.update(physicalInventoryItems)
          .set({ physicalQty: entry.physicalQty, systemQty, discrepancy, status: statusItem })
          .where(eq(physicalInventoryItems.id, existingItem.id));
      } else {
        await db.insert(physicalInventoryItems).values({
          sessionId,
          itemId: Number(entry.itemId),
          physicalQty: entry.physicalQty,
          systemQty,
          discrepancy,
          status: statusItem,
          comments: null,
        });
      }
    }

    // 5️⃣ Audit log
    await db.insert(audit_logs).values({
      entity: "physical_inventory_session",
      entityId: sessionId,
      action: "CREATE",
      description: `Warehouseman created/updated pending inventory session with ${countedItems.length} items.`,
      actorId: user.id,
      actorName: user.username || "Warehouseman",
      actorRole: role,
      module: "Inventory / Physical Inventory",
    });

    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("Create inventory session error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// GET all sessions (with totals)
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await db
      .select()
      .from(physicalInventorySessions)
      .orderBy(desc(physicalInventorySessions.createdAt));

    const sessionsWithTotals = await Promise.all(
      sessions.map(async (s) => {
        const itemsInSession = await db
          .select({
            physicalQty: physicalInventoryItems.physicalQty,
            discrepancy: physicalInventoryItems.discrepancy,
          })
          .from(physicalInventoryItems)
          .where(eq(physicalInventoryItems.sessionId, s.id));

        const totalItems = itemsInSession.length;
        const totalDiscrepancies = itemsInSession.reduce(
          (acc, i) => acc + (i.discrepancy ?? 0),
          0
        );

        return {
          ...s,
          totalItems,
          totalDiscrepancies: totalItems > 0 ? totalDiscrepancies : "-",
        };
      })
    );

    return NextResponse.json({ sessions: sessionsWithTotals });
  } catch (error) {
    console.error("GET sessions error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
