// app/api/customer/q_request/route.ts
import { db } from "@/db/drizzle";
import { quotation_requests, quotation_request_files, customer_profile } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary upload result type
// type CloudinaryUploadResult = {
//   public_id: string;
//   secure_url: string;
//   resource_type: string;
// };

// Helper to detect image files
const imageExtensions = ["png", "jpeg", "jpg"];
const markFiles = (files: { filename: string; path: string; publicId: string }[]) =>
  files.map((file) => {
    const ext = file.filename.split(".").pop()?.toLowerCase() || "";
    return { ...file, isImage: imageExtensions.includes(ext) };
  });

// -------------------- POST --------------------
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const project_name = formData.get("project_name")?.toString() || "";
    const mode = formData.get("mode")?.toString() || "";
    const message = formData.get("message")?.toString() || "";

    if (!project_name || !mode)
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });

    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    if (!customer) return NextResponse.json({ status: "no-profile" }, { status: 200 });

    // Insert request
    const [newRequest] = await db.insert(quotation_requests).values({
      project_name,
      mode,
      message,
      status: "Pending",
      customer_id: customer.id,
      created_at: new Date(),
    }).returning();

    const filesToUpload = formData.getAll("files").filter(f => f instanceof File) as File[];
    const uploadedFiles = [];

    for (const file of filesToUpload) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;
      

      try {
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "quotation_requests",
          resource_type: "raw",
          public_id: `${Date.now()}_${file.name}`,
          overwrite: false,
        });

        await db.insert(quotation_request_files).values({
          request_id: newRequest.id,
          filename: file.name,
          path: result.secure_url,
          publicId: result.public_id,
          resource_type: result.resource_type,
          uploaded_at: new Date(),
        });

        uploadedFiles.push({
          filename: file.name,
          path: result.secure_url,
          publicId: result.public_id,
          resource_type: result.resource_type,
        });
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    return NextResponse.json({ status: "ok", data: newRequest, files: markFiles(uploadedFiles) });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit quotation request." }, { status: 500 });
  }
}


// -------------------- GET --------------------
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ status: "unauthorized", error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const [customer] = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.clerkId, userId));

    if (!customer) return NextResponse.json({ status: "no-profile", error: "Customer profile not found" }, { status: 404 });

    if (id) {
      const [request] = await db
        .select()
        .from(quotation_requests)
        .where(and(eq(quotation_requests.id, Number(id)), eq(quotation_requests.customer_id, customer.id)));

      if (!request) return NextResponse.json({ status: "not-found", error: "Request not found" }, { status: 404 });

      const files = await db
        .select()
        .from(quotation_request_files)
        .where(eq(quotation_request_files.request_id, request.id));

      return NextResponse.json({
        status: "ok",
        data: {
          ...request,
          files: markFiles(files),
          customer: {
            id: customer.id,
            companyName: customer.companyName,
            conatactPerson: customer.contactPerson,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            tinNumber: customer.tinNumber,
          },
        },
      });
    } else {
      const requests = await db
        .select()
        .from(quotation_requests)
        .where(eq(quotation_requests.customer_id, customer.id))
        .orderBy(desc(quotation_requests.created_at));

      const requestsWithFiles = await Promise.all(
        requests.map(async (req) => {
          const files = await db
            .select()
            .from(quotation_request_files)
            .where(eq(quotation_request_files.request_id, req.id));

          return {
            ...req,
            files: markFiles(files),
            customer: {
              id: customer.id,
              companyName: customer.companyName,
              conatactPerson: customer.contactPerson,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              tinNumber: customer.tinNumber,
            },
          };
        })
      );

      return NextResponse.json({ status: "ok", data: requestsWithFiles });
    }

  } catch (err) {
    console.error("GET /api/customer/q_request error:", err);
    return NextResponse.json({ error: "Failed to fetch quotation requests." }, { status: 500 });
  }
}
