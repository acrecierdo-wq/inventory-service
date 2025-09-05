"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import DRModal from "@/app/warehouse/issuance_log/dr_modal";
import { toast } from "sonner";
import AutoComplete from "../autocomplete/AutoComplete";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";

type Selection = { id: string | number; name: string };

const NewIssuancePage = () => {
  const [clientName, setClientName] = useState("");
  const [dispatcherName, setDispatcherName] = useState("");
  const [customerPoNumber, setCustomerPoNumber] = useState("");
  const [prfNumber, setPrfNumber] = useState("");
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
  >([]);

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

  const [selectedItem, setSelectedItem] = useState<Selection | null>(null);
  const [selectedSize, setSelectedSize] = useState<Selection | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Selection | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Selection | null>(null);

  const [availableSizes, setAvailableSizes] = useState<Selection[]>([]);
  const [availableVariants, setAvailableVariants] = useState<Selection[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Selection[]>([]);

  // Update newItem when selections change
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
  }, [selectedItem, selectedSize, selectedVariant, selectedUnit]);

  // Fetch options whenever an item is selected
  useEffect(() => {
    if (!selectedItem) {
      setAvailableSizes([]);
      setAvailableVariants([]);
      setAvailableUnits([]);
      return;
    }

    const fetchOptions = async () => {
      const res = await fetch(`/api/inventory-options?itemId=${selectedItem.id}`);
      if (!res.ok) return;

      const data = await res.json();
      setAvailableSizes(data.sizes || []);
      setAvailableVariants(data.variants || []);
      setAvailableUnits(data.units || []);
    };

    fetchOptions();
  }, [selectedItem]);

  useEffect(() => {
    console.log("Available Sizes:", availableSizes);
    console.log("Available Variants:", availableVariants);
    console.log("Available Units:", availableUnits);
}, [availableSizes, availableVariants, availableUnits]);

  // Auto-select only if there is exactly one option
  useEffect(() => {
    if (!selectedItem) {
        setSelectedSize(null);
        setSelectedVariant(null);
        setSelectedUnit(null);
        return;
    }

    // Preselect if only one option
    if (availableSizes.length === 1) setSelectedSize(availableSizes[0]);
    if (availableVariants.length === 1) setSelectedVariant(availableVariants[0]);
    if (availableUnits.length === 1) setSelectedUnit(availableUnits[0]);

    // Clear selection if current selection is no longer valid
    if (selectedSize && !availableSizes.some(s => String(s.id) === String(selectedSize.id))) {
        setSelectedSize(null);
    }
    if (selectedVariant && !availableVariants.some(v => String(v.id) === String(selectedVariant.id))) {
        setSelectedVariant(null);
    }
    if (selectedUnit && !availableUnits.some(u => String(u.id) === String(selectedUnit.id))) {
        setSelectedUnit(null);
    }
}, [selectedItem, availableSizes, availableVariants, availableUnits]);

  const handleAddItem = async () => {
    // Validation
    if (!selectedItem) {
      toast.error("Please select an item.");
      return;
    }
    if (availableSizes.length > 1 && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (availableVariants.length > 1 && !selectedVariant) {
      toast.error("Please select a variant.");
      return;
    }
    if (availableUnits.length > 1 && !selectedUnit) {
      toast.error("Please select a unit.");
      return;
    }
    if (!newItem.quantity || Number(newItem.quantity) <= 0 || isNaN(Number(newItem.quantity))) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    try {
      const params = new URLSearchParams({
        itemName: selectedItem.name,
        sizeId: selectedSize?.id ? String(selectedSize.id) : "",
        variantId: selectedVariant?.id ? String(selectedVariant.id) : "",
        unitId: selectedUnit?.id ? String(selectedUnit.id) : "",
      });

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
        quantity: Number(newItem.quantity),
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

      setSelectedItem(null);
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
      setNewItem({
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
    } catch (error) {
      console.error("Item-find error:", error);
      toast.error("Something went wrong while adding the item.");
    }
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
      saveAsDraft: drInfo?.saveAsDraft || false,
      items: items.map((item) => ({
        itemId: item.itemId,
        sizeId: item.sizeId ?? null,
        variantId: item.variantId ?? null,
        unitId: item.unitId ?? null,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("/api/issuances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to process issuance.");
        return;
      }

      const result = await res.json();

      // Show warnings if any
      if (result.warning && result.warning.length > 0) {
        result.warning.forEach((w: string, i: number) => {
          setTimeout(() => toast.warning(w), i * 5000);
        });
      }

      setTimeout(() => {
        toast.success(drInfo.saveAsDraft ? "Issuance saved as draft." : "Issuance saved successfully!");
        setTimeout(() => {
          window.location.href = "/warehouse/issuance_log";
        }, 1500);
      }, (result.warning?.length || 0) * 1000);
    } catch (error) {
      console.error("Issuance error:", error);
      toast.error("Something went wrong while saving the issuance.");
    }
  };

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
                className="w-full border border-[#d2bda7] p-2 rounded"
              />
            </div>

            {/* Dispatcher Name */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Dispatcher Name:</label>
              <input
                type="text"
                value={dispatcherName}
                onChange={(e) => setDispatcherName(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded"
              />
            </div>

            {/* Customer PO Number */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Customer PO Number:</label>
              <input
                type="text"
                value={customerPoNumber}
                onChange={(e) => setCustomerPoNumber(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded"
              />
            </div>

            {/* PRF Number */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">PRF Number:</label>
              <input
                type="text"
                value={prfNumber}
                onChange={(e) => setPrfNumber(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded"
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
                    onChange={async (item) => {
                      setSelectedItem(item);

                      if (item?.id) {
                        const res = await fetch(`/api/inventory-options?itemId=${item.id}`);
                        const data = await res.json();
                        setAvailableSizes(data.sizes || []);
                        setAvailableVariants(data.variants || []);
                        setAvailableUnits(data.units || []);

                        setSelectedSize(null);
                        setSelectedVariant(null);
                        setSelectedUnit(null);
                      }
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
                    disabled={!selectedItem}
                    parentId={selectedItem?.id}
                  />
                </div>

                {/* Variant */}
                <div>
                  <AutoComplete
                    label="Item Variant"
                    options={availableVariants}
                    value={selectedVariant}
                    onChange={setSelectedVariant}
                    disabled={!selectedItem}
                    parentId={selectedItem?.id}
                  />
                </div>

                {/* Unit */}
                <div>
                  <AutoComplete
                    label="Item Unit"
                    options={availableUnits}
                    value={selectedUnit}
                    onChange={setSelectedUnit}
                    disabled={!selectedItem}
                    parentId={selectedItem?.id}
                  />
                </div>

                {/* Quantity */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1 text-[#482b0e]">Quantity</label>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="border border-[#d2bda7] p-2 rounded"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="mt-3 bg-[#d2bda7] px-4 py-2 text-sm rounded hover:bg-[#674d33] text-white font-medium"
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
                        <tr key={idx}>
                          <td className="border px-2 py-1">{item.itemName}</td>
                          <td className="border px-2 py-1">{item.sizeName || "(None)"}</td>
                          <td className="border px-2 py-1">{item.variantName || "(None)"}</td>
                          <td className="border px-2 py-1">{item.unitName || "(None)"}</td>
                          <td className="border px-2 py-1">{item.quantity}</td>
                          <td className="border px-2 py-1">
                            <button
                              type="button"
                              className="text-red-500 text-xs underline"
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
                onClick={() => setShowDRModal(true)}
                disabled={!clientName || !dispatcherName || !customerPoNumber || !prfNumber || items.length === 0}
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
                      <tr key={idx}>
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
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button onClick={handleSaveIssuance} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
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
