// // app/api/sales/quotations/[id]/route.ts

// import { db } from "@/db/drizzle";
// import { quotations, quotationItems, quotationMaterials } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { NextResponse, NextRequest } from "next/server";
// import { quotationSchema, QuotationUpdateInput } from "@/lib/quotationSchema"

// type RouteContext = {
//   params: Promise<{ id: string }>;
// }

// export async function PUT(req: NextRequest, context: RouteContext) {
//   try {
//     const { id } = await context.params;
//     const json = await req.json();

//     const parsed = quotationSchema.partial().safeParse(json);
//     if (!parsed.success) {
//       return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
//     }

//     const body: QuotationUpdateInput = parsed.data;
//     const quotationId = String(id);

//     // fetch current quotation
//     const [current] = await db
//     .select()
//     .from(quotations)
//     .where(eq(quotations.id, quotationId));

//     if (!current) {
//       return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
//     }

//     // determine if just draft or full revision of quotation
//     await db
//       .update(quotations)
//       .set({
//         projectName: body.projectName ?? current.projectName,
//         quotationNotes: body.quotationNotes ?? current.quotationNotes,
//         delivery: body.delivery ?? current.delivery,
//         warranty: body.warranty ?? current.warranty,
//         validity: body.validity ?? current.validity,
//         vat: String(body.vat ?? current.vat ?? 12),
//         markup: String(body.markup ?? current.markup ?? 0),
//         status: body.status ?? current.status,
//         mode: body.mode ?? current.mode,
//         updatedAt: new Date(),
//       })
//       .where(eq(quotations.id, quotationId))
//       .returning();

//     // replace items
//     if (body.items) {
//       await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));

//       const materialsToInsert: typeof quotationMaterials.$inferInsert[] = [];

//       for (const item of body.items) {
//         //const qty = typeof item.quantity === "string" ? parseInt(item.quantity, 10) || 0 : item.quantity || 0;
//         const qty = Number(item.quantity) || 0;
//         const unit = Number(item.unitPrice) || 0;
//         const total = qty * unit;

//         const [newItem] = await db
//         .insert(quotationItems)
//         .values({
//           quotationId: quotationId,
//           itemName: item.itemName,
//           scopeOfWork: item.scopeOfWork,
//           quantity: qty,
//           unitPrice: unit.toFixed(2),
//           totalPrice: total.toFixed(2),
//         })
//         .returning({ id: quotationItems.id });

//         if (item.materials && item.materials.length > 0) {
//           for (const m of item.materials) {
//             materialsToInsert.push({
//               quotationItemId: newItem.id,
//               name: m.name,
//               specification: m.specification ?? "",
//               quantity: typeof m.quantity === "string" ? parseInt(m.quantity, 10) || 0 : m.quantity || 0,
//             });
//           }
//         }
//       }

//       if (materialsToInsert.length > 0) {
//         await db.insert(quotationMaterials).values(materialsToInsert);
//       }
//     }

//     const refreshed = await db.query.quotations.findFirst({
//       where: eq(quotations.id, quotationId),
//       with: { items: true },
//     });

//     if (!refreshed) {
//       return NextResponse.json({ error: "Quotation not found after update" }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       data: {
//         ...refreshed,
//         revisionLabel: `REVISION-${String(refreshed.revisionNumber ?? 0).padStart(2, "0")}`,
//         cadSketchFile: refreshed.cadSketch
//           ? [
//             {
//               name: refreshed.cadSketch,
//               filePath: `/sales/uploads/${refreshed.cadSketch}`,
//             },
//           ]
//           : [],
//       },
//     });
//   } catch (err) {
//     console.error("Error updating quotation:", err);
//     return NextResponse.json({
//       error: err instanceof Error ? err.message : "Unknown error"
//     }, { status: 500 });
//   }
// }


// export async function GET(
//   _req: NextRequest, context: RouteContext) {

//   const { id } = await context.params;

//   try {
//     const quotation = await db.query.quotations.findFirst({
//       where: eq(quotations.id, id),
//       with: { items: true },
//     });

//     if (!quotation) {
//       return NextResponse.json({ error: "Not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       data: {
//         ...quotation,
//         revisionLabel: `REVISION-${String(quotation.revisionNumber ?? 0).padStart(2, "0")}`,
//         cadSketchFile: quotation.cadSketch
//           ? [{  name: quotation.cadSketch, filePath: `/sales/uploads/${quotation.cadSketch}`, } ]
//           : [],
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching quotation:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch quotation" },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * ✅ DELETE — delete draft quotation
//  */
// export async function DELETE(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");

//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: "Missing quotation ID" },
//       { status: 400 }
//     );
//   }

//   try {
//     await db.delete(quotations).where(eq(quotations.id, String(id)));
//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("❌ Error deleting quotation:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to delete quotation" },
//       { status: 500 }
//     );
//   }
// }

import { db } from "@/db/drizzle";
import { quotations, quotationItems, quotationMaterials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { quotationSchema, QuotationUpdateInput } from "@/lib/quotationSchema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * ✅ PUT — update quotation by ID
 * Used for marking draft as "restoring", "draft", or updating data.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const json = await req.json();

    // ✅ Allow “restoring” as temporary override
    const parsed = quotationSchema
      .partial()
      .safeParse({
        ...json,
        status: json.status === "restoring" ? "restoring" : json.status,
      });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const body: QuotationUpdateInput = parsed.data;
    const quotationId = String(id);

    const [current] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, quotationId));

    if (!current) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const validStatuses = ["draft", "restoring", "sent", "accepted", "rejected"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await db
      .update(quotations)
      .set({
        projectName: body.projectName ?? current.projectName,
        quotationNotes: body.quotationNotes ?? current.quotationNotes,
        delivery: body.delivery ?? current.delivery,
        warranty: body.warranty ?? current.warranty,
        validity: body.validity ?? current.validity,
        vat: String(body.vat ?? current.vat ?? 12),
        markup: String(body.markup ?? current.markup ?? 0),
        status: body.status ?? current.status,
        mode: body.mode ?? current.mode,
        updatedAt: new Date(),
      })
      .where(eq(quotations.id, quotationId))
      .returning();

    if (body.items) {
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));
      const materialsToInsert: typeof quotationMaterials.$inferInsert[] = [];

      for (const item of body.items) {
        const qty = Number(item.quantity) || 0;
        const unit = Number(item.unitPrice) || 0;
        const total = qty * unit;

        const [newItem] = await db
          .insert(quotationItems)
          .values({
            quotationId,
            itemName: item.itemName,
            scopeOfWork: item.scopeOfWork,
            quantity: qty,
            unitPrice: unit.toFixed(2),
            totalPrice: total.toFixed(2),
          })
          .returning({ id: quotationItems.id });

        if (item.materials?.length) {
          for (const m of item.materials) {
            materialsToInsert.push({
              quotationItemId: newItem.id,
              name: m.name,
              specification: m.specification ?? "",
              quantity: Number(m.quantity) || 0,
            });
          }
        }
      }

      if (materialsToInsert.length) {
        await db.insert(quotationMaterials).values(materialsToInsert);
      }
    }

    const refreshed = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: { items: true },
    });

    if (!refreshed) {
      return NextResponse.json({ error: "Quotation not found after update" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Quotation updated successfully",
      data: {
        ...refreshed,
        revisionLabel: `REVISION-${String(refreshed.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketchFile: refreshed.cadSketch
          ? [{ name: refreshed.cadSketch, filePath: `/sales/uploads/${refreshed.cadSketch}` }]
          : [],
      },
    });
  } catch (err) {
    console.error("Error updating quotation:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ GET — fetch quotation by ID
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const quotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, id),
      with: { items: true },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...quotation,
        revisionLabel: `REVISION-${String(quotation.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketchFile: quotation.cadSketch
          ? [{ name: quotation.cadSketch, filePath: `/sales/uploads/${quotation.cadSketch}` }]
          : [],
      },
    });
  } catch (err) {
    console.error("Error fetching quotation:", err);
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 });
  }
}

/**
 * ✅ DELETE — delete quotation by ID
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    await db.delete(quotations).where(eq(quotations.id, String(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting quotation:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}
