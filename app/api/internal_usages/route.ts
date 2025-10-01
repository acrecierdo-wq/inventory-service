// app/api/internal_usages/route.ts

import { db } from "@/db/drizzle";
import {
  internalUsages,
  internalUsageItems,
  items as itemsTable,
  sizes,
  variants,
  units,
  appUsers,
} from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import bcrypt from "bcryptjs";

type ClerkSignInResponse =
  | {
      id: string;
      status: "complete" | string;
      created_at: number;
      // add other Clerk fields if you need them later
    }
  | {
      errors: { message: string; code?: string }[];
    };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Raw incoming body:", body);

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      console.log("Missing or invalid items array");
      return NextResponse.json({ error: "Invalid or missing items array." }, { status: 400 });
    }

    const {
      personnelName,
      department,
      purpose,
      authorizedBy,
      note,
      loggedBy,
      items: usageItems,
      password,
    } = body;

    console.log("Parsed fields:", {
      personnelName,
      department,
      purpose,
      authorizedBy,
      note,
      loggedBy,
      items: usageItems,
      password,
    });

    // ✅ Get the current signed-in user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Password required
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    // ✅ Check if account even supports passwords
    if (!user.passwordEnabled) {
      return NextResponse.json(
        { error: "This account does not support password verification." },
        { status: 400 }
      );
    }

    // ✅ Verify password with Clerk
    try {
      const verifyResult = await clerkClient.users.verifyPassword({
        userId: user.id,
        password,
      });

      if (!verifyResult.verified) {
        return NextResponse.json({ error: "Invalid password." }, { status: 400 });
      }
    } catch (err: unknown) {
      console.error("Password verification failed:", err);
      return NextResponse.json(
        {
          error: "Password verification failed.",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 400 }
      );
    }

    // ✅ Safe "loggedBy" field
    const loggedBySafe =
      user.fullName?.trim() ||
      user.emailAddresses[0]?.emailAddress ||
      "System";

    // 👇 continue with your insert logic here...

    console.log("Incoming POST /api/internal_usages payload:", {
      personnelName,
      department,
      purpose,
      authorizedBy,
      note,
      loggedBy: loggedBySafe,
      items: usageItems,
    });

    const warning: string[] = [];
    const validatedItems: Map<string, typeof itemsTable.$inferSelect> = new Map();
    const mismatchesOverall: Record<string, { field: string; expected: unknown; received: unknown }[]> = {};

    // Validate items before inserting
    for (const item of usageItems) {
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

      const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
      const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
      const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

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

      // For internal usage, always deduct stock immediately
      if (itemData.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for "${itemData.name}". Current: ${itemData.stock}, Needed: ${item.quantity}` },
          { status: 400 }
        );
      } else {
        validatedItems.set(item.itemId, itemData);
      }
    }

    if (Object.keys(mismatchesOverall).length > 0) {
      console.error("Validation failed for items:", mismatchesOverall);
      return NextResponse.json(
        { error: "Item ID validation failed.", details: mismatchesOverall },
        { status: 400 }
      );
    }

    console.log("New usage record:", 
    {
        personnelName,
        department,
        purpose,
        authorizedBy,
        note,
        loggedBy,
    });

    console.log("Inserting usage record:", {
      personnelName,
      department,
      purpose,
      authorizedBy,
      note,
      loggedBy,
    });
    console.log("Inserting usage items:", usageItems);

    console.log("Final insert payload for internalUsages", {
      personnelName,
      department,
      purpose,
      authorizedBy,
      note: note ?? null,
      loggedBy,
    });


    // Insert main internal usage record
    const [newUsage] = await db
      .insert(internalUsages)
      .values({
        personnelName,
        department,
        purpose,
        authorizedBy,
        note,
        loggedBy: loggedBySafe,
      })
      .returning();

    // Insert usage items and update stock
    for (const item of usageItems) {
      const itemData = validatedItems.get(item.itemId);
      if (!itemData) continue;

      const sizeId = item.sizeId !== undefined && Number(item.sizeId) !== 0 ? Number(item.sizeId) : null;
      const variantId = item.variantId !== undefined && Number(item.variantId) !== 0 ? Number(item.variantId) : null;
      const unitId = item.unitId !== undefined && Number(item.unitId) !== 0 ? Number(item.unitId) : null;

      await db.insert(internalUsageItems).values({
        usageId: newUsage.id,
        itemId: item.itemId,
        sizeId,
        variantId,
        unitId,
        quantity: item.quantity,
      });

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
      } if (newStock < 0) continue;

      await db
        .update(itemsTable)
        .set({ stock: newStock, status: stockStatus })
        .where(eq(itemsTable.id, item.itemId));
    }

    return NextResponse.json(
      { message: "Internal usage saved successfully!", warning, usageId: newUsage.id },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Internal Usage POST error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  try {
    const usageRecords = await db
      .select({
        id: internalUsages.id,
        personnelName: internalUsages.personnelName,
        department: internalUsages.department,
        purpose: internalUsages.purpose,
        authorizedBy: internalUsages.authorizedBy,
        note: internalUsages.note,
        status: internalUsages.status,
        loggedAt: internalUsages.loggedAt,
        loggedBy: internalUsages.loggedBy,
      })
      .from(internalUsages)
      .orderBy(sql`${internalUsages.loggedAt} DESC, ${internalUsages.id} DESC`);

    const results = [];

    for (const usage of usageRecords) {
      const usedItems = await db
        .select({
          itemId: internalUsageItems.itemId,
          itemName: itemsTable.name,
          quantity: internalUsageItems.quantity,
          sizeId: internalUsageItems.sizeId,
          variantId: internalUsageItems.variantId,
          unitId: internalUsageItems.unitId,
          sizeName: sizes.name,
          variantName: variants.name,
          unitName: units.name,
        })
        .from(internalUsageItems)
        .where(eq(internalUsageItems.usageId, usage.id))
        .leftJoin(itemsTable, eq(internalUsageItems.itemId, itemsTable.id))
        .leftJoin(sizes, eq(internalUsageItems.sizeId, sizes.id))
        .leftJoin(variants, eq(internalUsageItems.variantId, variants.id))
        .leftJoin(units, eq(internalUsageItems.unitId, units.id));

      const normalizedItems = usedItems.map((item) => ({
        ...item,
        sizeId: item.sizeId ?? null,
        variantId: item.variantId ?? null,
        unitId: item.unitId ?? null,
      }));

      results.push({
        ...usage,
        items: normalizedItems,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/internal_usages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch internal usage records." },
      { status: 500 }
    );
  }
}
