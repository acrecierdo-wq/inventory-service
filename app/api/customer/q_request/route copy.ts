// // app/api/customer/q_request/route.ts

// import { db } from "@/db/drizzle";
// import { quotation_requests, quotation_request_files, customer_profile } from "@/db/schema";
// import { NextResponse, NextRequest } from "next/server";
// import { desc, eq, and } from "drizzle-orm";
// import path from "path";
// import fs from "fs";
// import { auth } from "@clerk/nextjs/server";

// // Directory to store uploaded files
// const uploadDir = path.join(process.cwd(), "public/uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// // GET handler – fetch all quotation requests or a single request by query ?id=
// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json({ status: "unauthorized", error: "Unauthorized" }, { status: 401 });
//     }

//     const url = new URL(req.url);
//     const id = url.searchParams.get("id");

//     // fetch customer profile linked to clerk userid
//     const [customer] = await db
//       .select()
//       .from(customer_profile)
//       .where(eq(customer_profile.clerkId, userId));

//       if (!customer) {
//         return NextResponse.json({ status: "no-profile", error: "Customer profile not found" }, { status: 404 });
//       }

//     // fetch singel request, only if it belongs to the customer
//     if (id) {
//       const [request] = await db
//         .select()
//         .from(quotation_requests)
//         .where(
//           and(
//             eq(quotation_requests.id, Number(id)),
//             eq(quotation_requests.customer_id, customer.id)
//           )
//         );

//       if (!request) {
//         return NextResponse.json({ status: "not-found", error: "Request not found" }, { status: 404 });
//       }

//       const files = await db
//         .select()
//         .from(quotation_request_files)
//         .where(eq(quotation_request_files.request_id, request.id));

//       return NextResponse.json({ 
//         status: "ok",
//         data: {
//           ...request, 
//         files,
//         customer: {
//           id: customer.id, 
//           companyName: customer.companyName,
//           conatactPerson: customer.contactPerson,
//           email: customer.email,
//           phone: customer.phone,
//           address: customer.address,
//           clientCode: customer.clientCode,
//         },
//         }
        
//       });
//     } else {
//       const requests = await db
//         .select()
//         .from(quotation_requests)
//         .where(eq(quotation_requests.customer_id, customer.id))
//         .orderBy(desc(quotation_requests.created_at));

//       const requestsWithFiles = await Promise.all(
//         requests.map(async (req) => {
//           const files = await db
//             .select()
//             .from(quotation_request_files)
//             .where(eq(quotation_request_files.request_id, req.id));

//           return {
//             ...req,
//             id: req.id,
//             project_name: req.project_name,
//             mode: req.mode,
//             message: req.message,
//             status: req.status,
//             created_at: req.created_at,
//             files,
//             customer: {
//               id: customer.id,
//               companyName: customer.companyName,
//               contactPerson: customer.contactPerson,
//               email: customer.email,
//               phone: customer.phone,
//               address: customer.address,
//               clientCode: customer.clientCode,
//             },
//           };
//         })
//       );

//       return NextResponse.json({ status: "ok", data: requestsWithFiles });
//     }
//   } catch (err) {
//     console.error("GET /api/customer/q_request error:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch quotation requests." },
//       { status: 500 }
//     );
//   }
// }

// // POST handler – submit new quotation request
// export async function POST(req: NextRequest) {
//   try {
//     const { userId} = await auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const formData = await req.formData();

//     // Extract fields
//     const project_name = formData.get("project_name")?.toString() || "";
//     const mode = formData.get("mode")?.toString() || "";
//     const message = formData.get("message")?.toString() || "";
//     const requesterName = formData.get("requester_name")?.toString() || "";
//     const requesterAddress = formData.get("requester_address")?.toString() || "";
//     const requesterPhone = formData.get("requester_phone")?.toString() || "";
//     const requesterEmail = formData.get("requester_email")?.toString() || "";
//     //const clientCode = formData.get("client_code")?.toString() || "";

//     // Validate required fields
//     if (!project_name || !mode) {
//       return NextResponse.json({ error: "Project name and mode are required." }, { status: 400 });
//     }

//     if (!requesterName || !requesterEmail) {
//       return NextResponse.json({ error: "Requester name and email are required." }, { status: 400 });
//     }

//     if (!requesterAddress || !requesterPhone) {
//       return NextResponse.json({ error: "Requester name and email are required." }, { status: 400 });
//     }

//     // Find existing customer by email
//     const [customer] = await db
//       .select()
//       .from(customer_profile)
//       .where(eq(customer_profile.clerkId, userId));

//     // If customer doesn't exist, create a new one
//     if (!customer) {
//       return NextResponse.json({ status: "no-profile" }, { status: 200 });
//       // [customer] = await db
//       //   .insert(customer_profile)
//       //   .values({
//       //     fullName: requesterName,
//       //     email: requesterEmail,
//       //     address: requesterAddress,
//       //     phone: requesterContact,
//       //     clientCode: clientCode || "N/A",
//       //     clerkId: requesterEmail,
//       //     //id: requesterEmail,
//       //   })
//       //   .returning();

//     // else if (clientCode && !customer.clientCode) {
//     //   [customer] = await  db
//     //     .update(customer_profile)
//     //     .set({ clientCode })
//     //     .where(eq(customer_profile.id, customer.id))
//     //     .returning();
//     }

//     if (!customer.companyName || !customer.contactPerson || !customer.phone || !customer.address || !customer.clientCode) {
//       return NextResponse.json({ status: "incomplete-profile" }, { status: 200 });
//     }

//     // Insert quotation request
//     const [newRequest] = await db
//       .insert(quotation_requests)
//       .values({
//         project_name,
//         mode,
//         message,
//         status: "Pending",
//         customer_id: customer.id,
//         created_at: new Date(),
//       })
//       .returning();

//     // Handle multiple file uploads
//     for (const [key, value] of formData.entries()) {
//       if ((key === "files" || key === "file") && value instanceof File) {
//         const timestamp = Date.now();
//         const fileName = `${timestamp}-${value.name}`;
//         const filePath = path.join(uploadDir, fileName);

//         const buffer = Buffer.from(await value.arrayBuffer());
//         fs.writeFileSync(filePath, buffer);

//         await db.insert(quotation_request_files).values({
//           request_id: newRequest.id,
//           path: `/uploads/${fileName}`,
//           uploaded_at: new Date(),
//         });
//       }
//     }

//     return NextResponse.json({
//       status: "ok",
//       data: newRequest,
//     });
//   } catch (err) {
//     console.error("POST /api/customer/q_request error:", err);
//     return NextResponse.json({ error: "Failed to submit quotation request." }, { status: 500 });
//   }
// }
