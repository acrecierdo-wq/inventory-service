import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { customer_profile, quotation_requests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPhaseUpdateEmail } from "@/lib/sendEmail";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const requestId = formData.get("requestId") as string;
    const customerId = formData.get("customerId") as string;
    const phaseName = formData.get("phaseName") as string;
    const status = formData.get("status") as string;
    const notes = formData.get("notes") as string;
    const files = formData.getAll("files") as File[];

    if (!requestId || !customerId || !phaseName || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch customer details
    const customer = await db
      .select()
      .from(customer_profile)
      .where(eq(customer_profile.id, parseInt(customerId)))
      .limit(1);

    if (!customer.length) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Fetch request details
    const request = await db
      .select()
      .from(quotation_requests)
      .where(eq(quotation_requests.id, parseInt(requestId)))
      .limit(1);

    if (!request.length) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    // Upload files to Cloudinary and get URLs
    const uploadedFileUrls: Array<{ url: string; name: string }> = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "phase_updates",
        resource_type: "auto",
      });

      uploadedFileUrls.push({
        url: uploadResult.secure_url,
        name: file.name,
      });
    }

    // Send email with attachments
    await sendPhaseUpdateEmail({
      to: customer[0].email,
      customerName: customer[0].companyName,
      requestId: request[0].id,
      projectName: request[0].project_name,
      phaseName,
      status,
      notes,
      attachments: uploadedFileUrls,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      filesUploaded: uploadedFileUrls.length,
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
