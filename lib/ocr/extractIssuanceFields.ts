/**
 * extractIssuanceFields
 *
 * Main OCR text parsing function that extracts structured data from delivery receipts.
 *
 * This function takes raw text from OCR and intelligently extracts:
 * 1. Client Name (recipient of the delivery)
 * 2. Client Address
 * 3. Customer PO Number (purchase order reference)
 * 4. Reference Number (receipt/DR number)
 * 5. Date (delivery date)
 * 6. Multiple items with quantities, units, and sizes
 *
 * @param parsedText - Raw text extracted from OCR
 * @param inventoryItems - Array of valid item names from the database for fuzzy matching
 * @returns Object containing all extracted fields
 */
export function extractIssuanceFields(
  parsedText: string,
  inventoryItems: string[]
) {
  const lines = parsedText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  console.log("📄 OCR Lines:", lines);

  // =========================================
  // SECTION 1: Extract Client Name (RECIPIENT)
  // =========================================
  let clientName = null;
  const deliveryReceiptIndex = lines.findIndex((l) =>
    l.toUpperCase().includes("DELIVERY RECEIPT")
  );

  if (deliveryReceiptIndex !== -1) {
    for (
      let i = deliveryReceiptIndex + 1;
      i < Math.min(deliveryReceiptIndex + 5, lines.length);
      i++
    ) {
      const candidate = lines[i].trim();

      if (
        candidate.length > 5 &&
        !candidate.match(
          /^(LOT|ADDRESS|TIN|P\.O\.|DATE|QUANTITY|UNIT|DESCRIPTION|N°|NO\.|REF)/i
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
  // SECTION 1B: Extract Client Address
  // =========================================
  // ✅ NEW: Extract address after client name
  let clientAddress = null;

  // Look for "ADDRESS" label or "LOT" keyword (common in PH addresses)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // Method 1: Find line with "ADDRESS" label
    if (upper.includes("ADDRESS")) {
      // Check if address is on the same line after the label
      const afterLabel = line.split(/ADDRESS[:\s]*/i)[1];
      if (afterLabel && afterLabel.length > 5) {
        clientAddress = afterLabel.trim();
        console.log("✅ Found Address (same line):", clientAddress);
        break;
      }
      // Check next line
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (
          nextLine.length > 10 &&
          !nextLine.match(/^(REF|TIN|P\.O\.|DATE)/i)
        ) {
          clientAddress = nextLine.trim();
          console.log("✅ Found Address (next line):", clientAddress);
          break;
        }
      }
    }

    // Method 2: Look for lines starting with "LOT" (common PH address format)
    if (
      upper.startsWith("LOT") &&
      line.length > 15 &&
      line.match(/LOT\s*[A-Z0-9]/i)
    ) {
      clientAddress = line.trim();
      console.log("✅ Found Address (LOT format):", clientAddress);
      break;
    }
  }

  // =========================================
  // SECTION 1C: Extract Reference Number
  // =========================================
  // ✅ NEW: Extract reference/DR number
  let referenceNumber = null;

  for (const line of lines) {
    const upper = line.toUpperCase();

    // Pattern 1: "N° 0036535" or "NO 0036535" or "No 0036535"
    const refMatch1 = line.match(
      /(?:N°|NO\.?|REF\.?\s*NO\.?)[:\s]*(\d{6,10})/i
    );

    if (refMatch1 && refMatch1[1]) {
      referenceNumber = refMatch1[1];
      console.log("✅ Found Reference Number:", referenceNumber);
      break;
    }

    // Pattern 2: Look for "DELIVERY RECEIPT" followed by number on same line
    if (upper.includes("DELIVERY RECEIPT")) {
      const receiptMatch = line.match(
        /DELIVERY\s+RECEIPT[:\s]*(?:N°|NO\.?)?[:\s]*(\d{6,10})/i
      );
      if (receiptMatch && receiptMatch[1]) {
        referenceNumber = receiptMatch[1];
        console.log(
          "✅ Found Reference Number (from receipt line):",
          referenceNumber
        );
        break;
      }
    }
  }

  // =========================================
  // SECTION 2: Extract Customer PO Number
  // =========================================
  let customerPoNumber = null;
  for (const line of lines) {
    if (
      line.toUpperCase().includes("P.O. NO") ||
      line.toUpperCase().includes("PO NO") ||
      line.toUpperCase().includes("P.O. NO.")
    ) {
      const poMatch = line.match(
        /(?:P\.O\.\s*NO\.?)[:\s._-]*([A-Z0-9][A-Z0-9\s._-]{4,})/i
      );

      if (poMatch && poMatch[1]) {
        const candidate = poMatch[1].replace(/^[._\s-]+|[._\s-]+$/g, "").trim();

        if (
          candidate.length >= 5 &&
          !/^[0-9]+$/.test(candidate) &&
          !/CALAMBA|LAGUNA|DELIVERED|ADDRESS/i.test(candidate)
        ) {
          customerPoNumber = candidate;
          console.log("✅ Found PO Number:", customerPoNumber);
          break;
        }
      }
    }
  }

  // =========================================
  // SECTION 3: Extract Date
  // =========================================
  let deliveryDate = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.toUpperCase().includes("DATE")) {
      // ✅ NEW: Try to extract date from the same line first
      const sameLine = line.split(/DATE[:\s._-]*/i)[1];
      if (sameLine && sameLine.length > 5) {
        // Look for date patterns in the remaining text
        const datePatterns = [
          /((?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|MAVEMBER)\s+\d{1,2}[,.]?\s+\d{4,5})/i,
          /(\d{2,4}[-/]\d{1,2}[-/]\d{2,4})/i,
          /(\d{1,2}[\/]\d{1,2}[\/]\d{2,4})/i,
        ];

        for (const pattern of datePatterns) {
          const dateMatch = sameLine.match(pattern);
          if (dateMatch && dateMatch[1]) {
            let extractedDate = dateMatch[1].trim();
            // ✅ Fix common OCR errors
            extractedDate = extractedDate
              .replace(/MAVEMBER/gi, "November")
              .replace(/202520_/g, "2025");
            deliveryDate = extractedDate;
            console.log("✅ Found Date (same line):", deliveryDate);
            break;
          }
        }
      }

      // If not found on same line, check next line
      if (!deliveryDate && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const datePatterns = [
          /((?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|MAVEMBER)\s+\d{1,2}[,.]?\s+\d{4,5})/i,
          /(\d{2,4}[-/]\d{1,2}[-/]\d{2,4})/i,
          /(\d{1,2}[\/]\d{1,2}[\/]\d{2,4})/i,
        ];

        for (const pattern of datePatterns) {
          const dateMatch = nextLine.match(pattern);
          if (dateMatch && dateMatch[1]) {
            let extractedDate = dateMatch[1].trim();
            extractedDate = extractedDate
              .replace(/MAVEMBER/gi, "November")
              .replace(/202520_/g, "2025");
            deliveryDate = extractedDate;
            console.log("✅ Found Date (next line):", deliveryDate);
            break;
          }
        }
      }

      if (deliveryDate) break;
    }
  }

  // =========================================
  // SECTION 4: Extract MULTIPLE Items
  // =========================================
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

  const descIndex = lines.findIndex((l) =>
    l.toUpperCase().includes("DESCRIPTION")
  );

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

  const extractedItems: Array<{
    itemName: string | null;
    quantity: number | null;
    unit: string | null;
    size: string | null;
    description: string;
  }> = [];

  if (descIndex !== -1 && endIndex !== -1) {
    const descriptionLines = lines.slice(descIndex + 1, endIndex);
    console.log("🔍 Scanning description lines:", descriptionLines);

    const quantities: Array<{ quantity: number; unit: string }> = [];
    const descriptions: string[] = [];

    for (let i = 0; i < descriptionLines.length; i++) {
      const line = descriptionLines[i];
      const upper = line.toUpperCase();

      const isMetadata =
        upper.match(/^(Nº|NO\.|#|N°)\s*\d+/) ||
        upper.includes("DATE") ||
        upper.includes("TERMS") ||
        upper.includes("REMARKS") ||
        upper.match(/^P\.O\.\s*NO/i) ||
        upper.match(/^\.\s*P\.O\./i) ||
        upper.match(/^PO\s*NO/i) ||
        upper === "QUANTITY" ||
        upper === "UNIT" ||
        upper === "DESCRIPTION" ||
        line.length < 3 ||
        upper.match(/^\d{4,}/) ||
        upper.includes("NOVEMBER") ||
        upper.includes("DECEMBER") ||
        upper.includes("JANUARY") ||
        upper.includes("FEBRUARY") ||
        upper.includes("MARCH") ||
        upper.includes("APRIL") ||
        upper.includes("MAY") ||
        upper.includes("JUNE") ||
        upper.includes("JULY") ||
        upper.includes("AUGUST") ||
        upper.includes("SEPTEMBER") ||
        upper.includes("OCTOBER") ||
        upper.match(/^\d{1,2}$/);

      if (isMetadata) {
        console.log("⏭️ Skipping metadata:", line);
        continue;
      }

      const qtyPattern = new RegExp(
        `^(\\d{1,4})\\s*(${unitWords.join("|")})\\.?\\s*$`,
        "i"
      );
      const qtyMatch = line.match(qtyPattern);

      if (qtyMatch) {
        quantities.push({
          quantity: parseInt(qtyMatch[1], 10),
          unit: qtyMatch[2].toUpperCase(),
        });
        console.log(`📊 Found quantity: ${qtyMatch[1]} ${qtyMatch[2]}`);
        continue;
      }

      if (
        line.match(/[A-Z]/i) &&
        line.length > 5 &&
        !upper.match(/^\d+$/) &&
        line.match(/[A-Z]{2,}/i) &&
        !upper.match(/^(BY:|RECEIVED|APPROVED|CHECKED|PREPARED|DELIVERED)/i) &&
        !upper.includes("BIR") &&
        !upper.includes("ACCREDITATION") &&
        !upper.includes("AUTHORITY") &&
        !upper.includes("EXPIRY") &&
        !upper.match(/^N°|^NO\.|^#/) &&
        !upper.match(/^P\.?O\.?\s*NO/i) &&
        !upper.match(/HKT|S\d{2}\.\d+/i)
      ) {
        descriptions.push(line.trim());
        console.log(`📝 Found description: ${line}`);
      } else {
        console.log(`⏭️ Rejected as description: ${line}`);
      }
    }

    console.log(
      `\n🔗 Pairing ${quantities.length} quantities with ${descriptions.length} descriptions`
    );

    const maxItems = Math.max(quantities.length, descriptions.length);

    for (let i = 0; i < maxItems; i++) {
      const qty = quantities[i];
      const desc = descriptions[i];

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

      const sizeMatch = desc.match(/(\d+)\s*(MM|CM|M|FT|IN)(?=\s|$)/i);
      const size = sizeMatch ? sizeMatch[0].toUpperCase() : null;

      const matchedName = matchInventoryItem(desc, inventoryItems);

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

    // FALLBACK: Handle embedded format
    if (extractedItems.length === 0) {
      console.log("⚠️ No column-based items found, trying embedded format...");

      for (const line of descriptionLines) {
        const embeddedPattern = new RegExp(
          `^(\\d{1,4})\\s*(${unitWords.join("|")})[\\.\\s]+(.*?)$`,
          "i"
        );
        const embeddedMatch = line.match(embeddedPattern);

        if (embeddedMatch) {
          const quantity = parseInt(embeddedMatch[1], 10);
          const unit = embeddedMatch[2].toUpperCase();
          const description = embeddedMatch[3].trim();

          const sizeMatch = description.match(
            /(\d+)\s*(MM|CM|M|FT|IN)(?=\s|$)/i
          );
          const size = sizeMatch ? sizeMatch[0].toUpperCase() : null;

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

    // FALLBACK: Handle embedded format for remaining items
    if (
      extractedItems.length === 0 ||
      extractedItems.length < descriptions.length
    ) {
      console.log("⚠️ Trying embedded format for remaining items...");

      for (const line of descriptionLines) {
        // Pattern: "100 PCS. P.E.PADS 10MM"
        const embeddedPattern = new RegExp(
          `^(\\d{1,4})\\s*(${unitWords.join("|")})[\\.\\s]+(.*?)$`,
          "i"
        );
        const embeddedMatch = line.match(embeddedPattern);

        if (embeddedMatch) {
          const quantity = parseInt(embeddedMatch[1], 10);
          const unit = embeddedMatch[2].toUpperCase();
          const description = embeddedMatch[3].trim();

          // Check if already added
          const alreadyAdded = extractedItems.some(
            (item) => item.description === description
          );

          if (!alreadyAdded) {
            const sizeMatch = description.match(
              /(\d+)\s*(MM|CM|M|FT|IN)(?=\s|$)/i
            );
            const size = sizeMatch ? sizeMatch[0].toUpperCase() : null;

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
  }

  const result = {
    clientName,
    clientAddress, // ✅ NEW
    referenceNumber, // ✅ NEW
    customerPoNumber,
    date: deliveryDate,
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

  return bestScore > 0.3 ? bestMatch : null;
}

function similarity(a: string, b: string) {
  const aTokens = a.split(/\s+/).filter((t) => t.length > 2);
  const bTokens = b.split(/\s+/).filter((t) => t.length > 2);

  if (aTokens.length === 0 || bTokens.length === 0) return 0;

  let matches = 0;
  let partialMatches = 0;

  aTokens.forEach((t) => {
    bTokens.forEach((bt) => {
      if (t === bt) {
        matches += 1;
      } else if (t.includes(bt) || bt.includes(t)) {
        partialMatches += 0.5;
      }
    });
  });

  const totalMatches = matches + partialMatches;

  return totalMatches / Math.max(aTokens.length, bTokens.length);
}
