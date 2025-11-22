// // app/api/customer/upload_po/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/drizzle";
// import { purchase_orders, audit_logs, customer_profile } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { auth } from "@clerk/nextjs/server";
// import fs from "fs";
// import path from "path";

// const uploadDir = path.join(process.cwd(), "public/uploads/po");

// export async function POST(req: NextRequest) {
//   try {
//     // ✅ 1. Authenticate customer
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // ✅ 2. Get form data
//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const quotationId = String(formData.get("quotationId"));
//     const poNumber = formData.get("poNumber")?.toString();

//     if (!file || !quotationId || !poNumber) {
//       return NextResponse.json({ error: "Missing file or quotation ID" }, { status: 400 });
//     }

//     // ✅ 3. Get customer info via Clerk ID
//     const customer = await db.query.customer_profile.findFirst({
//       where: eq(customer_profile.clerkId, userId),
//     });

//     if (!customer) {
//       return NextResponse.json({ error: "Customer not found" }, { status: 404 });
//     }

//     // ✅ 4. Save file to local uploads folder
//     fs.mkdirSync(uploadDir, { recursive: true });

//     const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
//     const filePath = path.join(uploadDir, fileName);
//     const buffer = Buffer.from(await file.arrayBuffer());
//     fs.writeFileSync(filePath, buffer);

//     // ✅ 5. Insert purchase order record
//     const [newPO] = await db
//       .insert(purchase_orders)
//       .values({
//         id: crypto.randomUUID(),
//         customerId: customer.id,
//         quotationId: quotationId,
//         poNumber,
//         fileName,
//         filePath: `/uploads/po/${fileName}`,
//         fileType: file.type,
//         uploadedBy: customer.contactPerson,
//         action: "UPLOAD",
//         status: "Pending",
//       })
//       .returning({ id: purchase_orders.id });

//     // ✅ 6. Insert audit log record
//     await db.insert(audit_logs).values({
//       entity: "purchase_order",
//       entityId: newPO.id,
//       action: "UPLOAD",
//       description: `Customer ${customer.contactPerson} uploaded PO ${poNumber} (${file.name})`,
//       actorId: userId,
//       actorName: customer.contactPerson,
//       actorRole: "Customer",
//       module: "Customer - Purchase Order",
//       timestamp: new Date(),
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Purchase Order uploaded successfully.",
//       poId: newPO.id,
//     });
//   } catch (error) {
//     console.error("PO Upload Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { purchase_orders, audit_logs, customer_profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const quotationId = String(formData.get("quotationId"));
    const poNumber = formData.get("poNumber")?.toString();

    if (!file || !quotationId || !poNumber) {
      return NextResponse.json(
        { error: "Missing file or quotation ID" },
        { status: 400 }
      );
    }

    // Get customer info
    const customer = await db.query.customer_profile.findFirst({
      where: eq(customer_profile.clerkId, userId),
    });

    if (!customer)
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    // const uploadResult = await cloudinary.uploader.upload_stream(
    //   { resource_type: "auto", folder: "purchase_orders" },
    //   async (error, result) => {
    //     if (error) throw error;
    //     return result;
    //   }
    // );

    // Cloudinary upload helper
    const streamUpload = (buffer: Buffer) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "purchase_orders" },
          (error, result) => {
            if (error) return reject(error);
            if (!result)
              return reject(new Error("No result returned from Cloudinary"));
            resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await streamUpload(buffer);

    // Insert purchase order record
    const [newPO] = await db
      .insert(purchase_orders)
      .values({
        id: crypto.randomUUID(),
        customerId: customer.id,
        quotationId,
        poNumber,
        fileName: file.name,
        filePath: result.secure_url,
        fileType: file.type,
        uploadedBy: customer.contactPerson,
        action: "UPLOAD",
        status: "Pending",
      })
      .returning({ id: purchase_orders.id });

    // Insert audit log
    await db.insert(audit_logs).values({
      entity: "purchase_order",
      entityId: newPO.id,
      action: "UPLOAD",
      description: `Customer ${customer.contactPerson} uploaded PO ${poNumber} (${file.name})`,
      actorId: userId,
      actorName: customer.contactPerson,
      actorRole: "Customer",
      module: "Customer - Purchase Order",
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Purchase Order uploaded successfully.",
      poId: newPO.id,
      fileUrl: result.secure_url,
    });
  } catch (error) {
    console.error("PO Upload Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
