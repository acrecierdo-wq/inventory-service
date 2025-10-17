// // app/api/customer/q_request/[id]/route.ts

// import { db } from "@/db/drizzle";
// import { quotation_requests, quotation_request_files, customer_profile } from "@/db/schema";
// import { NextResponse, NextRequest } from "next/server";
// import { eq, and } from "drizzle-orm";
// import { auth } from "@clerk/nextjs/server";

// type RouteContext = {
//   params: Promise<{ id: string }>;
// };

// // ✅ GET request by ID
// export async function GET(_req: NextRequest, context: RouteContext) {
//   const { id } = await context.params;
  
//   const { userId } = await auth();
//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//   console.log("🔑 userId:", userId);



//   //const { id } = await context.params;

//   try {
//     const requestId = Number(id);

//     const [customer] = await db
//       .select()
//       .from(customer_profile)
//       .where(eq(customer_profile.clerkId, userId));

//       if (!customer) {
//         console.log("👤 customer:", customer);
//         return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
//       }

//     // Fetch request by ID (serial -> number)
//     const [request] = await db
//       .select()
//       .from(quotation_requests)
//       .where(
//         and(
//           eq(quotation_requests.id, requestId),
//           eq(quotation_requests.customer_id, customer.id)
//         )
//       );

//     if (!request) {
//       console.log("📄 requestId:", requestId);

//       return NextResponse.json({ error: "Request not found." }, { status: 404 });
//     }

//     // Fetch related files (request_id -> number)
//     const files = await db
//       .select()
//       .from(quotation_request_files)
//       .where(eq(quotation_request_files.request_id, requestId));

//       return NextResponse.json({ 
//       ...request, 
//       files, 
//       customer: {
//         id: customer.id,
//         companyName: customer.companyName,
//         contactPerson: customer.contactPerson,
//         email: customer.email,
//         phone: customer.email,
//         address: customer.address,
//         clientCode: customer.clientCode,
//       },
//     });
//   } catch (err) {
//     console.error(`GET /api/customer/q_request/${id} error:`, err);
//     return NextResponse.json({ error: "Failed to fetch request." }, { status: 500 });
//   }
// }
    

// // ✅ PATCH request (update status)
// export async function PUT(req: NextRequest, { params }: RouteContext) {
//   const { id } = await params;
//   const { userId } = await auth();
//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const requestId  = Number(id);
//     const body = await req.json();
//     const { status } = body;

//     if (!status) {
//       return NextResponse.json({ error: "Status is required." }, { status: 400 });
//     }
    
//     const [customer] = await db
//       .select()
//       .from(customer_profile)
//       .where(eq(customer_profile.clerkId, userId));

//     if (!customer) {
//       return NextResponse.json({ error: "Cutsomer profile not found" }, { status: 404 });
//     }

//     // fetch existing request
//     const [existingRequest] = await db
//       .select()
//       .from(quotation_requests)
//       .where(
//         and(
//           eq(quotation_requests.id, requestId),
//           eq(quotation_requests.customer_id, customer.id)
//         )
//       );

//     if (!existingRequest) {
//       return NextResponse.json({ error: "Request not found."}, { status: 404 });
//     }

//     if (
//       ["Pending", "Sent"].includes(status) &&
//       (!customer?.phone || !customer?.address || !customer?.clientCode)
//     ) {
//       return NextResponse.json({ error: "Profile incomplete. Please set phone, address, and client code before updating status."}, { status: 403 });
//     }

//     // update request status
//     const [updatedRequest] = await db
//       .update(quotation_requests)
//       .set({ status })
//       .where(eq(quotation_requests.id, requestId))
//       .returning();

//     const files = await db
//       .select()
//       .from(quotation_request_files)
//       .where(eq(quotation_request_files.request_id, requestId));
    
//     return NextResponse.json({ 
//       ...updatedRequest, 
//       files, 
//       customer 
//     });
//   } catch (err) {
//     console.error(`PUT /api/customer/q_request/${id} error:`, err);
//     return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
//   }
// }

// // app/api/customer/q_request/[id]/route.ts

// import { db } from "@/db/drizzle";
// import { quotation_requests, quotation_request_files, customer_profile, quotations } from "@/db/schema";
// import { NextResponse, NextRequest } from "next/server";
// import { eq, and } from "drizzle-orm";
// import { auth } from "@clerk/nextjs/server";

// type RouteContext = {
//   params: Promise<{ id: string }>;
// };

// // ✅ GET request by ID
// export async function GET(_req: NextRequest, context: RouteContext) {
//   const { id } = await context.params;
  
//   const { userId } = await auth();
//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//   console.log("🔑 userId:", userId);



//   //const { id } = await context.params;

//   try {
//     const requestId = Number(id);

//     const [customer] = await db
//       .select()
//       .from(customer_profile)
//       .where(eq(customer_profile.clerkId, userId));

//       if (!customer) {
//         console.log("👤 customer:", customer);
//         return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
//       }

//     // Fetch request by ID (serial -> number)
//     const [request] = await db
//       .select()
//       .from(quotation_requests)
//       .where(
//         and(
//           eq(quotation_requests.id, requestId),
//           eq(quotation_requests.customer_id, customer.id)
//         )
//       );

//     if (!request) {
//       console.log("📄 requestId:", requestId);

//       return NextResponse.json({ error: "Request not found." }, { status: 404 });
//     }

//     // Fetch related files (request_id -> number)
//     const files = await db
//       .select()
//       .from(quotation_request_files)
//       .where(eq(quotation_request_files.request_id, requestId));

//     const [quotation] = await db
//       .select()
//       .from(quotations)
//       .where(eq(quotations.requestId, requestId));

//       return NextResponse.json({ 
//       ...request, 
//       files, 
//       quotation,
//       customer: {
//         id: customer.id,
//         companyName: customer.companyName,
//         contactPerson: customer.contactPerson,
//         email: customer.email,
//         phone: customer.email,
//         address: customer.address,
//         clientCode: customer.clientCode,
//       },
//     });
//   } catch (err) {
//     console.error(`GET /api/customer/q_request/${id} error:`, err);
//     return NextResponse.json({ error: "Failed to fetch request." }, { status: 500 });
//   }
// }
    

// // ✅ PUT request (update status)
// export async function PUT(req: NextRequest, { params }: RouteContext) {
//   const { id } = await params;
//   const { userId } = await auth();
//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const requestId  = Number(id);
//     const body = await req.json();
//     const { status } = body;

//     const allowedStatuses = ["accepted", "rejected", "revision_requested"];
//     if (!status || !allowedStatuses.includes(status)) {
//       return NextResponse.json({ error: "Invalid or missing status." }, { status: 400 });
//     }
    
//     const [customer] = await db
//       .select()
//       .from(customer_profile)
//       .where(eq(customer_profile.clerkId, userId));

//     if (!customer) {
//       return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
//     }

//     // fetch existing request
//     const [existingRequest] = await db
//       .select()
//       .from(quotation_requests)
//       .where(
//         and(
//           eq(quotation_requests.id, requestId),
//           eq(quotation_requests.customer_id, customer.id)
//         )
//       );

//     if (!existingRequest) {
//       return NextResponse.json({ error: "Request not found."}, { status: 404 });
//     }

//     // if (
//     //   ["Pending", "Sent"].includes(status) &&
//     //   (!customer?.phone || !customer?.address || !customer?.clientCode)
//     // ) {
//     //   return NextResponse.json({ error: "Profile incomplete. Please set phone, address, and client code before updating status."}, { status: 403 });
//     // }

//     // update request status
//     const [updatedRequest] = await db
//       .update(quotation_requests)
//       .set({ status })
//       .where(eq(quotation_requests.id, requestId))
//       .returning();

//     await db
//       .update(quotations)
//       .set({ status })
//       .where(eq(quotations.requestId, requestId));

//     const files = await db
//       .select()
//       .from(quotation_request_files)
//       .where(eq(quotation_request_files.request_id, requestId));
    
//     return NextResponse.json({ 
//       // ...updatedRequest, 
//       // files, 
//       // customer 
//       success: true,
//       message: `Quotation ${status} successfully.`,
//       data: { ...updatedRequest, files, customer },
//     });
//   } catch (err) {
//     console.error(`PUT /api/customer/q_request/${id} error:`, err);
//     return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
//   }
// }


// app/api/customer/q_request/[id]/route.ts

import { db } from "@/db/drizzle";
import {
  quotation_requests,
  quotation_request_files,
  customer_profile,
  quotations,
  quotationItems,
  quotationMaterials,
  quotationFiles,
} from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ✅ GET quotation request (with full quotation details)
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestId = Number(id);

    // find customer
    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    // fetch request
    const [request] = await db
      .select()
      .from(quotation_requests)
      .where(
        and(
          eq(quotation_requests.id, requestId),
          eq(quotation_requests.customer_id, customer.id)
        )
      );

    if (!request) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    // fetch files
    const files = await db
      .select()
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, requestId));

    // ✅ fetch quotation + nested data
    const [quotation] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.requestId, requestId));

    if (!quotation) {
      return NextResponse.json({ ...request, files, quotation: null, customer, });
    }

    // ✅ fetch quotation items + materials + quotation files
    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotation.id));

    const materials = await db
      .select()
      .from(quotationMaterials)

    const qFiles = await db
      .select()
      .from(quotationFiles)
      .where(eq(quotationFiles.quotationId, quotation.id));

    // ✅ merge materials into items
    const mergedItems = items.map((item) => ({
      ...item,
      materials: materials.filter((m) => m.quotationItemId === item.id),
    }));

    return NextResponse.json({
      ...request,
      files,
      quotation: {
        ...quotation,
        items: mergedItems,
        files: qFiles,
        revisionLabel: `REVISION-${String(quotation.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketch: quotation.cadSketch
        ? [{ name: quotation.cadSketch, filePath: `/sales/uploads/${quotation.cadSketch}` }]
        : [],
      },
      customer: {
        id: customer.id,
        companyName: customer.companyName,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        clientCode: customer.clientCode,
      },
    });
  } catch (err) {
    console.error(`GET /api/customer/q_request/${id} error:`, err);
    return NextResponse.json({ error: "Failed to fetch request." }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestId = Number(id);
    const body = await req.json();
    const { status } = body;

    const allowedStatuses = ["accepted", "rejected", "revision_requested"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid or missing status." }, { status: 400 });
    }

    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
    }

    const [existingRequest] = await db
      .select()
      .from(quotation_requests)
      .where(
        and(
          eq(quotation_requests.id, requestId),
          eq(quotation_requests.customer_id, customer.id)
        )
      );

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    const [updatedRequest] = await db
      .update(quotation_requests)
      .set({ status })
      .where(eq(quotation_requests.id, requestId))
      .returning();

    const [updatedQuotation] = await db
      .update(quotations)
      .set({ status })
      .where(eq(quotations.requestId, requestId))
      .returning()

    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, updatedQuotation.id))

    const materials = await db
      .select()
      .from(quotationMaterials);

      const qFiles = await db
        .select()
        .from(quotationFiles)
        .where(eq(quotationFiles.quotationId, updatedQuotation.id));

      const mergedItems = items.map((item) => ({
        ...item,
        materials: materials.filter((m) => m.quotationItemId === item.id),
      }));

    const files = await db
      .select()
      .from(quotation_request_files)
      .where(eq(quotation_request_files.request_id, requestId));

    return NextResponse.json({
      ...updatedRequest,
      files,
      quotation: {
        ...updatedQuotation,
        items: mergedItems,
        files: qFiles,
        revisionLabel: `REVISION-${String(quotations.revisionNumber ?? 0).padStart(2, "0")}`,
        cadSketch: quotations.cadSketch
        ? [{ name: quotations.cadSketch, filePath: `/sales/uploads/${quotations.cadSketch}` }]
        : [] as { name: string; filePath: string}[],
      },
      customer: {
        id: customer.id,
        companyName: customer.companyName,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        clientCode: customer.clientCode,
      },
      success: true,
      message: `Quotation ${status} successfully.`,
      
    });
  } catch (err) {
    console.error(`PUT /api/customer/q_request/${id} error:`, err);
    return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
  }
}