// api/item-find/route.ts
import { db } from "@/db/drizzle";
import { items } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const itemName = searchParams.get("itemName");
  const sizeIdParam = searchParams.get("sizeId");
  const variantIdParam = searchParams.get("variantId");
  const unitIdParam = searchParams.get("unitId");

  if (!itemName) {
    return new Response(JSON.stringify(null), { status: 200 });
  }

  // Normalize IDs: convert "0", undefined
  const sizeId = sizeIdParam && Number(sizeIdParam) !== 0 ? Number(sizeIdParam) : null;
  const variantId = variantIdParam && Number(variantIdParam) !== 0 ? Number(variantIdParam) : null;
  const unitId = unitIdParam && Number(unitIdParam) !== 0 ? Number(unitIdParam) : null;

  const [result] = await db
    .select({ id: items.id })
    .from(items)
    .where(
      and(
        eq(items.name, itemName),
        eq(items.sizeId, Number(sizeId)),
        eq(items.variantId, Number(variantId)),
        eq(items.unitId, Number(unitId))
      )
    );

  return new Response(JSON.stringify(result || null), { status: 200 });
}
