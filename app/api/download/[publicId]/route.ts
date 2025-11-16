// // app/api/download/[publicId]/route.ts
// import { NextResponse } from "next/server";

// type RouteContext = {
//   params: Promise<{ publicId: string }>;
// };

// export async function GET(context: RouteContext) {
//   try {
//   let { publicId } = await context.params;

//   publicId = decodeURIComponent(publicId);

//   const safePublicId = publicId
//     .split("/")
//     .map((p) => encodeURIComponent(p))
//     .join("/");

//   const fileUrl = `https://res.cloudinary.com/dluqkyumu/raw/upload/${safePublicId}`;

//   const response = await fetch(fileUrl);
//   if (!response.ok) return NextResponse.json({ error: "File not found" }, { status: 404 });

//   const arrayBuffer = await response.arrayBuffer();
//   const filename = publicId.split("/").pop() ?? "file";

//   return new NextResponse(Buffer.from(arrayBuffer), {
//     headers: {
//       "Content-Type": "application/octet-stream",
//       "Content-Disposition": `attachment; filename="${filename}"`,
//     },
//   });
//   } catch (err) {
//     console.error("Download failed:", err);
//     return NextResponse.json({ erorr: "failed to download file" }, { status: 500 });
//   }
// }

// app/api/download/[publicId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { quotation_request_files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

// Make params a Promise if your type really expects it
type RouteContext = {
  params: Promise<{ publicId: string }>;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(_req: NextRequest,context: RouteContext) {
  // Await the params promise
  const { publicId } = await context.params;

  const decoded = decodeURIComponent(publicId);

  const [file] = await db
    .select()
    .from(quotation_request_files)
    .where(eq(quotation_request_files.publicId, decoded));

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const signedUrl = cloudinary.url(file.publicId, { resource_type: "raw", sign_url: true });

  return NextResponse.json({ url: signedUrl, filename: file.filename });
}
