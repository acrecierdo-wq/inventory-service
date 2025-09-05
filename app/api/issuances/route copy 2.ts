//api/issuances/route.ts

import { db} from "@/db/drizzle";
import { itemIssuances, itemIssuanceItems, items as itemsTable, sizes, variants, units } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function POST(req: Request) {
    console.log("🔵 POST /api/issuances hit"); 
    
    try {
        const data = await req.json();

        const {
            clientName,
            dispatcherName,
            issuedAt,
            customerPoNumber,
            prfNumber,
            items,
            drNumber,
            status,
            saveAsDraft,
        } = data;
        console.log("🔵 Request body:", data);

        let finalIssuedAt: Date | null = null;

        if (status === "Issued") {
        finalIssuedAt = issuedAt ? new Date(issuedAt) : new Date();
        }


        // Insert into item_issuances
        const [newIssuance] = await db.insert(itemIssuances).values({
            clientName,
            dispatcherName,
            issuedAt: finalIssuedAt,
            customerPoNumber,
            prfNumber,
            drNumber,
            status,
            saveAsDraft,
        }).returning();

        const issuanceId = newIssuance.id;

        const warnings: string[] = [];

        for (const item of items) {
            const { itemId, sizeId, variantId, quantity } = item;
            
            console.log("Received issuedAt:", issuedAt);

            if (finalIssuedAt) {
                console.log("Parsed issuedAt", new Date(finalIssuedAt).toISOString());
            } else {
                console.log("No issuedAt provided - treating as draft");
            }

            const itemData = await db.query.items.findFirst({
                where: eq(itemsTable.id, itemId),
            });

            if (!itemData) {
                return NextResponse.json({ error: `Item ID ${itemId} not found.` }, { status: 400 });
            }

            const resolvedUnitId = itemData.unitId;
            

            // Insert line item
            await db.insert(itemIssuanceItems).values({
                issuanceId,
                itemId,
                sizeId,
                variantId,
                unitId: resolvedUnitId,
                quantity,
            });

            // fetch current stock
            const [itemRecord] = await db
            .select({
                stock: itemsTable.stock,
                name: itemsTable.name,
                reorderLevel: itemsTable.reorderLevel,
                criticalLevel: itemsTable.criticalLevel,
            })
            .from(itemsTable)
            .where(eq(itemsTable.id, itemId));

            if (!itemRecord) {
                return NextResponse.json({ error: `Item ID ${itemId} not found.` }, { status: 400 });
            }

            // Only subtract stock if status is "Issued"
            if (status === "Issued") {
                const newStock = itemRecord.stock - quantity;

                // Update stock
                 await db.update(itemsTable)
                    .set({ stock: newStock })
                    .where(eq(itemsTable.id, itemId));

                // Warn if below reorder level
                if (newStock < itemRecord.reorderLevel) {
                    warnings.push(`⚠️ Warning: This transaction brings "${itemRecord.name}" below minimum stock reorder level (Current: ${newStock}, Minimum: ${itemRecord.reorderLevel})`);
                }

                // Warn if below critical level
                if (newStock < itemRecord.criticalLevel) {
                    warnings.push(`⚠️ Warning: This transaction brings "${itemRecord.name}" below critical stock level (Current: ${newStock}, Critical: ${itemRecord.criticalLevel})`);
                }

                if (status === "Issued" && newStock < 0) {
                    return NextResponse.json({ error: `Insufficient stock for "${itemRecord.name}". Current: ${itemRecord.stock}, Needed: ${quantity}` }, { status: 400 });
                }

                }


        //     if (status === "Issued") {
        //             const newStock = itemRecord.stock - quantity;

        //     // Update stock
        //     await db
        //     .update(itemsTable)
        //     .set({ stock: newStock})
        //     .where(eq(itemsTable.id, itemId));

        //     // Warn if below reorder level
        //     if (newStock < itemRecord.reorderLevel) {
        //         warnings.push(
        //             `⚠️ Warning: This transaction brings "${itemRecord.name}" below minimum stock reorder level (Current: ${newStock}, Minimum: ${itemRecord.reorderLevel})`
        //         );
        //     }

        //     // Warn if below critical level
        //     if (newStock < itemRecord.criticalLevel) {
        //         warnings.push(
        //             `⚠️ Warning: This transaction brings "${itemRecord.name}" below critical stock level (Current: ${newStock}, Critical: ${itemRecord.criticalLevel})`
        //         )
        //     }
        // }
        }

        return NextResponse.json({
            message: "Item issuance recorded and inventory updated successfully.",
            issuanceId,
            warnings
        });
        } catch (error) {
            console.error("Issuance error:", error);
            return NextResponse.json({ error: "Failed to process issuance." }, {status:500});
        }
    }

    export async function GET() {
        try {

            // Get all item issuances
            const issuanceRecords = await db
            .select()
            .from(itemIssuances)
            .orderBy(desc(itemIssuances.issuedAt));

            const results = [];

            for (const issuance of issuanceRecords) {
                // Get items under this issuance
                const issuedItems = await db
                .select({
                    itemId: itemIssuanceItems.itemId,
                    itemName: itemsTable.name,
                    quantity: itemIssuanceItems.quantity,
                    size: sizes.name,
                    variant: variants.name,
                    unit: units.name,
                })
                .from(itemIssuanceItems)
                .where(eq(itemIssuanceItems.issuanceId, issuance.id))
                .leftJoin(itemsTable, eq(itemIssuanceItems.itemId, itemsTable.id))
                .leftJoin(sizes, eq(itemIssuanceItems.sizeId, sizes.id))
                .leftJoin(variants, eq(itemIssuanceItems.variantId, variants.id))
                .leftJoin(units, eq(itemIssuanceItems.unitId, units.id));

                results.push({
                    ...issuance,
                    items: issuedItems,
                });
            }

            return NextResponse.json(results);
        } catch (error) {
            console.error("GET /api/issuances error:", error);
            return NextResponse.json({ error: "Failed to fetch issuance records."}, { status: 500});
        }
    }

