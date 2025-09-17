// // api/issuances/[id]/route.ts

// import { db } from "@/db/drizzle";
// import { itemIssuanceItems, itemIssuances, items as itemsTable } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { NextResponse } from "next/server";

// // PUT — Update Issuance
// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//     try {
//         const data = await req.json();
//         const {
//             clientName,
//             dispatcherName,
//             customerPoNumber,
//             prfNumber,
//             items,
//             drNumber,
//             status,
//             saveAsDraft,
//         } = data;

//         const issuanceId = Number(params.id);

//         // Fetch old issuance
//         const [oldIssuance] = await db
//             .select()
//             .from(itemIssuances)
//             .where(eq(itemIssuances.id, issuanceId));

//         if (!oldIssuance) {
//             return NextResponse.json({ error: "Issuance not found." }, { status: 404 });
//         }

//         if (oldIssuance.status === "Issued") {
//             return NextResponse.json({ error: "Cannot update an already issued record." }, { status: 400 });
//         }

//         // Update issuance header
//         await db.update(itemIssuances)
//             .set({
//                 clientName,
//                 dispatcherName,
//                 issuedAt: new Date(),
//                 customerPoNumber,
//                 prfNumber,
//                 drNumber,
//                 status,
//                 saveAsDraft,
//             })
//             .where(eq(itemIssuances.id, issuanceId));

//         // Delete old line items
//         await db.delete(itemIssuanceItems)
//             .where(eq(itemIssuanceItems.issuanceId, issuanceId));

//         // Insert updated line items
//         for (const item of items) {
//             const { itemId, sizeId, variantId, unitId, quantity } = item;

//             const itemData = await db.query.items.findFirst({
//                 where: eq(itemsTable.id, itemId),
//             });

//             if (!itemData) {
//                 return NextResponse.json({ error: "Item not found." }, { status: 404 });
//             }

//             await db.insert(itemIssuanceItems).values({
//                 issuanceId: Number(params.id),
//                 itemId,
//                 sizeId,
//                 variantId,
//                 unitId,
//                 quantity,
//             });
//         }

//         return NextResponse.json({ message: "Issuance updated successfully." });
//     } catch (error) {
//         console.error("PUT /api/issuances/[id] error:", error);
//         return NextResponse.json({ error: "Failed to update issuance." }, { status: 500 });
//     }
// }

// // DELETE — Archive/Delete Issuance
// export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
//     try {
//         const issuanceId = Number(params.id);

//         // Delete line items
//        // await db.delete(itemIssuanceItems)
//        //     .where(eq(itemIssuanceItems.issuanceId, issuanceId)).returning();

//         // Delete header
//         await db.update(itemIssuances)
//             .set({ status: "Archived" })
//             .where(eq(itemIssuances.id, issuanceId)).returning();

//         return NextResponse.json({ message: "Issuance archived successfully." });
//     } catch (error) {
//         console.error("DELETE /api/issuances/[id] error:", error);
//         return NextResponse.json({ error: "Failed to delete issuance." }, { status: 500 });
//     }
// }
