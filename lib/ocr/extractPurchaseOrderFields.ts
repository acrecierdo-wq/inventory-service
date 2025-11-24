/**
 * extractPurchaseOrderFields
 *
 * Parses OCR text from Purchase Order receipts and extracts:
 * 1. Supplier name
 * 2. Supplier address
 * 3. Supplier contact number
 * 4. Supplier TIN
 * 5. Terms (payment terms)
 * 6. Project name
 * 7. Multiple items with quantities, units, and prices
 *
 * @param parsedText - Raw text extracted from OCR
 * @param inventoryItems - Array of valid item names from database for matching
 * @returns Object containing supplier info, terms, project name, and items array
 */
export function extractPurchaseOrderFields(
  parsedText: string,
  inventoryItems: string[]
) {
  const lines = parsedText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  console.log("📄 OCR Lines (PO):", lines);

  // =========================================
  // 1. Extract Supplier Name
  // =========================================
  let supplierName = null;
  const poIndex = lines.findIndex((l) =>
    l.toUpperCase().includes("PURCHASE ORDER")
  );

  if (poIndex !== -1) {
    // Look AFTER "PURCHASE ORDER" for supplier name
    for (let i = poIndex + 1; i < Math.min(poIndex + 10, lines.length); i++) {
      const line = lines[i];
      const upper = line.toUpperCase();

      // Skip PO number, date, terms lines
      if (
        upper.match(/^Nº/) ||
        upper.match(/^\d{4}/) || // Year like 2025
        upper.includes("OCTOBER") ||
        upper.includes("TERMS") ||
        upper.includes("POC") ||
        upper.includes("DELIVERY")
      ) {
        continue;
      }

      // Look for supplier patterns
      if (
        line.length > 15 &&
        (upper.includes("MANUFACTURING") ||
          upper.includes("PACKAGING") ||
          upper.includes("PLASTIC") ||
          upper.includes("PLANMAX") ||
          upper.includes("PLASTE") ||
          upper.includes("PLEMMAX"))
      ) {
        // Fix common OCR errors
        supplierName = line
          .replace(/PLEMMAX/gi, "PLANMAX")
          .replace(/PLASTE/gi, "PLASTIC")
          .replace(/PACHAGINES/gi, "PACKAGING")
          .replace(/PEANVFACTURING/gi, "MANUFACTURING")
          .replace(/\/MANUFACTURING/gi, "MANUFACTURING")
          .trim();
        console.log("✅ Found Supplier:", supplierName);
        break;
      }
    }
  }

  // =========================================
  // 2. Extract Supplier Address
  // =========================================
  let supplierAddress = null;
  for (const line of lines) {
    const upper = line.toUpperCase();

    if (
      (line.match(/\d{4}/) ||
        upper.includes("SITIO") ||
        upper.includes("BRGY") ||
        upper.includes("SIP") ||
        upper.includes("SAP")) &&
      (upper.includes("ABUHAN") ||
        upper.includes("BAKAHAN") ||
        upper.includes("BAKHAKAN") ||
        upper.includes("SILANG") ||
        upper.includes("SILANE") ||
        upper.includes("CAVITE") ||
        upper.includes("CRUITE") ||
        upper.includes("LAGUNA") ||
        upper.includes("CALAMBA"))
    ) {
      let cleaned = line.split(/Account Name:/i)[0].trim();
      cleaned = cleaned
        .replace(/98EZ/gi, "9862")
        .replace(/SAP ABU/gi, "SITIO ABUHAN")
        .replace(/BAKHAKAN/gi, "BAKAHAN")
        .replace(/MAGUVAKA/gi, "MAGUYAM")
        .replace(/SILANE/gi, "SILANG")
        .replace(/CRUITE/gi, "CAVITE");

      supplierAddress = cleaned;
      console.log("✅ Found Address:", supplierAddress);
      break;
    }
  }

  // =========================================
  // 3. Extract Contact Number
  // =========================================
  let contactNumber = null;
  for (const line of lines) {
    const phoneMatch = line.match(/09\d{2}[-\s]?\d{3}[-\s]?\d{4}/);
    if (phoneMatch) {
      contactNumber = phoneMatch[0].replace(/\s/g, "-");
      console.log("✅ Found Contact:", contactNumber);
      break;
    }
  }

  // =========================================
  // 4. Extract TIN Number
  // =========================================
  let tinNumber = null;
  for (const line of lines) {
    if (line.toUpperCase().includes("TIN")) {
      const tinMatch = line.match(
        /\d{3}[-\s.]?\d{2,3}[-\s.]?\d{3}[-\s.]?\d{5}/
      );
      if (tinMatch) {
        tinNumber = tinMatch[0].replace(/\s/g, "-").replace(/\./g, "-");
        console.log("✅ Found TIN:", tinNumber);
        break;
      }
    }
  }

  // =========================================
  // 5. Extract Terms
  // =========================================
  let terms = null;
  for (const line of lines) {
    const upper = line.toUpperCase();

    if (
      upper.includes("TERMS") ||
      upper.includes("POC") ||
      upper.includes("PAK") ||
      upper.includes("PAVE") ||
      upper.includes("DAVE") ||
      upper.includes("DAY")
    ) {
      const patterns = [
        /(\d+)\s*(?:DAYS?|PAK|PAY|PAVE|DAVE)/i,
        /POC\s*(\d+)/i,
        /TERMS[:\s]*(\d+)/i,
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          terms = `${match[1]} days`;
          console.log("✅ Found Terms:", terms);
          break;
        }
      }

      if (terms) break;
    }
  }

  // =========================================
  // 6. Extract Project Name
  // =========================================
  let projectName = null;
  for (const line of lines) {
    if (line.toUpperCase().includes("PROJECT NAME")) {
      const projectMatch = line.match(/PROJECT NAME[:\s]+(.+?)(?:TIN|$)/i);
      if (projectMatch && projectMatch[1]) {
        projectName = projectMatch[1]
          .replace(/^[_\s-]+/, "")
          .replace(/Name:\s*/i, "")
          .replace(/HKT/gi, "HRT")
          .replace(/MERAL/gi, "METAL")
          .replace(/MEMAL/gi, "METAL")
          .replace(/NIPPON MERAL/gi, "NIPPON METAL")
          .trim();
        console.log("✅ Found Project Name:", projectName);
        break;
      }
    }
  }

  // =========================================
  // 7. Extract Items - FIXED FOR THIS FORMAT
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
    "PLS",
  ];

  const extractedItems: Array<{
    itemName: string | null;
    quantity: number | null;
    unit: string | null;
    unitPrice: number | null;
    size: string | null;
    description: string;
  }> = [];

  // Find where item data starts and ends
  const descIndex = lines.findIndex((l) =>
    l.toUpperCase().includes("DESCRIPTION")
  );
  const endKeywords = [
    "NOTE:",
    "REQUESTED",
    "PREPARED",
    "CHECKED",
    "NOTED",
    "ACCEPTED",
    "PUPCHA",
    "IMPUT",
  ];
  const endIndex = lines.findIndex(
    (l, idx) =>
      idx > descIndex && endKeywords.some((kw) => l.toUpperCase().includes(kw))
  );

  if (descIndex !== -1 && endIndex !== -1) {
    const itemLines = lines.slice(descIndex + 1, endIndex);
    console.log("🔍 Scanning item lines (PO):", itemLines);

    // STRATEGY: Find quantities earlier in the document
    const qtyIndex = lines.findIndex((l) => l.toUpperCase() === "QTY.");
    const quantities: number[] = [];

    if (qtyIndex !== -1) {
      // Look for quantities in next few lines after "QTY." header
      for (let i = qtyIndex + 1; i < Math.min(qtyIndex + 10, descIndex); i++) {
        const qtyMatch = lines[i].match(/^([0-9,]+)$/);
        if (qtyMatch) {
          const qty = parseInt(qtyMatch[1].replace(/,/g, ""), 10);
          quantities.push(qty);
          console.log(`📊 Found quantity in header section: ${qty}`);
        }
      }
    }

    // STRATEGY: Parse item lines for description, unit, price
    let i = 0;
    let currentItem: {
      description: string | null;
      unit: string | null;
      price: number | null;
    } | null = null;

    while (i < itemLines.length) {
      const line = itemLines[i].trim();
      const upper = line.toUpperCase();

      // Skip column headers
      if (
        upper.match(/^(UNIT|UNIT PRICE|TOTAL PRICE|REMARKS|NO\.)$/i) ||
        line.length === 0
      ) {
        console.log("⏭️ Skipping header/empty:", line);
        i++;
        continue;
      }

      // **DETECT UNIT** (standalone line like "PCS")
      const foundUnit = unitWords.find((u) => upper === u || upper === u + ".");
      if (foundUnit) {
        if (currentItem) {
          currentItem.unit = foundUnit;
        }
        console.log(`📦 Found unit: ${foundUnit}`);
        i++;
        continue;
      }

      // **DETECT PRICE** (standalone decimal like "10.10")
      const priceMatch = line.match(/^([\d,]+\.\d{1,2})$/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace(/,/g, ""));
        if (currentItem) {
          currentItem.price = price;
        }
        console.log(`💰 Found unit price: ${price}`);
        i++;
        continue;
      }

      // **DETECT DESCRIPTION** (item name with dimensions)
      if (
        line.length > 5 &&
        !upper.match(/^\d+$/) &&
        line.match(/[A-Z]/i) &&
        !upper.includes("TOTAL")
      ) {
        // If we have a previous item, save it
        if (currentItem && currentItem.description) {
          const qty = quantities.length > 0 ? quantities.shift()! : null;
          const cleaned = currentItem.description
            .replace(/PiE BAG/gi, "P.E BAG")
            .replace(/PIE BAG/gi, "P.E BAG")
            .replace(/PE BAG/gi, "P.E BAG")
            .replace(/110CM/gi, "110 CM")
            .replace(/70 CM/gi, "70CM")
            .replace(/X0,005/gi, "X 0.005")
            .replace(/X0\.005/gi, "X 0.005")
            .trim();

          const sizeMatch = cleaned.match(
            /(\d+\s*CM\s*[xX]\s*\d+\s*CM(?:\s*[xX]\s*[\d.]+)?)/i
          );
          const size = sizeMatch ? sizeMatch[1].toUpperCase() : null;

          const matchedName = matchInventoryItem(cleaned, inventoryItems);

          extractedItems.push({
            itemName: matchedName,
            quantity: qty,
            unit: currentItem.unit || "PCS",
            unitPrice: currentItem.price,
            size,
            description: cleaned,
          });

          console.log(
            `✅ Added item: ${qty || "?"} ${
              currentItem.unit || "PCS"
            } of ${cleaned} @ ${currentItem.price || "N/A"}`
          );
        }

        // Start new item
        currentItem = { description: line, unit: null, price: null };
        console.log(`📝 Found description: ${line}`);
      }

      i++;
    }

    // Save last item if exists
    if (currentItem && currentItem.description) {
      const qty = quantities.length > 0 ? quantities.shift()! : null;
      const cleaned = currentItem.description
        .replace(/PiE BAG/gi, "P.E BAG")
        .replace(/PIE BAG/gi, "P.E BAG")
        .replace(/110CM/gi, "110 CM")
        .replace(/70CM/gi, "70 CM")
        .replace(/X0,005/gi, "X 0.005")
        .trim();

      const sizeMatch = cleaned.match(
        /(\d+\s*CM\s*[xX]\s*\d+\s*CM(?:\s*[xX]\s*[\d.]+)?)/i
      );
      const size = sizeMatch ? sizeMatch[1].toUpperCase() : null;

      const matchedName = matchInventoryItem(cleaned, inventoryItems);

      extractedItems.push({
        itemName: matchedName,
        quantity: qty,
        unit: currentItem.unit || "PCS",
        unitPrice: currentItem.price,
        size,
        description: cleaned,
      });

      console.log(
        `✅ Added item: ${qty || "?"} ${
          currentItem.unit || "PCS"
        } of ${cleaned} @ ${currentItem.price || "N/A"}`
      );
    }
  }

  const result = {
    supplierName,
    supplierAddress,
    contactNumber,
    tinNumber,
    terms,
    projectName,
    items: extractedItems,
  };

  console.log("📦 Final extracted PO fields:", result);
  return result;
}

// Fuzzy matching helper
function matchInventoryItem(description: string, inventoryItems: string[]) {
  if (!description || description.length < 3) return null;

  const cleanDesc = description
    .replace(/\d+\s*CM/gi, "")
    .replace(/[xX]\s*[\d.]+/g, "")
    .replace(/[._-]/g, " ")
    .replace(/\d+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  console.log("🔍 Cleaned description for matching (PO):", cleanDesc);

  let bestMatch = null;
  let bestScore = 0;

  for (const item of inventoryItems) {
    const score = similarity(cleanDesc, item.toUpperCase());
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  console.log(
    `🎯 Best match (PO): "${bestMatch}" (score: ${bestScore.toFixed(2)})`
  );

  return bestScore > 0.25 ? bestMatch : null;
}

function similarity(a: string, b: string) {
  const aTokens = a.split(/\s+/).filter((t) => t.length > 1);
  const bTokens = b.split(/\s+/).filter((t) => t.length > 1);

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
