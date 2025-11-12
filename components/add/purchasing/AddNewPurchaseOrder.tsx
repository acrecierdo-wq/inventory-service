// // app/components/add/purchasing/add_purchase_order.tsx

// "use client";

// import { useEffect, useState, ChangeEvent } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";

// type Supplier = {
//   id: number;
//   supplierName: string;
//   contactNumber: string;
//   email: string;
//   role: string;
//   tinNumber: string;
//   address: string;
//   status: string;
//   loggedBy: string;
//   createdAt: string;
//   updatedAt: string;
// };

// type Item = {
//   id: number;
//   name: string;
//   purchasingPurchaseOrderId?: number;
//   itemId?: number;
//   sizeId?: number;
//   variantId?: number;
//   unitId?: number;
//   quantity?: number;
//   unitPrice?: number;
//   totalPrice?: number | string;
// };

// type FormState = {
//   supplierId: string;
//   terms: string;
//   deliveryMode: string;
//   projectName: string;
//   remarks: string;
//   preparedBy: string;
//   items: Item[];
// };

// export default function AddPurchaseOrderModal({
//   onClose,
// }: {
//   onClose: () => void;
// }) {
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [items, setItems] = useState<Item[]>([]);
//   const [form, setForm] = useState<FormState>({
//     supplierId: "",
//     terms: "",
//     deliveryMode: "",
//     projectName: "",
//     remarks: "",
//     preparedBy: "",
//     items: [],
//   });
//   const [loading, setLoading] = useState(false);

//   // ✅ Fetch suppliers & items
//   useEffect(() => {
//     const loadSuppliers = async () => {
//       const res = await fetch("/api/purchasing/suppliers");
//       const data = await res.json();
//       setSuppliers(data.data || data);
//     };

//     const loadItems = async () => {
//       const res = await fetch("/api/items");
//       const data = await res.json();
//       setItems(data.data || data);
//     };

//     loadSuppliers();
//     loadItems();
//   }, []);

//   // ✅ Add new item row
//   const addItemRow = (): void => {
//     setForm((prev) => ({
//       ...prev,
//       items: [
//         ...prev.items,
//         {
//           id: 0,
//           name: "",
//           itemId: 0,
//           quantity: 1,
//           unitPrice: 0,
//           totalPrice: 0,
//         },
//       ],
//     }));
//   };

//   // ✅ Update item field
//   const updateItemRow = <K extends keyof Item>(
//     index: number,
//     field: K,
//     value: Item[K]
//   ): void => {
//     const updated = [...form.items];
//     updated[index] = { ...updated[index], [field]: value };
//     setForm({ ...form, items: updated });
//   };

//   // ✅ Remove a row
//   const removeItemRow = (index: number): void => {
//     setForm((prev) => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== index),
//     }));
//   };

//   // ✅ Submit handler
//   const handleSubmit = async (): Promise<void> => {
//     if (!form.supplierId) {
//       alert("Please select a supplier.");
//       return;
//     }
//     if (form.items.length === 0) {
//       alert("Please add at least one item.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/purchasing/purchase_orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       if (res.ok) {
//         alert("Purchase Order created successfully!");
//         onClose();
//       } else {
//         alert("Failed to create Purchase Order.");
//       }
//     } catch (err) {
//       console.error("Error creating PO:", err);
//       alert("An error occurred while creating the purchase order.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-semibold text-[#173f63]">
//             New Purchase Order
//           </DialogTitle>
//         </DialogHeader>

//         {/* Supplier Details */}
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <div>
//             <label className="text-sm font-medium">Supplier</label>
//             <Select
//               onValueChange={(val) => setForm({ ...form, supplierId: val })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Supplier" />
//               </SelectTrigger>
//               <SelectContent>
//                 {suppliers.map((s) => (
//                   <SelectItem key={s.id} value={s.id.toString()}>
//                     {s.supplierName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div>
//             <label className="text-sm font-medium">Terms (Payment)</label>
//             <Input
//               value={form.terms}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setForm({ ...form, terms: e.target.value })
//               }
//               placeholder="e.g. 30 days credit"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Mode of Delivery</label>
//             <Select
//               onValueChange={(val) => setForm({ ...form, deliveryMode: val })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select delivery mode" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Pickup">Pickup</SelectItem>
//                 <SelectItem value="Delivery">Delivery</SelectItem>
//                 <SelectItem value="Other">Other</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div>
//             <label className="text-sm font-medium">Project Name</label>
//             <Input
//               value={form.projectName}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setForm({ ...form, projectName: e.target.value })
//               }
//               placeholder="Enter project name"
//             />
//           </div>
//         </div>

//         {/* Item Table */}
//         <div className="mt-6">
//           <h3 className="font-semibold text-[#173f63] mb-2">Items</h3>
//           <table className="min-w-full border border-gray-300 rounded">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-3 py-2 text-left">Item</th>
//                 <th className="px-3 py-2 text-left">Qty</th>
//                 <th className="px-3 py-2 text-left">Unit Price</th>
//                 <th className="px-3 py-2 text-left">Total</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {form.items.map((row, index) => {
//                 const total = (row.quantity || 0) * (row.unitPrice || 0);
//                 return (
//                   <tr key={index} className="border-t">
//                     <td className="px-3 py-2">
//                       <Select
//                         onValueChange={(val) =>
//                           updateItemRow(index, "itemId", Number(val))
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select item" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {items.map((i) => (
//                             <SelectItem key={i.id} value={i.id.toString()}>
//                               {i.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </td>

//                     <td className="px-3 py-2">
//                       <Input
//                         type="number"
//                         value={row.quantity ?? 1}
//                         onChange={(e) =>
//                           updateItemRow(index, "quantity", Number(e.target.value))
//                         }
//                         className="w-20"
//                       />
//                     </td>

//                     <td className="px-3 py-2">
//                       <Input
//                         type="number"
//                         value={row.unitPrice ?? 0}
//                         onChange={(e) =>
//                           updateItemRow(index, "unitPrice", Number(e.target.value))
//                         }
//                         className="w-24"
//                       />
//                     </td>

//                     <td className="px-3 py-2">₱{total.toFixed(2)}</td>

//                     <td className="px-3 py-2 text-right">
//                       <button
//                         className="h-5 w-5 text-red-500 text-xs hover:underline cursor-pointer rounded-full"
//                         onClick={() => removeItemRow(index)}
//                       >
//                         ✕
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           <div className="mt-3">
//             <Button variant="outline" onClick={addItemRow}>
//               + Add Item
//             </Button>
//           </div>
//         </div>

//         {/* Remarks */}
//         <div className="mt-6">
//           <label className="text-sm font-medium">Remarks</label>
//           <Textarea
//             value={form.remarks}
//             onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
//               setForm({ ...form, remarks: e.target.value })
//             }
//             placeholder="Enter remarks or special notes"
//           />
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-2 mt-6">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} disabled={loading}>
//             {loading ? "Saving..." : "Save Purchase Order"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// app/components/add/purchasing/add_purchase_order.tsx
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import AutoComplete from "@/components/autocomplete/AutoComplete";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [projectName, setProjectName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  // Items
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<Selection | null>(null);
  const [selectedSize, setSelectedSize] = useState<Selection | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Selection | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Selection | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [combinations, setCombinations] = useState<Combination[]>([]);

  // --- Derive dynamic options ---
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
        .filter(
          (c) =>
            (!selectedSize || c.sizeId === Number(selectedSize.id)) &&
            c.variantId != null &&
            c.variantName
        )
        .map((c) => [String(c.variantId), { id: String(c.variantId), name: c.variantName! }])
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
            return c.sizeId === Number(selectedSize.id) && c.unitId != null && c.unitName;
          }
          return c.unitId != null && c.unitName;
        })
        .map((c) => [String(c.unitId), { id: String(c.unitId), name: c.unitName! }])
    ).values()
  );

  // --- Fetch supplier details automatically ---
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

  // --- Fetch item options when item changes ---
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
        const res = await fetch(`/api/inventory-options?itemName=${encodeURIComponent(selectedItem.name)}`);
        if (!res.ok) throw new Error("Failed to fetch item options");
        const data: Combination[] = await res.json();
        setCombinations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("inventory-options error:", err);
        setCombinations([]);
      }
    };
    fetchOptions();
  }, [selectedItem]);

  // --- Auto reset dependent selections ---
  useEffect(() => {
    setSelectedVariant(null);
    setSelectedUnit(null);
  }, [selectedSize]);

  useEffect(() => {
    setSelectedUnit(null);
  }, [selectedVariant]);

  // --- Auto assign user info ---
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

  // --- Add Item to PO list ---
  const handleAddItem = () => {
    if (!selectedItem) return toast.error("Select an item first");
    if (!quantity || Number(quantity) <= 0) return toast.error("Enter a valid quantity");
    if (!unitPrice || Number(unitPrice) <= 0) return toast.error("Enter a valid unit price");

    const newItem: PurchaseOrderItem = {
      itemId: String(selectedItem.id),
      itemName: selectedItem.name,
      sizeId: selectedSize ? String(selectedSize.id) : null,
      sizeName: selectedSize?.name || null,
      variantId: selectedVariant ? String(selectedVariant.id) : null,
      variantName: selectedVariant?.name || null,
      unitId: selectedUnit ? String(selectedUnit.id) : null,
      unitName: selectedUnit?.name || null,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalPrice: Number(quantity) * Number(unitPrice),
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedItem(null);
    setSelectedSize(null);
    setSelectedVariant(null);
    setSelectedUnit(null);
    setQuantity("");
    setUnitPrice("");
  };

  // --- Submit PO ---
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
        <h1 className="text-3xl font-bold text-[#173f63] mb-6">Create Purchase Order</h1>

        <form className="bg-white p-6 rounded shadow grid grid-cols-2 gap-4">
          {/* Supplier Info */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]"></label>
            <AutoComplete
              endpoint="/api/purchasing/suppliers"
              value={supplier}
              onChange={setSupplier}
              label="Supplier"
              
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">PO Number</label>
            <div>{poNumber}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Address</label>
            <input value={supplierAddress} disabled className="border border-[#d2bda7] p-2 rounded w-full bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Contact</label>
            <input value={supplierContact} disabled className="border border-[#d2bda7] p-2 rounded w-full bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">TIN</label>
            <input value={supplierTIN} disabled className="border border-[#d2bda7] p-2 rounded w-full bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Terms</label>
            <input
              type="text"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g., 30 days"
              className="border border-[#d2bda7] p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Delivery Mode</label>
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
              className="mt-2 border border-[#d2bda7] p-2 rounded w-full"
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value)}
            />
          )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Project Name</label>
            <input
              type="text"
              value={projectName}
              placeholder="Enter project name..."
              onChange={(e) => setProjectName(e.target.value)}
              className="border border-[#d2bda7] p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Remarks</label>
            <input
              type="text"
              value={remarks}
              placeholder="Enter remarks..."
              onChange={(e) => setRemarks(e.target.value)}
              className="border border-[#d2bda7] p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Prepared by:</label>
            <span className="capitalize">{preparedBy}</span>
          </div>

          {/* Items Section */}
          <div className="col-span-2 border-t pt-4 mt-4">
            <h2 className="text-lg font-bold mb-3 text-[#173f63]">Add Items</h2>

            <div className="grid grid-cols-6 gap-2">
              <AutoComplete
                label="Item"
                endpoint="/api/autocomplete/item-name"
                value={selectedItem}
                onChange={setSelectedItem}
              />
              <AutoComplete
                label="Size"
                options={availableSizes}
                value={selectedSize}
                onChange={setSelectedSize}
              />
              <AutoComplete
                label="Variant"
                options={availableVariants}
                value={selectedVariant}
                onChange={setSelectedVariant}
              />
              <AutoComplete
                label="Unit"
                options={availableUnits}
                value={selectedUnit}
                onChange={setSelectedUnit}
              />
              <div>
                <label className="block text-sm font-medium">Quantity</label>
              <input
                type="number"
                placeholder="Enter quantity..."
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded disabled:bg-gray-100 hover:bg-gray-100"
              />
              </div>
              <div>
                <label className="block text-sm font-medium">Unit Price</label>
                <input
                type="number"
                placeholder="Enter unit price..."
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full border border-[#d2bda7] p-2 rounded disabled:bg-gray-100 hover:bg-gray-100"
              />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-3 bg-[#d2bda7] px-4 py-2 text-sm rounded text-white hover:bg-[#674d33] cursor-pointer"
            >
              Add Item
            </button>

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
                        <td className="border px-2 py-1">{i.sizeName || "-"}</td>
                        <td className="border px-2 py-1">{i.variantName || "-"}</td>
                        <td className="border px-2 py-1">{i.unitName || "-"}</td>
                        <td className="border px-2 py-1 text-center">{i.quantity}</td>
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
      </section>
    </main>
  );
}
