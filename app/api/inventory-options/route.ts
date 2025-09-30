// // api/inventory-options/route.ts

import { db } from "@/db/drizzle";
import { items, sizes, variants, units } from "@/db/schema";
import { eq } from "drizzle-orm";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const itemName = searchParams.get("itemName"); // use name, not id

//   if (!itemName) {
//     return new Response(JSON.stringify([]), { status: 200 });
//   }

//   // Fetch all rows that match this item name
//   const rows = await db
//     .select({
//       itemId: items.id,
//       sizeId: items.sizeId,
//       sizeName: sizes.name,
//       variantId: items.variantId,
//       variantName: variants.name,
//       unitId: items.unitId,
//       unitName: units.name,
//     })
//     .from(items)
//     .leftJoin(sizes, eq(items.sizeId, sizes.id))
//     .leftJoin(variants, eq(items.variantId, variants.id))
//     .leftJoin(units, eq(items.unitId, units.id))
//     .where(eq(items.name, itemName));

//   // Return raw row combinations
//   return new Response(JSON.stringify(rows), { status: 200 });
// }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemName = searchParams.get("itemName");

  if (!itemName) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  const rows = await db
    .select({
      itemId: items.id,
      itemName: items.name,
      sizeId: items.sizeId,
      sizeName: sizes.name,
      variantId: items.variantId,
      variantName: variants.name,
      unitId: items.unitId,
      unitName: units.name,
    })
    .from(items)
    .leftJoin(sizes, eq(items.sizeId, sizes.id))
    .leftJoin(variants, eq(items.variantId, variants.id))
    .leftJoin(units, eq(items.unitId, units.id))
    .where(eq(items.name, itemName));

  console.log("rows for", itemName, rows);

  return new Response(JSON.stringify(rows), { status: 200 });
}
