// app/api/ocr/route.ts

import { NextRequest, NextResponse } from "next/server";
import { extractIssuanceFields } from "@/lib/ocr/extractIssuanceFields";
import { db } from "@/db/drizzle";
import { items } from "@/db/schema";

/**
 * POST endpoint that processes images using OCR (Optical Character Recognition)
 * to extract text and match it with inventory items.
 *
 * @param req - The incoming request containing an imageUrl in the body
 * @returns JSON response with extracted fields and raw text, or error message
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get the image URL
    const { imageUrl } = await req.json();

    // Validate that an image URL was provided
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL required" },
        { status: 400 }
      );
    }

    // Prepare form data for OCR.space API request
    const formData = new FormData();
    formData.append("url", imageUrl); // The image to process
    formData.append("apikey", process.env.OCR_API_KEY!); // API authentication key
    formData.append("language", "eng"); // Set language to English
    formData.append("isOverlayRequired", "false"); // Don't need overlay coordinates
    formData.append("detectOrientation", "true"); // Auto-detect image rotation
    formData.append("scale", "true"); // Scale image for better accuracy
    formData.append("OCREngine", "2"); // Use the newer, more accurate OCR engine

    // Send the image to OCR.space API for text extraction
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    // Parse the OCR API response
    const ocrResult = await ocrResponse.json();

    // Log the complete OCR result for debugging purposes
    console.log("🔍 OCR Result:", JSON.stringify(ocrResult, null, 2));

    // Check if OCR processing was successful and text was extracted
    if (!ocrResult.IsErroredOnProcessing && ocrResult.ParsedResults?.[0]) {
      // Get the extracted text from the first result
      const parsedText = ocrResult.ParsedResults[0].ParsedText;

      // Log the raw extracted text
      console.log("📄 Parsed Text:", parsedText);

      // Fetch all inventory item names from the database
      // This allows us to match extracted text with existing items
      const inventoryItems = await db.select({ name: items.name }).from(items);
      const itemNames = inventoryItems.map((i) => i.name);

      // Process the extracted text to identify specific fields
      // (e.g., item names, quantities, dates) using our custom parser
      const fields = extractIssuanceFields(parsedText, itemNames);

      // Log the successfully extracted and parsed fields
      console.log("✅ Extracted Fields:", fields);

      // Return success response with extracted fields and raw text
      return NextResponse.json({
        success: true,
        fields,
        rawText: parsedText,
      });
    }

    // If OCR processing failed, return error with details
    return NextResponse.json(
      { error: "OCR processing failed", details: ocrResult },
      { status: 500 }
    );
  } catch (error: unknown) {
    // Log any unexpected errors that occur during processing
    console.error("OCR API error:", error);

    // Extract error message safely (handle both Error objects and unknown types)
    const message = error instanceof Error ? error.message : "OCR failed";

    // Return error response
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
