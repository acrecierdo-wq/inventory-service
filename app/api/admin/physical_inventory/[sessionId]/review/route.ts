// // app/api/admin/physical_inventory/[sessionId]/review/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/drizzle";
// import {
//   physicalInventorySessions,
//   physicalInventoryItems,
//   items,
//   inventoryAdjustments,
// /**
//  * PATCH /api/admin/physical_inventory/[sessionId]/review
//  * @param {NextRequest} req
//  * @param {Object} params
//  * @param {string} params.sessionId
//  * @returns {NextResponse}
//  * @description
//  * Review a Physical Inventory Session.
//  * If the action is "approved", apply the stock adjustments to the actual stock levels.
//  * If the action is "rejected", just log the rejection and stop.
//  * If no action is provided, return a 400 error.
//  * If the user is not authenticated, return a 401 error.
//  * If an error occurs, return a 500 error.
//  */
//   audit_logs,
//   categories,
//   units,
//   variants,
//   sizes,
// } from "@/db/schema";
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
//     if (role !== "admin" && role !== "purchasing")
//       return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });

//     const sessionId = params.sessionId;

//     const body = await req.json();
//     const {
//       action,
//       remarks,
//       items: submittedItems,
//     }: {
//       action: "approved" | "rejected";
//       remarks: string | null;
//       items?: { itemId: number; physicalQty: number }[];
//     } = body;

//     if (!action) return NextResponse.json({ error: "Action is required." }, { status: 400 });

//     // 🔒 Ensure session is already submitted by Warehouse
//     const sessionRecord = await db
//       .select()
//       .from(physicalInventorySessions)
//       .where(eq(physicalInventorySessions.id, sessionId))
//       .then(res => res[0]);

//     if (!sessionRecord) {
//       return NextResponse.json({ error: "Session not found." }, { status: 404 });
//     }

//     // ❗ Purchasing can ONLY review submitted sessions
//     if (sessionRecord.status !== "submitted") {
//       return NextResponse.json(
//         { error: "Only submitted sessions can be reviewed." },
//         { status: 400 }
//       );
//     }

//     // 1️⃣ Update session status
//     const updateData: Record<string, string | Date | null> = {
//       status: action,
//       reviewedAt: new Date(),
//       remarks,
//     };
//     if (action === "approved") updateData.approvedBy = user.id;
//     else updateData.rejectedBy = user.id;

//     await db.update(physicalInventorySessions).set(updateData)
//       .where(eq(physicalInventorySessions.id, sessionId));

//     // 2️⃣ Fetch existing session items
//     const existingSessionItems = await db
//       .select()
//       .from(physicalInventoryItems)
//       .where(eq(physicalInventoryItems.sessionId, sessionId));

//     // 3️⃣ If rejected, log and return
//     if (action === "rejected") {
//       await db.insert(audit_logs).values({
//         entity: "physical_inventory_session",
//         entityId: sessionId,
//         action: "reject",
//         description: `Physical inventory rejected.`,
//         actorId: user.id,
//         actorName: user.fullName,
//         actorRole: role,
//         module: "Inventory",
//       });
//       return NextResponse.json({ message: "Session rejected." });
//     }

//     // 4️⃣ APPROVED: process submitted items
//     for (const submitted of submittedItems || []) {
//       const existing = existingSessionItems.find(i => i.itemId === submitted.itemId);

//       if (existing) {
//         // Update existing row
//         await db.update(physicalInventoryItems)
//           .set({ physicalQty: submitted.physicalQty })
//           .where(
//             and(
//               eq(physicalInventoryItems.sessionId, sessionId),
//               eq(physicalInventoryItems.itemId, submitted.itemId)
//             )
//           );

//         const adjustmentQty = submitted.physicalQty - existing.systemQty;
//         if (adjustmentQty !== 0) {
//           await db.update(items)
//             .set({ stock: submitted.physicalQty })
//             .where(eq(items.id, submitted.itemId));

//           await db.insert(inventoryAdjustments).values({
//             sessionId,
//             itemId: submitted.itemId,
//             adjustmentQty,
//             reason: "Physical Inventory Adjustment",
//             approvedBy: user.id,
//           });
//         }
//       } else {
//         // Insert new row if it doesn't exist
//         const itemRecord = await db.select().from(items)
//           .where(eq(items.id, submitted.itemId))
//           .then(res => res[0]);
//         if (!itemRecord) continue;

//         await db.insert(physicalInventoryItems).values({
//           sessionId,
//           itemId: submitted.itemId,
//           physicalQty: submitted.physicalQty,
//           systemQty: itemRecord.stock,
//           discrepancy: submitted.physicalQty - itemRecord.stock,
//           status: "counted",
//           comments: null,
//         });

//         // Apply stock adjustment if needed
//         const adjustmentQty = submitted.physicalQty - itemRecord.stock;
//         if (adjustmentQty !== 0) {
//           await db.update(items)
//             .set({ stock: submitted.physicalQty })
//             .where(eq(items.id, submitted.itemId));

//           await db.insert(inventoryAdjustments).values({
//             sessionId,
//             itemId: submitted.itemId,
//             adjustmentQty,
//             reason: "Physical Inventory Adjustment",
//             approvedBy: user.id,
//           });
//         }
//       }
//     }

//     // 5️⃣ Audit log for approval
//     await db.insert(audit_logs).values({
//       entity: "physical_inventory_session",
//       entityId: sessionId,
//       action: "approve",
//       description: `Approved physical inventory and applied adjustments.`,
//       actorId: user.id,
//       actorName: user.fullName,
//       actorRole: role,
//       module: "Inventory",
//     });

//     return NextResponse.json({ message: "Session approved. Adjustments applied." }, { status: 200 });
//   } catch (error) {
//     console.error("Review Physical Inventory Error:", error);
//     return NextResponse.json({ error: "Internal server error." }, { status: 500 });
//   }
// }

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     const user = await currentUser();
//     if (!user)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const sessionId = params.sessionId;

//     const session = await db
//       .select()
//       .from(physicalInventorySessions)
//       .where(eq(physicalInventorySessions.id, sessionId))
//       .limit(1)
//       .then((res) => res[0]);

//     if (!session)
//       return NextResponse.json({ error: "Session not found" }, { status: 404 });

//     const sessionItems = await db
//       .select({
//         id: physicalInventoryItems.itemId,
//         physicalQty: physicalInventoryItems.physicalQty,
//         systemQty: physicalInventoryItems.systemQty,
//         discrepancy: physicalInventoryItems.discrepancy,
//         status: physicalInventoryItems.status,
//         comments: physicalInventoryItems.comments,
//         name: items.name,
//         category: categories.name,
//         unit: units.name,
//         variant: variants.name,
//         size: sizes.name,
//         stock: items.stock,
//       })
//       .from(physicalInventoryItems)
//       .leftJoin(items, eq(items.id, physicalInventoryItems.itemId))
//       .leftJoin(categories, eq(categories.id, items.categoryId))
//       .leftJoin(units, eq(units.id, items.unitId))
//       .leftJoin(variants, eq(variants.id, items.variantId))
//       .leftJoin(sizes, eq(sizes.id, items.sizeId))
//       .where(eq(physicalInventoryItems.sessionId, sessionId));

//       console.log("Raw sessionItems from DB:", sessionItems);

//     const safeItems = sessionItems.map((i) => ({
//       id: i.id,
//       physicalQty: i.physicalQty ?? 0,
//       systemQty: i.systemQty ?? 0,
//       discrepancy: i.discrepancy ?? 0,
//       status: i.status ?? "",
//       comments: i.comments ?? "",
//       name: i.name ?? "Unknown Item",
//       category: i.category ?? "",
//       unit: i.unit ?? "",
//       variant: i.variant ?? "",
//       size: i.size ?? "",
//       stock: i.stock ?? 0,
//     }));

//       console.log("Mapped sessionItems:", safeItems);

//     return NextResponse.json({ session, items: safeItems });
//   } catch (error) {
//     console.error("GET session error:", error);
//     return NextResponse.json(
//       { error: "Internal server error." },
//       { status: 500 }
//     );
//   }
// }

// app/api/admin/physical_inventory/[sessionId]/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  physicalInventorySessions,
  physicalInventoryItems,
  items,
  inventoryAdjustments,
  audit_logs,
  categories,
  units,
  variants,
  sizes,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

type SubmittedItem = { itemId: number; physicalQty: number };
type ReviewBody = { action: "approved" | "rejected"; remarks?: string | null; items?: SubmittedItem[] };

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     const user = await currentUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const role = user.publicMetadata?.role;
//     if (role !== "admin" && role !== "purchasing")
//       return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });

//     const sessionId = params.sessionId;
//     const { action, remarks, items: submittedItems }: ReviewBody = await req.json();

//     if (!action) return NextResponse.json({ error: "Action is required." }, { status: 400 });

//     const sessionRecord = await db
//       .select()
//       .from(physicalInventorySessions)
//       .where(eq(physicalInventorySessions.id, sessionId))
//       .then(res => res[0]);

//     if (!sessionRecord) return NextResponse.json({ error: "Session not found." }, { status: 404 });
//     if (sessionRecord.status !== "submitted")
//       return NextResponse.json({ error: "Only submitted sessions can be reviewed." }, { status: 400 });

//     // Update session status
//     const updateData: {
//       status: "approved" | "rejected";
//       reviewedAt: Date;
//       remarks?: string | null;
//       approvedBy?: string;
//       rejectedBy?: string;
//     } = { status: action, reviewedAt: new Date(), remarks };

//     if (action === "approved") updateData.approvedBy = user.id;
//     else updateData.rejectedBy = user.id;

//     await db.update(physicalInventorySessions)
//       .set(updateData)
//       .where(eq(physicalInventorySessions.id, sessionId));

//     const existingSessionItems = await db
//       .select()
//       .from(physicalInventoryItems)
//       .where(eq(physicalInventoryItems.sessionId, sessionId));

//     if (action === "rejected") {
//       await db.insert(audit_logs).values({
//         entity: "physical_inventory_session",
//         entityId: sessionId,
//         action: "REJECT",
//         description: "Physical inventory session rejected.",
//         actorId: user.id,
//         actorName: user.fullName,
//         actorRole: role,
//         module: "Inventory",
//       });
//       return NextResponse.json({ message: "Session rejected." });
//     }

//     // Approved: process submitted items
//     for (const submitted of submittedItems ?? []) {
//       const existing = existingSessionItems.find(i => i.itemId === submitted.itemId);
//       if (!existing) continue;

//       // Update session item
//       await db.update(physicalInventoryItems)
//         .set({ physicalQty: submitted.physicalQty, discrepancy: submitted.physicalQty - existing.systemQty })
//         .where(and(eq(physicalInventoryItems.sessionId, sessionId), eq(physicalInventoryItems.itemId, submitted.itemId)));

//       const adjustmentQty = submitted.physicalQty - existing.systemQty;
//       if (adjustmentQty !== 0) {
//         await db.update(items).set({ stock: submitted.physicalQty }).where(eq(items.id, submitted.itemId));

//         await db.insert(inventoryAdjustments).values({
//           sessionId,
//           itemId: submitted.itemId,
//           adjustmentQty,
//           reason: "Physical Inventory Adjustment",
//           approvedBy: user.id,
//         });
//       }
//     }

//     // Audit log for approval
//     await db.insert(audit_logs).values({
//       entity: "physical_inventory_session",
//       entityId: sessionId,
//       action: "APPROVE",
//       description: "Physical inventory approved and adjustments applied.",
//       actorId: user.id,
//       actorName: user.fullName,
//       actorRole: role,
//       module: "Inventory",
//     });

//     return NextResponse.json({ message: "Session approved and stock adjusted." }, { status: 200 });
//   } catch (error) {
//     console.error("Review Physical Inventory Error:", error);
//     return NextResponse.json({ error: "Internal server error." }, { status: 500 });
//   }
// }

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { sessionId } = await context.params;

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = user.publicMetadata?.role;
    if (role !== "admin" && role !== "purchasing")
      return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });

    const body: ReviewBody = await req.json();
    const { action, remarks } = body;

    if (!action) return NextResponse.json({ error: "Action is required." }, { status: 400 });

    const sessionRecord = await db
      .select()
      .from(physicalInventorySessions)
      .where(eq(physicalInventorySessions.id, sessionId))
      .then(res => res[0]);

    if (!sessionRecord) return NextResponse.json({ error: "Session not found." }, { status: 404 });
    if (sessionRecord.status !== "submitted")
      return NextResponse.json({ error: "Only submitted sessions can be reviewed." }, { status: 400 });

    // Update session status
    const updateData: {
      status: "approved" | "rejected";
      reviewedAt: Date;
      remarks?: string | null;
      approvedBy?: string;
      rejectedBy?: string;
    } = { status: action, reviewedAt: new Date(), remarks };

    if (action === "approved") updateData.approvedBy = user.username || user.id;
    else updateData.rejectedBy = user.username || user.id;

    await db.update(physicalInventorySessions)
      .set(updateData)
      .where(eq(physicalInventorySessions.id, sessionId));

    const existingSessionItems = await db
      .select()
      .from(physicalInventoryItems)
      .where(eq(physicalInventoryItems.sessionId, sessionId));

    if (action === "rejected") {
      await db.insert(audit_logs).values({
        entity: "physical_inventory_session",
        entityId: sessionId,
        action: "REJECT",
        description: "Physical inventory session rejected, no adjutments applied.",
        actorId: user.id,
        actorName: user.username || "Purchasing",
        actorRole: role,
        module: "Inventory / Physical Inventory",
      });
      return NextResponse.json({ message: "Session rejected." });
    }

    // Approved: process all session items (auto-read if frontend doesn't send items)
    const itemsToProcess = body.items?.length ? body.items : existingSessionItems.map(i => ({
      itemId: i.itemId,
      physicalQty: i.physicalQty,
    }));

    for (const submitted of itemsToProcess) {
      const existing = existingSessionItems.find(i => i.itemId === submitted.itemId);
      if (!existing) continue;

      const discrepancy = submitted.physicalQty - existing.systemQty;

      // Update session item
      await db.update(physicalInventoryItems)
        .set({ physicalQty: submitted.physicalQty, discrepancy })
        .where(and(
          eq(physicalInventoryItems.sessionId, sessionId),
          eq(physicalInventoryItems.itemId, submitted.itemId)
        ));

      // Adjust stock and insert inventory adjustment if discrepancy exists
      if (discrepancy !== 0) {
        await db.update(items)
          .set({ stock: submitted.physicalQty })
          .where(eq(items.id, submitted.itemId));

        await db.insert(inventoryAdjustments).values({
          sessionId,
          itemId: submitted.itemId,
          adjustmentQty: discrepancy,
          reason: "Physical Inventory Adjustment",
          approvedBy: user.username || user.id,
        });
      }
    }

    // Audit log for approval
    await db.insert(audit_logs).values({
      entity: "physical_inventory_session",
      entityId: sessionId,
      action: "APPROVE",
      description: "Physical inventory approved and adjustments applied.",
      actorId: user.id,
      actorName: user.username || "Purchasing",
      actorRole: role,
      module: "Inventory / Physical Inventory",
    });

    return NextResponse.json({ message: "Session approved and stock adjusted." }, { status: 200 });
  } catch (error) {
    console.error("Review Physical Inventory Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  const { sessionId } = await context.params;

  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await db
      .select()
      .from(physicalInventorySessions)
      .where(eq(physicalInventorySessions.id, sessionId))
      .limit(1)
      .then(res => res[0]);

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const sessionItems = await db
      .select({
        id: physicalInventoryItems.itemId,
        physicalQty: physicalInventoryItems.physicalQty,
        systemQty: physicalInventoryItems.systemQty,
        discrepancy: physicalInventoryItems.discrepancy,
        status: physicalInventoryItems.status,
        comments: physicalInventoryItems.comments,
        name: items.name,
        category: categories.name,
        unit: units.name,
        variant: variants.name,
        size: sizes.name,
        stock: items.stock,
      })
      .from(physicalInventoryItems)
      .leftJoin(items, eq(items.id, physicalInventoryItems.itemId))
      .leftJoin(categories, eq(categories.id, items.categoryId))
      .leftJoin(units, eq(units.id, items.unitId))
      .leftJoin(variants, eq(variants.id, items.variantId))
      .leftJoin(sizes, eq(sizes.id, items.sizeId))
      .where(eq(physicalInventoryItems.sessionId, sessionId));

    const safeItems = sessionItems.map((i) => ({
      id: i.id,
      physicalQty: i.physicalQty ?? 0,
      systemQty: i.systemQty ?? 0,
      discrepancy: i.discrepancy ?? 0,
      status: i.status ?? "",
      comments: i.comments ?? "",
      name: i.name ?? "Unknown Item",
      category: i.category ?? "",
      unit: i.unit ?? "",
      variant: i.variant ?? "",
      size: i.size ?? "",
      stock: i.stock ?? 0,
    }));

    return NextResponse.json({ session, items: safeItems });
  } catch (error) {
    console.error("GET session error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}