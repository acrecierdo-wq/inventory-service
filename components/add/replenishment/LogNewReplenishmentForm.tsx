// app/components/add/LogNewReplenishmentForm.tsx

"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import DelRefModal from "@/app/warehouse/replenishment_log/DR_modal";
import { toast } from "sonner";
import AutoComplete from "@/components/autocomplete/AutoComplete";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { DraftReplenishment, FormInfo } from "@/app/warehouse/replenishment_log/types/replenishment";
import { useUser } from "@clerk/nextjs";

type Selection = { id: string | number; name: string };

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
  draftData?: DraftReplenishment;
  draftId?: string;
  onSaveSuccess?: () => void;
};

const NewReplenishmentPage = ({ draftData, draftId, onSaveSuccess }: Props) => {
  const { user } = useUser();
  const [supplier, setSupplier] = useState(draftData?.supplier || "");
  const [poRefNum, setPoRefNum] = useState(draftData?.poRefNum || "");
  const [remarks, setRemarks] = useState(draftData?.remarks || "");
  const [recordedBy, setRecordedBy] = useState(draftData?.recordedBy || "")
  const [showDRModal, setShowDRModal] = useState(false);
  const [drInfo, setDrInfo] = useState<{ drRefNum: string; isDraft: boolean } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [items, setItems] = useState<FormInfo[]>(() => 
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

  const [newItem, setNewItem] = useState<FormInfo>({
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
          const data: Combination[] = await res.json();
      console.log("inventory-options response", data);

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
        toast.error("Unable to fetch stock for item.");
        setIsAdding(false);
        return;
      }

      const stockData = await stockRes.json();
      const qty = Number(quantity);

      if (stockData.stock + qty >= stockData.ceilingLevel) {
        toast.warning(` Overstock: "${selectedItem.name}" currently has ${stockData.stock} in stock. You are replenishing ${qty}. It will go beyond ceiling level of ${stockData.ceilingLevel}.`, { duration: 10000 });
        setIsAdding(false);
        setSelectedItem(null);
        setSelectedSize(null);
        setSelectedVariant(null);
        setSelectedUnit(null);
        setQuantity("");
        return;
      }

      const candidate: FormInfo = {
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
      //setCombinations([]);
      setQuantity("");
    } catch (err) {
      console.error("Item-find error:", err);
      toast.error("Something went wrong while adding the item.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDone = () => {
    if (!supplier) {
      toast.error("Please enter a supplier.");
      return;
    }

    if (!poRefNum) {
      toast.error("Please enter a PO reference number.");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }

    setShowDRModal(true);
  };

  const handleSaveReplenishment = async () => {
    if (!drInfo) return;
    if (!supplier || !poRefNum || items.length === 0) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const payload = {
      supplier,
      poRefNum,
      remarks,
      recordedBy,
      drRefNum: drInfo.drRefNum,
      isDraft: drInfo.isDraft ? "draft" : "replenished",
      items: items.map((i) => ({
        itemId: Number(i.itemId),
        sizeId: i.sizeId ? Number(i.sizeId) : null,
        variantId: i.variantId ? Number(i.variantId) : null,
        unitId: i.unitId ? Number(i.unitId) : null,
        quantity: i.quantity,
      })),
    };

    console.log('[handleSaveReplenishment] drInfo', drInfo);
    console.log('[submit replenishment] payload about to send', payload);
    console.log("[ReplenishmentForm] About to PUT /api/replenishment", payload);


    try {
      console.log('[submit replenishment] payload about to send', payload);
      console.log("[ReplenishmentForm] About to PUT /api/replenishment", payload);

      const res = await fetch(draftId ? `/api/replenishment/${draftId}` : "/api/replenishment", {
        method: draftId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Attempt to parse error JSON like you had
        let errorMessage = "Failed to process replenishment.";
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

      if (result.warning && result.warning.length > 0) {
        result.warning.forEach((w: string, i: number) => {
          setTimeout(() => toast.warning(w), i * 5000);
        });
      }

      setTimeout(() => {
        toast.success(drInfo.isDraft ? "Replenishment saved as draft." : "Replenishment saved successfully!");
        onSaveSuccess?.();
        setTimeout(() => {
          window.location.href = "/warehouse/replenishment_log";
        }, 1500);
      }, (result.warning?.length || 0) * 1000);
    } catch (err) {
      console.error("Replenishment error:", err);
      toast.error("Something went wrong while saving the replenishment.");
    }
  };

  useEffect(() => {
    if (draftData) {
      setSupplier(draftData.supplier || "");
      setPoRefNum(draftData.poRefNum || "");
      setRemarks(draftData.remarks || "");
      setRecordedBy(draftData.recordedBy || "");
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
         setRecordedBy(
      user.username || user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || ""
    );
      }
    }, [user]);

  const MAX_QUANTITY = 9999;

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
          <h1 className="text-3xl font-bold text-[#173f63] mb-6">Log Item Replenishment</h1>

          <form className="grid grid-cols-1 gap-4 bg-white p-6 rounded shadow">
            {/* Supplier */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Supplier:</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            {/* PO reference number */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">PO Reference Number:</label>
              <input
                type="text"
                value={poRefNum}
                onChange={(e) => setPoRefNum(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>
            {/* Remarks */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Remarks:</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Logged by: {recordedBy}</label>
            </div>

            {/* Add Item Section */}
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-bold mb-2 text-[#173f63] text-center uppercase">Items to Replenish</h2>

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
                    max={MAX_QUANTITY}
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
                      } else if (parsed > MAX_QUANTITY) {
                        parsed = MAX_QUANTITY;
                        toast.error(`Quantity canoot exceed ${MAX_QUANTITY}.`, { duration: 2000 });
                      }
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
                      } else if (parsed > MAX_QUANTITY) {
                        parsed = MAX_QUANTITY;
                        toast.error(`Quantity cannot exceed ${MAX_QUANTITY}`, { duration: 2000 });
                      }

                      setQuantity(String(parsed));
                    }}
                    className="border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={isAdding}
                className="mt-5 bg-[#d2bda7] px-4 py-2 text-sm rounded hover:bg-[#674d33] text-white font-medium cursor-pointer"
              >
                {isAdding ? "Adding..." : "Add Item"}
              </button>

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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDone}
                //disabled={!clientName || !dispatcherName || !customerPoNumber || !prfNumber || items.length === 0}
                className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </form>

          {showDRModal && (
            <DelRefModal
              onClose={() => setShowDRModal(false)}
              onConfirm={(data) => {
                console.log('[DelRefModal onConfirm] data', data);
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
                <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Replenishment</h2>
                <p className="mb-2 text-sm text-gray-700">Supplier: {supplier}</p>
                <p className="mb-2 text-sm text-gray-700">PO Reference No.: {poRefNum}</p>
                <p className="mb-2 text-sm text-gray-700">DR Number: {drInfo?.drRefNum || "Draft"}</p>

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
                      setShowDRModal(true);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button onClick={handleSaveReplenishment} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
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

export default NewReplenishmentPage;