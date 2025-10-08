// // /app/api/sales/quotations/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/drizzle";
// import {
//   quotations,
//   quotationItems,
//   quotationMaterials,
//   quotationFiles,
//   quotation_requests,
//   customer_profile,
// } from "@/db/schema";
// import { eq, and } from "drizzle-orm";
// import { validateQuotation, DraftInput, SentInput } from "@/lib/quotationSchema";
// import { z } from "zod";

// function isUuid(value: unknown): value is string {
//   return (
//     typeof value === "string" &&
//     /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
//   );
// }

// export async function POST(req: NextRequest) {
//   try {
//     const json = await req.json();

//     let data: DraftInput | SentInput;
//     try {
//       data = validateQuotation(json);
//     } catch (err) {
//       if (err instanceof z.ZodError) {
//         return NextResponse.json(
//           { success: false, error: err.flatten().fieldErrors },
//           { status: 400 }
//         );
//       }
//       throw err;
//     }

//     // ✅ Validate request and customer
//     const [request] = await db
//       .select()
//       .from(quotation_requests)
//       .where(eq(quotation_requests.id, data.requestId));

//     if (!request) {
//       return NextResponse.json(
//         { success: false, error: "Invalid requestId" },
//         { status: 400 }
//       );
//     }

//     const [customer] = await db
//       .select()
//       .from(customer_profile)
//       .where(eq(customer_profile.id, request.customer_id));

//     if (!customer?.clientCode) {
//       return NextResponse.json(
//         { success: false, error: "Missing client code in customer profile" },
//         { status: 400 }
//       );
//     }

//     const clientCode = customer.clientCode;
//     const quotationStatus = data.status === "sent" ? "sent" : "draft";
//     let quotationId: string;

//     // ✅ CASE 1: UPDATE EXISTING DRAFT
//     if (isUuid(data.id)) {
//       quotationId = data.id;
//       console.log("🔄 Updating existing draft:", quotationId);

//       await db
//         .update(quotations)
//         .set({
//           projectName: data.projectName ?? "",
//           mode: data.mode ?? "",
//           status: quotationStatus,
//           validity: data.validity ?? new Date().toISOString().split("T")[0],
//           delivery: data.delivery ?? "",
//           warranty: data.warranty ?? "",
//           quotationNotes: data.quotationNotes ?? "",
//           cadSketch: data.cadSketch ?? null,
//           vat: String(data.vat ?? 12),
//           markup: String(data.markup ?? 0),
//         })
//         .where(eq(quotations.id, quotationId));

//       // clean old relations
//       await db.delete(quotationMaterials)
//         .where(eq(quotationMaterials.quotationItemId, quotationId));
//       await db.delete(quotationItems)
//         .where(eq(quotationItems.quotationId, quotationId));
//       await db.delete(quotationFiles)
//         .where(eq(quotationFiles.quotationId, quotationId));
//     }

//     // ✅ CASE 2: CREATE NEW DRAFT
//     else {
//       console.log("🆕 Creating new quotation record...");
//       const [newQuotation] = await db
//         .insert(quotations)
//         .values({
//           requestId: data.requestId,
//           projectName: data.projectName ?? "",
//           mode: data.mode ?? "",
//           status: quotationStatus,
//           validity: data.validity ?? new Date().toISOString().split("T")[0],
//           delivery: data.delivery ?? "",
//           warranty: data.warranty ?? "",
//           quotationNotes: data.quotationNotes ?? "",
//           cadSketch: data.cadSketch ?? null,
//           vat: String(data.vat ?? 12),
//           markup: String(data.markup ?? 0),
//         })
//         .returning({ id: quotations.id, quotationSeq: quotations.quotationSeq });

//       if (!newQuotation?.id) throw new Error("Failed to create quotation.");

//       quotationId = newQuotation.id;

//       const paddedSeq = String(newQuotation.quotationSeq).padStart(8, "0");
//       const formattedNumber = `CTIC-${clientCode}-${paddedSeq}-1`;

//       await db
//         .update(quotations)
//         .set({
//           quotationNumber: formattedNumber,
//           revisionNumber: 0,
//         })
//         .where(eq(quotations.id, quotationId));
//     }

//     // ✅ Insert items & materials
//     if (Array.isArray(data.items)) {
//       for (const item of data.items) {
//         const totalPrice = (item.quantity * item.unitPrice).toFixed(2);

//         const [newItem] = await db
//           .insert(quotationItems)
//           .values({
//             quotationId,
//             itemName: item.itemName,
//             scopeOfWork: item.scopeOfWork,
//             quantity: item.quantity,
//             unitPrice: String(item.unitPrice),
//             totalPrice,
//           })
//           .returning({ id: quotationItems.id });

//         if (item.materials?.length) {
//           for (const mat of item.materials) {
//             await db.insert(quotationMaterials).values({
//               quotationItemId: newItem.id,
//               name: mat.name,
//               specification: mat.specification ?? "",
//               quantity: mat.quantity,
//             });
//           }
//         }
//       }
//     }

//     // ✅ Insert attached files
//     if (Array.isArray(data.attachedFiles)) {
//       for (const file of data.attachedFiles) {
//         await db.insert(quotationFiles).values({
//           quotationId,
//           fileName: file.fileName,
//           filePath: file.filePath,
//         });
//       }
//     }

//     // ✅ Fetch normalized result
//     const [result] = await db
//       .select({
//         id: quotations.id,
//         projectName: quotations.projectName,
//         mode: quotations.mode,
//         status: quotations.status,
//         validity: quotations.validity,
//         delivery: quotations.delivery,
//         warranty: quotations.warranty,
//         quotationNotes: quotations.quotationNotes,
//         cadSketch: quotations.cadSketch,
//         revisionNumber: quotations.revisionNumber,
//         createdAt: quotations.createdAt,
//         quotationNumber: quotations.quotationNumber,
//         customerId: customer_profile.id,
//         companyName: customer_profile.companyName,
//         contactPerson: customer_profile.contactPerson,
//         clientCode: customer_profile.clientCode,
//       })
//       .from(quotations)
//       .leftJoin(
//         quotation_requests,
//         eq(quotation_requests.id, quotations.requestId)
//       )
//       .leftJoin(
//         customer_profile,
//         eq(customer_profile.id, quotation_requests.customer_id)
//       )
//       .where(eq(quotations.id, quotationId));

//     if (!result) throw new Error("Failed to fetch saved quotation.");

//     const normalized = {
//       ...result,
//       customer: {
//         id: result.customerId,
//         companyName: result.companyName,
//         contactPerson: result.contactPerson,
//         clientCode: result.clientCode,
//       },
//       revisionLabel: `REVISION-${String(result.revisionNumber ?? 0).padStart(2, "0")}`,
//       cadSketchFile: result.cadSketch
//         ? [{ name: result.cadSketch, filePath: `/sales/uploads/${result.cadSketch}` }]
//         : [],
//     };

//     return NextResponse.json({
//       success: true,
//       message: isUuid(data.id)
//         ? "Quotation draft updated successfully."
//         : "Quotation created successfully!",
//       data: normalized,
//     });
//   } catch (error) {
//     console.error("❌ Error saving quotation:", error);
//     return NextResponse.json(
//       { success: false, error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }


// export async function GET(req: NextRequest) {

//   const { searchParams } = new URL(req.url);
//   const status = searchParams.get("status");
//   const requestId = searchParams.get("requestId");

//   type QuotationStatus =
//   | "draft"
//   | "sent"
//   | "revision_requested"
//   | "accepted"
//   | "rejected"
//   | "expired";

//   try {
//     const conditions = [];

//     if (
//       status && 
//       ["draft", "sent", "revision_requested", "accepted", "rejected", "expired"].includes(status)
//     ) {
//       conditions.push(eq(quotations.status, status as QuotationStatus));
//     }

//     if (requestId) {
//       conditions.push(eq(quotations.requestId, Number(requestId)));
//     }

//     // include items + materials when fetching drafts
//     const allQuotations = await db.query.quotations.findMany({
//       where: conditions.length > 1 ? and(...conditions) : conditions[0],
//       with: {
//         items: {
//           with: {
//             materials: true,
//           },
//         },
//       },
//     });

//     const normalized = allQuotations.map((q) => ({
//       id: q.id,
//       requestId: q.requestId,
//       projectName: q.projectName,
//       mode: q.mode,
//       status: q.status,
//       validity: q.validity,
//       delivery: q.delivery,
//       warranty: q.warranty,
//       quotationNotes: q.quotationNotes,
//       cadSketch: q.cadSketch,
//       vat: Number(q.vat) || 12,
//       markup: Number(q.markup) || 0,
//       items: q.items.map((i) => ({
//         id: i.id,
//         itemName: i.itemName,
//         scopeOfWork: i.scopeOfWork,
//         quantity: i.quantity,
//         unitPrice: i.unitPrice,
//         totalPrice: i.totalPrice,
//         materials: i.materials?.map((m) => ({
//           id: m.id,
//           name: m.name,
//           specification: m.specification,
//           quantity: m.quantity,
//         })) ?? [],
//       })),
//       revisionLabel: `REVISION-${String(q.revisionNumber ?? 0).padStart(2, "0")}`,
//       cadSketchFile: q.cadSketch
//         ? [{ name: q.cadSketch, filePath: `/sales/uplaods/${q.cadSketch}` }]
//         : [],
//     }));

//     console.log("Returing quotations:",JSON.stringify(normalized, null, 2));

//     return NextResponse.json({ success: true, quotations: normalized });
//   } catch (err) {
//     console.error("Error fetching quotations:", err);
//     return NextResponse.json({ success: false, error: "Failed to fetch quotations." }, { status: 500 });
//   }
// }

// // DELETE

// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ success: false, error: "Missing quotation ID." }, { status: 400 });
//     }

//     // delete related materials
//       const items = await db
//         .select({ id: quotationItems.id })
//         .from(quotationItems)
//         .where(eq(quotationItems.quotationId, id));

//         for (const item of items) {
//           await db.delete(quotationMaterials).where(eq(quotationMaterials.quotationItemId, item.id));
//         }

//         // delete quotation items
//         await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));

//         // delete quotation itself
//         await db.delete(quotations).where(eq(quotations.id, id));
        
//         return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("Error deleting quotation:", err);
//     return NextResponse.json({ success: false, error: "Failed to delete quotation." }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  quotations,
  quotationItems,
  quotationMaterials,
  quotationFiles,
  quotation_requests,
  customer_profile,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { validateQuotation, DraftInput, SentInput } from "@/lib/quotationSchema";
import { z } from "zod";

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
  );
}

/**
 * ✅ POST — create or update quotation (draft or sent)
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    let data: DraftInput | SentInput;

    try {
      data = validateQuotation(json);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: err.flatten().fieldErrors },
          { status: 400 }
        );
      }
      throw err;
    }

    // Validate linked request and customer
    const [request] = await db
      .select()
      .from(quotation_requests)
      .where(eq(quotation_requests.id, data.requestId));
    if (!request)
      return NextResponse.json({ success: false, error: "Invalid requestId" }, { status: 400 });

    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.id, request.customer_id));
    if (!customer?.clientCode)
      return NextResponse.json(
        { success: false, error: "Missing client code in customer profile" },
        { status: 400 }
      );
    
      console.log("✅ POST — create or update quotation (draft or sent)", data);

    const clientCode = customer.clientCode;
    const quotationStatus = data.status === "sent" ? "sent" : "draft";
    let quotationId: string;

    // ✅ CASE 1: UPDATE EXISTING DRAFT
    if (isUuid(data.id)) {
      quotationId = data.id;
      await db
        .update(quotations)
        .set({
          projectName: data.projectName ?? "",
          mode: data.mode ?? "",
          status: quotationStatus,
          validity: data.validity ?? new Date().toISOString().split("T")[0],
          delivery: data.delivery ?? "",
          warranty: data.warranty ?? "",
          quotationNotes: data.quotationNotes ?? "",
          cadSketch: data.cadSketch ?? null,
          vat: String(data.vat ?? 12),
          markup: String(data.markup ?? 0),
        })
        .where(eq(quotations.id, quotationId));

      await db.delete(quotationMaterials).where(eq(quotationMaterials.quotationItemId, quotationId));
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));
      await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, quotationId));
    }

    // ✅ CASE 2: CREATE NEW DRAFT
    else {
      const [newQuotation] = await db
        .insert(quotations)
        .values({
          requestId: data.requestId,
          projectName: data.projectName ?? "",
          mode: data.mode ?? "",
          status: quotationStatus,
          validity: data.validity ?? new Date().toISOString().split("T")[0],
          delivery: data.delivery ?? "",
          warranty: data.warranty ?? "",
          quotationNotes: data.quotationNotes ?? "",
          cadSketch: data.cadSketch ?? null,
          vat: String(data.vat ?? 12),
          markup: String(data.markup ?? 0),
        })
        .returning({ id: quotations.id, quotationSeq: quotations.quotationSeq });

      console.log("✅ CASE 2: CREATE NEW DRAFT", newQuotation);

      quotationId = newQuotation.id;
      const paddedSeq = String(newQuotation.quotationSeq).padStart(8, "0");
      const formattedNumber = `CTIC-${clientCode}-${paddedSeq}-1`;

      await db
        .update(quotations)
        .set({ quotationNumber: formattedNumber, revisionNumber: 0 })
        .where(eq(quotations.id, quotationId));
    }

    // ✅ Insert items, materials, and files
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        const totalPrice = (item.quantity * item.unitPrice).toFixed(2);
        const [newItem] = await db
          .insert(quotationItems)
          .values({
            quotationId,
            itemName: item.itemName,
            scopeOfWork: item.scopeOfWork,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            totalPrice,
          })
          .returning({ id: quotationItems.id });

        if (item.materials?.length) {
          for (const mat of item.materials) {
            await db.insert(quotationMaterials).values({
              quotationItemId: newItem.id,
              name: mat.name,
              specification: mat.specification ?? "",
              quantity: mat.quantity,
            });
          }
        }
      }
    }
    console.log("✅ Insert items, materials, and files", data);

    if (Array.isArray(data.attachedFiles)) {
      for (const file of data.attachedFiles) {
        await db.insert(quotationFiles).values({
          quotationId,
          fileName: file.fileName,
          filePath: file.filePath,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: isUuid(data.id)
        ? "Quotation draft updated successfully."
        : "Quotation created successfully!",
    });
  } catch (error) {
    console.error("❌ Error saving quotation:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

/**
 * ✅ GET — fetch quotations (filter by status/requestId)
 * excludes drafts with status='restoring'
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const requestId = searchParams.get("requestId");

  type QuotationStatus =
    | "draft"
    | "restoring"
    | "sent"
    | "revision_requested"
    | "accepted"
    | "rejected"
    | "expired";

  try {
    const conditions = [];

    if (status) conditions.push(eq(quotations.status, status as QuotationStatus));
    if (requestId) conditions.push(eq(quotations.requestId, Number(requestId)));

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;

    const allQuotations = await db.query.quotations.findMany({
      where: whereClause,
      with: {
        items: { with: { materials: true } },
      },
    });

    const normalized = allQuotations
      .filter((q) => q.status !== "restoring") // ✅ exclude restoring
      .map((q) => ({
        id: q.id,
        requestId: q.requestId,
        projectName: q.projectName,
        mode: q.mode,
        status: q.status,
        validity: q.validity,
        delivery: q.delivery,
        warranty: q.warranty,
        quotationNotes: q.quotationNotes,
        cadSketch: q.cadSketch,
        vat: Number(q.vat) || 12,
        markup: Number(q.markup) || 0,
        items: q.items.map((i) => ({
          id: i.id,
          itemName: i.itemName,
          scopeOfWork: i.scopeOfWork,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
          materials:
            i.materials?.map((m) => ({
              id: m.id,
              name: m.name,
              specification: m.specification,
              quantity: m.quantity,
            })) ?? [],
        })),
      }));
      console.log("✅ GET QUOTATIONS", normalized);

    return NextResponse.json({ success: true, quotations: normalized });
  } catch (err) {
    console.error("Error fetching quotations:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotations." },
      { status: 500 }
    );
  }
}

/**
 * ✅ DELETE — remove quotation and its dependencies
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing quotation ID." }, { status: 400 });
    }

    const items = await db
      .select({ id: quotationItems.id })
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, id));

    for (const item of items) {
      await db.delete(quotationMaterials).where(eq(quotationMaterials.quotationItemId, item.id));
    }

    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
    await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, id));
    await db.delete(quotations).where(eq(quotations.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting quotation:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete quotation." },
      { status: 500 }
    );
  }
}
