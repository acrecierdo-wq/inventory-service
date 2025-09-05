"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import DRModal from "@/app/warehouse/issuance_log/dr_modal";
import { toast } from "sonner";
import AutoComplete from "../autocomplete/AutoComplete";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";

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
  draftData?: any;
  draftId?: string;
  onSaveSuccess?: () => void;
};

const NewIssuancePage = ({ draftData, draftId, onSaveSuccess }: Props) => {
  const [clientName, setClientName] = useState(draftData?.clientName || "");
  const [dispatcherName, setDispatcherName] = useState(draftData?.dispatcherName || "");
  const [customerPoNumber, setCustomerPoNumber] = useState(draftData?.customerPoNumber ||"");
  const [prfNumber, setPrfNumber] = useState(draftData?.prfNumber ||"");
  const [showDRModal, setShowDRModal] = useState(false);
  const [drInfo, setDrInfo] = useState<{ drNumber: string; saveAsDraft: boolean } | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const [items, setItems] = useState<
    {
      itemId: string;
      sizeId: string | null;
      variantId: string | null;
      unitId: string | null;
      quantity: number;
      itemName: string;
      sizeName: string | null;
      variantName: string | null;
      unitName: string | null;
    }[]
  >(draftData?.items || []);

  const [newItem, setNewItem] = useState({
      itemId: "",
      sizeId: "",
      variantId: "",
      unitId: "",
      quantity: "",
      itemName: "",
      sizeName: "",
      variantName: "",
      unitName: "",
    });

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
        .map((c) => [String(c.sizeId), { id: c.sizeId!, name: c.sizeName! }])
    ).values()
  ) as Selection[];

  const availableVariants = Array.from(
    new Map(
      combinations
        .filter((c) => {
          // only include variants that match the selected size (if any)
          if (selectedSize) return c.sizeId === Number(selectedSize.id) && c.variantId != null && c.variantName;
          // if no size selected, include all variants across combinations
          return c.variantId != null && c.variantName;
        })
        .map((c) => [String(c.variantId), { id: c.variantId!, name: c.variantName! }])
    ).values()
  ) as Selection[];

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
        .map((c) => [String(c.unitId), { id: c.unitId!, name: c.unitName! }])
    ).values()
  ) as Selection[];

  // Keep a "newItem" debug-like object similar to your previous UI (optional)
useEffect(() => {
    setNewItem((prev) => ({
      ...prev,
      itemId: selectedItem ? String(selectedItem.id) : "",
      itemName: selectedItem?.name || "",
      sizeId: selectedSize ? String(selectedSize.id) : "",
      sizeName: selectedSize?.name || "",
      variantId: selectedVariant ? String(selectedVariant.id) : "",
      variantName: selectedVariant?.name || "",
      unitId: selectedUnit ? String(selectedUnit.id) : "",
      unitName: selectedUnit?.name || "",
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
      } catch (err) {
        console.error("Failed to fetch inventory options:", err);
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
  }, [combinations]);

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
    // Basic validations: require item, require size/variant/unit depending on options
    if (!selectedItem) {
      toast.error("Please select an item.");
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (availableVariants.length > 0 && !selectedVariant) {
      toast.error("Please select a variant.");
      return;
    }
    if (availableUnits.length > 0 && !selectedUnit) {
      toast.error("Please select a unit.");
      return;
    }
    if (!quantity || Number(quantity) <= 0 || isNaN(Number(quantity))) {
      toast.error("Please enter a valid quantity.");
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
        return;
      }

      const candidate = {
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
        return;
      }

      setItems((prev) => [...prev, candidate]);

      // Reset selections for next entry
      setSelectedItem(null);
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
      setCombinations([]);
      setQuantity("");
    } catch (err) {
      console.error("Item-find error:", err);
      toast.error("Something went wrong while adding the item.");
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
      drNumber: drInfo?.drNumber || "",
      saveAsDraft: drInfo?.saveAsDraft ? "draft" : "issued",
      items: items.map((item) => ({
        itemId: item.itemId,
        sizeId: item.sizeId ?? null,
        variantId: item.variantId ?? null,
        unitId: item.unitId ?? null,
        quantity: item.quantity,
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
    if (!draftData) return;
    setClientName(draftData.clientName || "");
    setDispatcherName(draftData.dispatcherName || "");
    setCustomerPoNumber(draftData.customerPoNumber || "");
    setPrfNumber(draftData.prfNumber || "");
    setItems(draftData?.items || []);
  }, [draftData])

  return (
    <WarehousemanClientComponent>
      <main className="bg-[#ffedce] w-full">
        <Header />
        <section className="p-10 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#173f63] mb-6">Log Item Issuance</h1>

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
                  <pre className="text-xs text-gray-500">{JSON.stringify(newItem, null, 2)}</pre>
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
                    placeholder="Qty"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="mt-3 bg-[#d2bda7] px-4 py-2 text-sm rounded hover:bg-[#674d33] text-white font-medium cursor-pointer"
              >
                Add Item
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
            <DRModal
              onClose={() => setShowDRModal(false)}
              onConfirm={(data: { drNumber: string; saveAsDraft: boolean }) => {
                setDrInfo(data);
                setShowDRModal(false);
                setShowSummary(true);
              }}
              className="hover:bg-gray-100"
            />
          )}

          {showSummary && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40">
              <div className="bg-white w-[600px] p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Issuance</h2>
                <p className="mb-2 text-sm text-gray-700">Client: {clientName}</p>
                <p className="mb-2 text-sm text-gray-700">Dispatcher: {dispatcherName}</p>
                <p className="mb-2 text-sm text-gray-700">DR Number: {drInfo?.drNumber || "Draft"}</p>

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
                  <button onClick={handleSaveIssuance} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
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
// Latest version - Sept.2