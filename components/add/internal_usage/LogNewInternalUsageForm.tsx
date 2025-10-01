// // app/components/add/LogNewInternalUsageForm.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { Header } from "@/components/header";
// import { toast } from "sonner";
// import AutoComplete from "@/components/autocomplete/AutoComplete";
// import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
// import { useUser } from "@clerk/nextjs";

// type Selection = { id: string | number; name: string };

// type Combination = {
//   itemId: number;
//   sizeId: number | null;
//   sizeName: string | null;
//   variantId: number | null;
//   variantName: string | null;
//   unitId: number | null;
//   unitName: string | null;
// };

// type FormItem = {
//   itemId: string;
//   sizeId: string | null;
//   variantId: string | null;
//   unitId: string | null;
//   quantity: number;
//   itemName: string;
//   sizeName: string | null;
//   variantName: string | null;
//   unitName: string | null;
// };

// const NewInternalUsagePage = () => {
//   const { user } = useUser();
//   const [personnelName, setPersonnelName] = useState("");
//   const [department, setDepartment] = useState("");
//   const [purpose, setPurpose] = useState("");
//   const [authorizedBy, setAuthorizedBy] = useState("");
//   const [note, setNote] = useState("");
//   const [loggedBy, setLoggedBy] = useState("");
//   const [showSummary, setShowSummary] = useState(false);
//   const [isAdding, setIsAdding] = useState(false);
//   const [showPinModal, setShowPinModal] = useState(false);
//   const [pin, setPin] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [pinError, setPinError] = useState(false);

//   const [items, setItems] = useState<FormItem[]>([]);
//   const [newItem, setNewItem] = useState<FormItem>({
//     itemId: "",
//     sizeId: null,
//     variantId: null,
//     unitId: null,
//     quantity: 0,
//     itemName: "",
//     sizeName: null,
//     variantName: null,
//     unitName: null,
//   });
//   console.log("New items:", newItem);

//   // UI selections
//   const [selectedItem, setSelectedItem] = useState<Selection | null>(null);
//   const [selectedSize, setSelectedSize] = useState<Selection | null>(null);
//   const [selectedVariant, setSelectedVariant] = useState<Selection | null>(null);
//   const [selectedUnit, setSelectedUnit] = useState<Selection | null>(null);
//   const [quantity, setQuantity] = useState<string>("");

//   // raw row-level combos returned by API
//   const [combinations, setCombinations] = useState<Combination[]>([]);

//   // Derived option arrays (unique and filtered)
//   const availableSizes = Array.from(
//     new Map(
//       combinations
//         .filter((c) => c.sizeId != null && c.sizeName)
//         .map((c) => [String(c.sizeId), { id: String(c.sizeId), name: c.sizeName! }])
//     ).values()
//   );

//   const availableVariants = Array.from(
//     new Map(
//       combinations
//         .filter((c) => (!selectedSize || c.sizeId === Number(selectedSize.id)) && c.variantId != null && c.variantName)
//         .map((c) => [String(c.variantId), { id: String(c.variantId), name: c.variantName! }])
//     ).values()
//   );

//   const availableUnits = Array.from(
//     new Map(
//       combinations
//         .filter((c) => {
//           if (selectedSize && selectedVariant) {
//             return c.sizeId === Number(selectedSize.id) && c.variantId === Number(selectedVariant.id) && c.unitId != null && c.unitName;
//           }
//           if (selectedSize && !selectedVariant) {
//             return c.sizeId === Number(selectedSize.id) && c.unitId != null && c.unitName;
//           }
//           return c.unitId != null && c.unitName;
//         })
//         .map((c) => [String(c.unitId), { id: String(c.unitId), name: c.unitName! }])
//     ).values()
//   );

//   useEffect(() => {
//     setNewItem((prev) => ({
//       ...prev,
//       itemId: selectedItem ? String(selectedItem.id) : "",
//       itemName: selectedItem?.name || "",
//       sizeId: selectedSize ? String(selectedSize.id) : null,
//       sizeName: selectedSize?.name || null,
//       variantId: selectedVariant ? String(selectedVariant.id) : null,
//       variantName: selectedVariant?.name || null,
//       unitId: selectedUnit ? String(selectedUnit.id) : null,
//       unitName: selectedUnit?.name || null,
//       quantity: Number(quantity) || 0,
//     }));
//   }, [selectedItem, selectedSize, selectedVariant, selectedUnit, quantity]);

//   useEffect(() => {
//     if (!selectedItem) {
//       setCombinations([]);
//       setSelectedSize(null);
//       setSelectedVariant(null);
//       setSelectedUnit(null);
//       return;
//     }

//     const fetchOptions = async () => {
//       try {
//         const res = await fetch(`/api/inventory-options?itemName=${encodeURIComponent(String(selectedItem.name))}`);
//         if (!res.ok) {
//           setCombinations([]);
//           return;
//         }
//         const data: Combination[] = await res.json();
//         setCombinations(Array.isArray(data) ? data : []);
//       } catch {
//         setCombinations([]);
//       }
//       setSelectedSize(null);
//       setSelectedVariant(null);
//       setSelectedUnit(null);
//     };

//     fetchOptions();
//   }, [selectedItem]);

//   // Add item handler
//   const handleAddItem = async () => {
//     if (isAdding) return;
//     setIsAdding(true);

//     if (!selectedItem) {
//       toast.error("Please select an item.");
//       setIsAdding(false);
//       return;
//     }
//     if (availableSizes.length > 0 && !selectedSize) {
//       toast.error("Please select a size.");
//       setIsAdding(false);
//       return;
//     }
//     if (availableVariants.length > 0 && !selectedVariant) {
//       toast.error("Please select a variant.");
//       setIsAdding(false);
//       return;
//     }
//     if (availableUnits.length > 0 && !selectedUnit) {
//       toast.error("Please select a unit.");
//       setIsAdding(false);
//       return;
//     }
//     if (!quantity || Number(quantity) <= 0 || isNaN(Number(quantity))) {
//       toast.error("Please enter a valid quantity.");
//       setIsAdding(false);
//       return;
//     }

//     try {
//       const params = new URLSearchParams({
//         itemName: selectedItem.name,
//         sizeId: selectedSize ? String(selectedSize.id) : "",
//         variantId: selectedVariant ? String(selectedVariant.id) : "",
//         unitId: selectedUnit ? String(selectedUnit.id) : "",
//       });

//       const res = await fetch(`/api/item-find?${params.toString()}`);
//       const found = await res.json();

//       if (!found || !found.id) {
//         toast.error("Failed to find matching item in inventory.");
//         setIsAdding(false);
//         return;
//       }

//       const stockRes = await fetch(`/api/items/${found.id}`);
//       if (!stockRes.ok) {
//         toast.error("Unable to fetch stock for item.");
//         setIsAdding(false);
//         return;
//       }

//       const stockData = await stockRes.json();
//       const qty = Number(quantity);

//       if (qty > stockData.stock) {
//         toast.warning(`⚠️ "${selectedItem.name}" currently has only ${stockData.stock} in stock. You are adding ${qty}.`);
//         setIsAdding(false);
//         setSelectedItem(null);
//         setSelectedSize(null);
//         setSelectedVariant(null);
//         setSelectedUnit(null);
//         setQuantity("");
//         return;
//       }
      
//       if (stockData.stock - qty <= stockData.criticalLevel) {
//         toast.warning(`⚠️ "${selectedItem.name}" will be at critical level after this issuance.`);
//       } else if (stockData.stock - qty <= stockData.reorderLevel) {
//         toast.warning(`⚠️ "${selectedItem.name}" will be at reorder level after this issuance.`);
//       }

//       const candidate: FormItem = {
//         itemId: String(found.id),
//         sizeId: selectedSize ? String(selectedSize.id) : null,
//         variantId: selectedVariant ? String(selectedVariant.id) : null,
//         unitId: selectedUnit ? String(selectedUnit.id) : null,
//         quantity: Number(quantity),
//         itemName: selectedItem.name,
//         sizeName: selectedSize?.name || null,
//         variantName: selectedVariant?.name || null,
//         unitName: selectedUnit?.name || null,
//       };

//       const isDuplicate = items.some(
//         (i) =>
//           i.itemId === candidate.itemId &&
//           (i.sizeId || null) === (candidate.sizeId || null) &&
//           (i.variantId || null) === (candidate.variantId || null) &&
//           (i.unitId || null) === (candidate.unitId || null)
//       );

//       if (isDuplicate) {
//         toast.error("This item with the selected options is already added.");
//         setIsAdding(false);
//         return;
//       }

//       setItems((prev) => [...prev, candidate]);

//       setSelectedItem(null);
//       setSelectedSize(null);
//       setSelectedVariant(null);
//       setSelectedUnit(null);
//       setQuantity("");
//     } catch {
//       toast.error("Something went wrong while adding the item.");
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   // "Done" button
//   const handleDone = () => {
//     if (!personnelName) return toast.error("Please enter a personnel name.");
//     if (!department) return toast.error("Please enter a department.");
//     if (!purpose) return toast.error("Please enter a purpose.");
//     if (!authorizedBy) return toast.error("Please enter who authorized this.");
//     if (items.length === 0) return toast.error("Please add at least one item.");

//     setShowSummary(true); // show summary modal
//   };

//   // "Confirm" button in summary modal handler
//   const handleSaveUsage = () => {
//     setShowSummary(false);
//     setShowPinModal(true); // show PIN modal
//   }

//   // "Submit" button in pin modal handler
//   const handlePinSubmit = async () => {
//   if (isSubmitting) return;
//   setIsSubmitting(true);

//   if (!pin.trim() || pin.length !== 4) {
//     toast.error("Please enter a valid 4-digit PIN.");
//     setIsSubmitting(false);
//     return;
//   }
//   setIsSubmitting(true);

//   try {
//     // verify pin
//     const pinRes = await fetch("/api/warehouse_pin", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ pin }),
//     });
//     const pinData = await pinRes.json();

//     if (!pinRes.ok) {
//       toast.error(pinData?.error || "PIN verification failed.");
//       setPinError(true); // highlights input
//       setPin(""); // clear wrong PIN
//       setIsSubmitting(false);
//       return;
//     } else {
//       setPinError(false);
//     }

//     // prepare internal usage payload
//     const payload = {
//       personnelName,
//       department,
//       purpose,
//       authorizedBy,
//       note,
//       items: items.map((i) => ({
//         itemId: Number(i.itemId),
//         sizeId: i.sizeId ? Number(i.sizeId) : null,
//         variantId: i.variantId ? Number(i.variantId) : null,
//         unitId: i.unitId ? Number(i.unitId) : null,
//         quantity: i.quantity,
//       })),
//       loggedBy,
//       pin: pin,
//     };

//     console.log("Sending to /api/internal_usages:", payload);
//     // save usage
//     const usageRes = await fetch("/api/internal_usages", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//     const usageData = await usageRes.json().catch(() => null);

//     if (!usageRes.ok) {
//       toast.error(usageData?.error || "Failed to save internal usage log.");
//       setIsSubmitting(false);
//       return;
//     }

//     // success
//     toast.success(usageData?.message || "Internal usage saved successfully!");
//     setShowPinModal(false);

//     // show warnings if there's any
//     if (usageData?.warning?.length > 0) {
//       usageData.warning.forEach((msg: string) => {
//         toast.warning(msg);
//       });
//     }

//     // redirect to internal usage log

//     setTimeout(() => {
//       window.location.href = "/warehouse/internal_usage_log";
//     }, 1500);
//   } catch (err) {
//     console.error(err);
//     toast.error("Something went wrong while saving the usage.");
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   useEffect(() => {
//     if (user) {
//       setLoggedBy(user.fullName || user.emailAddresses[0]?.emailAddress || "Warehouseman"); 
//     }
//   }, [user]);

//   const handleClose = () => {
//     // reset all states when close button is clicked (pin modal)
//     setShowSummary(false);
//     setShowPinModal(false);
//     setItems([]);
//     setPersonnelName("");
//     setDepartment("");
//     setPurpose("");
//     setAuthorizedBy("");
//     setNote("");
//     setPin("");
//     setLoggedBy(user?.fullName || user?.emailAddresses[0]?.emailAddress || "Warehouseman");

//     // navigate back to internal usage log page
//     window.history.back();
//   }

//   const MAX_QUANTITY = 9999;

//   const sanitizeToDigits = (input: string) => {
//     const digits = input.replace(/\D+/g, "");
//     if (digits === "") return "";
//     const parsed = parseInt(digits, 10);
//     return Number.isNaN(parsed) ? "" : parsed;
//   };

//   return (
//     <WarehousemanClientComponent>
//       <main className="bg-[#ffedce] w-full min-h-screen">
//         <Header />
//         <section className="p-10 max-w-4xl mx-auto">
//           <h1 className="text-3xl font-bold text-[#173f63] mb-6">Log Internal Usage</h1>

//           <form className="grid grid-cols-1 gap-4 bg-white p-6 rounded shadow">
//             <div>
//               <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Personnel Name:</label>
//               <input
//                 type="text"
//                 value={personnelName}
//                 onChange={(e) => setPersonnelName(e.target.value)}
//                 className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Department:</label>
//               <input
//                 type="text"
//                 value={department}
//                 onChange={(e) => setDepartment(e.target.value)}
//                 className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Purpose:</label>
//               <input
//                 type="text"
//                 value={purpose}
//                 onChange={(e) => setPurpose(e.target.value)}
//                 className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Authorized by:</label>
//               <input
//                 type="text"
//                 value={authorizedBy}
//                 onChange={(e) => setAuthorizedBy(e.target.value)}
//                 className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Note:</label>
//               <input
//                 type="text"
//                 value={note}
//                 onChange={(e) => setNote(e.target.value)}
//                 className="w-full border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Logged by: {loggedBy}</label>
//             </div>

//             {/* Items Section */}
//             <div className="border-t pt-4 mt-4">
//               <h2 className="text-lg font-bold mb-2 text-[#173f63] text-center uppercase">Items to Utilize</h2>

//               <div className="grid grid-cols-5 gap-2 items-end">
//                 <div>
//                   <AutoComplete
//                     label="Item Name"
//                     endpoint="/api/autocomplete/item-name"
//                     value={selectedItem}
//                     onChange={(item) => {
//                       setSelectedItem(item);
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <AutoComplete
//                     label="Item Size"
//                     options={availableSizes}
//                     value={selectedSize}
//                     onChange={setSelectedSize}
//                     disabled={!selectedItem || availableSizes.length === 0}
//                   />
//                 </div>

//                 <div>
//                   <AutoComplete
//                     label="Item Variant"
//                     options={availableVariants}
//                     value={selectedVariant}
//                     onChange={setSelectedVariant}
//                     disabled={!selectedSize && availableVariants.length === 0}
//                   />
//                 </div>

//                 <div>
//                   <AutoComplete
//                     label="Item Unit"
//                     options={availableUnits}
//                     value={selectedUnit}
//                     onChange={setSelectedUnit}
//                     disabled={!selectedVariant && availableUnits.length === 0}
//                   />
//                 </div>

//                 <div className="flex flex-col">
//                   <label className="text-sm font-semibold mb-1 text-[#482b0e]">Quantity</label>
//                   <input
//                     type="number"
//                     inputMode="numeric"
//                     pattern="[0-9]*"
//                     min={0}
//                     max={MAX_QUANTITY}
//                     step={1}
//                     value={quantity === "" ? "" : quantity}
//                     onKeyDown={(e) => {
//                       if (["e", "E", "+", "-", "."].includes(e.key)) {
//                         e.preventDefault();
//                       }
//                     }}
//                     onPaste={(e) => {
//                       e.preventDefault();
//                       const pasted = e.clipboardData.getData("text");
//                       const sanitized = sanitizeToDigits(pasted);
//                       if (sanitized === "") {
//                         setQuantity("");
//                         return;
//                       }
//                       let parsed = Number(sanitized);
//                       if (parsed < 0) {
//                         parsed = 0;
//                         toast.error("Quantity cannot be negative.", { duration: 2000 });
//                       } else if (parsed > MAX_QUANTITY) {
//                         parsed = MAX_QUANTITY;
//                         toast.error(`Quantity canoot exceed ${MAX_QUANTITY}.`, { duration: 2000 });
//                       }
//                       setQuantity(String(parsed));
//                     }}
//                     onChange={(e) => {
//                       const value = e.target.value;

//                       if (value === "") {
//                         setQuantity("");
//                         return;
//                       }

//                       const digitsOnly = value.replace(/\D+/g, "");
//                       if (digitsOnly === "") {
//                         setQuantity("");
//                         return;
//                       }

//                       let parsed = parseInt(digitsOnly, 10);

//                       if (isNaN(parsed)) {
//                         setQuantity("");
//                         return;
//                       }

//                       if (parsed < 0) {
//                         parsed = 0;
//                         toast.error("Quantity cannot be negative.", { duration: 2000 });
//                       } else if (parsed > MAX_QUANTITY) {
//                         parsed = MAX_QUANTITY;
//                         toast.error(`Quantity cannot exceed ${MAX_QUANTITY}`, { duration: 2000 });
//                       }

//                       setQuantity(String(parsed));
//                     }}
//                     className="border border-[#d2bda7] p-2 rounded hover:bg-gray-100"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleAddItem}
//                 disabled={isAdding}
//                 className="mt-5 bg-[#d2bda7] px-4 py-2 text-sm rounded hover:bg-[#674d33] text-white font-medium cursor-pointer"
//               >
//                 {isAdding ? "Adding..." : "Add Item"}
//               </button>

//               {items.length > 0 && (
//                 <div className="mt-4">
//                   <h3 className="text-sm font-semibold mb-2">Items Added</h3>
//                   <table className="w-full border text-sm">
//                     <thead className="bg-[#f5e6d3] text-[#482b0e]">
//                       <tr>
//                         <th className="border px-2 py-1">Item Name</th>
//                         <th className="border px-2 py-1">Size</th>
//                         <th className="border px-2 py-1">Variant</th>
//                         <th className="border px-2 py-1">Unit</th>
//                         <th className="border px-2 py-1">Qty</th>
//                         <th className="border px-2 py-1">Remove</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {items.map((item, idx) => (
//                         <tr key={`${item.itemId}-${idx}`}>
//                           <td className="border px-2 py-1">{item.itemName}</td>
//                           <td className="border px-2 py-1">{item.sizeName || "(None)"}</td>
//                           <td className="border px-2 py-1">{item.variantName || "(None)"}</td>
//                           <td className="border px-2 py-1">{item.unitName || "(None)"}</td>
//                           <td className="border px-2 py-1">{item.quantity}</td>
//                           <td className="border px-2 py-1">
//                             <button
//                               type="button"
//                               className="text-red-500 text-xs hover:underline cursor-pointer"
//                               onClick={() => setItems(items.filter((_, index) => index !== idx))}
//                             >
//                               Remove
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>

//             <div className="mt-6 flex justify-end gap-4">
//               <button
//                 type="button"
//                 onClick={() => window.history.back()}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleDone}
//                 className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-700"
//               >
//                 Done
//               </button>
//             </div>
//           </form>

//           {showSummary && (
//             <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40">
//               <div className="bg-white w-[600px] p-6 rounded shadow">
//                 <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Internal Usage</h2>
//                 <p className="mb-2 text-sm text-gray-700">Personnel: {personnelName}</p>
//                 <p className="mb-2 text-sm text-gray-700">Department: {department}</p>
//                 <p className="mb-2 text-sm text-gray-700">Purpose: {purpose}</p>
//                 <p className="mb-2 text-sm text-gray-700">Authorized By: {authorizedBy}</p>
//                 <p className="mb-2 text-sm text-gray-700">Note: {note}</p>

//                 <table className="w-full mt-4 mb-2 text-sm border">
//                   <thead className="bg-[#f5e6d3] text-[#482b0e]">
//                     <tr>
//                       <th className="border px-2 py-1">Item</th>
//                       <th className="border px-2 py-1">Size</th>
//                       <th className="border px-2 py-1">Variant</th>
//                       <th className="border px-2 py-1">Unit</th>
//                       <th className="border px-2 py-1">Qty</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {items.map((item, idx) => (
//                       <tr key={`${item.itemId}-${idx}`}>
//                         <td className="border px-2 py-1">{item.itemName}</td>
//                         <td className="border px-2 py-1">{item.sizeName || "(None)"}</td>
//                         <td className="border px-2 py-1">{item.variantName || "(None)"}</td>
//                         <td className="border px-2 py-1">{item.unitName || "(None)"}</td>
//                         <td className="border px-2 py-1">{item.quantity}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 <p className="mb-2 text-sm text-gray-700">Logged By: {loggedBy}</p>

//                 <div className="mt-6 flex justify-end gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setShowSummary(false)}
//                     className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleSaveUsage}
//                     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-800"
//                   >
//                     Confirm
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* PIN Modal */}
//           {showPinModal && (
//             <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40">
//               <div className="bg-white w-[600px] p-6 rounded shadow">
//                 <h2 className="text-xl font-bold mb-4 text-[#173f63]">Enter PIN</h2>
//                 <div>
//                 <input 
//                     id="pinInput"
//                     type={"password"}
//                     inputMode="numeric"
//                     pattern="\d*"
//                     placeholder="Enter 4-digit PIN..."
//                     className={`w-full border p-2 rounded mb-2 hover:bg-gray-100 ${
//                       pinError ? "border-red-500" : "border-gray-300"
//                     }`}
//                     value={pin}
//                     maxLength={4}
//                     onChange={(e) => {
//                       setPin(e.target.value.replace(/\D/g, ""))
//                     }}
//                     autoFocus
//                 />
//                 </div>
//                 <div className="mt-6 flex justify-end gap-3">
//                   <button
//                     type="button"
//                     onClick={handleClose}
//                     className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//                   >
//                     Close
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handlePinSubmit}
//                     disabled={isSubmitting}
//                     className={`px-4 py-2 rounded text-white ${isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
//                   >
//                     {isSubmitting ? "Submitting..." : "Submit"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </section>
//       </main>
//     </WarehousemanClientComponent>
//   );
// };

// export default NewInternalUsagePage;

// app/components/add/LogNewInternalUsageForm.tsx

"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { toast } from "sonner";
import AutoComplete from "@/components/autocomplete/AutoComplete";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { useUser, useSignIn } from "@clerk/nextjs";

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

type InternalUsageSuccess = {
  message: string;
  usageId: number;
  warning?: string[];
};

type InternalUsageError = {
  error: string;
  details?: unknown;
};

type InternalUsageResponse = InternalUsageSuccess | InternalUsageError;

const NewInternalUsagePage = () => {
  const { isLoaded, signIn } = useSignIn();
  const { user } = useUser();
  const [personnelName, setPersonnelName] = useState("");
  const [department, setDepartment] = useState("");
  const [purpose, setPurpose] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [note, setNote] = useState("");
  const [loggedBy, setLoggedBy] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [items, setItems] = useState<FormItem[]>([]);
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

      const stockRes = await fetch(`/api/items/${found.id}`);
      if (!stockRes.ok) {
        toast.error("Unable to fetch stock for item.");
        setIsAdding(false);
        return;
      }

      const stockData = await stockRes.json();
      const qty = Number(quantity);

      if (qty > stockData.stock) {
        toast.warning(`⚠️ "${selectedItem.name}" currently has only ${stockData.stock} in stock. You are adding ${qty}.`);
        setIsAdding(false);
        setSelectedItem(null);
        setSelectedSize(null);
        setSelectedVariant(null);
        setSelectedUnit(null);
        setQuantity("");
        return;
      }
      
      if (stockData.stock - qty <= stockData.criticalLevel) {
        toast.warning(`⚠️ "${selectedItem.name}" will be at critical level after this issuance.`);
      } else if (stockData.stock - qty <= stockData.reorderLevel) {
        toast.warning(`⚠️ "${selectedItem.name}" will be at reorder level after this issuance.`);
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

  // "Done" button
  const handleDone = () => {
    if (!personnelName) return toast.error("Please enter a personnel name.");
    if (!department) return toast.error("Please enter a department.");
    if (!purpose) return toast.error("Please enter a purpose.");
    if (!authorizedBy) return toast.error("Please enter who authorized this.");
    if (items.length === 0) return toast.error("Please add at least one item.");

    setShowSummary(true); // show summary modal
  };

  // "Confirm" button in summary modal handler
  const handleSaveUsage = () => {
    setShowSummary(false);
    setShowPasswordModal(true); // show PIN modal
  }

  // "Submit" button in pin modal handler
  const handlePasswordSubmit = async () => {
  if (!isLoaded || !user) {
    toast.error("User not loaded yet.");
    return;
  }

  if (isSubmitting) return;
  setIsSubmitting(true);

  if (!password.trim()) {
    toast.error("Please enter your password.");
    setIsSubmitting(false);
    return;
  }

  try {
    // prepare payload
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
      loggedBy,
      password,
    };

    const usageRes = await fetch("/api/internal_usages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const raw = await usageRes.text();

    let usageData: InternalUsageResponse;
    try {
      usageData = JSON.parse(raw) as InternalUsageResponse;
    } catch {
      console.error("Invalid JSON from server:", raw);
      toast.error("Unexpected server response.");
      return;
    }

    // ❌ Error branch
    if (!usageRes.ok || "error" in usageData) {
      const errMsg =
        "error" in usageData ? usageData.error : "Failed to save internal usage log.";
      toast.error(errMsg);
      return;
    }

    // ✅ Success branch
    toast.success(usageData.message);

    setShowPasswordModal(false);

    // ⚡ FIX: ensure it's really an array before using .length / .forEach
    if (Array.isArray(usageData.warning)) {
      usageData.warning.forEach((msg: string) => {
        toast.warning(msg);
      });
    }

    setTimeout(() => {
      window.location.href = "/warehouse/internal_usage_log";
    }, 1500);
  } catch (err) {
    console.error("Password verification error:", err);
    toast.error("Something went wrong while verifying password.");
    setPassword("");
  } finally {
    setIsSubmitting(false);
  }
};

  useEffect(() => {
    if (user) {
      setLoggedBy(user.username || user.emailAddresses[0]?.emailAddress || "Warehouseman"); 
    }
  }, [user]);

  const handleClose = () => {
    // reset all states when close button is clicked (pin modal)
    setShowSummary(false);
    setShowPasswordModal(false);
    setItems([]);
    setPersonnelName("");
    setDepartment("");
    setPurpose("");
    setAuthorizedBy("");
    setNote("");
    setPassword("");
    setLoggedBy(user?.username || user?.emailAddresses[0]?.emailAddress || "Warehouseman");

    // navigate back to internal usage log page
    window.history.back();
  }

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
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Authorized by:</label>
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
              <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Logged by: {loggedBy}</label>
            </div>

            {/* Items Section */}
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-bold mb-2 text-[#173f63] text-center uppercase">Items to Utilize</h2>

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

                <table className="w-full mt-4 mb-2 text-sm border">
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
                <p className="mb-2 text-sm text-gray-700">Logged By: {loggedBy}</p>

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
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Modal */}
          {showPasswordModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40">
                <div className="bg-white w-[600px] p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4 text-[#173f63]">Enter Password</h2>
                  <div>
                    <input
                      id="passwordInput"
                      type="password"
                      placeholder="Enter your account password..."
                      className={`w-full border p-2 rounded mb-2 hover:bg-gray-100 ${
                        passwordError ? "border-red-500" : "border-gray-300"
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordSubmit}
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded text-white ${
                        isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
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
