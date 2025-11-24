import { NextRequest, NextResponse } from "next/server";
import { extractPurchaseOrderFields } from "@/lib/ocr/extractPurchaseOrderFields";
import { db } from "@/db/drizzle";
import { items } from "@/db/schema";

/**
 * POST endpoint for Purchase Order OCR processing
 * Extracts supplier info, terms, project name, and items from PO receipts
 */
export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL required" },
        { status: 400 }
      );
    }

    // Prepare OCR request
    const formData = new FormData();
    formData.append("url", imageUrl);
    formData.append("apikey", process.env.OCR_API_KEY!);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2");

    // Call OCR API
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    const ocrResult = await ocrResponse.json();
    console.log("🔍 OCR Result (PO):", JSON.stringify(ocrResult, null, 2));

    if (!ocrResult.IsErroredOnProcessing && ocrResult.ParsedResults?.[0]) {
      const parsedText = ocrResult.ParsedResults[0].ParsedText;
      console.log("📄 Parsed Text (PO):", parsedText);

      // Fetch inventory items for matching
      const inventoryItems = await db.select({ name: items.name }).from(items);
      const itemNames = inventoryItems.map((i) => i.name);

      // Extract PO fields
      const fields = extractPurchaseOrderFields(parsedText, itemNames);
      console.log("✅ Extracted PO Fields:", fields);

      return NextResponse.json({
        success: true,
        fields,
        rawText: parsedText,
      });
    }

    return NextResponse.json(
      { error: "OCR processing failed", details: ocrResult },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error("OCR API error (PO):", error);
    const message = error instanceof Error ? error.message : "OCR failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
