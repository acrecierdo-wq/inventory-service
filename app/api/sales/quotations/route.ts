// app/api/sales/quotations/route.ts

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
import { eq, and, inArray } from "drizzle-orm";
import { validateQuotation, DraftInput, SentInput } from "@/lib/quotationSchema";
import { z } from "zod";

async function getQuotationStatusByRequestId(requestId: number) {
  const quotationsForRequest = await db.query.quotations.findMany({
    where: eq(quotations.requestId, requestId),
    columns: { id: true, status: true },
  });

  const hasSent = quotationsForRequest.some((q) => q.status === "sent");
  return { hasSent, quotations: quotationsForRequest };
}

// function normalizeUploadPath(filePath: string) {
//   if (!filePath) return "";
//   // remove leading /sales/uploads or duplicate /uploads/
//   const stripped = filePath.replace(/^\/?(sales\/)?uploads\/+/, "");
//   return `/uploads/${stripped}`;
// }


// POST
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    let data: DraftInput | SentInput;

    try {
      console.log("STATUS:", json.status);
      data = validateQuotation(json);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: err.flatten().fieldErrors }, { status: 400 });
      }
      throw err;
    }

    // validate linked request and customer
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
      return NextResponse.json({ success: false, error: "Missing client code in customer profile." }, { status: 400 });

    console.log("POST - create or update quotation (draft or sent)", data);

    const clientCode = customer.clientCode;
    const quotationStatus: "draft" | "sent"  = data.status === "sent" ? "sent" : "draft";
    
    let quotationId: string;

    // Case 1: revision creation (new revision from an existing sent quotation)
    // If the payload has baseQuotationId, we clone and increment revision
    if (data.baseQuotationId) {
      const [baseQuotation] = await db
        .select()
        .from(quotations)
        .where(eq(quotations.id, data.baseQuotationId));

      if (!baseQuotation) {
        return NextResponse.json({ success: false, error: "Base quotation not found for revision." }, { status: 404 });
      }

      // Determine next revision number (base + 1)
      const nextRevisionNumber = (baseQuotation.revisionNumber ?? 0) + 1;

      // Create new quotation record (same quotationNumber, incremented revision)
      const [newRevision] = await db
        .insert(quotations)
        .values({
          requestId: baseQuotation.requestId,
          projectName: data.projectName ?? baseQuotation.projectName,
          mode: data.mode ?? baseQuotation.mode,
          status: quotationStatus,
          payment: data.payment ?? baseQuotation.payment,
          delivery: data.delivery ?? baseQuotation.delivery,
          validity: data.validity ?? baseQuotation.validity,
          warranty: data.warranty ?? baseQuotation.warranty,
          quotationNotes: data.quotationNotes ?? baseQuotation.quotationNotes,
          cadSketch: data.cadSketch ?? baseQuotation.cadSketch,
          vat: String(data.vat ?? baseQuotation.vat ?? 12),
          markup: String(data.markup ?? baseQuotation.markup ?? 5),
          quotationNumber: baseQuotation.quotationNumber, // same number
          revisionNumber: nextRevisionNumber, // incremented
        })
        .returning({ id: quotations.id });

      quotationId = newRevision.id;

      // Insert cloned items and materials
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

      // Insert files if any
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

      const refreshed = await db.query.quotations.findFirst({
        where: eq(quotations.id, quotationId),
        with: { items: { with: { materials: true } }, files: true },
      });

      return NextResponse.json({
        success: true,
        message: `Revision ${nextRevisionNumber} created successfully.`,
        data: {
          ...refreshed,
          revisionLabel: `REVISION-${String(nextRevisionNumber).padStart(2, "0")}`,
        },
      });
    }

    // Case 2: update existing (handle both draft -> draft and draft -> sent)
    else if (data.id) {
      quotationId = data.id;
    
      await db
        .update(quotations)
        .set({
          projectName: data.projectName ?? "",
          mode: data.mode ?? "",
          status: quotationStatus,
          payment: data.payment ?? "",
          delivery: data.delivery ?? "",
          validity: data.validity ?? "",
          warranty: data.warranty ?? "",
          quotationNotes: data.quotationNotes ?? "",
          cadSketch: data.cadSketch ?? null,
          vat: String(data.vat ?? 12),
          markup: String(data.markup ?? 5),
          updatedAt: new Date(),
        })
        .where(eq(quotations.id, quotationId));

      // clear and reinsert items/materials/files
      await db.delete(quotationMaterials).where(
        inArray(
          quotationMaterials.quotationItemId,
          db
            .select({ id: quotationItems.id })
            .from(quotationItems)
            .where(eq(quotationItems.quotationId, quotationId))
        )
      );
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));
      await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, quotationId));
    }

    // Case 3: Create new quotation (first time save)
    else {
      const [newQuotation] = await db
        .insert(quotations)
        .values({
          requestId: data.requestId,
          projectName: data.projectName ?? "",
          mode: data.mode ?? "",
          status: quotationStatus,
          payment: data.payment ?? "",
          delivery: data.delivery ?? "",
          validity: data.validity ?? "",
          warranty: data.warranty ?? "",
          quotationNotes: data.quotationNotes ?? "",
          cadSketch: data.cadSketch ?? null,
          vat: String(data.vat ?? 12),
          markup: String(data.markup ?? 5),
          revisionNumber: 0,
        })
        .returning({ id: quotations.id, quotationSeq: quotations.quotationSeq });

      quotationId = newQuotation.id;

      const paddedSeq = String(newQuotation.quotationSeq).padStart(8, "0");
      const formattedNumber = `CTIC-${clientCode}-${paddedSeq}`;

      await db
        .update(quotations)
        .set({ quotationNumber: formattedNumber })
        .where(eq(quotations.id, quotationId));
    }

    // Insert items and materials
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

    const refreshed = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: {
        items: { with: { materials: true } },
        files: true,
        request: { with: { customer: true } },
      },
    });

    if (!refreshed) throw new Error("Failed to fetch saved quotation.");

    const cadSketchFile =
      refreshed.files?.length > 0
        ? refreshed.files.map((f) => ({
            id: f.id,
            name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
            filePath: f.filePath.startsWith("/uploads/")
              ? f.filePath
              : `/uploads/${f.filePath.replace(/^\/+/, "")}`,
            //filePath: normalizeUploadPath(f.filePath),
          }))
        : refreshed.cadSketch
        ? [
            {
              name: refreshed.cadSketch,
              filePath: refreshed.cadSketch.startsWith("/uploads/")
                ? refreshed.cadSketch
                : `/uploads/${refreshed.cadSketch.replace(/^\/+/, "")}`,
              //filePath: normalizeUploadPath(refreshed.cadSketch),
            },
          ]
        : [];

    return NextResponse.json({
      success: true,
      message: data.id
        ? "Quotation updated successfully."
        : "Quotation created successfully!",
      data: {
        ...refreshed,
        revisionLabel: `REVISION-${String(refreshed.revisionNumber ?? 0).padStart(2, "0")}`,
        customer: refreshed.request?.customer ?? null,
        cadSketchFile,
      },
    });
  } catch (error) {
    console.error("Error saving quotation:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}


// ✅ GET — Fetch quotations
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const requestId = searchParams.get("requestId");

  try {

    if (searchParams.has("checkStatus") && requestId) {
      const result = await getQuotationStatusByRequestId(Number(requestId));
      return NextResponse.json({ success: true, ...result });
  }

    const conditions = [];
    //if (status) conditions.push(eq(quotations.status, status as typeof quotations.$inferSelect.status));
    if (status) {
      if (status === "draft") {
        conditions.push(inArray(quotations.status, ["draft", "restoring"]));
      } else {
        conditions.push(eq(quotations.status, status as typeof quotations.$inferSelect.status));
      }
    }
    if (requestId) conditions.push(eq(quotations.requestId, Number(requestId)));

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    const allQuotations = await db.query.quotations.findMany({
      where: whereClause,
      with: {
        items: { with: { materials: true } },
        files: true,
        request: { with: { customer: true } },
      },
    });

    console.log(`[GET /api/sales/quotations] returning statuses:`, allQuotations.map(q => q.status));

    //.filter(q => status === "draft" || q.status === "restoring");
    const normalized = allQuotations.map((q) => {
        const cadSketchFile =
          q.files?.length > 0
            ? q.files.map((f) => ({
                id: f.id,
                name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
                filePath: f.filePath.startsWith("/uploads/")
                  ? f.filePath
                  : `/uploads/${f.filePath.replace(/^\/+/, "")}`,
                // filePath: normalizeUploadPath(f.filePath),

                // filePath: f.filePath
                //   .replace(/^\/sales\/uploads\/+/, "/uploads/")
                //   .replace(/^\/+/, "/uploads/"),
              }))
            : q.cadSketch
            ? [
                {
                  name: q.cadSketch.split("/").pop() || "uploaded_file",
                  filePath: q.cadSketch.startsWith("/uploads/")
                    ? q.cadSketch
                    : `/uploads/${q.cadSketch.replace(/^\/+/, "")}`,
                  //filePath: normalizeUploadPath(q.cadSketch),
                },
              ]
            : [];

        const revisionLabel = `REVISION-${String(q.revisionNumber ?? 0).padStart(2, "0")}`;

        const customer = q.request?.customer
              ? {
                companyName: q.request.customer.companyName,
                contactPerson: q.request.customer.contactPerson,
                email: q.request.customer.email,
                address: q.request.customer.address,
                phone: q.request.customer.phone,
                clientCode: q.request.customer.clientCode,
              }
            : null;

        return {
          ...q,
          cadSketchFile,
          revisionLabel,
          customer,
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

// app/api/sales/quotations/route.ts

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
// import { eq, and, inArray } from "drizzle-orm";
// import { validateQuotation, DraftInput, SentInput } from "@/lib/quotationSchema";
// import { z } from "zod";

// async function getQuotationStatusByRequestId(requestId: number) {
//   const quotationsForRequest = await db.query.quotations.findMany({
//     where: eq(quotations.requestId, requestId),
//     columns: { id: true, status: true },
//   });

//   const hasSent = quotationsForRequest.some((q) => q.status === "sent");
//   return { hasSent, quotations: quotationsForRequest };
// }

// // POST
// export async function POST(req: NextRequest) {
//   try {
//     const json = await req.json();
//     let data: DraftInput | SentInput;

//     try {
//       console.log("STATUS:", json.status);
//       data = validateQuotation(json);
//     } catch (err) {
//       if (err instanceof z.ZodError) {
//         return NextResponse.json({ success: false, error: err.flatten().fieldErrors }, { status: 400 });
//       }
//       throw err;
//     }

//     // validate linked request and customer
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
//       return NextResponse.json({ success: false, error: "Missing client code in customer profile." }, { status: 400 });

//     console.log("POST - create or update quotation (draft or sent)", data);

//     const clientCode = customer.clientCode;
//     const quotationStatus = data.status === "sent" ? "sent" : "draft";
//     let quotationId: string;

//     // Case 1: revision creation (new revision from an existing sent quotation)
//     // If the payload has baseQuotationId, we clone and increment revision
//     if (data.baseQuotationId) {
//       const [baseQuotation] = await db
//         .select()
//         .from(quotations)
//         .where(eq(quotations.id, data.baseQuotationId));

//       if (!baseQuotation) {
//         return NextResponse.json({ success: false, error: "Base quotation not found for revision." }, { status: 404 });
//       }

//       // Determine next revision number (base + 1)
//       const nextRevisionNumber = (baseQuotation.revisionNumber ?? 0) + 1;

//       // Create new quotation record (same quotationNumber, incremented revision)
//       const [newRevision] = await db
//         .insert(quotations)
//         .values({
//           requestId: baseQuotation.requestId,
//           projectName: data.projectName ?? baseQuotation.projectName,
//           mode: data.mode ?? baseQuotation.mode,
//           status: quotationStatus,
//           payment: data.payment ?? baseQuotation.payment,
//           delivery: data.delivery ?? baseQuotation.delivery,
//           validity: data.validity ?? baseQuotation.validity,
//           warranty: data.warranty ?? baseQuotation.warranty,
//           quotationNotes: data.quotationNotes ?? baseQuotation.quotationNotes,
//           cadSketch: data.cadSketch ?? baseQuotation.cadSketch,
//           vat: String(data.vat ?? baseQuotation.vat ?? 12),
//           markup: String(data.markup ?? baseQuotation.markup ?? 5),
//           quotationNumber: baseQuotation.quotationNumber, // same number
//           revisionNumber: nextRevisionNumber, // incremented
//         })
//         .returning({ id: quotations.id });

//       quotationId = newRevision.id;

//       // Insert cloned items and materials
//       if (Array.isArray(data.items)) {
//         for (const item of data.items) {
//           const totalPrice = Number(item.quantity || 0) * Number(item.unitPrice || 0);

//           const [newItem] = await db
//             .insert(quotationItems)
//             .values({
//               quotationId,
//               itemName: item.itemName ?? "(Untitled Item)",
//               scopeOfWork: item.scopeOfWork ?? "(To be defined)",
//               quantity: item.quantity ?? 0,
//               unitPrice: String(item.unitPrice ?? 0),
//               totalPrice: totalPrice.toFixed(2),
//             })
//             .returning({ id: quotationItems.id });

//           if (item.materials?.length) {
//             for (const mat of item.materials) {
//               await db.insert(quotationMaterials).values({
//                 quotationItemId: newItem.id,
//                 name: mat.name ?? "(Unnamed material)",
//                 specification: mat.specification ?? "",
//                 quantity: mat.quantity ?? 0,
//               });
//             }
//           }
//         }
//       }

//       // Insert files if any
//       if (Array.isArray(data.attachedFiles) && data.attachedFiles.length > 0) {
//         await db.insert(quotationFiles).values(
//           data.attachedFiles.map((f) => ({
//             quotationId,
//             fileName: f.fileName,
//             filePath: f.filePath,
//             uploadedAt: new Date(),
//           }))
//         );
//       }

//       const refreshed = await db.query.quotations.findFirst({
//         where: eq(quotations.id, quotationId),
//         with: { items: { with: { materials: true } }, files: true },
//       });

//       return NextResponse.json({
//         success: true,
//         message: `Revision ${nextRevisionNumber} created successfully.`,
//         data: {
//           ...refreshed,
//           revisionLabel: `REVISION-${String(nextRevisionNumber).padStart(2, "0")}`,
//         },
//       });
//     }

//     // Case 2: update existing (handle both draft -> draft and draft -> sent)
//     else if (data.id) {
//       quotationId = data.id;

//       await db
//         .update(quotations)
//         .set({
//           projectName: data.projectName ?? "",
//           mode: data.mode ?? "",
//           status: quotationStatus,
//           payment: data.payment ?? "",
//           delivery: data.delivery ?? "",
//           validity: data.validity ?? "",
//           warranty: data.warranty ?? "",
//           quotationNotes: data.quotationNotes ?? "",
//           cadSketch: data.cadSketch ?? null,
//           vat: String(data.vat ?? 12),
//           markup: String(data.markup ?? 5),
//           updatedAt: new Date(),
//         })
//         .where(eq(quotations.id, quotationId));

//       // clear and reinsert items/materials/files
//       await db.delete(quotationMaterials).where(
//         inArray(
//           quotationMaterials.quotationItemId,
//           db
//             .select({ id: quotationItems.id })
//             .from(quotationItems)
//             .where(eq(quotationItems.quotationId, quotationId))
//         )
//       );
//       await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));
//       await db.delete(quotationFiles).where(eq(quotationFiles.quotationId, quotationId));
//     }

//     // Case 3: Create new quotation (first time save)
//     else {
//       const [newQuotation] = await db
//         .insert(quotations)
//         .values({
//           requestId: data.requestId,
//           projectName: data.projectName ?? "",
//           mode: data.mode ?? "",
//           status: quotationStatus,
//           payment: data.payment ?? "",
//           delivery: data.delivery ?? "",
//           validity: data.validity ?? "",
//           warranty: data.warranty ?? "",
//           quotationNotes: data.quotationNotes ?? "",
//           cadSketch: data.cadSketch ?? null,
//           vat: String(data.vat ?? 12),
//           markup: String(data.markup ?? 5),
//           revisionNumber: 0,
//         })
//         .returning({ id: quotations.id, quotationSeq: quotations.quotationSeq });

//       quotationId = newQuotation.id;

//       const paddedSeq = String(newQuotation.quotationSeq).padStart(8, "0");
//       const formattedNumber = `CTIC-${clientCode}-${paddedSeq}`;

//       await db
//         .update(quotations)
//         .set({ quotationNumber: formattedNumber })
//         .where(eq(quotations.id, quotationId));
//     }

//     // Insert items and materials
//     if (Array.isArray(data.items)) {
//       for (const item of data.items) {
//         const totalPrice = Number(item.quantity || 0) * Number(item.unitPrice || 0);

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

//     if (Array.isArray(data.attachedFiles) && data.attachedFiles.length > 0) {
//       await db.insert(quotationFiles).values(
//         data.attachedFiles.map((f) => ({
//           quotationId,
//           fileName: f.fileName,
//           filePath: f.filePath,
//           uploadedAt: new Date(),
//         }))
//       );
//     }

//     const refreshed = await db.query.quotations.findFirst({
//       where: eq(quotations.id, quotationId),
//       with: {
//         items: { with: { materials: true } },
//         files: true,
//         request: { with: { customer: true } },
//       },
//     });

//     if (!refreshed) throw new Error("Failed to fetch saved quotation.");

//     const cadSketchFile =
//       refreshed.files?.length > 0
//         ? refreshed.files.map((f) => ({
//             id: f.id,
//             name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
//             filePath: f.filePath.startsWith("/uploads/")
//               ? f.filePath
//               : `/uploads/${f.filePath.replace(/^\/+/, "")}`,
//             // filePath: f.filePath
//             //   .replace(/^\/sales\/uploads\/+/, "/uploads/")
//             //   .replace(/^\/+/, "/uploads/"),
//           }))
//         : refreshed.cadSketch
//         ? [
//             {
//               name: refreshed.cadSketch,
//               filePath: refreshed.cadSketch.startsWith("/uploads/")
//                 ? refreshed.cadSketch
//                 : `/uploads/${refreshed.cadSketch.replace(/^\/+/, "")}`,
//             },
//           ]
//         : [];

//     return NextResponse.json({
//       success: true,
//       message: data.id
//         ? "Quotation updated successfully."
//         : "Quotation created successfully!",
//       data: {
//         ...refreshed,
//         revisionLabel: `REVISION-${String(refreshed.revisionNumber ?? 0).padStart(2, "0")}`,
//         customer: refreshed.request?.customer ?? null,
//         cadSketchFile,
//       },
//     });
//   } catch (error) {
//     console.error("Error saving quotation:", error);
//     return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
//   }
// }


// // ✅ GET — Fetch quotations
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const status = searchParams.get("status");
//   const requestId = searchParams.get("requestId");

//   try {

//     if (searchParams.has("checkStatus") && requestId) {
//       const result = await getQuotationStatusByRequestId(Number(requestId));
//       return NextResponse.json({ success: true, ...result });
//   }

//     const conditions = [];
//     if (status) conditions.push(eq(quotations.status, status as typeof quotations.$inferSelect.status));
//     if (requestId) conditions.push(eq(quotations.requestId, Number(requestId)));

//     const whereClause =
//       conditions.length > 1 ? and(...conditions) : conditions[0];

//     const allQuotations = await db.query.quotations.findMany({
//       where: whereClause,
//       with: {
//         items: { with: { materials: true } },
//         files: true,
//         request: { with: { customer: true } },
//       },
//     });

//     const normalized = allQuotations
//       .filter((q) => q.status !== "restoring")
//       .map((q) => {
//         const cadSketchFile =
//           q.files?.length > 0
//             ? q.files.map((f) => ({
//                 id: f.id,
//                 name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
//                 filePath: f.filePath.startsWith("/uploads/")
//                   ? f.filePath
//                   : `/uploads/${f.filePath.replace(/^\/+/, "")}`,
//                 // filePath: f.filePath
//                 //   .replace(/^\/sales\/uploads\/+/, "/uploads/")
//                 //   .replace(/^\/+/, "/uploads/"),
//               }))
//             : q.cadSketch
//             ? [
//                 {
//                   name: q.cadSketch.split("/").pop() || "uploaded_file",
//                   filePath: q.cadSketch.startsWith("/uploads/")
//                     ? q.cadSketch
//                     : `/uploads/${q.cadSketch.replace(/^\/+/, "")}`,
//                 },
//               ]
//             : [];

//         const revisionLabel = `REVISION-${String(q.revisionNumber ?? 0).padStart(2, "0")}`;

//         const customer = q.request?.customer
//               ? {
//                 companyNmae: q.request.customer.companyName,
//                 contactPerson: q.request.customer.contactPerson,
//                 email: q.request.customer.email,
//                 address: q.request.customer.address,
//                 phone: q.request.customer.phone,
//                 clientCode: q.request.customer.clientCode,
//               }
//             : null;

//         return {
//           ...q,
//           cadSketchFile,
//           revisionLabel,
//           customer,
//           vat: Number(q.vat) || 12,
//           markup: Number(q.markup) || 5,
//         };
//       });

//     return NextResponse.json({ success: true, quotations: normalized });
//   } catch (err) {
//     console.error("Error fetching quotations:", err);
//     return NextResponse.json({ success: false, error: "Failed to fetch quotations." }, { status: 500 });
//   }
// }