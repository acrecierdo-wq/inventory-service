// app/components/add/LogNewInternalUsageForm.tsx

"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { toast } from "sonner";
import AutoComplete from "@/components/autocomplete/AutoComplete";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
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

type FormItem = {
  itemId: string;
  sizeId: string | null;
  variantId: string | null;
  unitId: string | null;
  quantity: number;
  itemName: string;
  sizeName: string | null;
  variantName: string | null;
  unitName: string | null;
};

const NewInternalUsagePage = () => {
  const { user } = useUser();
  const [personnelName, setPersonnelName] = useState("");
  const [department, setDepartment] = useState("");
  const [purpose, setPurpose] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [note, setNote] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [items, setItems] = useState<FormItem[]>([]);
  const [, setNewItem] = useState<FormItem>({
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
          if (selectedSize && selectedVariant) {
            return c.sizeId === Number(selectedSize.id) && c.variantId === Number(selectedVariant.id) && c.unitId != null && c.unitName;
          }
          if (selectedSize && !selectedVariant) {
            return c.sizeId === Number(selectedSize.id) && c.unitId != null && c.unitName;
          }
          return c.unitId != null && c.unitName;
        })
        .map((c) => [String(c.unitId), { id: String(c.unitId), name: c.unitName! }])
    ).values()
  );

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
        const res = await fetch(`/api/inventory-options?itemName=${encodeURIComponent(String(selectedItem.name))}`);
        if (!res.ok) {
          setCombinations([]);
          return;
        }
        const data: Combination[] = await res.json();
        setCombinations(Array.isArray(data) ? data : []);
      } catch {
        setCombinations([]);
      }
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
    };

    fetchOptions();
  }, [selectedItem]);

  // Add item handler
  const handleAddItem = async () => {
    if (isAdding) return;
    setIsAdding(true);

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

      const res = await fetch(`/api/item-find?${params.toString()}`);
      const found = await res.json();

      if (!found || !found.id) {
        toast.error("Failed to find matching item in inventory.");
        setIsAdding(false);
        return;
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

      setSelectedItem(null);
      setSelectedSize(null);
      setSelectedVariant(null);
      setSelectedUnit(null);
      setQuantity("");
    } catch {
      toast.error("Something went wrong while adding the item.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDone = () => {
    if (!personnelName) return toast.error("Please enter a personnel name.");
    if (!department) return toast.error("Please enter a department.");
    if (!purpose) return toast.error("Please enter a purpose.");
    if (!authorizedBy) return toast.error("Please enter who authorized this.");
    if (items.length === 0) return toast.error("Please add at least one item.");
    setShowSummary(true);
  };

  const handleSaveUsage = async () => {
    const payload = {
      personnelName,
      department,
      purpose,
      authorizedBy,
      note,
      items: items.map((i) => ({
        itemId: Number(i.itemId),
        sizeId: i.sizeId ? Number(i.sizeId) : null,
        variantId: i.variantId ? Number(i.variantId) : null,
        unitId: i.unitId ? Number(i.unitId) : null,
        quantity: i.quantity,
      })),
      loggedBy: user?.fullName || user?.emailAddresses[0]?.emailAddress || "Warehouseman",
    };

    try {
      const res = await fetch("/api/internal_usages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to save internal usage.");
        return;
      }

      toast.success("Internal usage saved successfully!");
      setTimeout(() => {
        window.location.href = "/warehouse/internal_usage_log";
      }, 1500);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong while saving the usage.");
    }
  };

  return (
    <WarehousemanClientComponent>
      <main className="bg-[#ffedce] w-full">
        <Header />
        <section className="p-10 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#173f63] mb-6">Log Internal Usage</h1>

          <form className="grid grid-cols-1 gap-4 bg-white p-6 rounded shadow">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Personnel Name:</label>
              <input
                type="text"
                value={personnelName}
                onChange={(e) => setPersonnelName(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Department:</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Purpose:</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Authorized By:</label>
              <input
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Note:</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Logged By: {user?.fullName || user?.emailAddresses[0]?.emailAddress}</label>
            </div>

            {/* Items Section */}
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-bold mb-2 text-[#173f63] text-center uppercase">Items Used</h2>

              <div className="grid grid-cols-5 gap-2 items-end">
                <div>
                  <AutoComplete
                    label="Item Name"
                    endpoint="/api/autocomplete/item-name"
                    value={selectedItem}
                    onChange={(item) => {
                      setSelectedItem(item);
                    }}
                  />
                </div>

                <div>
                  <AutoComplete
                    label="Item Size"
                    options={availableSizes}
                    value={selectedSize}
                    onChange={setSelectedSize}
                    disabled={!selectedItem || availableSizes.length === 0}
                  />
                </div>

                <div>
                  <AutoComplete
                    label="Item Variant"
                    options={availableVariants}
                    value={selectedVariant}
                    onChange={setSelectedVariant}
                    disabled={!selectedSize && availableVariants.length === 0}
                  />
                </div>

                <div>
                  <AutoComplete
                    label="Item Unit"
                    options={availableUnits}
                    value={selectedUnit}
                    onChange={setSelectedUnit}
                    disabled={!selectedVariant && availableUnits.length === 0}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1 text-[#482b0e]">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={isAdding}
                className="mt-3 bg-[#d2bda7] px-4 py-2 text-sm rounded hover:bg-[#674d33] text-white font-medium cursor-pointer"
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
                className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </form>

          {showSummary && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40">
              <div className="bg-white w-[600px] p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Internal Usage</h2>
                <p className="mb-2 text-sm text-gray-700">Personnel: {personnelName}</p>
                <p className="mb-2 text-sm text-gray-700">Department: {department}</p>
                <p className="mb-2 text-sm text-gray-700">Purpose: {purpose}</p>
                <p className="mb-2 text-sm text-gray-700">Authorized By: {authorizedBy}</p>
                <p className="mb-2 text-sm text-gray-700">Note: {note}</p>

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
                <p className="mb-2 text-sm text-gray-700">Logged By: {user?.fullName || user?.emailAddresses[0]?.emailAddress}</p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSummary(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUsage}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-800"
                  >
                    Confirm & Save
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

export default NewInternalUsagePage;
