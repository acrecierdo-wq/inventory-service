// // api/issuances/route.ts
// import { db } from "@/db/drizzle";
// import {
//   itemIssuances,
//   itemIssuanceItems,
//   items as itemsTable,
//   sizes,
//   variants,
//   units,
// } from "@/db/schema";
// import { NextResponse } from "next/server";
// import { eq, sql } from "drizzle-orm";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       clientName,
//       dispatcherName,
//       customerPoNumber,
//       prfNumber,
//       drNumber,
//       saveAsDraft,
//       items: issuedItems,
//     } = body;

//     if (!Array.isArray(issuedItems) || issuedItems.length === 0) {
//       return NextResponse.json({ error: "Invalid or missing items array." }, { status: 400 });
//     }

//     const warnings: string[] = [];
//     const validatedItems: Map<string, typeof itemsTable.$inferSelect> = new Map();
//     const mismatchesOverall: Record<string, { field: string; expected: unknown; received: unknown }[]> = {};

//     // ---- VALIDATE ALL ITEMS FIRST ----
//     for (const item of issuedItems) {
//       const itemData = await db.query.items.findFirst({
//         where: eq(itemsTable.id, item.itemId),
//       });

//       if (!itemData) {
//         mismatchesOverall[item.itemId] = [{ field: "itemId", expected: item.itemId, received: "Not found in DB" }];
//         continue;
//       }

//       const mismatches: { field: string; expected: unknown; received: unknown }[] = [];
//       const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
//       const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
//       const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

//       // Validate size/variant/unit matches DB
//       if ((itemData.sizeId ?? null) !== sizeId) mismatches.push({ field: "sizeId", expected: itemData.sizeId, received: sizeId });
//       if ((itemData.variantId ?? null) !== variantId) mismatches.push({ field: "variantId", expected: itemData.variantId, received: variantId });
//       if ((itemData.unitId ?? null) !== unitId) mismatches.push({ field: "unitId", expected: itemData.unitId, received: unitId });

//       // Stock check only if not draft
//       if (!saveAsDraft && itemData.stock < item.quantity) {
//         return NextResponse.json({
//           error: `Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${item.quantity}`,
//         }, { status: 400 });
//       }

//       if (mismatches.length > 0) {
//         mismatchesOverall[item.itemId] = mismatches;
//       } else {
//         validatedItems.set(item.itemId, itemData);
//       }
//     }

//     if (Object.keys(mismatchesOverall).length > 0) {
//       return NextResponse.json({ error: "Item validation failed.", details: mismatchesOverall }, { status: 400 });
//     }

//     // ---- INSERT MAIN ISSUANCE ----
//     const [newIssuance] = await db.insert(itemIssuances).values({
//       clientName,
//       dispatcherName,
//       customerPoNumber,
//       prfNumber,
//       drNumber,
//       status: saveAsDraft ? "Draft" : "Issued",
//       issuedAt: saveAsDraft ? null : new Date(),
//     }).returning();

//     // ---- INSERT ITEMS & UPDATE STOCK ----
//     for (const item of issuedItems) {
//       const itemData = validatedItems.get(item.itemId);
//       if (!itemData) continue;

//       const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
//       const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
//       const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

//       await db.insert(itemIssuanceItems).values({
//         issuanceId: newIssuance.id,
//         itemId: item.itemId,
//         sizeId,
//         variantId,
//         unitId,
//         quantity: item.quantity,
//       });

//       if (!saveAsDraft) {
//         const newStock = itemData.stock - item.quantity;
//         let stockStatus = "In Stock";

//         if (newStock === 0) stockStatus = "No Stock", warnings.push(`❗${itemData.name} is now out of stock.`);
//         else if (newStock <= itemData.criticalLevel) stockStatus = "Critical Level", warnings.push(`❗${itemData.name} is now at critical level.`);
//         else if (newStock <= itemData.reorderLevel) stockStatus = "Reorder Level", warnings.push(`⚠️${itemData.name} is now at reorder level.`);
//         else if (newStock > itemData.ceilingLevel) stockStatus = "Overstock", warnings.push(`⚠️${itemData.name} is now overstocked.`);

//         await db.update(itemsTable).set({ stock: newStock, status: stockStatus }).where(eq(itemsTable.id, item.itemId));
//       }
//     }

//     return NextResponse.json({
//       message: saveAsDraft ? "Issuance saved as draft." : "Issuance saved successfully!",
//       warnings,
//       issuanceId: newIssuance.id,
//     }, { status: 200 });

//   } catch (error: unknown) {
//     console.error("POST /api/issuances error:", error);
//     return NextResponse.json({
//       error: "Failed to create issuance.",
//       details: error instanceof Error ? error.message : String(error),
//     }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
//     const issuanceRecords = await db
//       .select({
//         id: itemIssuances.id,
//         clientName: itemIssuances.clientName,
//         dispatcherName: itemIssuances.dispatcherName,
//         customerPoNumber: itemIssuances.customerPoNumber,
//         prfNumber: itemIssuances.prfNumber,
//         drNumber: itemIssuances.drNumber,
//         status: itemIssuances.status,
//         issuedAt: itemIssuances.issuedAt,
//         createdAt: itemIssuances.createdAt,
//       })
//       .from(itemIssuances)
//       .orderBy(sql`COALESCE(${itemIssuances.issuedAt}, ${itemIssuances.createdAt}) DESC`);

//     const results = [];

//     for (const issuance of issuanceRecords) {
//       const issuedItems = await db
//         .select({
//           itemId: itemIssuanceItems.itemId,
//           itemName: itemsTable.name,
//           quantity: itemIssuanceItems.quantity,
//           sizeId: itemIssuanceItems.sizeId,
//           variantId: itemIssuanceItems.variantId,
//           unitId: itemIssuanceItems.unitId,
//           sizeName: sizes.name,
//           variantName: variants.name,
//           unitName: units.name,
//         })
//         .from(itemIssuanceItems)
//         .where(eq(itemIssuanceItems.issuanceId, issuance.id))
//         .leftJoin(itemsTable, eq(itemIssuanceItems.itemId, itemsTable.id))
//         .leftJoin(sizes, eq(itemIssuanceItems.sizeId, sizes.id))
//         .leftJoin(variants, eq(itemIssuanceItems.variantId, variants.id))
//         .leftJoin(units, eq(itemIssuanceItems.unitId, units.id));

//       // Normalize IDs: convert 0 > null
//       const normalizedItems = issuedItems.map((item) => ({
//         ...item,
//         sizeId: item.sizeId ?? null,
//         variantId: item.variantId ?? null,
//         unitId: item.unitId ?? null,
//       }));

//       results.push({
//         ...issuance,
//         items: normalizedItems,
//       });
//     }

//     return NextResponse.json(results);
//   } catch (error) {
//     console.error("GET /api/issuances error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch issuance records." },
//       { status: 500 }
//     );
//   }
// }

// api/issuances/route.ts

import { db } from "@/db/drizzle";
import {
  itemIssuances,
  itemIssuanceItems,
  items as itemsTable,
  sizes,
  variants,
  units,
} from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid or missing items array."}, { status: 400 });
    }

    const {
      clientName,
      dispatcherName,
      customerPoNumber,
      prfNumber,
      drNumber,
      saveAsDraft,
      items: issuedItems,
    } = body;

    const isDraft = saveAsDraft === true || saveAsDraft === "draft" || saveAsDraft === "Draft";

    console.log("Incoming POST /api/issuances payload:", {
      clientName,
      dispatcherName,
      customerPoNumber,
      prfNumber,
      drNumber,
      saveAsDraft,
      isDraft,
      items: issuedItems,
    });

    const warning: string[] = [];
    const validatedItems: Map<string, typeof itemsTable.$inferSelect> = new Map();

    // Validate all items BEFORE doing anything else
    const mismatchesOverall: Record<string, { field: string; expected: unknown; received: unknown }[]> = {};

    for (const item of issuedItems) {
      const itemData = await db.query.items.findFirst({
        where: eq(itemsTable.id, item.itemId),
      });

      if (!itemData) {
        mismatchesOverall[item.itemId] = [
          { field: "itemId", expected: item.itemId, received: "Not found in DB" },
        ];
        continue;
      }

      const mismatches: { field: string; expected: unknown; received: unknown }[] = [];

      // Normalize IDs: treat 0, undefined, or empty string as null
      const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
      const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
      const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

      // check name if provided
      if (item.name && itemData.name !== item.name) {
        mismatches.push({ field: "name", expected: itemData.name, received: item.name });
      }

      if ((itemData.sizeId ?? null) !== sizeId) {
        mismatches.push({ field: "sizeId", expected: itemData.sizeId, received: sizeId });
      }

      if ((itemData.variantId ?? null) !== variantId) {
        mismatches.push({ field: "variantId", expected: itemData.variantId, received: variantId });
      }

      if ((itemData.unitId ?? null) !== unitId) {
        mismatches.push({ field: "unitId", expected: itemData.unitId, received: unitId });
      }

      if (mismatches.length > 0) {
        mismatchesOverall[item.itemId] = mismatches;
      } 
      
      if (!isDraft && itemData.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${item.quantity}`, },
          { status: 400}
        );
      } else {
        validatedItems.set(item.itemId, itemData);
      }
    }

    if (Object.keys(mismatchesOverall).length > 0) {
      console.log("Validation failed for items:", mismatchesOverall);
      return NextResponse.json({ error: "Item ID validation failed.", details: mismatchesOverall }, { status: 400 });
    }

    // Insert main issuance record 
    const [newIssuance] = await db
      .insert(itemIssuances)
      .values({
        clientName,
        dispatcherName,
        customerPoNumber,
        prfNumber,
        drNumber,
        status: isDraft ? "Draft" : "Issued",
        issuedAt: isDraft ? null : new Date(),
      })
      .returning();

      // Insert issuance items and update stock
      for (const item of issuedItems) {
        const itemData = validatedItems.get(item.itemId);
        if (!itemData) continue;

        const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
        const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
        const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

        await db.insert(itemIssuanceItems).values({
          issuanceId: newIssuance.id,
          itemId: item.itemId,
          sizeId,
          variantId,
          unitId,
          quantity: item.quantity,
        });

        if (!isDraft) {
          const newStock = itemData.stock - item.quantity;

          let stockStatus = "In Stock";
          if (newStock === 0) {
            stockStatus = "No Stock";
            warning.push(`❗${itemData.name} is now out of stock.`);
          } else if (newStock <= itemData.criticalLevel) {
            stockStatus = "Critical Level";
            warning.push(`❗${itemData.name} is now at critical level.`);
          } else if (newStock <= itemData.reorderLevel) {
            stockStatus = "Reorder Level";
            warning.push(`⚠️${itemData.name} is now at reorder level.`);
          } else if (newStock > itemData.ceilingLevel) {
            stockStatus = "Overstock";
            warning.push(`⚠️${itemData.name} is now overstocked.`);
          }

          await db
          .update(itemsTable)
          .set({ stock: newStock, status: stockStatus })
          .where(eq(itemsTable.id, item.itemId));
        }
      }

      return NextResponse.json({ message: isDraft ? "Issuance saved as draft." : "Issuance saved successfully!", warning, issuanceId: newIssuance.id, }, { status: 200 });
  } catch (error: unknown) {
    console.error("Issuance POST error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred..", details: error instanceof Error ? error.message : String(error),}), { status: 500, headers: { "Content-Type": "application/json"},});
  }
}
export async function GET() {
  try {
    const issuanceRecords = await db
      .select({
        id: itemIssuances.id,
        clientName: itemIssuances.clientName,
        dispatcherName: itemIssuances.dispatcherName,
        customerPoNumber: itemIssuances.customerPoNumber,
        prfNumber: itemIssuances.prfNumber,
        drNumber: itemIssuances.drNumber,
        status: itemIssuances.status,
        issuedAt: itemIssuances.issuedAt,
        createdAt: itemIssuances.createdAt,
      })
      .from(itemIssuances)
      .orderBy(sql`COALESCE(${itemIssuances.issuedAt}, ${itemIssuances.createdAt}) DESC`);

    const results = [];

    for (const issuance of issuanceRecords) {
      const issuedItems = await db
        .select({
          itemId: itemIssuanceItems.itemId,
          itemName: itemsTable.name,
          quantity: itemIssuanceItems.quantity,
          sizeId: itemIssuanceItems.sizeId,
          variantId: itemIssuanceItems.variantId,
          unitId: itemIssuanceItems.unitId,
          sizeName: sizes.name,
          variantName: variants.name,
          unitName: units.name,
        })
        .from(itemIssuanceItems)
        .where(eq(itemIssuanceItems.issuanceId, issuance.id))
        .leftJoin(itemsTable, eq(itemIssuanceItems.itemId, itemsTable.id))
        .leftJoin(sizes, eq(itemIssuanceItems.sizeId, sizes.id))
        .leftJoin(variants, eq(itemIssuanceItems.variantId, variants.id))
        .leftJoin(units, eq(itemIssuanceItems.unitId, units.id));

      // Normalize IDs: convert 0 > null
      const normalizedItems = issuedItems.map((item) => ({
        ...item,
        sizeId: item.sizeId ?? null,
        variantId: item.variantId ?? null,
        unitId: item.unitId ?? null,
      }));

      results.push({
        ...issuance,
        items: normalizedItems,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/issuances error:", error);
    return NextResponse.json(
      { error: "Failed to fetch issuance records." },
      { status: 500 }
    );
  }
}

// Latest version - Sept.2