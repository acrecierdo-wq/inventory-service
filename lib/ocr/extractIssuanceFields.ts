/**
 * extractIssuanceFields
 *
 * Main OCR text parsing function that extracts structured data from delivery receipts.
 *
 * This function takes raw text from OCR and intelligently extracts:
 * 1. Client Name (recipient of the delivery)
 * 2. Customer PO Number (purchase order reference)
 * 3. Multiple items with quantities, units, and sizes
 *
 * The parser handles various receipt formats including:
 * - Column-based layouts (quantity and description in separate lines)
 * - Embedded format (quantity + description in same line)
 * - Different unit variations (PCS, PIECES, ROLL, etc.)
 *
 * @param parsedText - Raw text extracted from OCR
 * @param inventoryItems - Array of valid item names from the database for fuzzy matching
 * @returns Object containing clientName, customerPoNumber, and array of extracted items
 */
export function extractIssuanceFields(
  parsedText: string,
  inventoryItems: string[]
) {
  // Split OCR text into individual lines and clean up whitespace
  const lines = parsedText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  console.log("📄 OCR Lines:", lines);

  // =========================================
  // SECTION 1: Extract Client Name (RECIPIENT)
  // =========================================
  // Strategy: Find "DELIVERY RECEIPT" header, then look at the next few lines
  // for the recipient name, filtering out metadata and contact info

  let clientName = null;
  const deliveryReceiptIndex = lines.findIndex((l) =>
    l.toUpperCase().includes("DELIVERY RECEIPT")
  );

  if (deliveryReceiptIndex !== -1) {
    // Search the next 5 lines after "DELIVERY RECEIPT" for the client name
    for (
      let i = deliveryReceiptIndex + 1;
      i < Math.min(deliveryReceiptIndex + 5, lines.length);
      i++
    ) {
      const candidate = lines[i].trim();

      // Validate the candidate as a potential client name by checking:
      // - Length is reasonable (more than 5 characters)
      // - Not a form field label (LOT, ADDRESS, DATE, etc.)
      // - Not just numbers
      // - Not an email address
      // - Not a phone number with (049) area code
      // - Not a VAT line
      // - Contains at least one letter
      // - Not a signature field (APPROVED, CHECKED, etc.)
      if (
        candidate.length > 5 &&
        !candidate.match(
          /^(LOT|ADDRESS|TIN|P\.O\.|DATE|QUANTITY|UNIT|DESCRIPTION)/i
        ) &&
        !candidate.match(/^\d+$/) &&
        !candidate.includes("@") &&
        !candidate.includes("(049)") &&
        !candidate.includes("VAT") &&
        candidate.match(/[A-Z]/) &&
        !candidate.match(/^(APPROVED|CHECKED|PREPARED|DELIVERED|RECEIVED)/i)
      ) {
        clientName = candidate;
        console.log("✅ Found Client Name:", clientName);
        break;
      }
    }
  }

  // =========================================
  // SECTION 2: Extract Customer PO Number
  // =========================================
  // Strategy: Search for lines containing "P.O. NO" or similar patterns
  // and extract the alphanumeric code following it

  let customerPoNumber = null;
  for (const line of lines) {
    // Check if line contains PO number label in various formats
    if (
      line.toUpperCase().includes("P.O. NO") ||
      line.toUpperCase().includes("PO NO") ||
      line.toUpperCase().includes("P.O. NO.")
    ) {
      // Match patterns like "P.O. NO.__HKT. S04.25019A." or "P.O. NO: ABC-123"
      // Looking for alphanumeric sequences at least 5 characters long
      const poMatch = line.match(
        /(?:P\.O\.\s*NO\.?)[:\s._-]*([A-Z0-9][A-Z0-9\s._-]{4,})/i
      );
      if (poMatch && poMatch[1]) {
        // Clean up the extracted PO number:
        // - Remove leading/trailing punctuation
        // - Replace spaces with dashes for consistency
        const candidate = poMatch[1]
          .replace(/^[._\s-]+|[._\s-]+$/g, "")
          .replace(/\s+/g, "-")
          .trim();

        // Validate the PO number:
        // - At least 5 characters long
        // - Not just numbers (should be alphanumeric)
        // - Not accidentally capturing address info (CALAMBA, LAGUNA)
        if (
          candidate.length >= 5 &&
          !/^[0-9]+$/.test(candidate) &&
          !/CALAMBA|LAGUNA/i.test(candidate)
        ) {
          customerPoNumber = candidate;
          console.log("✅ Found PO Number:", customerPoNumber);
          break;
        }
      }
    }
  }

  // =========================================
  // SECTION 3: Extract MULTIPLE Items
  // =========================================
  // Strategy: Find the "DESCRIPTION" header, then parse items until we hit
  // signature fields (PREPARED, DELIVERED, etc.)
  //
  // Supports two formats:
  // Format A (Column-based): Quantities and descriptions on separate lines
  //   100 PCS
  //   P.E.FOAM TRAY 20MM
  //   400 PCS
  //   BUBBLE WRAP
  //
  // Format B (Embedded): Quantity and description on same line
  //   100 PCS P.E.FOAM TRAY 20MM
  //   400 PCS BUBBLE WRAP

  // List of recognized unit keywords (both singular and plural forms)
  const unitWords = [
    "PCS",
    "PC",
    "PIECES",
    "ROLL",
    "PACK",
    "BOX",
    "SET",
    "SACK",
    "BAG",
    "TUBE",
    "LTR",
    "KG",
    "METER",
    "FT",
    "MM",
  ];

  // Find the start of the items section (after "DESCRIPTION" header)
  const descIndex = lines.findIndex((l) =>
    l.toUpperCase().includes("DESCRIPTION")
  );

  // Find the end of the items section (before signature fields)
  const endKeywords = [
    "PREPARED",
    "DELIVERED",
    "CHECKED",
    "APPROVED",
    "RECEIVED",
  ];
  const endIndex = lines.findIndex(
    (l, idx) =>
      idx > descIndex && endKeywords.some((kw) => l.toUpperCase().includes(kw))
  );

  // Array to store all extracted items
  const extractedItems: Array<{
    itemName: string | null;
    quantity: number | null;
    unit: string | null;
    size: string | null;
    description: string;
  }> = [];

  if (descIndex !== -1 && endIndex !== -1) {
    // Extract only the lines between DESCRIPTION header and signature fields
    const descriptionLines = lines.slice(descIndex + 1, endIndex);
    console.log("🔍 Scanning description lines:", descriptionLines);

    // Arrays to collect quantities and descriptions separately
    // This handles the column-based format where they appear on different lines
    const quantities: Array<{ quantity: number; unit: string }> = [];
    const descriptions: string[] = [];

    // STEP 1: Scan through all lines and categorize them
    for (let i = 0; i < descriptionLines.length; i++) {
      const line = descriptionLines[i];
      const upper = line.toUpperCase();

      // Skip metadata lines that don't contain item information
      const isMetadata =
        upper.match(/^(Nº|NO\.|#)\s*\d+/) || // Line numbers
        upper.includes("DATE") ||
        upper.includes("TERMS") ||
        upper.includes("REMARKS") ||
        upper.match(/^P\.O\.\s*NO/) || // PO number (already extracted)
        upper === "QUANTITY" || // Column headers
        upper === "UNIT" ||
        line.length < 3; // Too short to be meaningful

      if (isMetadata) {
        console.log("⏭️ Skipping metadata:", line);
        continue;
      }

      // Check if this line is a standalone quantity line (e.g., "100 PCS." or "400 PCS")
      // Pattern: number followed by unit keyword, possibly with punctuation
      const qtyPattern = new RegExp(
        `^(\\d{1,4})\\s*(${unitWords.join("|")})\\.?\\s*$`,
        "i"
      );
      const qtyMatch = line.match(qtyPattern);

      if (qtyMatch) {
        // Found a quantity line - store it
        quantities.push({
          quantity: parseInt(qtyMatch[1], 10),
          unit: qtyMatch[2].toUpperCase(),
        });
        console.log(`📊 Found quantity: ${qtyMatch[1]} ${qtyMatch[2]}`);
        continue;
      }

      // Check if this line is a description line
      // Must contain letters, be longer than 3 chars, and not be just numbers
      if (line.match(/[A-Z]/i) && line.length > 3 && !upper.match(/^\d+$/)) {
        descriptions.push(line.trim());
        console.log(`📝 Found description: ${line}`);
      }
    }

    // STEP 2: Pair quantities with descriptions by matching array indices
    // This assumes quantities and descriptions appear in the same order
    console.log(
      `\n🔗 Pairing ${quantities.length} quantities with ${descriptions.length} descriptions`
    );

    const maxItems = Math.max(quantities.length, descriptions.length);

    for (let i = 0; i < maxItems; i++) {
      const qty = quantities[i];
      const desc = descriptions[i];

      // Warn if pairing is incomplete (more quantities than descriptions or vice versa)
      if (!desc) {
        console.warn(
          `⚠️ No description for quantity: ${qty?.quantity} ${qty?.unit}`
        );
        continue;
      }

      if (!qty) {
        console.warn(`⚠️ No quantity for description: ${desc}`);
        continue;
      }

      // Extract size information from the description (e.g., "20MM", "5CM", "10FT")
      const sizeMatch = desc.match(/(\d+)\s*(MM|CM|M|FT|IN)(?=\s|$)/i);
      const size = sizeMatch ? sizeMatch[0].toUpperCase() : null;

      // Try to match the description to an actual item in our inventory
      const matchedName = matchInventoryItem(desc, inventoryItems);

      // Store the complete item information
      extractedItems.push({
        itemName: matchedName,
        quantity: qty.quantity,
        unit: qty.unit,
        size,
        description: desc,
      });

      console.log(
        `✅ Paired: ${desc} → ${qty.quantity} ${qty.unit} (matched: ${matchedName})`
      );
    }

    // FALLBACK: Handle embedded format if column-based parsing found nothing
    // Format: "100 PCS P.E.FOAM TRAY 20MM" (all on one line)
    if (extractedItems.length === 0) {
      console.log("⚠️ No column-based items found, trying embedded format...");

      for (const line of descriptionLines) {
        // Pattern: number + unit + description all on same line
        const embeddedPattern = new RegExp(
          `^(\\d{1,4})\\s*(${unitWords.join("|")})[\\.\\s]+(.*?)$`,
          "i"
        );
        const embeddedMatch = line.match(embeddedPattern);

        if (embeddedMatch) {
          const quantity = parseInt(embeddedMatch[1], 10);
          const unit = embeddedMatch[2].toUpperCase();
          const description = embeddedMatch[3].trim();

          // Extract size from description
          const sizeMatch = description.match(
            /(\d+)\s*(MM|CM|M|FT|IN)(?=\s|$)/i
          );
          const size = sizeMatch ? sizeMatch[0].toUpperCase() : null;

          // Match to inventory
          const matchedName = matchInventoryItem(description, inventoryItems);

          extractedItems.push({
            itemName: matchedName,
            quantity,
            unit,
            size,
            description,
          });

          console.log(
            `✅ Found embedded item: ${description} - ${quantity} ${unit}`
          );
        }
      }
    }
  }

  // Build and return the final result object
  const result = {
    clientName,
    customerPoNumber,
    items: extractedItems,
  };

  console.log("📦 Final extracted fields:", result);
  return result;
}

/**
 * matchInventoryItem
 *
 * Fuzzy matching function that finds the best matching inventory item name
 * for a given description extracted from OCR.
 *
 * Steps:
 * 1. Clean the description (remove sizes, numbers, special chars)
 * 2. Compare against all inventory items using similarity scoring
 * 3. Return best match if confidence score is above threshold
 *
 * @param description - The raw description from OCR (e.g., "P.E.FOAM TRAY 20MM")
 * @param inventoryItems - Array of valid item names from database
 * @returns Best matching inventory item name, or null if no good match found
 */
function matchInventoryItem(description: string, inventoryItems: string[]) {
  // Validate input
  if (!description || description.length < 3) return null;

  // Clean the description for better matching:
  // - Remove size measurements (20MM, 5CM, etc.)
  // - Remove all numbers
  // - Replace punctuation with spaces
  // - Convert to uppercase for case-insensitive comparison
  const cleanDesc = description
    .replace(/\d+\s*(MM|CM|M|FT|IN)/gi, "")
    .replace(/\d+/g, "")
    .replace(/[._-]/g, " ")
    .trim()
    .toUpperCase();

  console.log("🔍 Cleaned description for matching:", cleanDesc);

  // Find the best matching item using similarity scoring
  let bestMatch = null;
  let bestScore = 0;

  for (const item of inventoryItems) {
    const score = similarity(cleanDesc, item.toUpperCase());
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  console.log(`🎯 Best match: "${bestMatch}" (score: ${bestScore.toFixed(2)})`);

  // Only return match if confidence score is above 0.3 (30%)
  // This prevents false matches with very dissimilar items
  return bestScore > 0.3 ? bestMatch : null;
}

/**
 * similarity
 *
 * Calculates a similarity score between two strings using token-based matching.
 *
 * Algorithm:
 * 1. Split both strings into tokens (words)
 * 2. Filter out very short tokens (less than 3 characters)
 * 3. Compare tokens pairwise:
 *    - Exact match = 1 point
 *    - Partial match (one contains the other) = 0.5 points
 * 4. Normalize score by dividing by the maximum token count
 *
 * Examples:
 * - "PE FOAM TRAY" vs "PE FOAM TRAY" → 1.0 (perfect match)
 * - "PE FOAM" vs "PE FOAM TRAY" → 0.67 (partial match)
 * - "BUBBLE WRAP" vs "PE FOAM TRAY" → 0.0 (no match)
 *
 * @param a - First string to compare (cleaned description)
 * @param b - Second string to compare (inventory item name)
 * @returns Similarity score between 0.0 and 1.0
 */
function similarity(a: string, b: string) {
  // Split strings into tokens and filter out short words (less than 3 chars)
  // Short words like "OF", "IN" are too common and cause false matches
  const aTokens = a.split(/\s+/).filter((t) => t.length > 2);
  const bTokens = b.split(/\s+/).filter((t) => t.length > 2);

  // Can't calculate similarity if either string has no valid tokens
  if (aTokens.length === 0 || bTokens.length === 0) return 0;

  // Count exact and partial matches
  let matches = 0; // Exact token matches
  let partialMatches = 0; // Partial token matches (substring matches)

  // Compare every token from string A with every token from string B
  aTokens.forEach((t) => {
    bTokens.forEach((bt) => {
      if (t === bt) {
        // Exact match: both tokens are identical
        matches += 1;
      } else if (t.includes(bt) || bt.includes(t)) {
        // Partial match: one token contains the other
        // Worth less than exact match (0.5 points)
        partialMatches += 0.5;
      }
    });
  });

  // Calculate total match score
  const totalMatches = matches + partialMatches;

  // Normalize by dividing by the longer token count
  // This prevents short strings from getting artificially high scores
  return totalMatches / Math.max(aTokens.length, bTokens.length);
}
