// api/item-find/route.ts
import { db } from "@/db/drizzle";
import { items } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const sizeId = searchParams.get("sizeId");
  const variantId = searchParams.get("variantId");
  const unitId = searchParams.get("unitId");

  if (!itemId || !sizeId || !variantId || !unitId) {
    return new Response(JSON.stringify(null), { status: 200 });
  }

  const [result] = await db
    .select({ id: items.id })
    .from(items)
    .where(
      and(
        eq(items.name, itemId),
        eq(items.sizeId, Number(sizeId)),
        eq(items.variantId, Number(variantId)),
        eq(items.unitId, Number(unitId))
      )
    );

  return new Response(JSON.stringify(result || null), { status: 200 });
}
