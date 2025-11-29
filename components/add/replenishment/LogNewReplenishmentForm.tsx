// app/components/add/LogNewReplenishmentForm.tsx

"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { toast } from "sonner";
import AutoComplete from "@/components/autocomplete/AutoComplete";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import {
  DraftReplenishment,
  FormInfo,
} from "@/app/warehouse/replenishment_log/types/replenishment";
import { useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, AlertTriangle, Package } from "lucide-react";

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

type PurchaseOrder = {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  terms: string | null;
  deliveryMode: string | null;
  projectName: string | null;
  remarks: string | null;
  status: "Pending" | "Partial" | "Complete";
  items: Array<{
    itemId: number;
    itemName: string;
    sizeId: number | null;
    sizeName: string | null;
    variantId: number | null;
    variantName: string | null;
    unitId: number | null;
    unitName: string | null;
    quantity: number;
    receivedQuantity: number;
    remainingQuantity: number;
    unitPrice: number;
  }>;
};

type POStatusSummary = {
  poNumber: string;
  status: "Pending" | "Partial" | "Complete";
  items: Array<{
    itemName: string;
    expected: number;
    received: number;
    remaining: number;
  }>;
};

interface Props {
  draftData?: DraftReplenishment;
  draftId?: number;
  onSaveSuccess?: () => void;
}

const NewReplenishmentPage = ({ draftData, draftId, onSaveSuccess }: Props) => {
  const { user } = useUser();

  const [availablePOs, setAvailablePOs] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<string>("");
  const [isLoadingPO, setIsLoadingPO] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false); // ✅ NEW: Track manual mode

  const [supplier, setSupplier] = useState(draftData?.supplier || "");
  const [poRefNum, setPoRefNum] = useState(draftData?.poRefNum || "");
  const [remarks, setRemarks] = useState(draftData?.remarks || "");
  const [recordedBy, setRecordedBy] = useState(draftData?.recordedBy || "");
  const [isSaving, setIsSaving] = useState(false);
  const [drRefNum, setDrRefNum] = useState(draftData?.drRefNum || "");

  const [showSummary, setShowSummary] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [poStatusSummary, setPOStatusSummary] =
    useState<POStatusSummary | null>(null);
  const [showPOStatusModal, setShowPOStatusModal] = useState(false);

  const [items, setItems] = useState<FormInfo[]>(
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

  const [selectedItem, setSelectedItem] = useState<Selection | null>(null);
  const [selectedSize, setSelectedSize] = useState<Selection | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Selection | null>(
    null
  );
  const [selectedUnit, setSelectedUnit] = useState<Selection | null>(null);
  const [quantity, setQuantity] = useState("");
  const [combinations, setCombinations] = useState<Combination[]>([]);

  // Fetch available purchase orders
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const res = await fetch("/api/purchasing/purchase_orders/available");
        if (res.ok) {
          const data = await res.json();
          setAvailablePOs(data);
        }
      } catch (err) {
        console.error("Error fetching purchase orders:", err);
        toast.error("Failed to load purchase orders");
      }
    };

    fetchPurchaseOrders();
  }, []);

  // ✅ UPDATED: Handle PO selection with manual mode
  const handlePOSelection = async (value: string) => {
    if (!value || value === "none") {
      setSelectedPO("");
      setIsManualMode(false);
      setSupplier("");
      setPoRefNum("");
      setRemarks("");
      setItems([]);
      return;
    }

    // ✅ NEW: Check if manual mode is selected
    if (value === "manual") {
      setSelectedPO("manual");
      setIsManualMode(true);
      setSupplier("");
      setPoRefNum("");
      setRemarks("");
      setItems([]);
      toast.info("Manual mode enabled. Fill out the form manually.");
      return;
    }

    // ✅ Existing PO selection logic
    setIsLoadingPO(true);
    setSelectedPO(value);
    setIsManualMode(false);

    try {
      const po = availablePOs.find((p) => p.poNumber === value);
      if (!po) {
        toast.error("Purchase order not found");
        return;
      }

      setSupplier(po.supplierName);
      setPoRefNum(po.poNumber);
      setRemarks(po.remarks || "");

      const poItems: FormInfo[] = po.items.map((item) => ({
        itemId: String(item.itemId),
        itemName: item.itemName,
        sizeId: item.sizeId ? String(item.sizeId) : null,
        sizeName: item.sizeName,
        variantId: item.variantId ? String(item.variantId) : null,
        variantName: item.variantName,
        unitId: item.unitId ? String(item.unitId) : null,
        unitName: item.unitName,
        quantity: 0,
        expectedQuantity: item.quantity,
        receivedSoFar: item.receivedQuantity,
        remainingQuantity: item.remainingQuantity,
      }));

      setItems(poItems);

      toast.success(
        `Loaded PO ${value} with ${po.items.length} item(s). Enter received quantities.`
      );
    } catch (err) {
      console.error("Error loading PO:", err);
      toast.error("Failed to load purchase order details");
    } finally {
      setIsLoadingPO(false);
    }
  };

  // Fetch item combinations
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
        const res = await fetch(
          `/api/inventory-options?itemName=${encodeURIComponent(
            String(selectedItem.name)
          )}`
        );
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

  // Derive available options
  const availableSizes = Array.from(
    new Map(
      combinations
        .filter((c) => c.sizeId != null && c.sizeName)
        .map((c) => [
          String(c.sizeId),
          { id: String(c.sizeId), name: c.sizeName! },
        ])
    ).values()
  );

  const availableVariants = Array.from(
    new Map(
      combinations
        .filter(
          (c) =>
            (!selectedSize || c.sizeId === Number(selectedSize.id)) &&
            c.variantId != null &&
            c.variantName
        )
        .map((c) => [
          String(c.variantId),
          { id: String(c.variantId), name: c.variantName! },
        ])
    ).values()
  );

  const availableUnits = Array.from(
    new Map(
      combinations
        .filter((c) => {
          if (selectedSize && selectedVariant) {
            return (
              c.sizeId === Number(selectedSize.id) &&
              c.variantId === Number(selectedVariant.id) &&
              c.unitId != null &&
              c.unitName
            );
          }
          if (selectedSize && !selectedVariant) {
            return (
              c.sizeId === Number(selectedSize.id) &&
              c.unitId != null &&
              c.unitName
            );
          }
          return c.unitId != null && c.unitName;
        })
        .map((c) => [
          String(c.unitId),
          { id: String(c.unitId), name: c.unitName! },
        ])
    ).values()
  );

  // Auto-select single options
  useEffect(() => {
    if (!selectedItem) return;

    if (availableSizes.length === 1 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }

    if (selectedSize && availableVariants.length === 1 && !selectedVariant) {
      setSelectedVariant(availableVariants[0]);
    }

    if (
      selectedSize &&
      selectedVariant &&
      availableUnits.length === 1 &&
      !selectedUnit
    ) {
      setSelectedUnit(availableUnits[0]);
    }
  }, [
    selectedItem,
    selectedSize,
    selectedVariant,
    availableSizes,
    availableVariants,
    availableUnits,
    selectedUnit,
  ]);

  // Reset invalid selections
  useEffect(() => {
    setSelectedVariant(null);
    setSelectedUnit(null);
  }, [selectedSize]);

  useEffect(() => {
    setSelectedUnit(null);
  }, [selectedVariant]);
  // OLD ADD ITEMS BEFORE I PUT THE MANUAL ENTRY OPTION
  // const handleAddItem = async () => {
  //   if (isAdding) return;
  //   setIsAdding(true);

  //   if (!selectedItem) {
  //     toast.error("Please select an item.");
  //     setIsAdding(false);
  //     return;
  //   }
  //   if (availableSizes.length > 0 && !selectedSize) {
  //     toast.error("Please select a size.");
  //     setIsAdding(false);
  //     return;
  //   }
  //   if (availableVariants.length > 0 && !selectedVariant) {
  //     toast.error("Please select a variant.");
  //     setIsAdding(false);
  //     return;
  //   }
  //   if (availableUnits.length > 0 && !selectedUnit) {
  //     toast.error("Please select a unit.");
  //     setIsAdding(false);
  //     return;
  //   }
  //   if (!quantity || Number(quantity) <= 0) {
  //     toast.error("Enter a valid quantity.");
  //     setIsAdding(false);
  //     return;
  //   }

  //   try {
  //     const params = new URLSearchParams({
  //       itemName: selectedItem.name,
  //       ...(selectedSize && { size: selectedSize.name }),
  //       ...(selectedVariant && { variant: selectedVariant.name }),
  //       ...(selectedUnit && { unit: selectedUnit.name }),
  //     });

  //     const res = await fetch(`/api/item-find?${params.toString()}`);
  //     if (!res.ok) throw new Error("Failed to find item combination");

  //     const data = await res.json();
  //     if (!data.exists) {
  //       toast.error(
  //         "That size/variant/unit combination does not exist in inventory."
  //       );
  //       setIsAdding(false);
  //       return;
  //     }

  //     setItems((prev) => [
  //       ...prev,
  //       {
  //         itemId: String(data.itemId),
  //         sizeId: selectedSize ? String(selectedSize.id) : null,
  //         variantId: selectedVariant ? String(selectedVariant.id) : null,
  //         unitId: selectedUnit ? String(selectedUnit.id) : null,
  //         quantity: Number(quantity),
  //         itemName: selectedItem.name,
  //         sizeName: selectedSize?.name || null,
  //         variantName: selectedVariant?.name || null,
  //         unitName: selectedUnit?.name || null,
  //       },
  //     ]);

  //     toast.success("Item added to the list.");
  //     setSelectedItem(null);
  //     setSelectedSize(null);
  //     setSelectedVariant(null);
  //     setSelectedUnit(null);
  //     setQuantity("");
  //   } catch (err) {
  //     console.error("Item-find error:", err);
  //     toast.error("Something went wrong while adding the item.");
  //   } finally {
  //     setIsAdding(false);
  //   }
  // };

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
    if (!quantity || Number(quantity) <= 0) {
      toast.error("Enter a valid quantity.");
      setIsAdding(false);
      return;
    }

    try {
      // ✅ FIX: Pass IDs instead of names
      const params = new URLSearchParams({
        itemName: selectedItem.name,
        ...(selectedSize && { sizeId: String(selectedSize.id) }), // ✅ Changed from 'size' to 'sizeId'
        ...(selectedVariant && { variantId: String(selectedVariant.id) }), // ✅ Changed from 'variant' to 'variantId'
        ...(selectedUnit && { unitId: String(selectedUnit.id) }), // ✅ Changed from 'unit' to 'unitId'
      });

      const res = await fetch(`/api/item-find?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to find item combination");

      const data = await res.json();

      // ✅ Check if item exists
      if (!data || !data.id) {
        toast.error(
          "That size/variant/unit combination does not exist in inventory."
        );
        setIsAdding(false);
        return;
      }

      setItems((prev) => [
        ...prev,
        {
          itemId: String(data.id),
          sizeId: selectedSize ? String(selectedSize.id) : null,
          variantId: selectedVariant ? String(selectedVariant.id) : null,
          unitId: selectedUnit ? String(selectedUnit.id) : null,
          quantity: Number(quantity),
          itemName: selectedItem.name,
          sizeName: selectedSize?.name || null,
          variantName: selectedVariant?.name || null,
          unitName: selectedUnit?.name || null,
        },
      ]);

      toast.success("Item added to the list.");
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
    if (!supplier) {
      toast.error("Please enter a supplier.");
      return;
    }

    if (!poRefNum) {
      toast.error("Please enter a PO reference number.");
      return;
    }

    if (!drRefNum || drRefNum.trim() === "") {
      toast.error("Please enter a Delivery Receipt number.");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }

    const itemsWithoutQty = items.filter(
      (item) => !item.quantity || item.quantity <= 0
    );
    if (itemsWithoutQty.length > 0) {
      toast.error("Please enter valid quantities for all items.");
      return;
    }

    setShowSummary(true);
  };

  const handleSaveReplenishment = async () => {
    if (!supplier || !poRefNum || !drRefNum || items.length === 0) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setIsSaving(true);

    const payload = {
      supplier,
      poRefNum,
      remarks,
      drRefNum,
      isDraft: false,
      recordedBy,
      items: items.map((i) => ({
        itemId: Number(i.itemId),
        sizeId: i.sizeId ? Number(i.sizeId) : null,
        variantId: i.variantId ? Number(i.variantId) : null,
        unitId: i.unitId ? Number(i.unitId) : null,
        quantity: Number(i.quantity),
      })),
      draftId: draftId || null,
    };

    try {
      const res = await fetch("/api/warehouse/replenishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save replenishment");

      const result = await res.json();

      if (result.poStatusSummary) {
        setPOStatusSummary(result.poStatusSummary);
        setShowSummary(false);
        setShowPOStatusModal(true);
      } else {
        toast.success("Replenishment saved successfully!");
        onSaveSuccess?.();
        setTimeout(() => {
          window.location.href = "/warehouse/replenishment_log";
        }, 1500);
      }
    } catch (err) {
      console.error("Replenishment error:", err);
      toast.error("Something went wrong while saving the replenishment.");
    } finally {
      setIsSaving(false);
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
        user.username ||
          user.fullName ||
          user.firstName ||
          user.primaryEmailAddress?.emailAddress ||
          ""
      );
    }
  }, [user]);

  return (
    <WarehousemanClientComponent>
      <main className="bg-[#ffedce] min-h-screen w-full">
        <Header />
        <section className="p-4 sm:p-6 md:p-10 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 mt-30">
            <h1 className="text-xl lg:text-3xl font-bold text-[#173f63]">
              Log Item Replenishment
            </h1>

            {/* ✅ UPDATED: Added Manual Option */}
            <div className="w-full sm:w-64">
              <Select onValueChange={handlePOSelection} value={selectedPO}>
                <SelectTrigger className="border border-[#d2bda7] bg-white">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  {/* ✅ NEW: Manual Option */}
                  <SelectItem value="manual">Manual Entry</SelectItem>

                  {/* Existing PO Options */}
                  {availablePOs.map((po) => (
                    <SelectItem
                      key={po.id}
                      value={po.poNumber}
                      disabled={po.status === "Complete"}
                    >
                      {po.poNumber} - ({po.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <form className="grid grid-cols-1 gap-4 bg-white p-4 sm:p-6 rounded shadow">
            {/* ✅ UPDATED: Make fields editable in manual mode */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                Supplier: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                disabled={!isManualMode && !!selectedPO && isLoadingPO}
                readOnly={!isManualMode && !!selectedPO}
                placeholder="Enter supplier name..."
                className={`w-full border border-[#d2bda7] p-2 rounded ${
                  isManualMode ? "hover:bg-gray-100" : "bg-gray-100"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                  PO Reference Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={poRefNum}
                  onChange={(e) => setPoRefNum(e.target.value)}
                  disabled={!isManualMode && !!selectedPO && isLoadingPO}
                  readOnly={!isManualMode && !!selectedPO}
                  placeholder="Enter PO number..."
                  className={`w-full border border-[#d2bda7] p-2 rounded ${
                    isManualMode ? "hover:bg-gray-100" : "bg-gray-100"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                  Delivery Receipt Number:{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={drRefNum}
                  onChange={(e) => setDrRefNum(e.target.value)}
                  placeholder="Enter DR number..."
                  className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                Remarks:
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                readOnly={!isManualMode && !!selectedPO}
                placeholder="Enter remarks..."
                className={`w-full border border-[#d2bda7] p-2 rounded ${
                  isManualMode || !selectedPO
                    ? "hover:bg-gray-100"
                    : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                Logged by: {recordedBy}
              </label>
            </div>

            <div className="border-t pt-4 mt-4">
              <h2 className="text-base sm:text-lg font-bold mb-2 text-[#173f63] text-center uppercase">
                Items to Replenish <span className="text-red-500">*</span>
              </h2>

              {/* ✅ UPDATED: Show item input only when PO is selected or in manual mode */}
              {(isManualMode || !selectedPO) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-end mb-4">
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

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
                      Quantity:
                    </label>
                    <input
                      type="number"
                      placeholder="Enter quantity..."
                      value={quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || Number(val) < 0) {
                          setQuantity("");
                          return;
                        }

                        const parsed = parseInt(val, 10);
                        if (isNaN(parsed)) {
                          setQuantity("");
                          return;
                        }

                        setQuantity(String(parsed));
                      }}
                      className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {(isManualMode || !selectedPO) && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={isAdding}
                  className="mt-5 bg-[#d2bda7] px-4 py-2 text-sm rounded hover:bg-[#674d33] text-white font-medium cursor-pointer"
                >
                  {isAdding ? "Adding..." : "Add Item"}
                </button>
              )}

              {/* Items table */}
              {items.length > 0 && (
                <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
                  <h3 className="text-sm font-semibold mb-2">
                    Items to Receive
                  </h3>
                  <div className="inline-block min-w-full align-middle">
                    <table className="w-full border text-sm">
                      <thead className="bg-[#f5e6d3] text-xs text-[#482b0e]">
                        <tr>
                          <th className="border px-2 py-1">Item Name</th>
                          <th className="border px-2 py-1">Size</th>
                          <th className="border px-2 py-1">Variant</th>
                          <th className="border px-2 py-1">Unit</th>
                          {!isManualMode && selectedPO && (
                            <>
                              <th className="border px-2 py-1">Expected</th>
                              <th className="border px-2 py-1">
                                Already Received
                              </th>
                              <th className="border px-2 py-1">Remaining</th>
                            </>
                          )}
                          <th className="border px-2 py-1">
                            Quantity {isManualMode && "(Received)"}
                          </th>
                          <th className="border px-2 py-1">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => {
                          const receivingNow = item.quantity || 0;
                          const expected = item.expectedQuantity || 0;
                          const alreadyReceived = item.receivedSoFar || 0;
                          const remaining = item.remainingQuantity || 0;
                          const willBeComplete =
                            alreadyReceived + receivingNow >= expected;

                          return (
                            <tr
                              key={`${item.itemId}-${idx}`}
                              className={
                                !isManualMode && selectedPO
                                  ? willBeComplete
                                    ? "bg-green-50"
                                    : "bg-yellow-50"
                                  : "bg-white"
                              }
                            >
                              <td className="border px-2 py-1">
                                {item.itemName}
                              </td>
                              <td className="border px-2 py-1">
                                {item.sizeName || "(None)"}
                              </td>
                              <td className="border px-2 py-1">
                                {item.variantName || "(None)"}
                              </td>
                              <td className="border px-2 py-1">
                                {item.unitName || "(None)"}
                              </td>
                              {!isManualMode && selectedPO && (
                                <>
                                  <td className="border px-2 py-1 text-center font-semibold">
                                    {expected}
                                  </td>
                                  <td className="border px-2 py-1 text-center text-blue-600">
                                    {alreadyReceived}
                                  </td>
                                  <td className="border px-2 py-1 text-center text-orange-600 font-semibold">
                                    {remaining}
                                  </td>
                                </>
                              )}
                              <td className="border px-2 py-1">
                                <input
                                  type="number"
                                  value={item.quantity || ""}
                                  onChange={(e) => {
                                    const newQty =
                                      parseInt(e.target.value, 10) || 0;
                                    setItems((prev) =>
                                      prev.map((i, index) =>
                                        index === idx
                                          ? { ...i, quantity: newQty }
                                          : i
                                      )
                                    );
                                  }}
                                  max={
                                    !isManualMode && selectedPO
                                      ? remaining
                                      : undefined
                                  }
                                  className="w-20 border border-gray-300 px-2 py-1 rounded text-center"
                                  placeholder="0"
                                />
                              </td>
                              <td className="border px-2 py-1">
                                <button
                                  type="button"
                                  className="text-red-500 text-xs hover:underline cursor-pointer"
                                  onClick={() =>
                                    setItems(
                                      items.filter((_, index) => index !== idx)
                                    )
                                  }
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="w-full sm:w-auto px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </form>

          {/* Summary Modal and PO Status Modal remain the same... */}
          {showSummary && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-2 sm:p-4">
              <div className="bg-[#ffedce] rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-white border-b-4 border-[#d2bda7] p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-[#173f63] p-2 sm:p-3 rounded-lg">
                      <Package className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#173f63]">
                        Replenishment Summary
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Review details before confirming
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Section - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#ffedce]">
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white p-4 rounded-lg border border-[#d2bda7] shadow-sm">
                      <label className="text-xs font-semibold text-[#482b0e] uppercase tracking-wide">
                        Supplier
                      </label>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {supplier}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-[#d2bda7] shadow-sm">
                      <label className="text-xs font-semibold text-[#482b0e] uppercase tracking-wide">
                        PO Reference Number
                      </label>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {poRefNum}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-[#d2bda7] shadow-sm">
                      <label className="text-xs font-semibold text-[#482b0e] uppercase tracking-wide">
                        DR Number
                      </label>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {drRefNum}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-[#d2bda7] shadow-sm">
                      <label className="text-xs font-semibold text-[#482b0e] uppercase tracking-wide">
                        Remarks
                      </label>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {remarks || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* ✅ NEW: Overstock Warning Section - After Remarks */}
                  {(() => {
                    const overstockItems = items.filter((item) => {
                      const receivingNow = item.quantity || 0;
                      const expected = item.expectedQuantity || 0;
                      const alreadyReceived = item.receivedSoFar || 0;
                      return alreadyReceived + receivingNow > expected;
                    });

                    if (overstockItems.length > 0) {
                      return (
                        <div className="mb-6 bg-yellow-50 border border-yellow-400 rounded-lg p-4">
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle
                              className="text-yellow-600 flex-shrink-0 mt-0.5"
                              size={20}
                            />
                            <div>
                              <h3 className="text-md font-bold text-yellow-800 mb-1">
                                Over-Receiving Detected
                              </h3>
                              <p className="text-sm text-yellow-700">
                                The following items will exceed their expected
                                quantity:
                              </p>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="space-y-2 mb-4">
                            {overstockItems.map((item, idx) => {
                              const receivingNow = item.quantity || 0;
                              const expected = item.expectedQuantity || 0;
                              const alreadyReceived = item.receivedSoFar || 0;
                              const excess =
                                alreadyReceived + receivingNow - expected;

                              return (
                                <div
                                  key={idx}
                                  className="bg-white border border-yellow-200 rounded p-3"
                                >
                                  <div className="font-semibold text-gray-800 text-md mb-1">
                                    {item.itemName}
                                    {item.sizeName && (
                                      <span className="text-gray-600 font-semibold">
                                        {" "}
                                        - {item.sizeName}
                                      </span>
                                    )}
                                    {item.variantName && (
                                      <span className="text-gray-600 font-semibold">
                                        {" "}
                                        - {item.variantName}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-yellow-700">
                                    Expected:{" "}
                                    <span className="font-semibold">
                                      {expected}
                                    </span>{" "}
                                    | Receiving:{" "}
                                    <span className="font-semibold">
                                      {receivingNow}
                                    </span>{" "}
                                    | Excess:{" "}
                                    <span className="font-semibold text-red-600">
                                      +{excess}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer */}
                          <p className="text-xs text-yellow-700 font-medium">
                            Please verify quantities before confirming.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* ✅ NEW: Predicted PO Status - Below DR Number */}
                  <div className="mb-6 bg-white p-4 rounded-lg border border-[#d2bda7] shadow-sm">
                    <label className="text-xs font-semibold text-[#482b0e] uppercase tracking-wide block mb-2">
                      Predicted PO Status After Saving:
                    </label>
                    <div className="flex items-center gap-2">
                      {items.every((item) => {
                        const receivingNow = item.quantity || 0;
                        const expected = item.expectedQuantity || 0;
                        const alreadyReceived = item.receivedSoFar || 0;
                        return alreadyReceived + receivingNow >= expected;
                      }) ? (
                        <>
                          <CheckCircle className="text-green-600" size={20} />
                          <span className="text-sm font-semibold text-green-700">
                            Complete - All items fulfilled
                          </span>
                        </>
                      ) : items.some(
                          (item) =>
                            (item.receivedSoFar || 0) > 0 ||
                            (item.quantity || 0) > 0
                        ) ? (
                        <>
                          <AlertTriangle
                            className="text-yellow-600"
                            size={20}
                          />
                          <span className="text-sm font-semibold text-yellow-700">
                            Partial - Some items still pending
                          </span>
                        </>
                      ) : (
                        <>
                          <Package className="text-gray-600" size={20} />
                          <span className="text-sm font-semibold text-gray-700">
                            Pending - No items received yet
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Items Table - */}
                  <div className="bg-white rounded-lg border border-[#d2bda7] shadow-sm overflow-hidden">
                    <div className="bg-[#f5e6d3] px-3 sm:px-4 py-2 sm:py-3 border-b border-[#d2bda7]">
                      <h3 className="text-xs sm:text-sm font-bold text-[#482b0e] uppercase tracking-wide">
                        Items Summary
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-[#f5e6d3] text-[#482b0e]">
                          <tr>
                            <th className="border-b border-[#d2bda7] px-2 sm:px-3 py-2 text-left font-semibold min-w-[120px]">
                              Item
                            </th>
                            <th className="border-b border-[#d2bda7] px-2 sm:px-3 py-2 text-left font-semibold min-w-[80px]">
                              Size
                            </th>
                            <th className="border-b border-[#d2bda7] px-2 sm:px-3 py-2 text-left font-semibold min-w-[80px]">
                              Variant
                            </th>
                            <th className="border-b border-[#d2bda7] px-2 sm:px-3 py-2 text-left font-semibold min-w-[60px]">
                              Unit
                            </th>
                            <th className="border-b border-[#d2bda7] px-2 sm:px-3 py-2 text-center font-semibold min-w-[70px]">
                              Expected
                            </th>
                            <th className="border-b border-[#d2bda7] px-2 sm:px-3 py-2 text-center font-semibold min-w-[90px]">
                              Already Received
                            </th>
                            <th className="border-b border-[#d2bda7] px-2 sm:px-3 py-2 text-center font-semibold min-w-[80px]">
                              Remaining
                            </th>
                            <th className="border-b border-[#d2bda7] px-2 sm:px-3 py-2 text-center font-semibold min-w-[90px]">
                              Receiving Now
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => {
                            const receivingNow = item.quantity || 0;
                            const expected = item.expectedQuantity || 0;
                            const alreadyReceived = item.receivedSoFar || 0;
                            const remaining = item.remainingQuantity || 0;
                            const willBeComplete =
                              alreadyReceived + receivingNow >= expected;
                            const isOverReceiving =
                              alreadyReceived + receivingNow > expected;

                            return (
                              <tr
                                key={`${item.itemId}-${idx}`}
                                className={`border-b border-[#d2bda7] hover:bg-[#fef5e4] transition-colors ${
                                  isOverReceiving
                                    ? "bg-yellow-100"
                                    : willBeComplete
                                    ? "bg-green-50"
                                    : "bg-white"
                                }`}
                              >
                                <td
                                  className="px-3 py-3 text-gray-800 truncate max-w-0"
                                  title={item.itemName}
                                >
                                  {item.itemName}
                                </td>
                                <td className="px-3 py-3 text-gray-600 truncate max-w-0">
                                  {item.sizeName || (
                                    <span className="text-gray-400 italic">
                                      (None)
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-gray-600 truncate max-w-0">
                                  {item.variantName || (
                                    <span className="text-gray-400 italic">
                                      (None)
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-gray-600 truncate max-w-0">
                                  {item.unitName || (
                                    <span className="text-gray-400 italic">
                                      (None)
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-center font-semibold text-gray-800">
                                  {expected}
                                </td>
                                <td className="px-3 py-3 text-center font-semibold text-blue-600">
                                  {alreadyReceived}
                                </td>
                                <td className="px-3 py-3 text-center font-semibold text-orange-600">
                                  {remaining}
                                </td>
                                <td
                                  className={`px-3 py-3 text-center font-bold ${
                                    isOverReceiving
                                      ? "text-red-600"
                                      : "text-[#173f63]"
                                  }`}
                                >
                                  {receivingNow}
                                  {isOverReceiving && (
                                    <span className="ml-1 text-xs">⚠️</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer Section with Actions */}
                <div className="bg-white border-t-4 border-[#d2bda7] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setShowSummary(false)}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveReplenishment}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#674d33] text-white rounded-lg hover:bg-[#d2bda7] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {isSaving && (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {isSaving ? "Saving..." : "Confirm & Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPOStatusModal && poStatusSummary && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-2 sm:p-4">
              <div className="bg-[#ffedce] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header Section */}
                <div className="bg-white border-b-4 border-[#d2bda7] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#173f63] p-3 rounded-lg">
                        <Package className="text-white" size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#173f63]">
                          Purchase Order Status Update
                        </h2>
                        <p className="text-sm text-gray-600">
                          Receipt confirmation completed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#ffedce]">
                  {/* PO Info Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-[#d2bda7] shadow-sm">
                      <label className="text-xs font-semibold text-[#482b0e] uppercase tracking-wide">
                        PO Number
                      </label>
                      <p className="text-lg font-bold text-blue-600 mt-1">
                        {poStatusSummary.poNumber}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-[#d2bda7] shadow-sm">
                      <label className="text-xs font-semibold text-[#482b0e] uppercase tracking-wide">
                        Overall Status
                      </label>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                            poStatusSummary.status === "Complete"
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : poStatusSummary.status === "Partial"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              : "bg-gray-100 text-gray-800 border border-gray-300"
                          }`}
                        >
                          {poStatusSummary.status === "Complete" ? (
                            <CheckCircle size={16} />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                          {poStatusSummary.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary Banner */}
                  {poStatusSummary.status === "Complete" ? (
                    <div className="mb-6 bg-green-50 border border-green-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle
                          className="text-green-600 flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <div>
                          <h3 className="text-md font-bold text-green-800 mb-1">
                            All Items Received
                          </h3>
                          <p className="text-sm text-green-700">
                            This purchase order has been fully fulfilled. All
                            expected items have been received.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          className="text-yellow-600 flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <div>
                          <h3 className="text-md font-bold text-yellow-800 mb-1">
                            Partial Receipt
                          </h3>
                          <p className="text-sm text-yellow-700">
                            Some items are still pending. The purchase order
                            remains open for additional deliveries.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items Table */}
                  <div className="bg-white rounded-lg border border-[#d2bda7] shadow-sm overflow-hidden">
                    <div className="bg-[#f5e6d3] px-4 py-3 border-b border-[#d2bda7]">
                      <h3 className="text-sm font-bold text-[#482b0e] uppercase tracking-wide">
                        Items Status
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#f5e6d3] text-[#482b0e]">
                          <tr>
                            <th className="border-b border-[#d2bda7] px-4 py-3 text-left font-semibold">
                              Item Name
                            </th>
                            <th className="border-b border-[#d2bda7] px-4 py-3 text-center font-semibold w-28">
                              Expected
                            </th>
                            <th className="border-b border-[#d2bda7] px-4 py-3 text-center font-semibold w-28">
                              Received
                            </th>
                            <th className="border-b border-[#d2bda7] px-4 py-3 text-center font-semibold w-28">
                              Remaining
                            </th>
                            <th className="border-b border-[#d2bda7] px-4 py-3 text-center font-semibold w-24">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {poStatusSummary.items.map((item, idx) => {
                            const isComplete = item.remaining === 0;
                            return (
                              <tr
                                key={idx}
                                className={`border-b border-[#d2bda7] hover:bg-[#fef5e4] transition-colors ${
                                  isComplete ? "bg-green-50" : "bg-yellow-50"
                                }`}
                              >
                                <td className="px-4 py-3 text-gray-800 font-medium">
                                  {item.itemName}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-gray-800">
                                  {item.expected}
                                </td>
                                <td className="px-4 py-3 text-center text-blue-600 font-bold">
                                  {item.received}
                                </td>
                                <td className="px-4 py-3 text-center text-orange-600 font-bold">
                                  {item.remaining}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {isComplete ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <CheckCircle
                                        className="text-green-600"
                                        size={20}
                                      />
                                      <span className="text-xs font-semibold text-green-700">
                                        Complete
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1">
                                      <AlertTriangle
                                        className="text-yellow-600"
                                        size={20}
                                      />
                                      <span className="text-xs font-semibold text-yellow-700">
                                        Pending
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Status Legend */}
                  {/* <div className="mt-4 flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={16} />
                      <span className="text-gray-600">Item Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="text-yellow-600" size={16} />
                      <span className="text-gray-600">Item Pending</span>
                    </div>
                  </div> */}
                </div>

                {/* Footer Section with Actions */}
                <div className="bg-white border-t-4 border-[#d2bda7] p-6">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPOStatusModal(false);
                        onSaveSuccess?.();
                        setTimeout(() => {
                          window.location.href = "/warehouse/replenishment_log";
                        }, 500);
                      }}
                      className="px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-md flex items-center gap-2"
                    >
                      Done
                      <CheckCircle size={18} />
                    </button>
                  </div>
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
