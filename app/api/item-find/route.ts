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

  // Build comditions dynamically

  const conditions = [eq(items.name, itemName)];

  if (sizeIdParam && Number(sizeIdParam) !== 0) {
    conditions.push(eq(items.sizeId, Number(sizeIdParam)));
  }

  if (variantIdParam && Number(variantIdParam) !== 0) {
    conditions.push(eq(items.variantId, Number(variantIdParam)));
  }

  if (unitIdParam && Number(unitIdParam) !== 0) {
    conditions.push(eq(items.unitId, Number(unitIdParam)));
  }

  const [result] = await db
    .select({ id: items.id })
    .from(items)
    .where(
      and(...conditions));

  return new Response(JSON.stringify(result || null), { status: 200 });
}
