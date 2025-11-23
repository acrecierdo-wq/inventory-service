"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import AutoComplete from "@/components/autocomplete/AutoComplete";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OCRModeModal from "@/components/modals/OCRModeModal";
import WebcamCaptureModal from "@/components/modals/WebcamCaptureModal";
import { Trash2, Plus } from "lucide-react";

type Selection = { id: string | number; name: string };

interface Combination {
  itemId: number;
  itemName: string;
  sizeId?: number | null;
  sizeName?: string | null;
  variantId?: number | null;
  variantName?: string | null;
  unitId?: number | null;
  unitName?: string | null;
}

interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  sizeId: string | null;
  sizeName: string | null;
  variantId: string | null;
  variantName: string | null;
  unitId: string | null;
  unitName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InputRow {
  id: string;
  selectedItem: Selection | null;
  selectedSize: Selection | null;
  selectedVariant: Selection | null;
  selectedUnit: Selection | null;
  quantity: string;
  unitPrice: string;
  combinations: Combination[];
}

export default function AddPurchaseOrder() {
  const { user } = useUser();

  // Supplier info
  const [supplier, setSupplier] = useState<Selection | null>(null);
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierTIN, setSupplierTIN] = useState("");

  // PO header fields
  const [terms, setTerms] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("mode");
  const [otherDeliveryMode, setOtherDeliveryMode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [date] = useState(() => new Date().toISOString().split("T")[0]);

  // OCR-related states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showOCRModeModal, setShowOCRModeModal] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);

  // Dynamic input rows
  const [inputRows, setInputRows] = useState<InputRow[]>([
    {
      id: crypto.randomUUID(),
      selectedItem: null,
      selectedSize: null,
      selectedVariant: null,
      selectedUnit: null,
      quantity: "",
      unitPrice: "",
      combinations: [],
    },
  ]);

  // Final items list
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  // === OCR HANDLERS ===

  const handleScanClick = () => {
    setShowOCRModeModal(true);
  };

  const handleSelectWebcam = () => {
    setShowWebcamModal(true);
  };

  const handleSelectUpload = () => {
    fileInputRef.current?.click();
  };

  const handleWebcamCapture = (file: File) => {
    handleOCRFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleOCRFile(file);
    }
    e.target.value = "";
  };

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const unsignedPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && unsignedPreset) {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", unsignedPreset);

      const res = await fetch(url, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Cloudinary upload failed");
      const json = await res.json();
      return json.secure_url as string;
    }

    throw new Error("Cloudinary config missing");
  }

  /**
   * Main OCR processing function for Purchase Orders
   * ONLY auto-fills: terms, project name, remarks, and items
   * Supplier selection is manual (OCR just helps find match in dropdown)
   */
  async function handleOCRFile(file: File) {
    setIsScanning(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      console.log("☁️ Uploaded to Cloudinary:", cloudinaryUrl);

      const ocrRes = await fetch("/api/ocr/purchase-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: cloudinaryUrl }),
      });

      if (!ocrRes.ok) {
        const err = await ocrRes.json().catch(() => null);
        throw new Error(err?.error || "OCR request failed");
      }

      const ocrJson = await ocrRes.json();
      const fields = ocrJson.fields || {};

      console.log("📦 OCR Extracted Fields:", fields);

      // ✅ Step 1: Try to match supplier from database (but don't auto-fill address/contact/TIN)
      if (fields.supplierName) {
        const supplierRes = await fetch(
          `/api/autocomplete/supplier-name?query=${encodeURIComponent(
            fields.supplierName
          )}`
        );
        if (supplierRes.ok) {
          const suppliers = await supplierRes.json();
          if (suppliers.length > 0) {
            setSupplier({ id: suppliers[0].id, name: suppliers[0].name });
            console.log("✅ Supplier matched from DB:", suppliers[0].name);
            toast.success(`Found supplier: ${suppliers[0].name}`, {
              duration: 3000,
            });
          } else {
            toast.info(
              `Supplier "${fields.supplierName}" not found in database. Please select manually.`,
              { duration: 5000 }
            );
          }
        }
      }

      // ✅ Step 2: Auto-fill ONLY terms, project name, and remarks
      if (fields.terms) {
        setTerms(fields.terms);
        console.log("✅ Auto-filled Terms:", fields.terms);
      }

      if (fields.projectName) {
        setProjectName(fields.projectName);
        console.log("✅ Auto-filled Project Name:", fields.projectName);
      }

      if (fields.remarks) {
        setRemarks(fields.remarks);
        console.log("✅ Auto-filled Remarks:", fields.remarks);
      }

      // ✅ Step 3: Create input rows for each detected item
      if (Array.isArray(fields.items) && fields.items.length > 0) {
        const newRows: InputRow[] = [];

        for (const extractedItem of fields.items) {
          const row = await createInputRowFromOCR(extractedItem);
          newRows.push(row);
        }

        setInputRows(newRows);

        toast.success(
          `✅ Scanned ${fields.items.length} item(s). Review and add to list.`,
          { duration: 5000 }
        );
      } else {
        toast.info("No items extracted from the purchase order.");
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
   */
  async function createInputRowFromOCR(extractedItem: {
    itemName: string | null;
    quantity: number | null;
    unit: string | null;
    unitPrice: number | null;
    size: string | null;
    description: string;
  }): Promise<InputRow> {
    const { itemName, quantity, unit, unitPrice, size } = extractedItem;

    const row: InputRow = {
      id: crypto.randomUUID(),
      selectedItem: null,
      selectedSize: null,
      selectedVariant: null,
      selectedUnit: null,
      quantity: quantity ? String(quantity) : "",
      unitPrice: unitPrice ? String(unitPrice) : "",
      combinations: [],
    };

    if (!itemName) return row;

    try {
      // Step 1: Search for the item
      const acRes = await fetch(
        `/api/autocomplete/item-name?query=${encodeURIComponent(itemName)}`
      );
      if (!acRes.ok) return row;

      const items = await acRes.json();
      if (!Array.isArray(items) || items.length === 0) return row;

      const matchedItem = items[0];
      row.selectedItem = { id: matchedItem.id, name: matchedItem.name };

      // Step 2: Fetch combinations for this item
      const combRes = await fetch(
        `/api/inventory-options?itemName=${encodeURIComponent(
          matchedItem.name
        )}`
      );
      if (!combRes.ok) return row;

      const combinations: Combination[] = await combRes.json();
      row.combinations = Array.isArray(combinations) ? combinations : [];

      // Step 3: Match size if extracted
      if (size && row.combinations.length > 0) {
        const availableSizes = Array.from(
          new Map(
            row.combinations
              .filter((c) => c.sizeId != null && c.sizeName)
              .map((c) => [
                String(c.sizeId),
                { id: String(c.sizeId!), name: c.sizeName! },
              ])
          ).values()
        );

        const matchedSize = availableSizes.find((s) =>
          s.name.toLowerCase().includes(size.toLowerCase())
        );
        if (matchedSize) {
          row.selectedSize = matchedSize;
        }
      }

      // Step 4: Match unit if extracted
      if (unit && row.combinations.length > 0) {
        const availableUnits = Array.from(
          new Map(
            row.combinations
              .filter((c) => c.unitId != null && c.unitName)
              .map((c) => [
                String(c.unitId),
                { id: String(c.unitId!), name: c.unitName! },
              ])
          ).values()
        );

        const matchedUnit = availableUnits.find((u) =>
          u.name.toLowerCase().includes(unit.toLowerCase())
        );
        if (matchedUnit) {
          row.selectedUnit = matchedUnit;
        }
      }

      return row;
    } catch (err) {
      console.error("Error creating row from OCR:", err);
      return row;
    }
  }

  // === EXISTING LOGIC ===

  // Fetch supplier details automatically when supplier is selected
  useEffect(() => {
    const fetchSupplierDetails = async () => {
      if (!supplier) {
        setSupplierAddress("");
        setSupplierContact("");
        setSupplierTIN("");
        return;
      }
      try {
        const res = await fetch(`/api/purchasing/suppliers/${supplier.id}`);
        if (res.ok) {
          const data = await res.json();
          setSupplierAddress(data.address || "");
          setSupplierContact(data.contactNumber || "");
          setSupplierTIN(data.tinNumber || "");
        }
      } catch {
        console.error("Failed to fetch supplier details");
      }
    };
    fetchSupplierDetails();
  }, [supplier]);

  useEffect(() => {
    const fetchNextPoNumber = async () => {
      try {
        const res = await fetch("/api/purchasing/purchase_orders/next");
        const data = await res.json();
        setPoNumber(data.nextPoNumber);
      } catch {
        setPoNumber("Error");
      }
    };
    fetchNextPoNumber();
  }, []);

  useEffect(() => {
    if (user) {
      setPreparedBy(
        user.username ||
          user.fullName ||
          user.firstName ||
          user.primaryEmailAddress?.emailAddress ||
          ""
      );
    }
  }, [user]);

  useEffect(() => {
    inputRows.forEach((row, index) => {
      if (!row.selectedItem) return;

      const fetchOptions = async () => {
        try {
          const res = await fetch(
            `/api/inventory-options?itemName=${encodeURIComponent(
              row.selectedItem!.name
            )}`
          );
          if (!res.ok) throw new Error("Failed to fetch item options");
          const data: Combination[] = await res.json();

          setInputRows((prev) =>
            prev.map((r, i) =>
              i === index
                ? { ...r, combinations: Array.isArray(data) ? data : [] }
                : r
            )
          );
        } catch (err) {
          console.error("inventory-options error:", err);
        }
      };
      fetchOptions();
    });
  }, [inputRows]);

  const getAvailableSizes = (combinations: Combination[]) => {
    return Array.from(
      new Map(
        combinations
          .filter((c) => c.sizeId != null && c.sizeName)
          .map((c) => [
            String(c.sizeId),
            { id: String(c.sizeId), name: c.sizeName! },
          ])
      ).values()
    );
  };

  const getAvailableVariants = (
    combinations: Combination[],
    selectedSize: Selection | null
  ) => {
    return Array.from(
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
  };

  const getAvailableUnits = (
    combinations: Combination[],
    selectedSize: Selection | null,
    selectedVariant: Selection | null
  ) => {
    return Array.from(
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
  };

  const handleAddRow = () => {
    setInputRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        selectedItem: null,
        selectedSize: null,
        selectedVariant: null,
        selectedUnit: null,
        quantity: "",
        unitPrice: "",
        combinations: [],
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setInputRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddAllRows = () => {
    const newItems: PurchaseOrderItem[] = [];

    for (const row of inputRows) {
      if (!row.selectedItem) {
        toast.error("Please select an item for all rows");
        return;
      }
      if (!row.quantity || Number(row.quantity) <= 0) {
        toast.error("Please enter valid quantity for all rows");
        return;
      }
      if (!row.unitPrice || Number(row.unitPrice) <= 0) {
        toast.error("Please enter valid unit price for all rows");
        return;
      }

      newItems.push({
        itemId: String(row.selectedItem.id),
        itemName: row.selectedItem.name,
        sizeId: row.selectedSize ? String(row.selectedSize.id) : null,
        sizeName: row.selectedSize?.name || null,
        variantId: row.selectedVariant ? String(row.selectedVariant.id) : null,
        variantName: row.selectedVariant?.name || null,
        unitId: row.selectedUnit ? String(row.selectedUnit.id) : null,
        unitName: row.selectedUnit?.name || null,
        quantity: Number(row.quantity),
        unitPrice: Number(row.unitPrice),
        totalPrice: Number(row.quantity) * Number(row.unitPrice),
      });
    }

    setItems((prev) => [...prev, ...newItems]);

    setInputRows([
      {
        id: crypto.randomUUID(),
        selectedItem: null,
        selectedSize: null,
        selectedVariant: null,
        selectedUnit: null,
        quantity: "",
        unitPrice: "",
        combinations: [],
      },
    ]);

    toast.success("Items added successfully!");
  };

  const handleSubmit = async () => {
    if (!supplier) return toast.error("Please select a supplier");
    if (items.length === 0) return toast.error("Add at least one item");

    const payload = {
      poNumber,
      date,
      supplierId: supplier.id,
      terms,
      deliveryMode,
      projectName,
      remarks,
      preparedBy,
      items: items.map((i) => ({
        itemId: Number(i.itemId),
        sizeId: i.sizeId ? Number(i.sizeId) : null,
        variantId: i.variantId ? Number(i.variantId) : null,
        unitId: i.unitId ? Number(i.unitId) : null,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
    };

    try {
      const res = await fetch("/api/purchasing/purchase_orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save purchase order");

      toast.success("Purchase order saved successfully!");
      setTimeout(() => {
        window.location.href = "/purchasing/p_purchase_order";
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Error saving purchase order");
    }
  };

  const totalPOAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);

  return (
    <main className="bg-[#ffedce] min-h-screen w-full">
      <Header />
      <section className="p-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#173f63] mb-6">
          Create Purchase Order
        </h1>

        <form className="bg-white p-6 rounded shadow grid grid-cols-2 gap-4">
          {/* Supplier Info */}
          <div>
            <AutoComplete
              endpoint="/api/purchasing/suppliers"
              value={supplier}
              onChange={setSupplier}
              label="Supplier"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              PO Number
            </label>
            <div>{poNumber}</div>
          </div>

          {/* ✅ TRULY DISABLED AND READ-ONLY ADDRESS/CONTACT/TIN */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              Address
            </label>
            <input
              value={supplierAddress}
              onChange={(e) => setSupplierAddress(e.target.value)}
              disabled={!supplier}
              readOnly
              className="border border-[#d2bda7] p-2 rounded w-full disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-500"
              placeholder={!supplier ? "Select supplier first" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              Contact
            </label>
            <input
              value={supplierContact}
              onChange={(e) => setSupplierContact(e.target.value)}
              disabled={!supplier}
              readOnly
              className="border border-[#d2bda7] p-2 rounded w-full disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-500"
              placeholder={!supplier ? "Select supplier first" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              TIN
            </label>
            <input
              value={supplierTIN}
              onChange={(e) => setSupplierTIN(e.target.value)}
              disabled={!supplier}
              readOnly
              className="border border-[#d2bda7] p-2 rounded w-full disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-500"
              placeholder={!supplier ? "Select supplier first" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              Terms
            </label>
            <input
              type="text"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g., 30 days"
              className="border border-[#d2bda7] p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              Delivery Mode
            </label>
            <Select onValueChange={setDeliveryMode} value={deliveryMode}>
              <SelectTrigger className="border border-[#d2bda7] p-2 w-full rounded cursor-pointer">
                <SelectValue placeholder="Select a mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mode">Select mode</SelectItem>
                <SelectItem value="deliver">Deliver</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {deliveryMode === "other" && (
              <input
                type="text"
                placeholder="Please specify other delivery mode"
                className="w-full border rounded-lg px-4 py-2 hover:bg-gray-100 mt-2"
                value={otherDeliveryMode}
                onChange={(e) => setOtherDeliveryMode(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              placeholder="Enter project name..."
              onChange={(e) => setProjectName(e.target.value)}
              className="border border-[#d2bda7] p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              placeholder="Enter remarks..."
              onChange={(e) => setRemarks(e.target.value)}
              className="border border-[#d2bda7] p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">
              Prepared by:
            </label>
            <span className="capitalize">{preparedBy}</span>
          </div>

          {/* Items Section with OCR */}
          <div className="col-span-2 border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#173f63]">Add Items</h2>
              <button
                type="button"
                onClick={handleScanClick}
                disabled={isScanning}
                className="bg-[#0b74ff] px-3 py-2 text-sm rounded text-white hover:bg-[#0966d6] flex items-center gap-2 disabled:opacity-50"
              >
                {isScanning ? "Scanning..." : "Scan via OCR"}
              </button>
            </div>

            <div className="space-y-4">
              {inputRows.map((row) => {
                const availableSizes = getAvailableSizes(row.combinations);
                const availableVariants = getAvailableVariants(
                  row.combinations,
                  row.selectedSize
                );
                const availableUnits = getAvailableUnits(
                  row.combinations,
                  row.selectedSize,
                  row.selectedVariant
                );

                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-7 gap-2 items-end border p-3 rounded bg-gray-50"
                  >
                    <AutoComplete
                      label="Item"
                      endpoint="/api/autocomplete/item-name"
                      value={row.selectedItem}
                      onChange={(val) =>
                        setInputRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? {
                                  ...r,
                                  selectedItem: val,
                                  selectedSize: null,
                                  selectedVariant: null,
                                  selectedUnit: null,
                                }
                              : r
                          )
                        )
                      }
                    />
                    <AutoComplete
                      label="Size"
                      options={availableSizes}
                      value={row.selectedSize}
                      onChange={(val) =>
                        setInputRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? {
                                  ...r,
                                  selectedSize: val,
                                  selectedVariant: null,
                                  selectedUnit: null,
                                }
                              : r
                          )
                        )
                      }
                    />
                    <AutoComplete
                      label="Variant"
                      options={availableVariants}
                      value={row.selectedVariant}
                      onChange={(val) =>
                        setInputRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? {
                                  ...r,
                                  selectedVariant: val,
                                  selectedUnit: null,
                                }
                              : r
                          )
                        )
                      }
                    />
                    <AutoComplete
                      label="Unit"
                      options={availableUnits}
                      value={row.selectedUnit}
                      onChange={(val) =>
                        setInputRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? { ...r, selectedUnit: val } : r
                          )
                        )
                      }
                    />
                    <div>
                      <label className="block text-sm font-medium">
                        Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="Qty..."
                        value={row.quantity}
                        onChange={(e) =>
                          setInputRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, quantity: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-full border border-[#d2bda7] p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        placeholder="Price..."
                        value={row.unitPrice}
                        onChange={(e) =>
                          setInputRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, unitPrice: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-full border border-[#d2bda7] p-2 rounded"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                        title="Add Row"
                      >
                        <Plus size={20} />
                      </button>
                      {inputRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                          title="Remove Row"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddAllRows}
              className="mt-4 bg-[#674d33] px-6 py-2 text-sm rounded hover:bg-[#d2bda7] text-white font-medium"
            >
              Add Items to List
            </button>

            {/* Hidden file input for OCR upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />

            {/* Final items table */}
            {items.length > 0 && (
              <div className="mt-4">
                <table className="w-full border text-sm">
                  <thead className="bg-[#f5e6d3]">
                    <tr>
                      <th className="border px-2 py-1">Item</th>
                      <th className="border px-2 py-1">Size</th>
                      <th className="border px-2 py-1">Variant</th>
                      <th className="border px-2 py-1">Unit</th>
                      <th className="border px-2 py-1">Qty</th>
                      <th className="border px-2 py-1">Unit Price</th>
                      <th className="border px-2 py-1">Total</th>
                      <th className="border px-2 py-1">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{i.itemName}</td>
                        <td className="border px-2 py-1">
                          {i.sizeName || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {i.variantName || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {i.unitName || "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {i.quantity}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          {i.unitPrice.toFixed(2)}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          {i.totalPrice.toFixed(2)}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setItems(items.filter((_, x) => x !== idx))
                            }
                            className="text-red-500 hover:underline text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right font-semibold mt-2">
                  Grand Total: ₱{totalPOAmount.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-2 mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Save PO
            </button>
          </div>
        </form>

        {/* OCR Modals */}
        {showOCRModeModal && (
          <OCRModeModal
            onClose={() => setShowOCRModeModal(false)}
            onSelectWebcam={handleSelectWebcam}
            onSelectUpload={handleSelectUpload}
          />
        )}

        {showWebcamModal && (
          <WebcamCaptureModal
            onClose={() => setShowWebcamModal(false)}
            onCapture={handleWebcamCapture}
          />
        )}
      </section>
    </main>
  );
}
