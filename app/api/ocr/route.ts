// // app/api/ocr/route.ts

// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { imageUrl } = await req.json();
//     if (!imageUrl) {
//       return NextResponse.json({ error: "No imageUrl provided" }, { status: 400 });
//     }

//     const apiKey = process.env.OCR_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json({ error: "OCR API key missing" }, { status: 500 });
//     }

//     // Call OCR.Space
//     const formData = new FormData();
//     formData.append("apikey", apiKey);
//     formData.append("url", imageUrl); // Image URL from Cloudinary
//     formData.append("language", "eng");
//     formData.append("scale", "true");
//     formData.append("OCREngine", "2");

//     const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
//       method: "POST",
//       body: formData,
//     });

//     const result = await ocrResponse.json();

//     if (result.IsErroredOnProcessing) {
//       return NextResponse.json({ error: "OCR processing failed", details: result }, { status: 500 });
//     }

//     const parsedText = result.ParsedResults?.[0]?.ParsedText || "";

//     return NextResponse.json({
//       success: true,
//       parsedText,
//       raw: result, // For debugging
//     });

//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error", err }, { status: 500 });
//   }
// }

// app/api/ocr/route.ts

import { extractIssuanceFields } from "@/lib/ocr/extractIssuanceFields";
import { db } from "@/db/drizzle";
import { items as inventory } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No imageUrl provided" }, { status: 400 });
    }

    const apiKey = process.env.OCR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OCR API key" }, { status: 500 });
    }

    // ===== OCR SPACE REQUEST =====
    const formData = new FormData();
    formData.append("apikey", apiKey);
    formData.append("url", imageUrl);
    formData.append("language", "eng");
    formData.append("scale", "true");
    formData.append("OCREngine", "2");

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    const result = await ocrResponse.json();

    if (result.IsErroredOnProcessing) {
      return NextResponse.json(
        { error: "OCR failed", details: result },
        { status: 500 }
      );
    }

    const parsedText = result.ParsedResults?.[0]?.ParsedText || "";

    // ===== FETCH INVENTORY ITEMS FOR MATCHING =====
    const items = await db.select().from(inventory);

    // IMPORTANT: the correct field is "name", NOT "itemName"
    const inventoryNames = items.map((i) => i.name);

    // ===== RUN EXTRACTION LOGIC =====
    const fields = extractIssuanceFields(parsedText, inventoryNames);

    return NextResponse.json({
      success: true,
      fields,
      rawText: parsedText,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error", details: err }, { status: 500 });
  }
}
