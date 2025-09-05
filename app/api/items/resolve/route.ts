// // // api/items/resolve/route.ts

// // import { NextRequest, NextResponse } from "next/server";
// // import { db } from "@/db/drizzle";
// // import { items } from "@/db/schema";
// // import { eq, and } from "drizzle-orm";

// // export async function GET(req: NextRequest) {
// //     const { searchParams } = new URL(req.url);

// //     const name = searchParams.get("name");
// //     const sizeId = searchParams.get("sizeId");
// //     const variantId = searchParams.get("variantId");
// //     const unitId = searchParams.get("unitId");

// //     if (!name || !unitId) {
// //         return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
// //     }

// //     const whereClauses = [
// //         eq(items.name, name),
// //         eq(items.unitId, Number(unitId)),
// //     ];

// //     if (sizeId) whereClauses.push(eq(items.sizeId, Number(sizeId)));
// //     if (variantId) whereClauses.push(eq(items.variantId, Number(variantId)));

// //     const result = await db
// //     .select({
// //         id: items.id,
// //         name: items.name,
// //         stock: items.stock,
// //         sizeId: items.sizeId,
// //         variantId: items.variantId,
// //         unitId: items.unitId,
// //     })
// //     .from(items)
// //     .where(and(...whereClauses))
// //     .limit(1);

// //     if (result.length === 0) {
// //         return NextResponse.json({ error: "Item not found." }, { status: 404 });
// //     }

// //     return NextResponse.json(result[0]);
// // }

// // app/component/add/LogNewIssuanceForm.tsx

// "use client";

// import { useState, useEffect } from "react";
// import { Header } from "@/components/header";
// import DRModal from "@/app/warehouse/issuance_log/dr_modal";
// import { toast } from "sonner";
// // import AutoComplete from "../autocomplete/AutoComplete";
// import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";

// type Selection = { id: string | number; name: string };

// const NewIssuancePage = () => {
//     const [clientName, setClientName] = useState("");
//     const [dispatcherName, setDispatcherName] = useState("");
//     const [customerPoNumber, setCustomerPoNumber] = useState("");
//     const [prfNumber, setPrfNumber] = useState("");
//     const [showDRModal, setShowDRModal] = useState(false);
//     const [drInfo, setDrInfo] = useState<{ drNumber: string; saveAsDraft: boolean } | null>(null);
//     const [showSummary, setShowSummary] = useState(false);

//     const [items, setItems] = useState<
//     {
//         itemId: string;
//         sizeId: string | null;
//         variantId: string | null;
//         unitId: string | null;
//         quantity: number;
//         itemName: string;
//         sizeName: string | null;
//         variantName: string | null;
//         unitName: string | null;
//     } []
//         >([]);

//     const [newItem, setNewItem] = useState({
//         itemId: "",
//         sizeId: "",
//         variantId: "",
//         unitId: "",
//         quantity: "",
//         itemName: "",
//         sizeName: "",
//         variantName: "",
//         unitName: "",
//     });

//     const [selectedItem, setSelectedItem] = useState<Selection | null>(null);
//     const [selectedSize, setSelectedSize] = useState<Selection | null>(null);
//     const [selectedVariant, setSelectedVariant] = useState<Selection | null>(null);
//     const [selectedUnit, setSelectedUnit] = useState<Selection | null>(null);

//     useEffect(() => {
//         setNewItem((prev) => ({
//             ...prev,
//             itemId: selectedItem ? String(selectedItem.id) : "",
//             itemName: selectedItem?.name || "",
//         }));
//     }, [selectedItem]);

//     useEffect(() => {
//         setNewItem((prev) => ({
//             ...prev,
//             sizeId: selectedSize ? String(selectedSize.id) : "",
//             sizeName: selectedSize?.name || "",
//         }));
//     }, [selectedSize]);

//     useEffect(() => {
//         setNewItem((prev) => ({
//             ...prev,
//             variantId: selectedVariant ? String(selectedVariant.id) : "",
//             variantName: selectedVariant?.name || "",
//         }));
//     }, [selectedVariant]);

//     useEffect(() => {
//         setNewItem((prev) => ({
//             ...prev,
//             unitId: selectedUnit ? String(selectedUnit.id) : "",
//             unitName: selectedUnit?.name || "",
//         }));
//     }, [selectedUnit]);

//     useEffect(() => {
//         if (drInfo) setShowSummary(true);
//     }, [drInfo]);

//     async function preselectIfSingle(endpoint: string, setter: (s: Selection) => void) {
//         try {
//             const res = await fetch(endpoint);
//             const data: Selection[] = await res.json();
//             if (Array.isArray(data) && data.length === 1) {
//                 setter(data[0]);
//             }
//         } catch (e) {
//             console.error("Preselect fetch failed:", e);
//         }
//     }

//     useEffect(() => {
//         setSelectedSize(null);
//         setSelectedVariant(null);
//         setSelectedUnit(null);

//         if (!selectedItem) return;

//         const id = selectedItem.id;
//         preselectIfSingle(`/api/autocomplete/item-size?itemId=${id}`, setSelectedSize);
//         preselectIfSingle(`/api/autocomplete/item-variant?itemId=${id}`, setSelectedVariant);
//         preselectIfSingle(`/api/autocomplete/item-unit?itemId=${id}`, setSelectedUnit);
//     }, [selectedItem]);

//     const handleAddItem = async () => {
//         // Validate
//         if (
//             !selectedItem ||
//             !selectedUnit ||
//             !newItem.quantity ||
//             Number(newItem.quantity) <= 0 ||
//             isNaN(Number(newItem.quantity))
//         ) {
//             toast.error("Please fill in all required fields with valid values.");
//             return;
//         }

//         try {
//             // Call item-finder API to get the exact inventory row
//             const res = await fetch(`/api/item-find?itemId=${selectedItem.id}&sizeId=${selectedSize?.id || ""}&variantId=${selectedVariant?.id || ""}&unitId=${selectedUnit?.id ||""}`);

//             if (!res.ok) {
//                 toast.error("Failed to find item in inventory.");
//                 return;
//             }

//             const match = await res.json();

//             if (!match || !match.itemId) {
//                 toast.error("Selected item not found in the inventory.");
//                 return;
//             }

//             const candidate = {
//             itemId: String(selectedItem.id),
//             sizeId: selectedSize ? String(selectedSize.id) : null,
//             variantId: selectedVariant ? String(selectedVariant.id) : null,
//             unitId: selectedUnit ? String(selectedUnit.id) : null,
//             quantity: Number(newItem.quantity),
//             itemName: selectedItem.name,
//             sizeName: selectedSize?.name || null,
//             variantName: selectedVariant?.name || null,
//             unitName: selectedUnit?.name || null,
//         };

//         // Duplicate check by Ids
//         const isDuplicate = items.some(
//             (i) =>
//                 i.itemId === candidate.itemId &&
//                 (i.sizeId || null) === (candidate.sizeId || null) &&
//                 (i.variantId || null) === (candidate.variantId || null) &&
//                 (i.unitId || null) === (candidate.unitId || null)
//         );
//         if (isDuplicate) {
//             toast.error("This item with the selected options is already added.");
//             return;
//         }

//         // Push to list
//         setItems((prev) => [...prev, candidate]);

//         //Reset for next input
//         setSelectedItem(null);
//         setSelectedSize(null);
//         setSelectedVariant(null);
//         setSelectedUnit(null);
//         setNewItem({
//             itemId: "",
//             sizeId: "",
//             variantId: "",
//             unitId: "",
//             quantity: "",
//             itemName: "",
//             sizeName: "",
//             variantName: "",
//             unitName: "",
//         });

//         } catch (error) {
//             console.error("Error adding item:", error);
//             toast.error("An error occurred while adding item.");
//         }
//     };

//     const handleSaveIssuance = async () => {
//         if (!drInfo) return;

//         if (!clientName || !dispatcherName || !customerPoNumber || !prfNumber || items.length === 0) {
//             toast.error("Please fill in all the required fields.");
//             return;
//         }

//         const payload = {
//             clientName,
//             dispatcherName,
//             customerPoNumber,
//             prfNumber,
//             drNumber: drInfo?.drNumber || "",
//             saveAsDraft: drInfo?.saveAsDraft || false,
//             items: items.map((item) => ({
//                 itemId: item.itemId,
//                 sizeId: item.sizeId ?? null,
//                 variantId: item.variantId ?? null,
//                 unitId: item.unitId ?? null,
//                 quantity: item.quantity,
//             })),
//         };

//         console.log("Issuance payload:", payload);

//         try {
//             const res = await fetch("/api/issuances", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (!res.ok) {
//                 let errorMessage = "Failed to process issuance.";
//                 try {
//                     const contentType = res.headers.get("content-type") || "";
//                     if (contentType.includes("application/json")) {
//                         const errorResult = await res.json();
//                         if (errorResult?.error) {
//                             console.warn("Handled API warning:", errorResult.error);
//                             errorMessage = errorResult.error;
//                         } else {
//                             console.error("Non-JSON API response:", errorResult);
//                         }
//                     }
//                 } catch (e) {
//                     console.error("Failed to parse API error response:", e);
//                     errorMessage = "An unexpectd error occurred while handling response.";
//                 }
//                 toast.error(errorMessage);
//                 return;
//             }

//             const result = await res.json();
//             console.log("Received issuance data:", result);

//             const warningDelay = (result.warning?.length || 0) * 1000;
//             if (result.warning && result.warning.length > 0) {
//                 result.warning.forEach((w: string, i: number) => {
//                     setTimeout(() => {
//                         toast.warning(w);
//                     }, i * 5000);
//                 });
//             }

//             setTimeout(() => {
//                 toast.success(drInfo.saveAsDraft ? "Issuance saved as draft." : "Issuance saved successfully!");
//                 setTimeout(() => {
//                     window.location.href = "/warehouse/issuance_log";
//                 }, 1500);
//             }, warningDelay || 0);
//         } catch (error) {
//             console.error("Issuance error:", error instanceof Error ? error.stack : error);
//             toast.error("Something went wrong while saving the issuance.");
//         }
//     };

//     return (
//         <WarehousemanClientComponent>
//             <main className="bg-[#ffedce] w-full">
//                 <Header />
//                 <section className="p-10 max-w-4xl mx-auto">
//                     <h1 className="text-3xl font-bold text-[#173f63] mb-6">Log Item Issuance</h1>

//                     <form className="grid grid-cols-1 gap-4 bg-white p-6 rounded shadow">
//                         {/* Client Name */}
//                         <div>
//                             <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Client Name:</label>
//                             <input 
//                             type="text"
//                             value={clientName}
//                             onChange={(e) => setClientName(e.target.value)}
//                             className="w-full border border-[#d2bda7] p-2 rounded"
//                             />
//                         </div>

//                         {/* Dispatcher Name */}
//                         <div>
//                             <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Dispatcher Name:</label>
//                             <input 
//                             type="text"
//                             value={dispatcherName}
//                             onChange={(e) => setDispatcherName(e.target.value)}
//                             className="w-full border border-[#d2bda7] p-2 rounded"
//                             />
//                         </div>

//                         {/* Customer PO Number */}
//                         <div>
//                             <label className="block text-sm font-semibold mb-1 text-[#482b0e]">Customer PO Number:</label>
//                             <input 
//                             type="text"
//                             value={customerPoNumber}
//                             onChange={(e) => setCustomerPoNumber(e.target.value)}
//                             className="w-full border border-[#d2bda7] p-2 rounded"
//                             />
//                         </div>

//                         {/* PRF Number */}
//                         <div>
//                             <label className="block text-sm font-semibold mb-1 text-[#482b0e]">PRF Number:</label>
//                             <input 
//                             type="text"
//                             value={prfNumber}
//                             onChange={(e) => setPrfNumber(e.target.value)}
//                             className="w-full border border-[#d2bda7] p-2 rounded"
//                             />
//                         </div>

//                         {/* Add Item Section */}
//                         <div className="border-t pt-4 mt-4">
//                             <h2 className="text-lg font-bold mb-2 text-[#173f63] text-center uppercase">Items to Issue</h2>

//                             <div className="grid grid-cols-5 gap-2 items-end">
//                                 {/* Item Name */}
//                                 <div>
//                                     <AutoComplete 
//                                     label="Item Name"
//                                     endpoint="/api/autocomplete/item-name"
//                                     value={selectedItem}
//                                     onChange={setSelectedItem}
//                                     />
//                                     <pre className="text-xs text-gray-500">{JSON.stringify(newItem, null, 2)}</pre>
//                                 </div>

//                                 {/* Item Size */}
//                                 <div>
//                                     <AutoComplete 
//                                     label="Item Size"
//                                     endpoint={`/api/autocomplete/item-size?itemId=${selectedItem?.id || ""}`}
//                                     value={selectedSize}
//                                     onChange={setSelectedSize}
//                                     disabled={!selectedItem}
//                                     />
//                                 </div>

//                                 {/* Item variant */}
//                                 <div>
//                                     <AutoComplete 
//                                     label="Item Variant"
//                                     endpoint={`/api/autocomplete/item-variant?itemId=${selectedItem?.id || ""}`}
//                                     value={selectedVariant}
//                                     onChange={setSelectedVariant}
//                                     disabled={!selectedItem}
//                                     />
//                                 </div>

//                                 {/* Item Unit */}
//                                 <div>
//                                     <AutoComplete 
//                                     label="Item Unit"
//                                     endpoint={`/api/autocomplete/item-unit?itemId=${selectedItem?.id || ""}`}
//                                     value={selectedUnit}
//                                     onChange={setSelectedUnit}
//                                     disabled={!selectedItem}
//                                     />
//                                 </div>

//                                 {/* Quantity */}
//                                 <div className="flex flex-col">
//                                     <label className="block text-sm font-medium">Quantity</label>
//                                     <input
//                                     type="number"
//                                     placeholder="Qty"
//                                     value={newItem.quantity}
//                                     onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
//                                     className="border border-[#d2bda7] p-2 rounded"
//                                     />
//                                 </div>
//                             </div>

//                             {/*Add Item Button */}
//                             <button
//                             type="button"
//                             onClick={handleAddItem}
//                             className="mt-3 bg-[#d2bda7] px-4 py-2 text-sm rounded hover:bg-[#674d33] text-white font-medium"
//                             >
//                                 Add Item
//                             </button>

//                             {/* Table of Added Items */}
//                             {items.length > 0 && (
//                                 <div className="mt-4">
//                                     <h3 className="text-sm font-semibold mb-2">Items Added</h3>
//                                     <table className="w-full border text-sm">
//                                         <thead className="bg-[#f5e6d3] text-[#482b0e]">
//                                             <tr>
//                                                 <th className="border px-2 py-1">Item Name</th>
//                                                 <th className="border px-2 py-1">Size</th>
//                                                 <th className="border px-2 py-1">Variant</th>
//                                                 <th className="border px-2 py-1">Unit</th>
//                                                 <th className="border px-2 py-1">Qty</th>
//                                                 <th className="border px-2 py-1">Remove</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {items.map((item, idx) => (
//                                                 <tr key={idx}>
//                                                     <td className="border px-2 py-1">{item.itemName}</td>
//                                                     <td className="border px-2 py-1">{item.sizeName || "(None)"}</td>
//                                                     <td className="border px-2 py-1">{item.variantName || "(None)"}</td>
//                                                     <td className="border px-2 py-1">{item.unitName || "(None)"}</td>
//                                                     <td className="border px-2 py-1">{item.quantity}</td>
//                                                     <td className="border px-2 py-1">
//                                                                                                                 <button
//                                                         type="button"
//                                                         className="text-red-500 text-xs underline"
//                                                         onClick={() => setItems(items.filter((_, index) => index !== idx))}
//                                                         >
//                                                             Remove
//                                                         </button>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Action Button */}
//                         <div className="mt-6 flex justify-end gap-4">
//                             <button
//                             type="button"
//                             onClick={() => window.history.back()}
//                             className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                             type="button"
//                             onClick={() => setShowDRModal(true)}
//                             disabled={!clientName || !dispatcherName || !customerPoNumber || !prfNumber || items.length === 0}
//                             className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-700"
//                             >
//                                 Done
//                             </button>
//                         </div>
//                     </form>
                    
//                     {/* DR Modal */}
//                     {showDRModal && (
//                         <DRModal 
//                         onClose={() => setShowDRModal(false)}
//                         onConfirm={(data: { drNumber: string; saveAsDraft: boolean }) => {
//                             setDrInfo(data);
//                             setShowDRModal(false);
//                             setShowSummary(true);
//                         }}
//                         />
//                     )}

//                     {/*Summary Modal */}
//                     {showSummary && (
//                         <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40">
//                             <div className="bg-white w-[600px] p-6 rounded shadow">
//                                 <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Issuance</h2>

//                                 <p className="mb-2 text-sm text-gray-700">Client: {clientName}</p>
//                                 <p className="mb-2 text-sm text-gray-700">Dispatcher: {dispatcherName}</p>
//                                 <p className="mb-2 text-sm text-gray-700">DR Number: {drInfo?.drNumber || "Draft"}</p>

//                                 <table className="w-full mt-4 text-sm border">
//                                     <thead className="bg-[#f5e6d3] text-[#482b0e]">
//                                         <tr>
//                                             <th className="border px-2 py-1">Item</th>
//                                             <th className="border px-2 py-1">Size</th>
//                                             <th className="border px-2 py-1">Variant</th>
//                                             <th className="border px-2 py-1">Unit</th>
//                                             <th className="border px-2 py-1">Qty</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {items.map((item, idx) => (
//                                             <tr key={ idx }>
//                                                 <td className="border px-2 py-1">{item.itemName}</td>
//                                                 <td className="border px-2 py-1">{item.sizeName || "(None)"}</td>
//                                                 <td className="border px-2 py-1">{item.variantName || "(None)"}</td>
//                                                 <td className="border px-2 py-1">{item.unitName || "(None)"}</td>
//                                                 <td className="border px-2 py-1">{item.quantity}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>

//                                 <div className="flex justify-end gap-4 mt-6">
//                                     <button
//                                     onClick={() => {
//                                         setShowSummary(false);
//                                         setShowDRModal(true);
//                                     }}
//                                     className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                     onClick={handleSaveIssuance}
//                                     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                                     >
//                                         Save
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </section>
//             </main>
//         </WarehousemanClientComponent>
//     );
// };

// export default NewIssuancePage;