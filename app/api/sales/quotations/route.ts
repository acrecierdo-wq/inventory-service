// // /app/api/quotations/route.ts

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
// import { eq } from "drizzle-orm";
// import { quotationSchema, QuotationInput } from "@/lib/quotationSchema";

// // Define the type for the data you expect from the front end.
// type QuotationData = {
//   requestId: number;
//   projectName: string;
//   mode: string;
//   //quotationNumber: string;
//   //revisionNumber: number;
//   //baseQuotationId?: number;
//   validity: string;
//   delivery: string;
//   warranty: string;
//   quotationNotes: string;
//   cadSketch: string | null;
//   vat: number;
//   markup: number;
//   status: "draft" | "sent";
//   attachedFiles: Array<{
//     fileName: string;
//     filePath: string;
//   }>;
//   items: Array<{
//     itemName: string;
//     scopeOfWork: string;
//     quantity: number;
//     unitPrice: number;
//     materials: Array<{
//       name: string;
//       specification: string;
//       quantity: number;
//     }>;
//   }>;
// };

// export async function POST(req: NextRequest) {
  
//   try {
//     const json = await req.json();
//     const parsed = quotationSchema.safeParse(json);

//     if (!parsed.success) {
//       return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
//     }

//     const data: QuotationInput = parsed.data;

//     // if (!data.items || data.items.length === 0) {
//     //   return NextResponse.json(
//     //     { success: false, error: "Quotation must contain at least one item." },
//     //     { status: 400 }
//     //   );
//     // }

//     // get customer clientCode via request -> customer_profile
//     const [request] = await db
//     .select()
//     .from(quotation_requests)
//     .where(eq(quotation_requests.id, data.requestId));

//     if (!request) {
//       return NextResponse.json({ success: false, error: "Invalid requestId" }, { status: 400 });
//     }

//     const [customer] = await db
//     .select()
//     .from(customer_profile)
//     .where(eq(customer_profile.id, request.customer_id));

//     if (!customer || !customer.clientCode) {
//       return NextResponse.json({ success: false, error: "Customer profile missing clientCode" }, { status: 400 });
//     }

//     const clientCode = customer.clientCode;

//     let newQuotationId: string | undefined;
//     let updatedQuotation: typeof quotations.$inferSelect | null = null;

//     try {
//       // insert into the main quotations table (quotationSeq auto-incremented)
//       const [newQuotation] = await db
//         .insert(quotations)
//         .values({
//           requestId: data.requestId,
//           //quotationNumber: data.quotationNumber,
//           //revisionNumber: data.revisionNumber,
//           //baseQuotationId: data.baseQuotationId,
//           projectName: data.projectName,
//           mode: data.mode,
//           status: data.status ?? "draft",
//           validity: data.validity,
//           delivery: data.delivery,
//           warranty: data.warranty,
//           quotationNotes: data.quotationNotes,
//           cadSketch: data.cadSketch,
//           vat: data.vat.toFixed(2),
//           markup: data.markup.toFixed(2),
//         })
//         .returning({ id: quotations.id, quotationSeq: quotations.quotationSeq, });

//       if (!newQuotation?.id) {
//         throw new Error("Failed to create the quotation.");
//       }

//       newQuotationId = newQuotation.id;

//       // generate formatted quotation number
//       const paddedSeq = String(newQuotation.quotationSeq).padStart(8, "0");
//       const formattedNumber = `CTIC-${clientCode}-${paddedSeq}-1`;

//       // update quottaion with formatted number + revision 0

//       const [afterUpdate] = await db
//       .update(quotations)
//       .set({
//         quotationNumber: formattedNumber,
//         revisionNumber: 0,
//       })
//       .where(eq(quotations.id, newQuotationId))
//       .returning();

//       updatedQuotation = afterUpdate;

//       // insert items & materials
//       const quotationMaterialsToInsert: typeof quotationMaterials.$inferInsert[] = [];
//       const quotationFilesToInsert: typeof quotationFiles.$inferInsert[] = [];

//       // iterate and insert into quotationItems.
//       for (const item of data.items) {
//         const totalPrice = (item.quantity * item.unitPrice).toFixed(2);

//         const [newItem] = await db
//           .insert(quotationItems)
//           .values({
//             quotationId: newQuotationId,
//             itemName: item.itemName,
//             scopeOfWork: item.scopeOfWork,
//             quantity: item.quantity,
//             unitPrice: item.unitPrice.toFixed(2),
//             totalPrice,
//           })
//           .returning({ id: quotationItems.id });

//         // if (!newItem?.id) {
//         //   throw new Error("Failed to create a quotation item.");
//         // }
        
//         if (item.materials) {
//           // Prepare the materials for this item for a later batch insert.
//         for (const material of item.materials) {
//           quotationMaterialsToInsert.push({
//             quotationItemId: newItem.id,
//             name: material.name,
//             specification: material.specification ?? "",
//             quantity: typeof material.quantity === "string" ? parseInt(material.quantity, 10) || 0 : material.quantity || 0,
//           });
//         }
//       }
//     }

//     if (data.attachedFiles) {
//       // insert attached files
//       for (const file of data.attachedFiles) {
//         quotationFilesToInsert.push({
//           quotationId: newQuotationId,
//           fileName: file.fileName,
//           filePath: file.filePath,
//         });
//       }
//     }

//       // perform efficient batch inserts for materials and files.
//       if (quotationMaterialsToInsert.length > 0) {
//         await db.insert(quotationMaterials).values(quotationMaterialsToInsert);
//       }
//       if (quotationFilesToInsert.length > 0) {
//         await db.insert(quotationFiles).values(quotationFilesToInsert);
//       }
//     } catch (innerError) {
//       console.error("Inner transaction failed, initiating rollback...", innerError);
//       if (newQuotationId) {
//         // Attempt to delete the quotation and all cascade-related items
//         await db.delete(quotations).where(eq(quotations.id, newQuotationId));
//       }
//       throw innerError; // Rethrow the error to be caught by the outer try-catch
//     }

//     const createdQuotation = await db.query.quotations.findFirst({
//       where: eq(quotations.id, newQuotationId),
//       with: { items: true },
//     });

//     if (!createdQuotation) {
//       return NextResponse.json({
//          success: false,
//          error: "Failed to create quotation"
//       }, { status: 500 });
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Quotation created successfully.",
//       data: {
//         ...createdQuotation,
//         revisionLabel: `REVISION-${String(createdQuotation.revisionNumber ?? 0).padStart(2, "0")}`,
//         cadSketchFile : createdQuotation.cadSketch
//           ? [{ name: createdQuotation.cadSketch, filePath: `/uploads/${createdQuotation.cadSketch}` }]
//           : [],
//       },
//     });
//   } catch (error) {
//     console.error("Error saving quotation:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: 
//           error instanceof Error
//             ? error.message
//             : "Failed to save quotation."
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   try {
//     const allQuotations = await db.query.quotations.findMany({
//       with: { items: true },
//       orderBy: (q, { desc }) => [desc(q.createdAt)],
//     });

//     const normalized = allQuotations.map((q) => ({
//       ...q,
//       revisionLabel: `REVISION-${String(q.revisionNumber ?? 0).padStart(2, "0")}`,
//       cadSketchFile: q.cadSketch
//         ? [{ name: q.cadSketch, filePath: `/sales/uploads/${q.cadSketch}`}]
//         : [],
//     }));

//     return NextResponse.json({ success: true, data: normalized });
//   } catch (err) {
//     console.error("Error fethcing quotations:", err);
//     return NextResponse.json({ success: false, error: "Failed to fetch quotations" }, { status: 500 });
//   }
// }


// // // app/api/quotations/route.ts

// // import { db } from "@/db/drizzle";
// // import { quotations, quotation_items } from "@/db/schema";
// // import { NextResponse } from "next/server";

// // interface Item {
// //   quotationId?: number; // assigned later when saving
// //   itemName: string;
// //   scopeOfWork: string;
// //   materials: string;
// //   quantity: number;
// //   unitPrice: number;
// //   totalPrice: number;
// // }

// // interface QuotationRequest {
// //   requestId: number;
// //   status: string;
// //   delivery?: string;
// //   warranty?: string;
// //   validity?: string;
// //   notes?: string;
// //   items?: Item[];
// //   overallTotal: number;
// // }

// // export async function POST(req: Request) {
// //   try {
// //     const body: QuotationRequest = await req.json();

// //     const { requestId, status, delivery, warranty, validity, notes, items, overallTotal } = body;

// //     if (!requestId || !status) {
// //       return NextResponse.json({ error: "ID and status are required." }, { status: 400 });
// //     }

// //     // Insert quotation
// //     const [quotation] = await db
// //       .insert(quotations)
// //       .values({
// //         requestId,
// //         status,
// //         delivery,
// //         warranty,
// //         validity: validity ? new Date(validity) : null,
// //         notes,
// //         overallTotal,
// //       })
// //       .returning();

// //     if (items && items.length > 0) {
// //       await db.insert(quotation_items).values(
// //         items.map((item) => ({
// //           quotationId: quotation.id,
// //           itemName: item.itemName,
// //           scopeOfWork: item.scopeOfWork,
// //           materials: item.materials,
// //           quantity: item.quantity,
// //           unitPrice: item.unitPrice,
// //           totalPrice: item.totalPrice,
// //         }))
// //       );
// //     }

// //     return NextResponse.json({ success: true, data: quotation });
// //   } catch (error) {
// //     console.error("POST error:", error);
// //     return NextResponse.json({ error: String(error) }, { status: 500 });
// //   }
// // }

// /app/api/sales/quotations/route.ts

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
import { eq } from "drizzle-orm";
import { quotationSchema, QuotationInput } from "@/lib/quotationSchema";

// Define the type for the data you expect from the front end.
// type QuotationData = {
//   requestId: number;
//   projectName: string;
//   mode: string;
//   validity: string;
//   delivery: string;
//   warranty: string;
//   quotationNotes: string;
//   cadSketch: string | null;
//   vat: number;
//   markup: number;
//   status: "draft" | "sent";
//   attachedFiles: Array<{
//     fileName: string;
//     filePath: string;
//   }>;
//   items: Array<{
//     itemName: string;
//     scopeOfWork: string;
//     quantity: number;
//     unitPrice: number;
//     materials: Array<{
//       name: string;
//       specification: string;
//       quantity: number;
//     }>;
//   }>;
// };

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = quotationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: QuotationInput = parsed.data;

    // get customer clientCode via request -> customer_profile
    const [request] = await db
      .select()
      .from(quotation_requests)
      .where(eq(quotation_requests.id, data.requestId));

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Invalid requestId" },
        { status: 400 }
      );
    }

    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.id, request.customer_id));

    if (!customer || !customer.clientCode) {
      return NextResponse.json(
        { success: false, error: "Customer profile missing clientCode" },
        { status: 400 }
      );
    }

    //const clientCode = customer.clientCode;

    let newQuotationId: string | undefined;
    // let updatedQuotation: typeof quotations.$inferSelect | null = null;

    try {
      // insert into the main quotations table (quotationSeq auto-incremented)
      const [newQuotation] = await db
        .insert(quotations)
        .values({
          requestId: data.requestId,
          projectName: data.projectName,
          mode: data.mode,
          status: data.status ?? "draft",
          validity: data.validity,
          delivery: data.delivery,
          warranty: data.warranty,
          quotationNotes: data.quotationNotes,
          cadSketch: data.cadSketch,
          vat: data.vat.toFixed(2),
          markup: data.markup.toFixed(2),
        })
        .returning({ id: quotations.id, quotationSeq: quotations.quotationSeq });

      if (!newQuotation?.id) {
        throw new Error("Failed to create the quotation.");
      }

      newQuotationId = newQuotation.id;

      // generate formatted quotation number
      //const paddedSeq = String(newQuotation.quotationSeq).padStart(8, "0");
      //const formattedNumber = `CTIC-${clientCode}-${paddedSeq}-1`;

      // update quotation with formatted number + revision 0
      // const [afterUpdate] = await db
      //   .update(quotations)
      //   .set({
      //     quotationNumber: formattedNumber,
      //     revisionNumber: 0,
      //   })
      //   .where(eq(quotations.id, newQuotationId))
      //   .returning();

      //updatedQuotation = afterUpdate;

      // insert items & materials
      const quotationMaterialsToInsert: typeof quotationMaterials.$inferInsert[] = [];
      const quotationFilesToInsert: typeof quotationFiles.$inferInsert[] = [];

      // iterate and insert into quotationItems.
      for (const item of data.items) {
        const totalPrice = (item.quantity * item.unitPrice).toFixed(2);

        const [newItem] = await db
          .insert(quotationItems)
          .values({
            quotationId: newQuotationId,
            itemName: item.itemName,
            scopeOfWork: item.scopeOfWork,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
            totalPrice,
          })
          .returning({ id: quotationItems.id });

        if (item.materials) {
          for (const material of item.materials) {
            quotationMaterialsToInsert.push({
              quotationItemId: newItem.id,
              name: material.name,
              specification: material.specification ?? "",
              quantity:
                typeof material.quantity === "string"
                  ? parseInt(material.quantity, 10) || 0
                  : material.quantity || 0,
            });
          }
        }
      }

      if (data.attachedFiles) {
        for (const file of data.attachedFiles) {
          quotationFilesToInsert.push({
            quotationId: newQuotationId,
            fileName: file.fileName,
            filePath: file.filePath,
          });
        }
      }

      if (quotationMaterialsToInsert.length > 0) {
        await db.insert(quotationMaterials).values(quotationMaterialsToInsert);
      }
      if (quotationFilesToInsert.length > 0) {
        await db.insert(quotationFiles).values(quotationFilesToInsert);
      }
    } catch (innerError) {
      console.error("Inner transaction failed, initiating rollback...", innerError);
      if (newQuotationId) {
        await db.delete(quotations).where(eq(quotations.id, newQuotationId));
      }
      throw innerError;
    }

    const createdQuotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, newQuotationId),
      with: { items: true },
    });

    if (!createdQuotation) {
      return NextResponse.json(
        { success: false, error: "Failed to create quotation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quotation created successfully.",
      data: {
        ...createdQuotation,
        customer: {
          id: customer.id,
          companyName: customer.companyName,
          contactPerson: customer.contactPerson,
          clientCode: customer.clientCode,
        },
        revisionLabel: `REVISION-${String(
          createdQuotation.revisionNumber ?? 0
        ).padStart(2, "0")}`,
        cadSketchFile: createdQuotation.cadSketch
          ? [
              {
                name: createdQuotation.cadSketch,
                filePath: `/uploads/${createdQuotation.cadSketch}`,
              },
            ]
          : [],
      },
    });
  } catch (error) {
    console.error("Error saving quotation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save quotation.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // join quotations -> request -> customer
    const allQuotations = await db
      .select({
        id: quotations.id,
        projectName: quotations.projectName,
        status: quotations.status,
        validity: quotations.validity,
        delivery: quotations.delivery,
        warranty: quotations.warranty,
        quotationNotes: quotations.quotationNotes,
        cadSketch: quotations.cadSketch,
        revisionNumber: quotations.revisionNumber,
        createdAt: quotations.createdAt,
        quotationNumber: quotations.quotationNumber,
        customerId: customer_profile.id,
        companyName: customer_profile.companyName,
        contactPerson: customer_profile.contactPerson,
        clientCode: customer_profile.clientCode,
      })
      .from(quotations)
      .leftJoin(
        quotation_requests,
        eq(quotation_requests.id, quotations.requestId)
      )
      .leftJoin(customer_profile, eq(customer_profile.id, quotation_requests.customer_id));

    const normalized = allQuotations.map((q) => ({
      ...q,
      customer: {
        id: q.customerId,
        companyName: q.companyName,
        contactPerson: q.contactPerson,
        clientCode: q.clientCode,
      },
      revisionLabel: `REVISION-${String(q.revisionNumber ?? 0).padStart(2, "0")}`,
      cadSketchFile: q.cadSketch
        ? [{ name: q.cadSketch, filePath: `/sales/uploads/${q.cadSketch}` }]
        : [],
    }));

    return NextResponse.json({ success: true, data: normalized });
  } catch (err) {
    console.error("Error fetching quotations:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}
