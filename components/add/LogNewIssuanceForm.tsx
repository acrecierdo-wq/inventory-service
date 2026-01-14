"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import { toast } from "sonner";
import AutoComplete from "../autocomplete/AutoComplete";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import {
  DraftIssuance,
  FormItem,
} from "@/app/warehouse/issuance_log/types/issuance";
import { useUser } from "@clerk/nextjs";
import OCRModeModal from "@/components/modals/OCRModeModal";
import WebcamCaptureModal from "@/components/modals/WebcamCaptureModal";
import { Trash2, Plus, AlertTriangle, CheckCircle } from "lucide-react";

// Type definitions for selections (dropdowns)
type Selection = { id: string | number; name: string };

// Combination of item attributes (size, variant, unit) available in inventory
type Combination = {
  itemId: number;
  sizeId: number | null;
  sizeName: string | null;
  variantId: number | null;
  variantName: string | null;
  unitId: number | null;
  unitName: string | null;
};

// Represents a single row in the item input form
type InputRow = {
  id: string;
  selectedItem: Selection | null;
  selectedSize: Selection | null;
  selectedVariant: Selection | null;
  selectedUnit: Selection | null;
  quantity: string;
  combinations: Combination[]; // Available combinations for the selected item
  availableStock: number | null; // Current stock available for this item configuration
  isLoadingStock: boolean; // Loading state for stock fetch
};

// Component props - supports draft editing
interface Props {
  draftData?: DraftIssuance;
  draftId?: string;
  onSaveSuccess?: () => void;
}



/**
 * NewIssuancePage Component
 *
 * Main form for creating warehouse issuances (outgoing items).
 * Features:
 * - Manual item selection with autocomplete
 * - OCR scanning (webcam or file upload) to auto-populate form
 * - Real-time stock validation
 * - Draft saving capability
 * - Multi-item support with dynamic rows
 */
const NewIssuancePage = ({ draftData, draftId }: Props) => {
  const { user } = useUser();

  // Issuance header information
  //const [client, setClient] = useState<Selection| null>(null); 

  const [clientName, setClientName] = useState(draftData?.clientName || "");
  const [customerPoNumber, setCustomerPoNumber] = useState(draftData?.customerPoNumber || "");
  const [issuedBy, setIssuedBy] = useState(draftData?.issuedBy || "");
  const [deliveryDate, setDeliveryDate] = useState(draftData?.deliveryDate || "");
  const [clientAddress, setClientAddress] = useState(draftData?.clientAddress || "");
  const [referenceNumber, setReferenceNumber] = useState(draftData?.referenceNumber || "");

  const [showSummary, setShowSummary] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // OCR-related states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showOCRModeModal, setShowOCRModeModal] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);

  // const [clientSuggestions, setClientSuggestions] = useState<Clients[]>([]);
  //const [address, setAddress] = useState("");

  const [duplicateErrors, setDuplicateErrors] = useState<string[]>([]);
  // Dynamic input rows for adding items (before they're officially added to the list)
  const [inputRows, setInputRows] = useState<InputRow[]>([
    {
      id: crypto.randomUUID(),
      selectedItem: null,
      selectedSize: null,
      selectedVariant: null,
      selectedUnit: null,
      quantity: "",
      combinations: [],
      availableStock: null,
      isLoadingStock: false,
    },
  ]);

  // Final list of items that will be included in the issuance
  const [items, setItems] = useState<FormItem[]>(
    () =>
      draftData?.items.map((i) => ({
        itemId: String(i.itemId),
        sizeId: i.sizeId !== null ? String(i.sizeId) : null,
        variantId: i.variantId !== null ? String(i.variantId) : null,
        unitId: i.unitId !== null ? String(i.unitId) : null,
        quantity: i.quantity,
        itemName: i.itemName,
        sizeName: i.sizeName,
        variantName: i.variantName,
        unitName: i.unitName,
      })) || []
  );

//   const [confirmData, setConfirmData] = useState<{
//   referenceNumber: string;
//   saveAsDraft: boolean;
// } | null>(null);

  // === OCR HANDLERS ===

  /**
   * Opens the modal to choose between webcam or file upload for OCR
   */
  const handleScanClick = () => {
    setShowOCRModeModal(true);
  };

  /**
   * User chose webcam option - open webcam modal
   */
  const handleSelectWebcam = () => {
    setShowWebcamModal(true);
  };

  /**
   * User chose file upload - trigger hidden file input
   */
  const handleSelectUpload = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles the captured image from webcam
   */
  const handleWebcamCapture = (file: File) => {
    handleOCRFile(file);
  };

  /**
   * Handles file selection from file input
   */
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleOCRFile(file);
    }
    // Reset input so same file can be selected again if needed
    e.target.value = "";
  };

  /**
   * Uploads an image file to Cloudinary CDN
   * Required because OCR.space API needs a publicly accessible URL
   */
  async function uploadToCloudinary(file: File) {
    try {
      // Use server-side API route instead of direct Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Cloudinary upload failed";
        try {
          const errorJson = await res.json();
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // If response is not JSON, try to get text
          const errorText = await res.text().catch(() => "");
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      const json = await res.json();

      if (!json.url) {
        throw new Error("Cloudinary upload succeeded but no URL was returned");
      }

      return json.url as string;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to upload image to Cloudinary");
    }
  }
  /**
   * Main OCR processing function
   * Steps:
   * 1. Upload image to Cloudinary
   * 2. Send Cloudinary URL to our OCR API
   * 3. Extract fields from OCR response
   * 4. Auto-populate form fields (client name, PO number)
   * 5. Create input rows for each detected item
   * 6. Fetch stock levels for all items
   */
  async function handleOCRFile(file: File) {
    setIsScanning(true);
    try {
      // Step 1: Upload image to get a public URL
      const cloudinaryUrl = await uploadToCloudinary(file);
      console.log("☁️ Uploaded to Cloudinary:", cloudinaryUrl);

      // Step 2: Send URL to our OCR API endpoint
      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: cloudinaryUrl }),
      });

      if (!ocrRes.ok) {
        const err = await ocrRes.json().catch(() => null);
        throw new Error(err?.error || "OCR request failed");
      }

      // Step 3: Parse the extracted fields from OCR
      const ocrJson = await ocrRes.json();
      const fields = ocrJson.fields || {};

      // Step 4: Auto-populate header fields if detected
      if (fields.clientName) {
        setClientName(fields.clientName);
        console.log("✅ Auto-filled Client Name:", fields.clientName);
      }

      // ✅ NEW: Auto-populate address
      if (fields.clientAddress) {
        setClientAddress(fields.clientAddress);
        console.log("✅ Auto-filled Address:", fields.clientAddress);
      }

      // ✅ NEW: Auto-populate reference number
      if (fields.referenceNumber) {
        setReferenceNumber(fields.referenceNumber);
        console.log("✅ Auto-filled Reference Number:", fields.referenceNumber);
      }

      if (fields.customerPoNumber) {
        setCustomerPoNumber(fields.customerPoNumber);
        console.log("✅ Auto-filled PO Number:", fields.customerPoNumber);
      }

      if (fields.date) {
        setDeliveryDate(fields.date);
        console.log("✅ Auto-filled Date:", fields.date);
      }

      // Step 5: Create input rows for each detected item
      if (Array.isArray(fields.items) && fields.items.length > 0) {
        const newRows: InputRow[] = [];

        // Process each extracted item and create a pre-filled input row
        for (const extractedItem of fields.items) {
          const row = await createInputRowFromOCR(extractedItem);
          newRows.push(row);
        }

        // Replace current input rows with OCR results
        setInputRows(newRows);

        // Step 6: Fetch stock levels for all items after a brief delay
        // (allows state to update first)
        setTimeout(() => {
          newRows.forEach((row) => {
            if (row.selectedItem) {
              fetchStockForRow(row.id);
            }
          });
        }, 100);

        toast.success(
          `✅ Scanned ${fields.items.length} item(s). Review and add to list.`,
          { duration: 5000 }
        );
      } else {
        toast.info("No items extracted from the receipt.");
      }
    } catch (err) {
      console.error("❌ OCR error:", err);
      toast.error((err as Error)?.message || "OCR scan failed.");
    } finally {
      setIsScanning(false);
    }
  }

  /**
   * Creates a pre-filled input row from OCR-extracted item data
   * Steps:
   * 1. Look up item name using autocomplete API
   * 2. Fetch available combinations (size/variant/unit) for the item
   * 3. Match extracted size/unit with available options
   *
   * @param extractedItem - Raw item data from OCR (name, quantity, unit, size, description)
   * @returns InputRow with as much data pre-filled as possible
   */
  async function createInputRowFromOCR(extractedItem: {
    itemName: string | null;
    quantity: number | null;
    unit: string | null;
    size: string | null;
    description: string;
  }): Promise<InputRow> {
    const { itemName, quantity, unit, size } = extractedItem;

    // Start with an empty row
    const row: InputRow = {
      id: crypto.randomUUID(),
      selectedItem: null,
      selectedSize: null,
      selectedVariant: null,
      selectedUnit: null,
      quantity: quantity ? String(quantity) : "",
      combinations: [],
      availableStock: null,
      isLoadingStock: false,
    };

    // If no item name was extracted, return empty row
    if (!itemName) return row;

    try {
      // Step 1: Search for the item using autocomplete to get the exact item ID
      const acRes = await fetch(
        `/api/autocomplete/item-name?query=${encodeURIComponent(itemName)}`
      );
      if (!acRes.ok) return row;

      const acJson = await acRes.json();
      if (!Array.isArray(acJson) || acJson.length === 0) return row;

      // Get the first (best) match
      const first = acJson[0];
      const itemId =
        typeof first === "string" ? first : first.id || first.value || itemName;
      const itemNameResolved =
        typeof first === "string"
          ? first
          : first.name || first.label || itemName;

      // Set the selected item
      row.selectedItem = { id: itemId, name: itemNameResolved };

      // Step 2: Fetch available combinations for this item
      const combRes = await fetch(
        `/api/inventory-options?itemName=${encodeURIComponent(
          itemNameResolved
        )}`
      );
      if (combRes.ok) {
        const combos = await combRes.json();
        row.combinations = Array.isArray(combos) ? combos : [];

        // Step 3a: Try to match the extracted size with available sizes
        if (size && Array.isArray(combos)) {
          const sizeMatch = combos.find(
            (c: Combination) =>
              c.sizeName &&
              c.sizeName.toUpperCase().includes(size.toUpperCase())
          );
          if (sizeMatch && sizeMatch.sizeId) {
            row.selectedSize = {
              id: String(sizeMatch.sizeId),
              name: sizeMatch.sizeName!,
            };
          }
        }

        // Step 3b: Try to match the extracted unit with available units
        if (unit && Array.isArray(combos)) {
          const unitMatch = combos.find(
            (c: Combination) =>
              c.unitName &&
              c.unitName.toUpperCase().includes(unit.toUpperCase())
          );
          if (unitMatch && unitMatch.unitId) {
            row.selectedUnit = {
              id: String(unitMatch.unitId),
              name: unitMatch.unitName!,
            };
          }
        }
      }
    } catch (err) {
      console.error("❌ Error creating row:", err);
    }

    return row;
  }

  /**
   * Fetches the current available stock for a specific item configuration
   * Uses the item name, size, variant, and unit to find the exact inventory record
   */
  const fetchStockForRow = async (rowId: string) => {
    const row = inputRows.find((r) => r.id === rowId);
    if (!row || !row.selectedItem) return;

    // Show loading indicator
    updateRow(rowId, "isLoadingStock", true);

    try {
      // Build query parameters from selected options
      const params = new URLSearchParams({
        itemName: row.selectedItem.name,
        sizeId: row.selectedSize ? String(row.selectedSize.id) : "",
        variantId: row.selectedVariant ? String(row.selectedVariant.id) : "",
        unitId: row.selectedUnit ? String(row.selectedUnit.id) : "",
      });

      // Find the exact inventory item
      const res = await fetch(`/api/item-find?${params.toString()}`);
      const found = await res.json();

      // If found, fetch its current stock level
      if (found && found.id) {
        const stockRes = await fetch(`/api/items/${found.id}`);
        if (stockRes.ok) {
          const stockData = await stockRes.json();
          updateRow(rowId, "availableStock", stockData.stock);
          console.log(
            `📦 Stock for ${row.selectedItem.name}: ${stockData.stock}`
          );
        }
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
    } finally {
      // Hide loading indicator
      updateRow(rowId, "isLoadingStock", false);
    }
  };

  /**
   * Adds a new empty row to the input form
   */
  const addEmptyRow = () => {
    setInputRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        selectedItem: null,
        selectedSize: null,
        selectedVariant: null,
        selectedUnit: null,
        quantity: "",
        combinations: [],
        availableStock: null,
        isLoadingStock: false,
      },
    ]);
  };

  /**
   * Removes a row from the input form
   * Prevents removing the last row (at least one must remain)
   */
  const removeRow = (rowId: string) => {
    if (inputRows.length === 1) {
      toast.error("Cannot remove the last row.");
      return;
    }
    setInputRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  /**
   * Updates a specific field in a specific input row
   * Generic helper function to avoid repetitive state updates
   */
  const updateRow = (
    rowId: string,
    field: keyof InputRow,
    value: InputRow[keyof InputRow]
  ) => {
    setInputRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  /**
   * Handles item selection change in an input row
   * Responsibilities:
   * 1. Clear dependent fields (size, variant, unit, stock)
   * 2. Fetch available combinations for the selected item
   */
  const handleItemChange = async (rowId: string, item: Selection | null) => {
    // Update the selected item
    updateRow(rowId, "selectedItem", item);

    // Clear all dependent selections
    updateRow(rowId, "selectedSize", null);
    updateRow(rowId, "selectedVariant", null);
    updateRow(rowId, "selectedUnit", null);
    updateRow(rowId, "availableStock", null);

    // If item was cleared, reset combinations
    if (!item) {
      updateRow(rowId, "combinations", []);
      return;
    }

    try {
      // Fetch available combinations (sizes, variants, units) for this item
      const res = await fetch(
        `/api/inventory-options?itemName=${encodeURIComponent(
          String(item.name)
        )}`
      );
      if (!res.ok) {
        updateRow(rowId, "combinations", []);
        return;
      }
      const data: Combination[] = await res.json();
      updateRow(rowId, "combinations", Array.isArray(data) ? data : []);
    } catch {
      updateRow(rowId, "combinations", []);
    }
  };

  /**
   * Handles size selection change
   * Triggers stock fetch because size affects inventory lookup
   */
  const handleSizeChange = async (rowId: string, size: Selection | null) => {
    updateRow(rowId, "selectedSize", size);
    updateRow(rowId, "availableStock", null);
    await fetchStockForRow(rowId);
  };

  /**
   * Handles unit selection change
   * Triggers stock fetch because unit affects inventory lookup
   */
  const handleUnitChange = async (rowId: string, unit: Selection | null) => {
    updateRow(rowId, "selectedUnit", unit);
    updateRow(rowId, "availableStock", null);
    await fetchStockForRow(rowId);
  };

  /**
   * Validates and adds all input rows to the final items list
   * NEW: All-or-nothing validation - if ANY item exceeds stock, NONE are added
   * INCLUDES: Duplicate detection shown inline below items table
   */
  const handleAddAllRows = async () => {
    if (isAdding) return;
    setIsAdding(true);

    // ✅ NEW: Check if there are any non-empty rows first
    const hasNonEmptyRows = inputRows.some((row) => row.selectedItem !== null);

    if (!hasNonEmptyRows) {
      toast.error("Please select at least one item before adding to list.", {
        duration: 3000,
      });
      setIsAdding(false);
      return; // ✅ STOP HERE - No items selected
    }

    // **PHASE 1: VALIDATION PASS - Check ALL items before adding ANY**
    const validatedRows: Array<{
      row: InputRow;
      itemId: string;
      qty: number;
    }> = [];
    const validationErrors: string[] = [];
    const duplicateErrors: string[] = [];

    for (const row of inputRows) {
      // Skip empty rows
      if (!row.selectedItem) continue;

      // Get available sizes for this item
      const availableSizes = Array.from(
        new Map(
          row.combinations
            .filter((c) => c.sizeId != null && c.sizeName)
            .map((c) => [String(c.sizeId), c])
        ).values()
      );

      // Validate size selection if sizes exist
      if (availableSizes.length > 0 && !row.selectedSize) {
        validationErrors.push(
          `❌ "${row.selectedItem.name}": Please select a size.`
        );
        continue;
      }

      // Validate quantity
      if (!row.quantity || Number(row.quantity) <= 0) {
        validationErrors.push(
          `❌ "${row.selectedItem.name}": Please enter a valid quantity.`
        );
        continue;
      }

      const qty = Number(row.quantity);

      // **STRICT STOCK VALIDATION**
      if (row.availableStock === null) {
        validationErrors.push(
          `❌ "${row.selectedItem.name}": Stock information not loaded. Please wait or refresh.`
        );
        continue;
      }

      if (qty > row.availableStock) {
        validationErrors.push(
          `❌ "${row.selectedItem.name}": Requested ${qty} ${
            row.selectedUnit?.name || ""
          }, but only ${row.availableStock} available in stock.`
        );
        continue;
      }

      // Find the exact inventory item ID
      try {
        const params = new URLSearchParams({
          itemName: row.selectedItem.name,
          sizeId: row.selectedSize ? String(row.selectedSize.id) : "",
          variantId: row.selectedVariant ? String(row.selectedVariant.id) : "",
          unitId: row.selectedUnit ? String(row.selectedUnit.id) : "",
        });

        const res = await fetch(`/api/item-find?${params.toString()}`);
        const found = await res.json();

        if (!found || !found.id) {
          validationErrors.push(
            `❌ "${row.selectedItem.name}": Failed to find matching item in inventory.`
          );
          continue;
        }

        // ✅ Check for duplicates in existing items list
        const isDuplicateInExisting = items.some(
          (i) =>
            i.itemId === String(found.id) &&
            (i.sizeId || null) ===
              (row.selectedSize ? String(row.selectedSize.id) : null) &&
            (i.variantId || null) ===
              (row.selectedVariant ? String(row.selectedVariant.id) : null) &&
            (i.unitId || null) ===
              (row.selectedUnit ? String(row.selectedUnit.id) : null)
        );

        if (isDuplicateInExisting) {
          duplicateErrors.push(
            `❌ "${row.selectedItem.name}" (${
              row.selectedSize?.name || "No Size"
            }, ${row.selectedVariant?.name || "No Variant"}, ${
              row.selectedUnit?.name || "No Unit"
            }): This item is already in the list.`
          );
          continue;
        }

        // ✅ Check for duplicates within current input rows being added
        const isDuplicateInBatch = validatedRows.some(
          (validated) =>
            validated.itemId === String(found.id) &&
            (validated.row.selectedSize?.id || null) ===
              (row.selectedSize?.id || null) &&
            (validated.row.selectedVariant?.id || null) ===
              (row.selectedVariant?.id || null) &&
            (validated.row.selectedUnit?.id || null) ===
              (row.selectedUnit?.id || null)
        );

        if (isDuplicateInBatch) {
          duplicateErrors.push(
            `❌ "${row.selectedItem.name}" (${
              row.selectedSize?.name || "No Size"
            }, ${row.selectedVariant?.name || "No Variant"}, ${
              row.selectedUnit?.name || "No Unit"
            }): Duplicate detected in current batch.`
          );
          continue;
        }

        // Store validated row for later processing
        validatedRows.push({
          row,
          itemId: String(found.id),
          qty,
        });
      } catch (err) {
        console.error("Error validating item:", err);
        validationErrors.push(
          `❌ "${row.selectedItem.name}": Error validating item.`
        );
      }
    }

    // **PHASE 2: CHECK VALIDATION RESULTS**
    const allErrors = [...validationErrors, ...duplicateErrors];

    if (allErrors.length > 0) {
      // Store duplicate errors in state to display inline
      setDuplicateErrors(duplicateErrors);

      toast.error(
        `⚠️ Cannot add items: ${allErrors.length} item(s) failed validation. Please fix all issues before adding.`,
        { duration: 8000 }
      );

      setIsAdding(false);
      return; // **STOP HERE - Don't add ANY items**
    }

    // ✅ NEW: Check if we actually have valid items after filtering
    if (validatedRows.length === 0) {
      toast.warning(
        "No valid items to add. Please complete all item details.",
        {
          duration: 4000,
        }
      );
      setIsAdding(false);
      return; // ✅ STOP HERE - No valid items found
    }

    // **PHASE 3: ALL VALIDATIONS PASSED - Add ALL items**
    const newItems: FormItem[] = [];

    for (const { row, itemId, qty } of validatedRows) {
      const candidate: FormItem = {
        itemId,
        sizeId: row.selectedSize ? String(row.selectedSize.id) : null,
        variantId: row.selectedVariant ? String(row.selectedVariant.id) : null,
        unitId: row.selectedUnit ? String(row.selectedUnit.id) : null,
        quantity: qty,
        itemName: row.selectedItem!.name,
        sizeName: row.selectedSize?.name || null,
        variantName: row.selectedVariant?.name || null,
        unitName: row.selectedUnit?.name || null,
      };

      newItems.push(candidate);
    }

    // Add all validated items at once
    setItems((prev) => [...prev, ...newItems]);

    // Clear duplicate errors on success
    setDuplicateErrors([]);

    // Show success message
    toast.success(`✅ Added ${newItems.length} item(s) to list.`, {
      duration: 5000,
    });

    // Reset input rows to single empty row
    setInputRows([
      {
        id: crypto.randomUUID(),
        selectedItem: null,
        selectedSize: null,
        selectedVariant: null,
        selectedUnit: null,
        quantity: "",
        combinations: [],
        availableStock: null,
        isLoadingStock: false,
      },
    ]);

    setIsAdding(false);
  };

  /**
   * Extracts unique sizes from combinations array
   * Returns array of {id, name} objects for autocomplete
   */
  const getAvailableSizes = (combinations: Combination[]) =>
    Array.from(
      new Map(
        combinations
          .filter((c) => c.sizeId != null && c.sizeName)
          .map((c) => [
            String(c.sizeId),
            { id: String(c.sizeId), name: c.sizeName! },
          ])
      ).values()
    );

  /**
   * Extracts unique units from combinations array
   * Filters by selected size if one is chosen
   * Returns array of {id, name} objects for autocomplete
   */
  const getAvailableUnits = (
    combinations: Combination[],
    selectedSize: Selection | null
  ) =>
    Array.from(
      new Map(
        combinations
          .filter((c) => {
            // If a size is selected, only show units for that size
            if (selectedSize) {
              return (
                c.sizeId === Number(selectedSize.id) &&
                c.unitId != null &&
                c.unitName
              );
            }
            // Otherwise, show all units
            return c.unitId != null && c.unitName;
          })
          .map((c) => [
            String(c.unitId),
            { id: String(c.unitId), name: c.unitName! },
          ])
      ).values()
    );

  /**
   * Validates form and opens DR number modal
   * Checks that all required header fields and at least one item are present
   */
  const handleDone = () => {
  console.log("handleDone triggered");
  console.log({
    clientName,
    customerPoNumber,
    clientAddress,
    deliveryDate,
    referenceNumber,
    items,
  });

  if (!clientName) {
    console.warn("Missing clientName");
    toast.error("Please enter a client name.");
    return;
  }

  if (!customerPoNumber) {
    console.warn("Missing customerPoNumber");
    toast.error("Please enter a customer PO number.");
    return;
  }

  if (!clientAddress) {
    console.warn("Missing clientAddress");
    toast.error("Please enter a client address.");
    return;
  }

  if (!deliveryDate) {
    console.warn("Missing deliveryDate");
    toast.error("Please enter a delivery date.");
    return;
  }

  if (!referenceNumber) {
    console.warn("Missing referenceNumber");
    toast.error("Please enter a DR reference number.");
    return;
  }

  if (items.length === 0) {
    console.warn("No items added");
    toast.error("Please add at least one item.");
    return;
  }

  console.log("All validations passed. Showing summary.");
  setShowSummary(true);
};


  /**
   * Saves the issuance to the database
   * Can either create new issuance or update existing draft
   * Handles both "issued" and "draft" statuses
   */

  
 const handleSaveIssuance = async (isDraft?: boolean) => {
  const status = isDraft ? "draft" : "issued";

  // Only validate required fields if not saving as draft
  if (!isDraft && (!clientName || !customerPoNumber || items.length === 0)) {
    toast.error("Please fill in all the required fields.");
    return;
  }
// ✅ NEW: Validate DR number is provided when not draft
    if (!isDraft && !referenceNumber) {
      toast.error("Please enter a DR Number for issued issuances.");
      return;
    }


  const payload = {
    clientName,
    clientAddress,
    referenceNumber,
    customerPoNumber,
    deliveryDate,
    issuedBy,
    saveAsDraft: status,
    items: items.map((i) => ({
      itemId: Number(i.itemId),
      sizeId: i.sizeId ? Number(i.sizeId) : null,
      variantId: i.variantId ? Number(i.variantId) : null,
      unitId: i.unitId ? Number(i.unitId) : null,
      quantity: i.quantity,
    })),
  };

  try {
    const res = await fetch(
      draftId ? `/api/issuances/${draftId}` : "/api/issuances",
      {
        method: draftId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      let errorMessage = "Failed to process issuance.";
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const err = await res.json();
          if (err?.error) errorMessage = err.error;
        }
      } catch {}
      toast.error(errorMessage);
      return;
    }

    const result = await res.json();

    // show warnings if any
    if (result.warning && result.warning.length > 0) {
      result.warning.forEach((w: string, i: number) =>
        setTimeout(() => toast.warning(w), i * 5000)
      );
    }

    // show success toast
    toast.success(isDraft ? "Issuance saved as draft." : "Issuance saved successfully!");

    // Redirect back to issuance log after short delay
    setTimeout(() => {
      window.location.href = "/warehouse/issuance_log";
    }, (result.warning?.length || 0) * 1000 + 500);

  } catch (err) {
    console.error("Issuance error:", err);
    toast.error("Something went wrong while saving the issuance.");
  }
};


  /**
   * Load draft data when component mounts
   */
  useEffect(() => {
    if (draftData) {
      setClientName(draftData.clientName || "");
      setClientAddress(draftData.clientAddress || "");
      setReferenceNumber(draftData.referenceNumber || "");
      setCustomerPoNumber(draftData.customerPoNumber || "");
      setDeliveryDate(draftData.deliveryDate || "");
      setIssuedBy(draftData.issuedBy || "");
      setItems(
        draftData.items.map((i) => ({
          itemId: String(i.itemId),
          sizeId: i.sizeId !== null ? String(i.sizeId) : null,
          variantId: i.variantId !== null ? String(i.variantId) : null,
          unitId: i.unitId !== null ? String(i.unitId) : null,
          quantity: i.quantity,
          itemName: i.itemName,
          sizeName: i.sizeName,
          variantName: i.variantName,
          unitName: i.unitName,
        }))
      );
    }
  }, [draftData]);

  /**
   * Set "issued by" field from logged-in user information
   */
  useEffect(() => {
    if (user) {
      setIssuedBy(
        user.username ||
          user.fullName ||
          user.firstName ||
          user.primaryEmailAddress?.emailAddress ||
          ""
      );
    }
  }, [user]);

    // Fetch client details automatically when client is selected
// useEffect(() => {
//   const fetchClientDetails = async () => {
//     if (!client) {
//       setAddress("");
//       return;
//     }

//     try {
//       const res = await fetch(`/api/admin/clients/${client.id}`);
//       if (res.ok) {
//         const data = await res.json();
//         setAddress(data.address || "");
//       }
//     } catch (err) {
//       console.error("Failed to fetch client details", err);
//     }
//   };

//   fetchClientDetails();
// }, [client]);


  return (
    <WarehousemanClientComponent>
      <main className="bg-[#ffedce] w-full min-h-screen ">
        <Header />
        <section className="p-10 max-w-6xl mx-auto">
          <form className="grid grid-cols-1 mt-18 gap-4 bg-white p-6 rounded shadow">
            {/* ✅ UPDATED: Reduced to 3 columns per row (removed dispatcher and PRF) */}
            <div className="grid grid-cols-3 gap-4">
              {/* Row 1: Client Name, Client Address, Reference Number */}
              <div>
<div>
  <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
    Client Name
  </label>
  <input
    type="text"
    value={clientName}
    onChange={(e) => setClientName(e.target.value)}
    className="w-full border border-[#d2bda7] p-2 rounded"
    placeholder="Enter client name"
  />
</div>

              </div>

          {/* Address */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1 text-[#482b0e]">
              Address
            </label>
            <input
  type="text"
  value={clientAddress}
  onChange={(e) => setClientAddress(e.target.value)}
  className="border border-[#d2bda7] p-2 rounded w-full text-xs sm:text-sm"
  placeholder="Enter client address"
/>

          </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                  Reference Number:
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full border border-[#d2bda7] p-2 rounded"
                  placeholder="e.g., 0036535"
                />
              </div>

              {/* Row 2: Customer PO Number, Delivery Date, (empty space) */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                  Customer PO Number:
                </label>
                <input
                  type="text"
                  value={customerPoNumber}
                  onChange={(e) => setCustomerPoNumber(e.target.value)}
                  className="w-full border border-[#d2bda7] p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                  Delivery Date:
                </label>
                <input
                  type="text"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full border border-[#d2bda7] p-2 rounded"
                  placeholder="e.g., November 20, 2024"
                />
              </div>

              {/* Empty third column to maintain grid */}
              <div></div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#482b0e]">
                Logged by: {issuedBy}
              </label>
            </div>

            {/* Items section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#173f63]">
                  ITEMS TO ISSUE
                </h2>
                <button
                  type="button"
                  onClick={handleScanClick}
                  disabled={isScanning}
                  className={`px-3 py-2 text-sm rounded text-white flex items-center gap-2 ${
                    isScanning
                      ? "bg-[#0b74ff] opacity-50 cursor-not-allowed"
                      : "bg-[#0b74ff] hover:bg-[#0966d6] cursor-pointer"
                  }`}
                >
                  {isScanning ? "Scanning..." : "Scan via OCR"}
                </button>
              </div>

              {/* Dynamic input rows */}
              <div className="space-y-4">
                {inputRows.map((row, index) => {
                  const availableSizes = getAvailableSizes(row.combinations);
                  const availableUnits = getAvailableUnits(
                    row.combinations,
                    row.selectedSize
                  );

                  const qty = Number(row.quantity) || 0;
                  const hasStock = row.availableStock !== null;
                  const isOverStock = hasStock && qty > row.availableStock!;
                  const isValidStock = hasStock && qty <= row.availableStock!;

                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-start p-4 border border-[#d2bda7] rounded bg-gray-50"
                    >
                      <div className="md:col-span-2 lg:col-span-1">
                        <AutoComplete
                          label="Item Name"
                          endpoint="/api/autocomplete/item-name"
                          value={row.selectedItem}
                          onChange={(item) => handleItemChange(row.id, item)}
                        />
                      </div>

                      <div>
                        <AutoComplete
                          label="Size"
                          options={availableSizes}
                          value={row.selectedSize}
                          onChange={(size) => handleSizeChange(row.id, size)}
                          disabled={availableSizes.length === 0}
                        />
                      </div>

                      <div>
                        <AutoComplete
                          label="Variant"
                          options={[]}
                          value={row.selectedVariant}
                          onChange={(variant) =>
                            updateRow(row.id, "selectedVariant", variant)
                          }
                          disabled
                        />
                      </div>

                      <div>
                        <AutoComplete
                          label="Unit"
                          options={availableUnits}
                          value={row.selectedUnit}
                          onChange={(unit) => handleUnitChange(row.id, unit)}
                          disabled={availableUnits.length === 0}
                        />
                      </div>

                      <div className="relative">
                        <label className="text-sm font-semibold mb-1 text-[#482b0e]">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) =>
                            updateRow(row.id, "quantity", e.target.value)
                          }
                          className={`w-full border p-2 rounded ${
                            isOverStock
                              ? "border-red-500 bg-red-50"
                              : "border-[#d2bda7]"
                          }`}
                        />

                        {/* Loading indicator while fetching stock */}
                        {row.isLoadingStock && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className="animate-spin">⏳</span> Checking
                            stock...
                          </div>
                        )}

                        {/* Stock validation messages */}
                        {hasStock && qty > 0 && (
                          <div
                            className={`text-xs mt-1 flex items-center gap-1 ${
                              isOverStock ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {isOverStock ? (
                              <>
                                <AlertTriangle size={14} />
                                <span className="font-semibold">
                                  Exceeds stock! Only {row.availableStock}{" "}
                                  available
                                </span>
                              </>
                            ) : isValidStock ? (
                              <>
                                <CheckCircle size={14} />
                                <span>
                                  Stock available: {row.availableStock}
                                </span>
                              </>
                            ) : null}
                          </div>
                        )}

                        {/* Show available stock when quantity is zero */}
                        {hasStock && qty === 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Available: {row.availableStock}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-6">
                        {/* Show remove button if more than one row exists */}
                        {inputRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                            title="Remove Row"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                        {/* Show add button only on last row */}
                        {index === inputRows.length - 1 && (
                          <button
                            type="button"
                            onClick={addEmptyRow}
                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                            title="Add Row"
                          >
                            <Plus size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* NEW: Display duplicate errors inline below input rows */}
              {duplicateErrors.length > 0 && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className="text-red-600 mt-0.5 flex-shrink-0"
                      size={20}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-red-800 mb-2">
                        ⚠️ Duplicate Items Detected
                      </h4>
                      <ul className="space-y-1">
                        {duplicateErrors.map((error, idx) => (
                          <li key={idx} className="text-sm text-red-700">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddAllRows}
                disabled={isAdding}
                className="mt-5 bg-[#674d33] px-4 py-2 text-sm rounded-full hover:bg-[#d2bda7] text-white font-medium cursor-pointer disabled:opacity-50"
              >
                {isAdding ? "Adding..." : "Add Items to List"}
              </button>

              {/* Hidden file input for OCR image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />

              {/* Display table of items that have been added to the final list */}
              {items.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">Items Added</h3>
                  <table className="w-full border text-sm">
                    <thead className="bg-[#f5e6d3]">
                      <tr>
                        <th className="border px-2 py-1">Item Name</th>
                        <th className="border px-2 py-1">Size</th>
                        <th className="border px-2 py-1">Variant</th>
                        <th className="border px-2 py-1">Unit</th>
                        <th className="border px-2 py-1">Quantity</th>
                        <th className="border px-2 py-1">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={`${item.itemId}-${idx}`}>
                          <td className="border px-2 py-1">{item.itemName}</td>
                          <td className="border px-2 py-1">
                            {item.sizeName || "(None)"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.variantName || "(None)"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.unitName || "(None)"}
                          </td>
                          <td className="border px-2 py-1">{item.quantity}</td>
                          <td className="border px-2 py-1">
                            <button
                              type="button"
                              className="text-red-500 text-xs hover:underline"
                              onClick={() =>
                                setItems(items.filter((_, i) => i !== idx))
                              }
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Form action buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </form>

          {/* Modal for entering DR (Delivery Receipt) number */}
          {/* {showDRModal && (
            <DRModal
              onClose={() => setShowDRModal(false)}
              onConfirm={(data) => {
                setDrInfo(data);
                setShowDRModal(false);
                setShowSummary(true);
              }}
            />
          )} */}

          {/* ✅ UPDATED: Removed dispatcher from summary modal */}
          {showSummary && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
              <div className="bg-white w-[600px] p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4 text-[#173f63]">
                  Confirm Issuance
                </h2>
                <p className="mb-2 text-sm">
                  <span className="font-semibold">Client:</span> {clientName}
                </p>
                {clientAddress && (
                  <p className="mb-2 text-sm">
                    <span className="font-semibold">Address:</span>{" "}
                    {clientAddress}
                  </p>
                )}
                {referenceNumber && (
                  <p className="mb-2 text-sm">
                    <span className="font-semibold">D.R. Reference No:</span>{" "}
                    {referenceNumber}
                  </p>
                )}
                {deliveryDate && (
                  <p className="mb-2 text-sm">
                    <span className="font-semibold">Delivery Date:</span>{" "}
                    {deliveryDate}
                  </p>
                )}
                <p className="mb-2 text-sm">
                  <span className="font-semibold">PO Number:</span>{" "}
                  {customerPoNumber}
                </p>
                

                <table className="w-full mt-4 text-sm border">
                  <thead className="bg-[#f5e6d3]">
                    <tr>
                      <th className="border px-2 py-1">Item</th>
                      <th className="border px-2 py-1">Size</th>
                      <th className="border px-2 py-1">Variant</th>
                      <th className="border px-2 py-1">Unit</th>
                      <th className="border px-2 py-1">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{item.itemName}</td>
                        <td className="border px-2 py-1">
                          {item.sizeName || "(None)"}
                        </td>
                        <td className="border px-2 py-1">
                          {item.variantName || "(None)"}
                        </td>
                        <td className="border px-2 py-1">
                          {item.unitName || "(None)"}
                        </td>
                        <td className="border px-2 py-1">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveIssuance(true)} // Save as Draft
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                  >
                    Save as Draft
                  </button>

                  <button
                    onClick={() => handleSaveIssuance(false)} // Final Issuance
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    Save Issuance
                  </button>


                </div>
              </div>
            </div>
          )}

          {/* Modal for choosing OCR mode (webcam vs file upload) */}
          {showOCRModeModal && (
            <OCRModeModal
              onClose={() => setShowOCRModeModal(false)}
              onSelectWebcam={handleSelectWebcam}
              onSelectUpload={handleSelectUpload}
            />
          )}

          {/* Modal for capturing image via webcam */}
          {showWebcamModal && (
            <WebcamCaptureModal
              onClose={() => setShowWebcamModal(false)}
              onCapture={handleWebcamCapture}
            />
          )}
        </section>
      </main>
    </WarehousemanClientComponent>
  );
};

export default NewIssuancePage;
