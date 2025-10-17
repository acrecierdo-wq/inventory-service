// // app/api/sales/quotations/route.ts

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

// /**
//  * ✅ POST — create or update quotation (draft or sent)
//  */
// export async function POST(req: NextRequest) {
//   try {
//     const json = await req.json();
//     let data: DraftInput | SentInput;

//     try {
//       console.log("STATUS:", json.status);
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

//     // Validate linked request and customer
//     const [request] = await db
//       .select()
//       .from(quotation_requests)
//       .where(eq(quotation_requests.id, data.requestId));

//     if (!request)
//       return NextResponse.json({ success: false, error: "Invalid requestId" }, { status: 400 });

//     const [customer] = await db
//       .select()
//       .from(customer_profile)
//       .where(eq(customer_profile.id, request.customer_id));

//     if (!customer?.clientCode)
//       return NextResponse.json(
//         { success: false, error: "Missing client code in customer profile" },
//         { status: 400 }
//       );
    
//       console.log("✅ POST — create or update quotation (draft or sent)", data);

//     const clientCode = customer.clientCode;
//     const quotationStatus = data.status === "sent" ? "sent" : "draft";
//     let quotationId: string;

//     // ✅ CASE 1: UPDATE EXISTING DRAFT
//     if (isUuid(data.id)) {
//       quotationId = data.id;
//       await db
//         .update(quotations)
//         .set({
//           projectName: data.projectName ?? "",
//           mode: data.mode ?? "",
//           status: quotationStatus,
//           payment: data.payment ?? "",
//           validity: data.validity ?? "",
//           delivery: data.delivery ?? "",
//           warranty: data.warranty ?? "",
//           quotationNotes: data.quotationNotes ?? "",
//           cadSketch: data.cadSketch ?? null,
//           vat: String(data.vat ?? 12),
//           markup: String(data.markup ?? 5),
//         })
//         .where(eq(quotations.id, quotationId));

//       await db.delete(quotationMaterials).where(eq(quotationMaterials.quotationItemId, quotationId));
//       await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));
//       await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, quotationId));
//     }

//     // ✅ CASE 2: CREATE NEW DRAFT
//     else {
//       const [newQuotation] = await db
//         .insert(quotations)
//         .values({
//           requestId: data.requestId,
//           projectName: data.projectName ?? "",
//           mode: data.mode ?? "",
//           status: quotationStatus,
//           payment: data.payment ?? "",
//           validity: data.validity ?? "",
//           delivery: data.delivery ?? "",
//           warranty: data.warranty ?? "",
//           quotationNotes: data.quotationNotes ?? "",
//           cadSketch: data.cadSketch ?? null,
//           vat: String(data.vat ?? 12),
//           markup: String(data.markup ?? 5),
//         })
//         .returning({ id: quotations.id, quotationSeq: quotations.quotationSeq });

//       console.log("✅ CASE 2: CREATE NEW DRAFT", newQuotation);

//       quotationId = newQuotation.id;
//       const paddedSeq = String(newQuotation.quotationSeq).padStart(8, "0");
//       const formattedNumber = `CTIC-${clientCode}-${paddedSeq}-1`;

//       await db
//         .update(quotations)
//         .set({ quotationNumber: formattedNumber, revisionNumber: 0 })
//         .where(eq(quotations.id, quotationId));
//     }

//     // ✅ Insert items, materials, and files
//     if (Array.isArray(data.items)) {
//       for (const item of data.items) {
//         if (data.status === "sent") {
//           if (!item.scopeOfWork?.trim()) {
//             throw new Error("Scope of work is required.");
//           }
//           if (Number(item.unitPrice) <= 0) {
//             throw new Error("Unit price must be greater than 0");
//           }
//         }
//         const totalPrice =
//           Number(item.quantity || 0) * Number(item.unitPrice || 0);
        
//         const [newItem] = await db
//           .insert(quotationItems)
//           .values({
//             quotationId,
//             itemName: item.itemName ?? "(Untitled Item)",
//             scopeOfWork: item.scopeOfWork ?? "(To be defined)",
//             quantity: item.quantity ?? 0,
//             unitPrice: String(item.unitPrice ?? 0),
//             totalPrice: totalPrice.toFixed(2),
//           })
//           .returning({ id: quotationItems.id });

//         if (item.materials?.length) {
//           for (const mat of item.materials) {
//             await db.insert(quotationMaterials).values({
//               quotationItemId: newItem.id,
//               name: mat.name ?? "(Unnamed material)",
//               specification: mat.specification ?? "",
//               quantity: mat.quantity ?? 0,
//             });
//           }
//         }
//       }
//     }
//     console.log("✅ Insert items, materials, and files", data);

//     if (Array.isArray(data.attachedFiles)) {
//       for (const file of data.attachedFiles) {
//         await db.insert(quotationFiles).values({
//           quotationId,
//           fileName: file.fileName,
//           filePath: file.filePath.replace("/uploads/", "/sales/uploads/"),
//         });
//       }
//     }

//     // fetch full quotation details to return to frontend
//   const [result] = await db
//     .select({
//       id: quotations.id,
//       projectName: quotations.projectName,
//       mode: quotations.mode,
//       status: quotations.status,
//       payment: quotations.payment,
//       delivery: quotations.delivery,
//       validity: quotations.validity,
//       warranty: quotations.warranty,
//       quotationNotes: quotations.quotationNotes,
//       cadSketch: quotations.cadSketch,
//       revisionNumber: quotations.revisionNumber,
//       createdAt: quotations.createdAt,
//       quotationNumber: quotations.quotationNumber,
//       customerId: customer_profile.id,
//       companyName: customer_profile.companyName,
//       contactPerson: customer_profile.contactPerson,
//       clientCode: customer_profile.clientCode,
//     })
//     .from(quotations)
//     .leftJoin(
//       quotation_requests,
//       eq(quotation_requests.id, quotations.requestId)
//     )
//     .leftJoin(
//       customer_profile,
//       eq(customer_profile.id, quotation_requests.customer_id)
//     )
//     .where(eq(quotations.id, quotationId));

//     if (!result) throw new Error("Failed to fetch saved quotation.");

//     // normalize structure fro frontend
//     const normalized = {
//       ...result,
//       customer: {
//         id: result.customerId,
//         companyName: result.companyName,
//         contactPerson: result.contactPerson,
//         clientCode: result.clientCode,
//       },
//       revisionLabel: `REVISION-${String(result.revisionNumber ?? 0).padStart(2, "0")}`,
//       cadSketch: result.cadSketch
//         ? [{ name: result.cadSketch, filePath: `/sales/uploads/${result.cadSketch}` }]
//         : [],
//     };

//     return NextResponse.json({
//       success: true,
//       message: isUuid(data.id)
//         ? "Quotation draft updated successfully."
//         : "Quotation created succssfully!",
//       data: normalized,
//     });
    
//   } catch (error) {
//     console.error("❌ Error saving quotation:", error);
//     return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
//   }
  
// }

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const status = searchParams.get("status");
//   const requestId = searchParams.get("requestId");

//   type QuotationStatus =
//     | "draft"
//     | "restoring"
//     | "sent"
//     | "revision_requested"
//     | "accepted"
//     | "rejected"
//     | "expired";

//   try {
//     const conditions = [];
//     if (status) conditions.push(eq(quotations.status, status as QuotationStatus));
//     if (requestId) conditions.push(eq(quotations.requestId, Number(requestId)));

//     const whereClause =
//       conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;

//     const allQuotations = await db.query.quotations.findMany({
//       where: whereClause,
//       with: {
//         items: { with: { materials: true } },
//       },
//     });

//     const normalized = allQuotations
//       .filter((q) => q.status !== "restoring")
//       .map((q) => {
//         // ✅ Convert cadSketch (string) to cadSketchFile (array) for consistency
//         const cadSketchFile = q.cadSketch
//           ? [
//               {
//                 name: q.cadSketch.split("/").pop() || "uploaded_file",
//                 filePath: q.cadSketch.startsWith("/uploads/")
//                   ? q.cadSketch
//                   : `/uploads/${q.cadSketch}`,
//               },
//             ]
//           : [];

//         return {
//           id: q.id,
//           requestId: q.requestId,
//           projectName: q.projectName,
//           mode: q.mode,
//           status: q.status,
//           payment: q.payment,
//           validity: q.validity,
//           delivery: q.delivery,
//           warranty: q.warranty,
//           quotationNotes: q.quotationNotes,
//           cadSketch: q.cadSketch,
//           cadSketchFile, // ✅ now included
//           vat: Number(q.vat) || 12,
//           markup: Number(q.markup) || 5,
//           createdAt: q.createdAt,
//           items: q.items.map((i) => ({
//             id: i.id,
//             itemName: i.itemName,
//             scopeOfWork: i.scopeOfWork,
//             quantity: i.quantity,
//             unitPrice: i.unitPrice,
//             totalPrice: i.totalPrice,
//             materials:
//               i.materials?.map((m) => ({
//                 id: m.id,
//                 name: m.name,
//                 specification: m.specification,
//                 quantity: m.quantity,
//               })) ?? [],
//           })),
//         };
//       });

//     console.log("✅ GET QUOTATIONS", normalized);
//     return NextResponse.json({ success: true, quotations: normalized });
//   } catch (err) {
//     console.error("Error fetching quotations:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch quotations." },
//       { status: 500 }
//     );
//   }
// }


// /**
//  * ✅ DELETE — remove quotation and its dependencies
//  */
// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ success: false, error: "Missing quotation ID." }, { status: 400 });
//     }

//     const items = await db
//       .select({ id: quotationItems.id })
//       .from(quotationItems)
//       .where(eq(quotationItems.quotationId, id));

//     for (const item of items) {
//       await db.delete(quotationMaterials).where(eq(quotationMaterials.quotationItemId, item.id));
//     }

//     await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
//     await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, id));
//     await db.delete(quotations).where(eq(quotations.id, id));

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("Error deleting quotation:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to delete quotation." },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    let data: DraftInput | SentInput;

    try {
      console.log("STATUS:", json.status);
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
          payment: data.payment ?? "",
          validity: data.validity ?? "",
          delivery: data.delivery ?? "",
          warranty: data.warranty ?? "",
          quotationNotes: data.quotationNotes ?? "",
          cadSketch: data.cadSketch ?? null,
          vat: String(data.vat ?? 12),
          markup: String(data.markup ?? 5),
          updatedAt: new Date(),
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
          payment: data.payment ?? "",
          validity: data.validity ?? "",
          delivery: data.delivery ?? "",
          warranty: data.warranty ?? "",
          quotationNotes: data.quotationNotes ?? "",
          cadSketch: data.cadSketch ?? null,
          vat: String(data.vat ?? 12),
          markup: String(data.markup ?? 5),
        })
        .returning({ id: quotations.id, quotationSeq: quotations.quotationSeq });

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
        const totalPrice = Number(item.quantity || 0) * Number(item.unitPrice || 0);

        const [newItem] = await db
          .insert(quotationItems)
          .values({
            quotationId,
            itemName: item.itemName ?? "(Untitled Item)",
            scopeOfWork: item.scopeOfWork ?? "(To be defined)",
            quantity: item.quantity ?? 0,
            unitPrice: String(item.unitPrice ?? 0),
            totalPrice: totalPrice.toFixed(2),
          })
          .returning({ id: quotationItems.id });

        if (item.materials?.length) {
          for (const mat of item.materials) {
            await db.insert(quotationMaterials).values({
              quotationItemId: newItem.id,
              name: mat.name ?? "(Unnamed material)",
              specification: mat.specification ?? "",
              quantity: mat.quantity ?? 0,
            });
          }
        }
      }
    }

    if (Array.isArray(data.attachedFiles) && data.attachedFiles.length > 0) {
      await db.insert(quotationFiles).values(
        data.attachedFiles.map((f) => ({
          quotationId,
          fileName: f.fileName,
          filePath: f.filePath,
          uploadedAt: new Date(),
        }))
      );
    }

    // ✅ Fetch full quotation details
    // const [result] = await db
    //   .select({
    //     id: quotations.id,
    //     projectName: quotations.projectName,
    //     mode: quotations.mode,
    //     status: quotations.status,
    //     payment: quotations.payment,
    //     delivery: quotations.delivery,
    //     validity: quotations.validity,
    //     warranty: quotations.warranty,
    //     quotationNotes: quotations.quotationNotes,
    //     cadSketch: quotations.cadSketch,
    //     revisionNumber: quotations.revisionNumber,
    //     createdAt: quotations.createdAt,
    //     quotationNumber: quotations.quotationNumber,
    //     customerId: customer_profile.id,
    //     companyName: customer_profile.companyName,
    //     contactPerson: customer_profile.contactPerson,
    //     clientCode: customer_profile.clientCode,
    //   })
    //   .from(quotations)
    //   .leftJoin(quotation_requests, eq(quotation_requests.id, quotations.requestId))
    //   .leftJoin(customer_profile, eq(customer_profile.id, quotation_requests.customer_id))
    //   .where(eq(quotations.id, quotationId));

    // if (!result) throw new Error("Failed to fetch saved quotation.");

    // const normalized = {
    //   ...result,
    //   customer: {
    //     id: result.customerId,
    //     companyName: result.companyName,
    //     contactPerson: result.contactPerson,
    //     clientCode: result.clientCode,
    //   },
    //   revisionLabel: `REVISION-${String(result.revisionNumber ?? 0).padStart(2, "0")}`,
    //   cadSketch: result.cadSketch
    //     ? [
    //         {
    //           name: result.cadSketch,
    //           filePath: result.cadSketch.startsWith("/uploads/")
    //             ? result.cadSketch
    //             : `/uploads/${result.cadSketch.replace(/^\/+/, "")}`,
    //         },
    //       ]
    //     : [],
    // };

    const refreshed = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: {
        items: {with: { materials: true }},
        files: true,
      },
    });

    if (!refreshed) throw new Error("Failed to fetch saved quotation.");

    // ✅ Normalize cadSketchFile
    const cadSketchFile =
      refreshed.files?.length > 0
        ? refreshed.files.map((f) => ({
            id: f.id,
            name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
            filePath: f.filePath.startsWith("/uploads/")
              ? f.filePath
              : `/uploads/${f.filePath.replace(/^\/+/, "")}`,
          }))
        : refreshed.cadSketch
        ? [
            {
              name: refreshed.cadSketch,
              filePath: refreshed.cadSketch.startsWith("/uploads/")
                ? refreshed.cadSketch
                : `/uploads/${refreshed.cadSketch.replace(/^\/+/, "")}`,
            },
          ]
        : [];

    return NextResponse.json({
      success: true,
      message: isUuid(data.id)
        ? "Quotation draft updated successfully."
        : "Quotation created successfully!",
      data: {
        ...refreshed,
        revisionLabel: `REVISION-${String(refreshed.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketchFile,
      },
    });
  } catch (error) {
    console.error("❌ Error saving quotation:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ✅ GET — Fetch quotations
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const requestId = searchParams.get("requestId");

  try {
    const conditions = [];
    if (status) conditions.push(eq(quotations.status, status as typeof quotations.$inferSelect.status));
    if (requestId) conditions.push(eq(quotations.requestId, Number(requestId)));

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    const allQuotations = await db.query.quotations.findMany({
      where: whereClause,
      with: {
        items: { with: { materials: true } },
        files: true,
      },
    });

    const normalized = allQuotations
      .filter((q) => q.status !== "restoring")
      .map((q) => {
        const cadSketchFile =
          q.files?.length > 0
            ? q.files.map((f) => ({
                id: f.id,
                name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
                filePath: f.filePath.startsWith("/uploads/")
                  ? f.filePath
                  : `/uploads/${f.filePath.replace(/^\/+/, "")}`,
              }))
            : q.cadSketch
            ? [
                {
                  name: q.cadSketch.split("/").pop() || "uploaded_file",
                  filePath: q.cadSketch.startsWith("/uploads/")
                    ? q.cadSketch
                    : `/uploads/${q.cadSketch.replace(/^\/+/, "")}`,
                },
              ]
            : [];

        return {
          ...q,
          cadSketchFile,
          vat: Number(q.vat) || 12,
          markup: Number(q.markup) || 5,
        };
      });

    return NextResponse.json({ success: true, quotations: normalized });
  } catch (err) {
    console.error("Error fetching quotations:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch quotations." }, { status: 500 });
  }
}
