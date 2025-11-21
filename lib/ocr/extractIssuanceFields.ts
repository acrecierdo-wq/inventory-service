export function extractIssuanceFields(parsedText: string, inventoryItems: string[]) {
  const text = parsedText.toUpperCase().replace(/\s+/g, " ").trim();

  // =========================================
  // 1. Extract Quantity + Unit
  // =========================================

  const unitWords = [
    "PCS", "PC", "PIECES", "ROLL", "ROLLS", "PACK", "PACKS",
    "BOX", "BOXES", "SET", "SETS", "SACK", "SACKS", "BAG", "BAGS",
    "TUBE", "LTR", "LITER", "KG", "METER", "METERS", "FT", "FEET"
  ];

  const unitRegex = new RegExp(`(\\d{1,3}(?:,\\d{3})*|\\d+)\\s*(${unitWords.join("|")})`, "i");
  const qtyMatch = text.match(unitRegex);

  let quantity = null;
  let unit = null;

  if (qtyMatch) {
    quantity = qtyMatch[1].replace(/,/g, "");
    unit = qtyMatch[2].toUpperCase();
  }

  // =========================================
  // 2. Extract dimensional size (110CM X 70CM)
  // =========================================

  const dimensionRegex =
    /(\d+\.?\d*)\s*(CM|MM|M|FT|IN)?\s*[Xx]\s*(\d+\.?\d*)\s*(CM|MM|M|FT|IN)?(?:\s*[Xx]\s*(\d+\.?\d*))?/;

  const dimensionMatch = text.match(dimensionRegex);
  let dimensionalSize = dimensionMatch ? dimensionMatch[0] : null;

  // =========================================
  // 3. Extract category size (Small/Medium/Large/etc.)
  // =========================================

  const categorySizes = ["XS", "S", "SMALL", "M", "MEDIUM", "L", "LARGE", "XL", "XXL", "MINI", "JUMBO"];
  const categorySizeFound = categorySizes.find(s => text.includes(s)) || null;

  // =========================================
  // 4. Extract variant (colors only)
  // =========================================

  const variants = [
    "RED", "BLUE", "GREEN", "BLACK", "WHITE", "YELLOW",
    "CLEAR", "TRANSPARENT", "ORANGE", "PINK", "VIOLET", "GRAY", "BROWN"
  ];

  const variantFound = variants.find(v => text.includes(v)) || null;

  // =========================================
  // 5. Extract description line
  // =========================================

  const lines = text.split("\n").map(l => l.trim());
  const descriptionCandidate = lines.reduce((longest, line) => {
    if (
      line.length > longest.length &&
      !/^\d+(\.\d+)?$/.test(line) &&
      !line.includes("PRICE")
    ) {
      return line;
    }
    return longest;
  }, "");

  // =========================================
  // 6. Match to inventory item name
  // =========================================

  const probableItem = matchInventoryItem(descriptionCandidate, inventoryItems);

  return {
    itemName: probableItem,
    quantity,
    unit,
    size: dimensionalSize || categorySizeFound || null,
    variant: variantFound,
    description: descriptionCandidate
  };
}

// ==============================
// Fuzzy matching (simple token-based)
// ==============================

function matchInventoryItem(description: string, inventoryItems: string[]) {
  let bestMatch = null;
  let bestScore = 0;

  for (const item of inventoryItems) {
    const score = similarity(description, item.toUpperCase());
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore > 0.2 ? bestMatch : null;
}

function similarity(a: string, b: string) {
  const aTokens = a.split(" ");
  const bTokens = b.split(" ");

  let matches = 0;
  aTokens.forEach(t => {
    if (bTokens.includes(t)) matches++;
  });

  return matches / Math.max(aTokens.length, bTokens.length);
}
