// app/components/add/LogNewIssuanceForm.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import DRModal from "@/app/warehouse/issuance_log/dr_modal";
import { toast } from "sonner";
import AutoComplete from "../autocomplete/AutoComplete";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { DraftIssuance, FormItem } from "@/app/warehouse/issuance_log/types/issuance";
import { useUser } from "@clerk/nextjs";

type Selection = { id: string | number; name: string };

type Issuance = {
  id: string;
}

type Combination = {
  itemId: number;
  sizeId: number | null;
  sizeName: string | null;
  variantId: number | null;
  variantName: string | null;
  unitId: number | null;
  unitName: string | null;
};

interface Props {
  draftData?: DraftIssuance;
  draftId?: string;
  onSaveSuccess?: () => void;
};

const NewIssuancePage = ({ draftData, draftId, onSaveSuccess }: Props) => {
  const { user } = useUser();
  const [issuance, setIssuance] = useState<Issuance>({ id: "" });
  const [clientName, setClientName] = useState(draftData?.clientName || "");
  const [dispatcherName, setDispatcherName] = useState(draftData?.dispatcherName || "");
  const [customerPoNumber, setCustomerPoNumber] = useState(draftData?.customerPoNumber ||"");
  const [prfNumber, setPrfNumber] = useState(draftData?.prfNumber ||"");
  const [issuedBy, setIssuedBy] = useState(draftData?.issuedBy ||"");
  const [showDRModal, setShowDRModal] = useState(false);
  const [drInfo, setDrInfo] = useState<{ drNumber: string; saveAsDraft: boolean } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [items, setItems] = useState<FormItem[]>(() => 
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

  const [newItem, setNewItem] = useState<FormItem>({
      itemId: "",
      sizeId: null,
      variantId: null,
      unitId: null,
      quantity: 0,
      itemName: "",
      sizeName: null,
      variantName: null,
      unitName: null,
    });
  
  console.log("New items:", newItem);

  // UI selections
  const [selectedItem, setSelectedItem] = useState<Selection | null>(null);
  const [selectedSize, setSelectedSize] = useState<Selection | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Selection | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Selection | null>(null);
  const [quantity, setQuantity] = useState<string>("");

  // raw row-level combos returned by API
  const [combinations, setCombinations] = useState<Combination[]>([]);

  // Derived option arrays (unique and filtered)
  const availableSizes = Array.from(
    new Map(
      combinations
        .filter((c) => c.sizeId != null && c.sizeName)
        .map((c) => [String(c.sizeId), { id: String(c.sizeId), name: c.sizeName! }])
    ).values()
  );

  const availableVariants = Array.from(
    new Map(
      combinations
        .filter((c) => (!selectedSize || c.sizeId === Number(selectedSize.id)) && c.variantId != null && c.variantName)
        .map((c) => [String(c.variantId), { id: String(c.variantId), name: c.variantName! }])
    ).values()
  );

  const availableUnits = Array.from(
    new Map(
      combinations
        .filter((c) => {
          // units must match selected size and selected variant (if provided)
          if (selectedSize && selectedVariant) {
            return c.sizeId === Number(selectedSize.id) && c.variantId === Number(selectedVariant.id) && c.unitId != null && c.unitName;
          }
          // if variant isn't chosen yet (but size is), show units for size across variants
          if (selectedSize && !selectedVariant) {
            return c.sizeId === Number(selectedSize.id) && c.unitId != null && c.unitName;
          }
          // otherwise show all units (fallback)
          return c.unitId != null && c.unitName;
        })
        .map((c) => [String(c.unitId), { id: String(c.unitId), name: c.unitName! }])
    ).values()
  );

  // debug-like object similar to previous UI
useEffect(() => {
    setNewItem((prev) => ({
      ...prev,
      itemId: selectedItem ? String(selectedItem.id) : "",
      itemName: selectedItem?.name || "",
      sizeId: selectedSize ? String(selectedSize.id) : null,
      sizeName: selectedSize?.name || null,
      variantId: selectedVariant ? String(selectedVariant.id) : null,
      variantName: selectedVariant?.name || null,
      unitId: selectedUnit ? String(selectedUnit.id) : null,
      unitName: selectedUnit?.name || null,
      quantity: Number(quantity) || 0,
    }));
  }, [selectedItem, selectedSize, selectedVariant, selectedUnit, quantity]);

  // When an item is selected (from item-name autocomplete), fetch row-level combos
  useEffect(() => {
    if (!selectedItem) {
      setCombinations([]);
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
      return;
    }

    const fetchOptions = async () => {
      try {
        // pass itemName so API aggregates across all itemIds that share the same name
        const res = await fetch(`/api/inventory-options?itemName=${encodeURIComponent(String(selectedItem.name))}`);
        if (!res.ok) {
          console.warn("inventory-options returned non-ok status");
          setCombinations([]);
          return;
        }
        const data: Combination[] = await res.json();
        setCombinations(Array.isArray(data) ? data : []);
      } catch {
        console.error("Failed to fetch inventory options:");
        setCombinations([]);
      }
      // reset dependent selections when item changes
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
    };

    fetchOptions();
  }, [selectedItem]);

  useEffect(() => {
      console.log("Available Sizes:", availableSizes);
      console.log("Available Variants:", availableVariants);
      console.log("Available Units:", availableUnits);
  }, [availableSizes, availableVariants, availableUnits]);

  useEffect(() => {
    setSelectedVariant(null);
    setSelectedUnit(null);
  }, [selectedSize]);

  useEffect(() => {
    setSelectedUnit(null);
  }, [selectedVariant])

  // Auto-select single options where useful and keep selections valid
  useEffect(() => {
    if (!selectedItem) {
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
      return;
    }

    if (availableSizes.length === 1 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }

    if(selectedSize && availableVariants.length === 1 && !selectedVariant) {
      setSelectedVariant(availableVariants[0]);
    }

    if (selectedSize && selectedVariant && availableUnits.length === 1 && !selectedUnit) {
      setSelectedUnit(availableUnits[0]);
    }
  }, [selectedItem, availableSizes, availableVariants, availableUnits, selectedSize, selectedVariant, selectedUnit]);

  useEffect(() => {
    if (selectedSize && !availableSizes.some((s) => String(s.id) === String(selectedSize.id))) {
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
    }

    if (selectedVariant && !availableVariants.some((v) => String(v.id) === String(selectedVariant.id))) {
      setSelectedVariant(null);
      setSelectedUnit(null);
    }

    if (selectedUnit && !availableUnits.some((u) => String(u.id) === String(selectedUnit.id))) {
      setSelectedUnit(null);
    }
  }, [selectedSize, selectedVariant, selectedUnit, availableSizes, availableVariants, availableUnits]);

// Attempts direct unsigned Cloudinary upload first, otherwise falls back to POST /api/cloudinary/upload
async function uploadToCloudinary(file: File) {
  // Try unsigned upload using client-side preset (fast, no server roundtrip)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const unsignedPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && unsignedPreset) {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", unsignedPreset);

    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) throw new Error("Cloudinary upload failed (unsigned)");
    const json = await res.json();
    return json.secure_url as string;
  }

  // Fallback: your server side upload endpoint - implement if you already have one.
  // It should accept FormData with `file` and return { url: string }
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/cloudinary/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error("Server upload failed: " + txt);
    }
    const json = await res.json();
    if (!json.url) throw new Error("Server upload response missing url");
    return json.url as string;
  } catch (err) {
    throw err;
  }
}

// Core OCR flow: upload -> call /api/ocr -> apply results to UI
async function handleOCRFile(file: File) {
  setIsScanning(true);
  try {
    // 1) upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file);

    // 2) call your OCR API route
    const ocrRes = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: cloudinaryUrl }),
    });

    if (!ocrRes.ok) {
      const err = await ocrRes.json().catch(() => null);
      throw new Error(err?.error || "OCR request failed");
    }

    const ocrJson = await ocrRes.json();

    // ocrJson.fields expected shape:
    // { itemName, quantity, unit, size, variant, description }
    const fields = ocrJson.fields || {};
    const extractedName = fields.itemName || fields.description || "";
    const extractedSize = fields.size || null;
    const extractedVariant = fields.variant || null;
    const extractedUnit = fields.unit || null;
    const extractedQty = fields.quantity ? String(fields.quantity) : "";

    // 3) try to auto-select item by calling your autocomplete endpoint
    // Your AutoComplete component expects selection object { id, name }
    let matchedSelection: Selection | null = null;
    if (extractedName) {
      try {
        // If your autocomplete endpoint returns an array of suggestions, use the first match.
        const q = encodeURIComponent(extractedName);
        const acRes = await fetch(`/api/autocomplete/item-name?query=${q}`);
        if (acRes.ok) {
          const acJson = await acRes.json();
          // If your endpoint returns different shape, adapt this check.
          if (Array.isArray(acJson) && acJson.length > 0) {
            const first = acJson[0];
            matchedSelection = { id: first.id ?? first.value ?? first.key ?? first.name, name: first.name ?? first.value ?? first.key ?? extractedName };
          }
        }
      } catch (e) {
        console.warn("autocomplete lookup failed", e);
      }
    }

    // 4) If matchedSelection found, setSelectedItem which triggers fetching combinations (existing useEffect)
    if (matchedSelection) {
      setSelectedItem(matchedSelection);

      // Wait for combinations to load by explicitly fetching inventory-options (so we can set size/variant/unit)
      try {
        const combRes = await fetch(`/api/inventory-options?itemName=${encodeURIComponent(matchedSelection.name)}`);
        if (combRes.ok) {
          const combos: Combination[] = await combRes.json();
          setCombinations(Array.isArray(combos) ? combos : []);

          // Try to pick size/variant/unit from combos using extracted tokens
          if (extractedSize) {
            const s = combos.find(c => c.sizeName && c.sizeName.toUpperCase().includes(String(extractedSize).toUpperCase()));
            if (s) setSelectedSize({ id: String(s.sizeId), name: s.sizeName! });
          }

          if (extractedVariant) {
            const v = combos.find(c => c.variantName && c.variantName.toUpperCase().includes(String(extractedVariant).toUpperCase()));
            if (v) setSelectedVariant({ id: String(v.variantId), name: v.variantName! });
          }

          if (extractedUnit) {
            const u = combos.find(c => c.unitName && c.unitName.toUpperCase().includes(String(extractedUnit).toUpperCase()));
            if (u) setSelectedUnit({ id: String(u.unitId), name: u.unitName! });
          }

          // If size or variant not auto-picked above, attempt to auto-select single options (keeps current UX logic)
          // (Your existing auto-select effect will pick single options if available)
        }
      } catch (e) {
        console.warn("Failed to fetch combos after OCR:", e);
      }
    } else if (extractedName) {
      // If no match returned from autocomplete, set the AutoComplete value to the raw text so user can review
      setSelectedItem({ id: extractedName, name: extractedName });
      // Also attempt to load combos by description (may return nothing)
      try {
        const combRes = await fetch(`/api/inventory-options?itemName=${encodeURIComponent(extractedName)}`);
        if (combRes.ok) {
          const combos: Combination[] = await combRes.json();
          setCombinations(Array.isArray(combos) ? combos : []);
        }
      } catch (e) {
        console.warn("Failed to fetch combos for raw description:", e);
      }
    }

    // 5) Set quantity
    if (extractedQty) setQuantity(String(extractedQty));

    // 6) show quick success
    toast.success("OCR scanned. Please review selections and add the item.");
  } catch (err: any) {
    console.error("OCR flow error:", err);
    toast.error(err?.message || "OCR scan failed. Please try again.");
  } finally {
    setIsScanning(false);
  }
}

// Triggered by hidden file input
function triggerFileInput() {
  fileInputRef.current?.click();
}

async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  await handleOCRFile(file);
  // reset input so same file can be selected again if needed
  e.currentTarget.value = "";
}

  // Add item: consult item-find (which resolves correct item id) then push to list
  const handleAddItem = async () => {
    if (isAdding) return;
    setIsAdding(true);

    // Basic validations: require item, require size/variant/unit depending on options
    if (!selectedItem) {
      toast.error("Please select an item.");
      setIsAdding(false);
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Please select a size.");
      setIsAdding(false);
      return;
    }
    if (availableVariants.length > 0 && !selectedVariant) {
      toast.error("Please select a variant.");
      setIsAdding(false);
      return;
    }
    if (availableUnits.length > 0 && !selectedUnit) {
      toast.error("Please select a unit.");
      setIsAdding(false);
      return;
    }
    if (!quantity || Number(quantity) <= 0 || isNaN(Number(quantity))) {
      toast.error("Please enter a valid quantity.");
      setIsAdding(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        itemName: selectedItem.name,
        sizeId: selectedSize ? String(selectedSize.id) : "",
        variantId: selectedVariant ? String(selectedVariant.id) : "",
        unitId: selectedUnit ? String(selectedUnit.id) : "",
      });

      // item-find should return the specific item id that matches the combination
      const res = await fetch(`/api/item-find?${params.toString()}`);
      const found = await res.json();

      if (!found || !found.id) {
        toast.error("Failed to find matching item in inventory.");
        setIsAdding(false);
        return;
      }

      const stockRes = await fetch(`/api/items/${found.id}`);
      if (!stockRes.ok) {
        toast.error("Failed to fetch stock for item.");
        setIsAdding(false);
        return;
      }
      const stockData = await stockRes.json();
      const qty = Number(quantity);

      // warn user before adding items
      if (qty > stockData.stock) {
        toast.warning(`⚠️ Understock:"${selectedItem.name}" currently has only ${stockData.stock} in stock. You are issuing ${qty}.`, { duration: 10000 });
        setIsAdding(false);
        setSelectedItem(null);
        setSelectedSize(null);
        setSelectedVariant(null);
        setSelectedUnit(null);
        setQuantity("");
        return;
      }
      
      if (stockData.stock - qty <= stockData.criticalLevel) {
        toast.warning(`⚠️ "${selectedItem.name}" will be at critical level after this issuance.`, { duration: 10000 });
      } else if (stockData.stock - qty <= stockData.reorderLevel) {
        toast.warning(`⚠️ "${selectedItem.name}" will be at reorder level after this issuance.`, { duration: 10000 });
      } 

      const candidate: FormItem = {
        itemId: String(found.id),
        sizeId: selectedSize ? String(selectedSize.id) : null,
        variantId: selectedVariant ? String(selectedVariant.id) : null,
        unitId: selectedUnit ? String(selectedUnit.id) : null,
        quantity: Number(quantity),
        itemName: selectedItem.name,
        sizeName: selectedSize?.name || null,
        variantName: selectedVariant?.name || null,
        unitName: selectedUnit?.name || null,
      };

      const isDuplicate = items.some(
        (i) =>
          i.itemId === candidate.itemId &&
          (i.sizeId || null) === (candidate.sizeId || null) &&
          (i.variantId || null) === (candidate.variantId || null) &&
          (i.unitId || null) === (candidate.unitId || null)
      );

      if (isDuplicate) {
        toast.error("This item with the selected options is already added.");
        setIsAdding(false);
        return;
      }

      setItems((prev) => [...prev, candidate]);

      // Reset selections for next entry
      setSelectedItem(null);
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
      setQuantity("");
    } catch (err) {
      console.error("Item-find error:", err);
      toast.error("Something went wrong while adding the item.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDone = () => {
    if (!clientName) {
      toast.error("Please enter a client name.");
      return;
    }

    if (!dispatcherName) {
      toast.error("Please enter a dispatcher name.");
      return;
    }

    if (!customerPoNumber) {
      toast.error("Please enter a customer PO number.");
      return;
    }

    if (!prfNumber) {
      toast.error("Please enter a PRF number.");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }

    setShowDRModal(true);
  };

  const handleSaveIssuance = async () => {
    if (!drInfo) return;
    if (!clientName || !dispatcherName || !customerPoNumber || !prfNumber || items.length === 0) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const payload = {
      clientName,
      dispatcherName,
      customerPoNumber,
      prfNumber,
      issuedBy,
      drNumber: drInfo.drNumber,
      saveAsDraft: drInfo.saveAsDraft ? "draft" : "issued",
      items: items.map((i) => ({
        itemId: Number(i.itemId),
        sizeId: i.sizeId ? Number(i.sizeId) : null,
        variantId: i.variantId ? Number(i.variantId) : null,
        unitId: i.unitId ? Number(i.unitId) : null,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch(draftId ? `/api/issuances/${draftId}` : "/api/issuances", {
        method: draftId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Attempt to parse error JSON like you had
        let errorMessage = "Failed to process issuance.";

        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const err = await res.json();
            if (err?.error) errorMessage = err.error;
          }
        } catch (e) {
          console.log(e);
          /* ignore parse error */
        }
        toast.error(errorMessage);
        return;
      }

      const result = await res.json();

      if (result.issuanceRef) {
    setIssuance(result.issuance);
  }

      if (result.warning && result.warning.length > 0) {
        result.warning.forEach((w: string, i: number) => {
          setTimeout(() => toast.warning(w), i * 5000);
        });
      }

      setTimeout(() => {
        toast.success(drInfo.saveAsDraft ? "Issuance saved as draft." : "Issuance saved successfully!");
        onSaveSuccess?.();
        setTimeout(() => {
          window.location.href = "/warehouse/issuance_log";
        }, 1500);
      }, (result.warning?.length || 0) * 1000);
    } catch (err) {
      console.error("Issuance error:", err);
      toast.error("Something went wrong while saving the issuance.");
    }
  };

  useEffect(() => {
    if (draftData) {
      setClientName(draftData.clientName || "");
      setDispatcherName(draftData.dispatcherName || "");
      setCustomerPoNumber(draftData.customerPoNumber || "");
      setPrfNumber(draftData.prfNumber || "");
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

  useEffect(() => {
  if (user) {
    setIssuedBy(
      user.username || user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || ""
    );
  }
}, [user]);


  //const MAX_QUANTITY = 9999;

  const sanitizeToDigits = (input: string) => {
    const digits = input.replace(/\D+/g, "");
    if (digits === "") return "";
    const parsed = parseInt(digits, 10);
    return Number.isNaN(parsed) ? "" : parsed;
  };

  

  return (
    <WarehousemanClientComponent>
      <main className="bg-[#ffedce] w-full min-h-screen">
        <Header />
        <section className="p-10 max-w-4xl mx-auto">
          <div className="flex flex-row justify-between">
            {/* <h1 className="text-3xl font-bold text-[#173f63] mb-2">Log Item Issuance</h1> */}
            <p className="text-md font-bold text-[#173f63]">Issuance Ref: {issuance.id}</p>
          </div>

          <form className="grid grid-cols-1 gap-4 bg-white p-6 rounded shadow">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Client Name:</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            {/* Dispatcher Name */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Dispatcher Name:</label>
              <input
                type="text"
                value={dispatcherName}
                onChange={(e) => setDispatcherName(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            {/* Customer PO Number */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Customer PO Number:</label>
              <input
                type="text"
                value={customerPoNumber}
                onChange={(e) => setCustomerPoNumber(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            {/* PRF Number */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">PRF Number:</label>
              <input
                type="text"
                value={prfNumber}
                onChange={(e) => setPrfNumber(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Logged by: {issuedBy}</label>
            </div>

            {/* Add Item Section */}
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-bold mb-2 text-[#173f63] text-center uppercase">Items to Issue</h2>

              <div className="grid grid-cols-5 gap-2 items-end">
                {/* Item Name */}
                <div>
                  <AutoComplete
                    label="Item Name"
                    endpoint="/api/autocomplete/item-name"
                    value={selectedItem}
                    onChange={(item) => {
                      setSelectedItem(item);
                    }}
                  />
                  {/* <pre className="text-xs text-gray-500">{JSON.stringify(newItem, null, 2)}</pre> */}
                </div>

                {/* Size */}
                <div>
                  <AutoComplete
                    label="Item Size"
                    options={availableSizes}
                    value={selectedSize}
                    onChange={setSelectedSize}
                    disabled={!selectedItem || availableSizes.length === 0}
                  />
                </div>

                {/* Variant */}
                <div>
                  <AutoComplete
                    label="Item Variant"
                    options={availableVariants}
                    value={selectedVariant}
                    onChange={setSelectedVariant}
                    disabled={!selectedSize && availableVariants.length === 0}
                  />
                </div>

                {/* Unit */}
                <div>
                  <AutoComplete
                    label="Item Unit"
                    options={availableUnits}
                    value={selectedUnit}
                    onChange={setSelectedUnit}
                    disabled={!selectedVariant && availableUnits.length === 0}
                  />
                </div>

                {/* Quantity */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1 text-[#482b0e]">Quantity</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                    //max={MAX_QUANTITY}
                    step={1}
                    value={quantity === "" ? "" : quantity}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text");
                      const sanitized = sanitizeToDigits(pasted);
                      if (sanitized === "") {
                        setQuantity("");
                        return;
                      }
                      let parsed = Number(sanitized);
                      if (parsed < 0) {
                        parsed = 0;
                        toast.error("Quantity cannot be negative.", { duration: 2000 });
                      } 
                      // else if (parsed > MAX_QUANTITY) {
                      //   parsed = MAX_QUANTITY;
                      //   toast.error(`Quantity canoot exceed ${MAX_QUANTITY}.`, { duration: 2000 });
                      // }
                      setQuantity(String(parsed));
                    }}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === "") {
                        setQuantity("");
                        return;
                      }

                      const digitsOnly = value.replace(/\D+/g, "");
                      if (digitsOnly === "") {
                        setQuantity("");
                        return;
                      }

                      let parsed = parseInt(digitsOnly, 10);

                      if (isNaN(parsed)) {
                        setQuantity("");
                        return;
                      }

                      if (parsed < 0) {
                        parsed = 0;
                        toast.error("Quantity cannot be negative.", { duration: 2000 });
                      } 
                      // else if (parsed > MAX_QUANTITY) {
                      //   parsed = MAX_QUANTITY;
                      //   toast.error(`Quantity cannot exceed ${MAX_QUANTITY}`, { duration: 2000 });
                      // }

                      setQuantity(String(parsed));
                    }}
                    className="border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={isAdding}
                  className="bg-[#674d33] px-4 py-2 text-sm rounded hover:bg-[#d2bda7] text-white font-medium cursor-pointer"
                >
                  {isAdding ? "Adding..." : "Add Item"}
                </button>

                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isScanning}
                  className="bg-[#0b74ff] px-3 py-2 text-sm rounded text-white hover:bg-[#0966d6] cursor-pointer"
                  title="Scan an item from a DR/SI/PO image"
                >
                  {isScanning ? "Scanning..." : "Scan via OCR"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>

              {items.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Items Added</h3>
                  <table className="w-full border text-sm">
                    <thead className="bg-[#f5e6d3] text-[#482b0e]">
                      <tr>
                        <th className="border px-2 py-1">Item Name</th>
                        <th className="border px-2 py-1">Size</th>
                        <th className="border px-2 py-1">Variant</th>
                        <th className="border px-2 py-1">Unit</th>
                        <th className="border px-2 py-1">Qty</th>
                        <th className="border px-2 py-1">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={`${item.itemId}-${idx}`}>
                          <td className="border px-2 py-1">{item.itemName}</td>
                          <td className="border px-2 py-1">{item.sizeName || "(None)"}</td>
                          <td className="border px-2 py-1">{item.variantName || "(None)"}</td>
                          <td className="border px-2 py-1">{item.unitName || "(None)"}</td>
                          <td className="border px-2 py-1">{item.quantity}</td>
                          <td className="border px-2 py-1">
                            <button
                              type="button"
                              className="text-red-500 text-xs hover:underline cursor-pointer"
                              onClick={() => setItems(items.filter((_, index) => index !== idx))}
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

            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDone}
                //disabled={!clientName || !dispatcherName || !customerPoNumber || !prfNumber || items.length === 0}
                className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </form>

          {showDRModal && (
            <DRModal
              onClose={() => setShowDRModal(false)}
              onConfirm={(data) => {
                setDrInfo(data);
                setShowDRModal(false);
                setShowSummary(true);
              }}
              //className="hover:bg-gray-100"
            />
          )}

          {showSummary && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40">
              <div className="bg-white w-[600px] p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Issuance</h2>
                <p className="mb-2 text-sm text-gray-700">Client: {clientName}</p>
                <p className="mb-2 text-sm text-gray-700">Dispatcher: {dispatcherName}</p>
                <p className="mb-2 text-sm text-gray-700">DR Number: {drInfo?.drNumber || "Draft"}</p>
                <p className="mb-2 text-sm text-gray-700">Customer PO Number: {customerPoNumber}</p>

                <table className="w-full mt-4 text-sm border">
                  <thead className="bg-[#f5e6d3] text-[#482b0e]">
                    <tr>
                      <th className="border px-2 py-1">Item</th>
                      <th className="border px-2 py-1">Size</th>
                      <th className="border px-2 py-1">Variant</th>
                      <th className="border px-2 py-1">Unit</th>
                      <th className="border px-2 py-1">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={`${item.itemId}-${idx}`}>
                        <td className="border px-2 py-1">{item.itemName}</td>
                        <td className="border px-2 py-1">{item.sizeName || "(None)"}</td>
                        <td className="border px-2 py-1">{item.variantName || "(None)"}</td>
                        <td className="border px-2 py-1">{item.unitName || "(None)"}</td>
                        <td className="border px-2 py-1">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowSummary(false);
                      //setShowDRModal(true);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                  onClick={() => {
                    handleSaveIssuance();
                  }} 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </WarehousemanClientComponent>
  );
};

export default NewIssuancePage;
// Latest version - Sept.2 - 5:40PM