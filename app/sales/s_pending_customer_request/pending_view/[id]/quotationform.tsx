// // app/sales/s_pending_customer_request/pending_view/[id]/quotationform.tsx

// "use client";

// import { useState, useEffect, Dispatch, SetStateAction } from "react";
// import { UploadCloud, Trash2, } from "lucide-react";
// import { PreviewDocument } from "./components/quotationcomponents/PreviewDocument";
// import { PreviewFile } from "@/app/sales/types/quotation";
// import { toast } from "sonner";

// type QuotationFormProps = {
//   requestId: number;
//   projectName?: string;
//   customerId?: string;
//   mode?: string;
//   initialNotes?: string;
//   initialItems?: QuotationItem[];
//   initialVat?: number;
//   initialMarkup?: number;
//   initialDelivery?: string;
//   initialWarranty?: string;
//   initialValidity?: string;
//   baseQuotationId?: number; // pass this if creating a revision
//   initialRevisionNumber?: number; // initial revision (0 = original)
//   initialId?: string | null;
//   onSaved?: (data: SavedQuotation) => void;
//   onSavedDraft?: (data: SavedQuotation) => void;
//   onSendQuotation: () => void;
//   setActiveDraftId?: Dispatch<SetStateAction<string | null>>
// };

// type MaterialRow = {
//   id: string;
//   name: string;
//   specification: string;
//   quantity: number;
//   error?: {
//     name?: string;
//     specification?: string;
//     quantity?: string;
//   };
// };

// type QuotationItem = {
//   itemName: string;
//   scopeOfWork: string;
//   materials: MaterialRow[];
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
//   error?: {
//     itemName?: string;
//     scopeOfWork?: string;
//     quantity?: string;
//     unitPrice?: string;
//   };
// };

// type SavedQuotation = {
//   id: string;
//   requestId: number;
//   quotationNumber: string;
//   revisionLabel: number;
//   baseQuotationId: number;
//   status?: string;
//   items: (QuotationItem & { totalPrice: number })[];
//   validity: string;
//   delivery: string;
//   warranty: string;
//   quotation_notes?: string;
//   cadSketch?: string | null;
//   vat?: number;
//   markup?: number;
// };

// type Customer = {
//   id: string;
//   companyName: string;
//   contactPerson: string;
//   email: string;
//   phone: string;
//   address: string;
// };

// function uid(prefix = "") {
//   return prefix + Math.random().toString(36).slice(2, 9);
// }


// /** Helper: convert string|number to finite number, fallback 0 */
// function toNumber(v: string | number | undefined | null) {
//   if (typeof v === "number") {
//     return Number.isFinite(v) ? v : 0;
//   }
//   if (v === undefined || v === null) return 0;
//   const n = Number(String(v).trim());
//   return Number.isFinite(n) ? n : 0;
// }

// async function uploadCadFile(file: File) {
//   const formData = new FormData();
//   formData.append("file", file);

//   const res = await fetch("/api/sales/upload", {
//     method: "POST",
//     body: formData,
//   });

//   if (!res.ok) throw new Error("Upload failed");
//   return res.json();
// }

// export default function QuotationForm({
//   requestId,
//   projectName,
//   mode,
//   initialNotes,
//   initialItems,
//   initialVat,
//   initialMarkup,
//   initialDelivery,
//   initialWarranty,
//   initialValidity,
//   baseQuotationId,
//   initialId,
//   onSaved,
//   onSavedDraft,
//   //customerId, //
// }: QuotationFormProps) {

//   const [customer, setCustomer] = useState<Customer | null>(null);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [project, setProject] = useState<string>("");
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [modeName, setMode] = useState<string>("");
//   const [quotationNumber, setQuotationNumber] = useState<string>("");
//   const [baseId] = useState<number | null>(baseQuotationId ?? null);
//   const [isSent, setIsSent] = useState<boolean>(false);

//   const [items, setItems] = useState<QuotationItem[]>(initialItems && initialItems.length > 0
//     ? initialItems
//     : [{
//       itemName: "",
//       scopeOfWork: "",
//       materials: [{ id: uid(), name: "", specification: "", quantity: 0, error: {} }],
//       quantity: 0,
//       unitPrice: 0,
//       totalPrice: 0,
//       error: {},
//     },]
//   );

//   const [validity, setValidity] = useState(initialValidity || "");
//   const [delivery, setDelivery] = useState(initialDelivery || "");
//   const [warranty, setWarranty] = useState(initialWarranty || "");
//   const [quotationNotes, setQuotationNotes] = useState(initialNotes || "");
//   const [vat, setVat] = useState<number>(initialVat ?? 12);
//   const [markup, setMarkup] = useState<number>(initialMarkup ?? 0);
//   const [cadSketchFile, setCadSketchFile] = useState<PreviewFile[]>([]);
//   const [showPreview, setShowPreview] = useState(false);

//   const [revisionLabel, setRevisionLabel] = useState<string>("REVISION-00");

//   const [fieldErrors, setFieldErrors] = useState<{
//     delivery?: string;
//     warranty?: string;
//     validity?: string;
//     quotationNotes?: string;
//     cadSketch?: string;
//     items?: string;
//   }>({});

//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (initialItems && initialItems.length > 0) setItems(initialItems);
//     if (initialValidity) setValidity(initialValidity);
//     if (initialDelivery) setDelivery(initialDelivery);
//     if (initialWarranty) setWarranty(initialWarranty);
//     if (initialNotes) setQuotationNotes(initialNotes);
//     if (initialVat !== undefined) setVat(initialVat);
//     if (initialMarkup !== undefined) setMarkup(initialMarkup);
//   }, [initialItems, initialValidity, initialDelivery, initialWarranty, initialNotes, initialVat, initialMarkup]);

//    useEffect(() => {
//     async function fetchRequest() {
//       try {
//         const res = await fetch(`/api/sales/my_request/${requestId}`);
//         if (!res.ok) throw new Error("Failed to fetch request");
//         const data = await res.json();

//         if (data.customer) setCustomer (data.customer);
//         if (data.project_name) setProject (data.project_name);
//         if (data.mode) setMode (data.mode);
        
//       } catch (err) {
//         console.error(err);
//       }
//     }

//     fetchRequest();
//   }, [requestId]);

//   useEffect(() => {
//     // default validity to 30 days from today
//     if (!validity) {
//       const today = new Date();
//       today.setDate(today.getDate() + 30);
//       setValidity(today.toISOString().split("T")[0]);
//     }
    
//   }, [validity]);

//   // === Validation helpers ===
//   const validateAllFields = () => {
//     let isValid = true;
//     const newFieldErrors: typeof fieldErrors = {};
//     const newItems = [...items];

//     // Validate global fields
//     if (!delivery) {
//       newFieldErrors.delivery = "Delivery is required";
//       isValid = false;
//     }
//     if (!warranty) {
//       newFieldErrors.warranty = "Warranty is required";
//       isValid = false;
//     }
//     if (!validity) {
//       newFieldErrors.validity = "Validity is required";
//       isValid = false;
//     }
//     // if (!quotationNotes) {
//     //   newFieldErrors.quotationNotes = "Quotation notes are required";
//     //   isValid = false;
//     // }
//     // if (cadSketchFile.length === 0) {
//     //   newFieldErrors.cadSketch = "CAD Sketch is required";
//     //   isValid = false;
//     // }

//     newItems.forEach((item) => {
//       const itemError: NonNullable<QuotationItem['error']> = {};
//       if (!String(item.itemName).trim()) {
//         itemError.itemName = "Item Name is required";
//         isValid = false;
//       }
//       if (!String(item.scopeOfWork).trim()) {
//         itemError.scopeOfWork = "Scope of Work is required";
//         isValid = false;
//       }
//       if (toNumber(item.quantity) <= 0) {
//         itemError.quantity = "Quantity must be > 0";
//         isValid = false;
//       }
//       if (toNumber(item.unitPrice) <= 0) {
//         itemError.unitPrice = "Unit Price must be > 0";
//         isValid = false;
//       }

//       item.error = itemError;

//       item.materials.forEach((mat) => {
//         const materialError: NonNullable<MaterialRow['error']> = {};
//         if (!String(mat.name).trim()) {
//           materialError.name = "Material Name required";
//           isValid = false;
//         }
//         if (!String(mat.specification).trim()) {
//           materialError.specification = "Specification required";
//           isValid = false;
//         }
//         if (toNumber(mat.quantity) <= 0) {
//           materialError.quantity = "Qty must be > 0";
//           isValid = false;
//         }
//         mat.error = materialError;
//       });
//     });

//     if (newItems.some(i => Object.values(i.error || {}).some(Boolean)) ||
//       newItems.some(i => i.materials.some(m => Object.values(m.error || {}).some(Boolean)))) {
//       isValid = false;
//     }

//     setFieldErrors(newFieldErrors);
//     setItems(newItems);

//     return isValid;
//   };

//   // === Item & Material Handlers ===
//   const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
//     const newItems = [...items];
//     const updatedValue = (field === "quantity" || field === "unitPrice") ? toNumber(value) : value;
//     // @ts-expect-error: dynamic field assignment
//     newItems[index][field] = updatedValue;
//     setItems(newItems);
//   };

//   const addItem = () => {
//     setItems([
//       ...items,
//       {
//         itemName: "",
//         scopeOfWork: "",
//         materials: [{ id: uid(), name: "", specification: "", quantity: 0, error: {} }],
//         quantity: 0,
//         unitPrice: 0,
//         totalPrice: 0,
//         error: {},
//       },
//     ]);
//   };

//   const removeItem = (index: number) => {
//     setItems(items.filter((_, i) => i !== index));
//   };

//   const addMaterial = (itemIndex: number) => {
//     const newItems = [...items];
//     newItems[itemIndex].materials.push({
//       id: uid(),
//       name: "",
//       specification: "",
//       quantity: 0,
//       error: {},
//     });
//     setItems(newItems);
//   };

//   const updateMaterial = (
//     itemIndex: number,
//     materialIndex: number,
//     field: keyof MaterialRow,
//     value: string | number
//   ) => {
//     const newItems = [...items];
//     const updatedValue = (field === "quantity") ? toNumber(value) : value;
//     // @ts-expect-error: dynamic field assignment
//     newItems[itemIndex].materials[materialIndex][field] = updatedValue;
//     setItems(newItems);
//   };

//   const removeMaterial = (itemIndex: number, materialIndex: number) => {
//     const newItems = [...items];
//     newItems[itemIndex].materials.splice(materialIndex, 1);
//     if (newItems[itemIndex].materials.length === 0) {
//       newItems[itemIndex].materials.push({
//         id: uid(),
//         name: "",
//         specification: "",
//         quantity: 0,
//         error: {},
//       });
//     }
//     setItems(newItems);
//   };

//   // === Calculations ===
//   const calculateSummary = () => {
//     const subtotal = items.reduce((sum, i) => {
//       return sum + toNumber(i.quantity) * toNumber(i.unitPrice);
//     }, 0);
//     const markupAmount = subtotal * (toNumber(markup) / 100);
//     const totalWithMarkup = subtotal + markupAmount;
//     const vatAmount = totalWithMarkup * (toNumber(vat) / 100);
//     const grandTotal = totalWithMarkup + vatAmount;
//     return { subtotal, markupAmount, vatAmount, grandTotal };
//   };

//   // Build items array that *always* includes totalPrice (safe for preview/save)
//   const buildItemsWithTotals = () => {
//     return items.map((it) => ({
//       ...it,
//       totalPrice: toNumber(it.quantity) * toNumber(it.unitPrice),
//     }));
//   };

//   // === CAD Upload UI ===
  
//   const renderCadUpload = () => (
//     <div className="border p-4 rounded-lg bg-gray-50">
//       <label className="block text-gray-700 font-medium mb-2">Upload CAD Sketch</label>
//       <div className="flex items-center gap-4">
//         <input 
//           type="file"
//           accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.dwg"
//           onChange={async (e) => {
//             if (e.target.files && e.target.files[0]) {
//               const file = e.target.files[0];
//               const MAX_FILE_SIZE = 10* 1024 * 1024;

//               if (file.size > MAX_FILE_SIZE) {
//                 toast.error(`File "${file.name}" is too large. Max is 10MB.`);
//                 return;
//               }
//               try {
//                 const uploadResult = await uploadCadFile(e.target.files[0]);
//                 if (uploadResult.success) {
                  
//                   setCadSketchFile([ { id: Date.now(), name: uploadResult.file.name, filePath: uploadResult.file.filePath }, ]);
//                 } else {
//                   toast.error("Upload failed: " + uploadResult.error);
//                 }
//               } catch {
//                 toast.error("Upload failed");
//               }
//             }
//           }}
//           disabled={isSent}
//           className="hidden"
//           id="cad-upload"
//         />
//         <label
//           htmlFor="cad-upload"
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition flex item-center gap-2"
//         >
//           <UploadCloud size={18} />Upload File
//         </label>
//         {cadSketchFile.length > 0 && (
//           <ul className="text-sm text-gray-700">
//             {cadSketchFile.map((f, i) => (
//               <li key={i} className="flex items-center gap-2">
//                 {f.name}
//                 <button
//                   type="button"
//                   onClick={() => setCadSketchFile(cadSketchFile.filter((_, idx) => idx !== i))}
//                   className="text-red-600 hover:text-red-800"
//                 >
//                   ✕
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//       <p className="text-xs text-gray-500 mt-2">
//         Allowed types: PDF, JPG, PNG, DOC, XLS, DWG — Max size: 10MB
//       </p>
//       {fieldErrors.cadSketch && <p className="text-red-600 text-sm mt-2">{fieldErrors.cadSketch}</p>}
//     </div>
//   );

//   const MAX_FILE_SIZE = 10 * 1024 * 1024;

//   const handleSave = async (status: "draft" | "sent") => {
//     // only require validation when saving as final (sent)
//     if (status === "sent" && !validateAllFields()) {
//       toast.error("Please fill in all required fields before saving.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       let uploadedFilePath: string | null = null;

//       if (cadSketchFile.length > 0 && cadSketchFile[0] instanceof File) {
//         if (cadSketchFile[0].size > MAX_FILE_SIZE) {
//           toast.error("File too large. Maximum is 10MB.");
//           setIsLoading(false);
//           return;
//         }
//         const uploadResult = await uploadCadFile(cadSketchFile[0]);
//         if (uploadResult.success) {
//           uploadedFilePath = uploadResult.file.filePath;
//         } else {
//           toast.error("Failed to uplaod file: " + uploadResult.error);
//           setIsLoading(false);
//           return;
//         }
//       } else if (cadSketchFile.length > 0) {
//         const first = cadSketchFile[0];
//         if (!(first instanceof File)) {
//           uploadedFilePath = first.filePath || null;
//         }
//       }

//       const itemsForSave = items.map((it) => ({
//         itemName: it.itemName,
//         scopeOfWork: it.scopeOfWork,
//         quantity: toNumber(it.quantity),
//         unitPrice: toNumber(it.unitPrice),
//         materials: it.materials.map((m) => ({
//           name: m.name,
//           specification: m.specification,
//           quantity: toNumber(m.quantity),
//         })),
//       }));

//       const attachedFiles = cadSketchFile.map((f) => 
//       f instanceof File
//         ? {
//           fileName: f.name,
//           filePath: `/uploads/${f.name}`,
//         }
//       : {
//           fileName: f.name,
//           filePath: f.filePath || `/uploads/${f.name}`,
//       });

//       const isUuid = (value: unknown): value is string =>
//         typeof value === "string" &&
//           /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value as string);
    
//       const isRestoredDraft = initialId && /^[0-9a-fA-F-]{36}$/.test(initialId);
      
//     const payLoad = {
//         id: isRestoredDraft ? initialId : undefined,
//         requestId,
//         baseQuotationId: isUuid(baseId) ? baseId : undefined,
//         projectName: projectName || "",
//         mode: mode || "",
//         validity,
//         delivery,
//         warranty,
//         quotationNotes,
//         cadSketch: uploadedFilePath,
//         vat: Number(vat) || 12,
//         markup: Number(markup) || 0,
//         attachedFiles,
//         items: itemsForSave,
//         status,
//       };

//       console.log("Saving quotation payload:", payLoad);

//       const isRestoringToDraft = status === "draft" && isRestoredDraft;
//       const url = isRestoringToDraft
//         ? `/api/sales/quotations/${initialId}`
//         : "/api/sales/quotations";
//       const method = isRestoringToDraft ? "PUT" : "POST";

//       console.log("Saving draft:", { method, url, id: payLoad.id });

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payLoad),
//       });

//       const result = await res.json();

//       if (res.ok && result.success) {
//         // normaize possible shapes from api
//         const savedQuotation = result.data;

//         setQuotationNumber(savedQuotation?.quotationNumber || "");
//         setRevisionLabel(savedQuotation?.revisionLabel || "");

//         toast.success(
//           status === "draft"
//             ? isRestoredDraft
//               ? "Restored draft saved again."
//               : "Draft saved successfully."
//             : "Quotation saved successfully!"
//         );

//         if (status === "draft") {
//           onSavedDraft?.({
//             ...savedQuotation,
//             vat: savedQuotation?.vat ?? 12,
//             markup: savedQuotation?.markup ?? 0,
//             items: savedQuotation?.items ?? [],
//           });

//           window.dispatchEvent(new CustomEvent("drafts-unlocked"));
//           window.dispatchEvent(new CustomEvent("drafts-updated"));
//         } else {
//           onSaved?.(savedQuotation);
//         }
//       } else {
//         toast.error(`Failed to save quotation: ${result.error || "Unknown error"}`);
//       }
//     } catch (err) {
//       console.error("Error saving quotation:", err);
//       toast.error("Error saving quotation. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSend = async () => {
    
//   if (!validateAllFields()) {
//     toast.error("Please fix the validation errors before sending.");
//     return;
//   }

//   setIsLoading(true);

//   try {
//     let uploadedFilePath: string | null = null;

//     if (cadSketchFile.length > 0 && cadSketchFile[0] instanceof File) {
//       if (cadSketchFile[0].size > MAX_FILE_SIZE) {
//         toast.error("File too large. Max size is 10MB.");
//         setIsLoading(false);
//         return;
//       }
//       const uploadResult = await uploadCadFile(cadSketchFile[0]);
//       if (uploadResult.success) {
//         uploadedFilePath = uploadResult.file.filePath;
//       } else {
//         toast.error("Failed to upload file: " + uploadResult.error);
//         setIsLoading(false);
//         return;
//       }
//     } else if (cadSketchFile.length > 0) {
//       const first = cadSketchFile[0];
//       if(!(first instanceof File)) {
//         uploadedFilePath = first.filePath || null;
//       }
//     }

//     const itemsForSend = items.map((it) => ({
//       itemName: it.itemName,
//       scopeOfWork: it.scopeOfWork,
//       quantity: toNumber(it.quantity),
//       unitPrice: toNumber(it.unitPrice),
//       materials: it.materials.map((m) => ({
//         name: m.name,
//         specification: m.specification,
//         quantity: toNumber(m.quantity),
//       })),
//     }));

//     // Build attachedFiles array
//   const attachedFiles = cadSketchFile.map((f) => 
//       f instanceof File
//         ? {
//           fileName: f.name,
//           filePath: `/uploads/${f.name}`,
//         }
//       : {
//         fileName: f.name,
//         filePath: f.filePath || `/uploads/${f.name}`,
//       }
//     );

//     const payLoad = {
//       requestId,
//       baseQuotationId: baseId ?? undefined,
//       projectName: projectName || "",
//       mode: mode || "",
//       validity,
//       delivery,
//       warranty,
//       quotationNotes,
//       cadSketch: uploadedFilePath,
//       vat: Number(vat) || 12,
//       markup: Number(markup) || 0,
//       attachedFiles,
//       status: "sent",
//       items: itemsForSend,
//     };

//     const res = await fetch("/api/sales/quotations", {
//       method: "POST",
//       headers: { "Content-Type" : "application/json" },
//       body: JSON.stringify(payLoad),
//     });

//     const result = await res.json();
//     if (res.ok && result.success) {
//       toast.success("Quotation sent successfully!");
//       setIsSent(true);

//       setQuotationNumber(result.data.quotationNumber);
//       setRevisionLabel(result.data.revisionLabel);

//       onSaved?.(result.data);
//     } else {
//       toast.error(`Failed to send quotation: ${result.error || "Unknown error"}`);
//     }
//   } catch (err) {
//     console.error("Error sending quotation:", err);
//     toast.error("Error sending quotation.Please try again.");
//   } finally {
//     setIsLoading(false);
//   }
// };

//   // If preview requested, pass itemsWithTotals to PreviewDocument (so totalPrice is defined)
//   if (showPreview) {
//     const itemsForPreview = buildItemsWithTotals();
//     return (
//       <PreviewDocument
//         items={itemsForPreview}
//         delivery={delivery}
//         warranty={warranty}
//         validity={validity}
//         quotationNotes={quotationNotes}
//         requestId={requestId}
//         projectName={projectName}
//         vat={vat}
//         markup={markup}
//         cadSketchFile={cadSketchFile}
//         revisionLabel={revisionLabel}
//         baseQuotationId={baseId ?? requestId}
//         quotationNumber={quotationNumber}
//         customer={customer}
//         onBack={() => setShowPreview(false)}
//         onSend={handleSend}
//         isSent={isSent}
//       />
//     );
//   }

//   return (
//     <div className="space-y-8">
//       <div className="p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//     {/* Customer Info */}
//     <div>
//       <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Customer Information</h3>
//       {customer ? (
//         <div className="space-y-2 text-gray-700">
//           <p><span className="font-medium">Company:</span> {customer.companyName}</p>
//           <p><span className="font-medium">Contact Person:</span> {customer.contactPerson}</p>
//           <p><span className="font-medium">Email:</span> {customer.email}</p>
//           <p><span className="font-medium">Phone:</span> {customer.phone}</p>
//           <p><span className="font-medium">Address:</span> {customer.address}</p>
//         </div>
//       ) : (
//         <p className="text-gray-500">Loading customer info...</p>
//       )}
//     </div>

//     {/* Quotation & Request Info */}
//     <div>
//       <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Quotation Details</h3>
//       <div className="space-y-2 text-gray-700">
//         <p><span className="font-medium">Quotation Number:</span> {quotationNumber || "Pending"}</p>
//         <p><span className="font-medium">Revision:</span> {revisionLabel}</p>
//         <p><span className="font-medium">Base Quotation ID:</span> {baseId ?? requestId}</p>
//         <p><span className="font-medium">Request ID:</span> {requestId}</p>
//         <p><span className="font-medium">Project Name:</span> {projectName || "Not provided"}</p>
//         <p><span className="font-medium">Mode:</span> {mode || "Not provided"}</p>
//       </div>
//     </div>
//   </div>
// </div>

//       {/* CAD Upload */}
//       {renderCadUpload()}

//       {/* Add Item */}
//       <div className="flex justify-end">
//         <button
//           type="button"
//           onClick={addItem}
//           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//         >
//           + Add Item
//         </button>
//       </div>

//       {/* Items */}
//       {items.map((item, index) => {
//         const itemTotal = toNumber(item.quantity) * toNumber(item.unitPrice);
//         return (
//           <div key={index} className="border rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
//             {/* Item Name */}
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">Item Name</label>
//               <input
//                 type="text"
//                 value={item.itemName}
//                 onChange={(e) => updateItem(index, "itemName", e.target.value)}
//                 disabled={isSent}
//                 className={`w-full border rounded-lg px-4 py-2 ${item.error?.itemName ? "border-red-500" : ""}`}
//               />
//               {item.error?.itemName && <p className="text-red-600 text-sm mt-1">{item.error.itemName}</p>}
//             </div>

//             {/* Scope of Work */}
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">Scope of Work</label>
//               <textarea
//                 value={item.scopeOfWork}
//                 onChange={(e) => updateItem(index, "scopeOfWork", e.target.value)}
//                 disabled={isSent}
//                 className={`w-full border rounded-lg px-4 py-2 ${item.error?.scopeOfWork ? "border-red-500" : ""}`}
//                 rows={3}
//               />
//               {item.error?.scopeOfWork && <p className="text-red-600 text-sm mt-1">{item.error.scopeOfWork}</p>}
//             </div>

//             {/* Materials */}
//             <div>
//               <h4 className="font-semibold">Materials</h4>
//               {item.materials.map((mat, mi) => (
//                 <div key={mat.id} className="grid grid-cols-3 gap-3 items-center mt-2">
//                   <input
//                     type="text"
//                     placeholder="Material Name"
//                     value={mat.name}
//                     onChange={(e) => updateMaterial(index, mi, "name", e.target.value)}
//                     disabled={isSent}
//                     className={`border rounded px-2 py-1 ${mat.error?.name ? "border-red-500" : ""}`}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Specification"
//                     value={mat.specification}
//                     onChange={(e) => updateMaterial(index, mi, "specification", e.target.value)}
//                     disabled={isSent}
//                     className={`border rounded px-2 py-1 ${mat.error?.specification ? "border-red-500" : ""}`}
//                   />
//                   <input
//                     type="number"
//                     placeholder="Qty"
//                     value={mat.quantity === 0 ? "" : mat.quantity}
//                     onChange={(e) => updateMaterial(index, mi, "quantity", e.target.value)}
//                     disabled={isSent}
//                     className={`border rounded px-2 py-1 ${mat.error?.quantity ? "border-red-500" : ""}`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeMaterial(index, mi)}
//                     className="text-red-600 hover:text-red-800 col-span-3 text-right"
//                   >
//                     Remove
//                   </button>
//                   {mat.error?.name && <p className="text-red-600 text-xs col-span-3">{mat.error.name}</p>}
//                   {mat.error?.specification && <p className="text-red-600 text-xs col-span-3">{mat.error.specification}</p>}
//                   {mat.error?.quantity && <p className="text-red-600 text-xs col-span-3">{mat.error.quantity}</p>}
//                 </div>
//               ))}
//               <button type="button" onClick={() => addMaterial(index)} className="mt-2 text-blue-600 hover:text-blue-800">
//                 + Add Material
//               </button>
//             </div>

//             {/* Item Quantity & Unit Price */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-gray-700 font-medium mb-1">Quantity</label>
//                 <input
//                   type="number"
//                   value={item.quantity === 0 ? "" : item.quantity}
//                   onChange={(e) => updateItem(index, "quantity", e.target.value)}
//                   disabled={isSent}
//                   className={`w-full border rounded-lg px-4 py-2 ${item.error?.quantity ? "border-red-500" : ""}`}
//                 />
//                 {item.error?.quantity && <p className="text-red-600 text-sm mt-1">{item.error.quantity}</p>}
//               </div>
//               <div>
//                 <label className="block text-gray-700 font-medium mb-1">Unit Price</label>
//                 <input
//                   type="number"
//                   value={item.unitPrice === 0 ? "" : item.unitPrice}
//                   onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
//                   disabled={isSent}
//                   className={`w-full border rounded-lg px-4 py-2 ${item.error?.unitPrice ? "border-red-500" : ""}`}
//                 />
//                 {item.error?.unitPrice && <p className="text-red-600 text-sm mt-1">{item.error.unitPrice}</p>}
//               </div>
//             </div>

//             {/* Item Total */}
//             <p className="font-medium">Item Total: ₱{itemTotal.toFixed(2)}</p>

//             {/* Remove Item */}
//             <button
//               type="button"
//               onClick={() => removeItem(index)}
//               className="absolute top-4 right-4 text-red-600 hover:text-red-800 flex items-center gap-1"
//             >
//               <Trash2 size={16} /> Remove
//             </button>
//           </div>
//         );
//       })}

//       {/* Global Fields */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Validity</label>
//           <input
//             type="date"
//             value={validity}
//             onChange={(e) => setValidity(e.target.value)}
//             disabled={isSent}
//             className={`w-full border rounded px-3 py-2 ${fieldErrors.validity ? "border-red-500" : ""}`}
//           />
//           {fieldErrors.validity && <p className="text-red-600 text-sm">{fieldErrors.validity}</p>}
//         </div>

//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Delivery</label>
//           <select
//             value={delivery}
//             onChange={(e) => setDelivery(e.target.value)}
//             disabled={isSent}
//             className={`w-full border rounded px-3 py-2 ${fieldErrors.delivery ? "border-red-500" : ""}`}
//           >
//             <option value="">Select Delivery</option>
//             <option value="3-4 Days">3–4 Days</option>
//             <option value="5-7 Days">5–7 Days</option>
//             <option value="7-10 Days">7–10 Days</option>
//             <option value="2-3 Weeks">2–3 Weeks</option>
//             <option value="30-45 Days">30–45 Days</option>
//           </select>
//           {fieldErrors.delivery && <p className="text-red-600 text-sm">{fieldErrors.delivery}</p>}
//         </div>

//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Warranty (Months)</label>
//           <select
//             value={warranty}
//             onChange={(e) => setWarranty(e.target.value)}
//             disabled={isSent}
//             className={`w-full border rounded px-3 py-2 ${fieldErrors.warranty ? "border-red-500" : ""}`}
//           >
//             <option value="">Select Warranty</option>
//             <option value="1">1 Month</option>
//             <option value="3">3 Months</option>
//             <option value="6">6 Months</option>
//             <option value="12">12 Months</option>
//             <option value="24">24 Months</option>
//             <option value="36">36 Months</option>
//           </select>
//           {fieldErrors.warranty && <p className="text-red-600 text-sm">{fieldErrors.warranty}</p>}
//         </div>
//       </div>

//       {/* Notes */}
//       <div>
//         <label className="block text-gray-700 font-medium mb-1">Quotation Notes</label>
//         <textarea
//           value={quotationNotes}
//           onChange={(e) => setQuotationNotes(e.target.value)}
//           disabled={isSent}
//           rows={3}
//           className={`w-full border rounded px-3 py-2 ${fieldErrors.quotationNotes ? "border-red-500" : ""}`}
//         />
//         {fieldErrors.quotationNotes && <p className="text-red-600 text-sm">{fieldErrors.quotationNotes}</p>}
//       </div>

//       {/* VAT & Markup */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-gray-700 font-medium mb-1">VAT (%)</label>
//           <input
//             type="number"
//             value={vat}
//             onChange={(e) => setVat(toNumber(e.target.value))}
//             disabled={isSent}
//             className="w-full border rounded px-3 py-2"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Markup (%)</label>
//           <input
//             type="number"
//             value={markup}
//             onChange={(e) => setMarkup(toNumber(e.target.value))}
//             disabled={isSent}
//             className="w-full border rounded px-3 py-2"
//           />
//         </div>
//       </div>

//       {/* Summary */}
//       {(() => {
//         const { subtotal, markupAmount, vatAmount, grandTotal } = calculateSummary();
//         return (
//           <div className="p-6 bg-gray-50 rounded-lg shadow-sm space-y-2 text-right">
//             <div className="flex justify-between">
//               <span>Subtotal:</span>
//               <span>₱{subtotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Markup ({markup}%):</span>
//               <span>₱{markupAmount.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>VAT ({vat}%):</span>
//               <span>₱{vatAmount.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between font-semibold text-lg border-t pt-2">
//               <span>Grand Total:</span>
//               <span>₱{grandTotal.toFixed(2)}</span>
//             </div>
//           </div>
//         );
//       })()}

//      {/* Actions */}
// <div className="flex justify-end gap-4">
//   <button
//     type="button"
//     onClick={() => {
//       if (validateAllFields()) {
//         setShowPreview(true);
//       } else {
//         toast.error("Complete the form before proceeding.");
//       }
//     }}
//     className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
//   >
//     Done
//   </button>

//   <button
//     type="button"
//     onClick={() => handleSave("draft")}
//     disabled={isLoading}
//     className={`px-6 py-2 rounded-lg transition ${
//       isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
//     }`}
//   >
//     {isLoading ? "Saving..." : "Save as Draft"}
//   </button>
// </div>
// {/* {!isSent ? (
//   <>
//   <button onClick={() => handleSave("draft")}>Save as Draft</button>
//   <button onClick={() => setShowPreview(true)}>Done</button>
//   </>
// ) : (
//   <p className="text-green600 font-semibold">Quotation has been sent.</p>
// )} */}
//     </div>
//   );
// };  

// app/sales/s_pending_customer_request/pending_view/[id]/quotationform.tsx

"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { UploadCloud, Trash2, } from "lucide-react";
import { PreviewDocument } from "./components/quotationcomponents/PreviewDocument";
import { PreviewFile } from "@/app/sales/types/quotation";
import { toast } from "sonner";
import { NumericInput } from "./components/NumericInput";

type QuotationFormProps = {
  requestId: number;
  projectName?: string;
  customerId?: string;
  mode?: string;
  initialNotes?: string;
  initialItems?: QuotationItem[];
  initialVat?: number;
  initialMarkup?: number;
  initialDelivery?: string;
  initialWarranty?: string;
  initialValidity?: string;
  baseQuotationId?: number; // pass this if creating a revision
  initialRevisionNumber?: number; // initial revision (0 = original)
  initialId?: string | null;
  onSaved?: (data: SavedQuotation) => void;
  onSavedDraft?: (data: SavedQuotation) => void;
  onSendQuotation: () => void;
  setActiveDraftId?: Dispatch<SetStateAction<string | null>>
};

type MaterialRow = {
  id: string;
  name: string;
  specification: string;
  quantity: number;
  error?: {
    name?: string;
    specification?: string;
    quantity?: string;
  };
};

type QuotationItem = {
  itemName: string;
  scopeOfWork: string;
  materials: MaterialRow[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  error?: {
    itemName?: string;
    scopeOfWork?: string;
    quantity?: string;
    unitPrice?: string;
  };
};

type SavedQuotation = {
  id: string;
  requestId: number;
  quotationNumber: string;
  revisionLabel: number;
  baseQuotationId: number;
  status?: string;
  items: (QuotationItem & { totalPrice: number })[];
  validity: string;
  delivery: string;
  warranty: string;
  quotation_notes?: string;
  cadSketch?: string | null;
  vat?: number;
  markup?: number;
};

type Customer = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
};

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}


/** Helper: convert string|number to finite number, fallback 0 */
function toNumber(v: string | number | undefined | null) {
  if (typeof v === "number") {
    return Number.isFinite(v) ? v : 0;
  }
  if (v === undefined || v === null) return 0;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : 0;
}

async function uploadCadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/sales/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export default function QuotationForm({
  requestId,
  projectName,
  mode,
  initialNotes,
  initialItems,
  initialVat,
  initialMarkup,
  initialDelivery,
  initialWarranty,
  initialValidity,
  baseQuotationId,
  initialId,
  onSaved,
  onSavedDraft,
  //customerId, //
}: QuotationFormProps) {

  const [customer, setCustomer] = useState<Customer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [project, setProject] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modeName, setMode] = useState<string>("");
  const [quotationNumber, setQuotationNumber] = useState<string>("");
  const [baseId] = useState<number | null>(baseQuotationId ?? null);
  const [isSent, setIsSent] = useState<boolean>(false);

  const [items, setItems] = useState<QuotationItem[]>(initialItems && initialItems.length > 0
    ? initialItems
    : [{
      itemName: "",
      scopeOfWork: "",
      materials: [{ id: uid(), name: "", specification: "", quantity: 0, error: {} }],
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      error: {},
    },]
  );

  const [validity, setValidity] = useState(initialValidity || "");
  const [delivery, setDelivery] = useState(initialDelivery || "");
  const [warranty, setWarranty] = useState(initialWarranty || "");
  const [quotationNotes, setQuotationNotes] = useState(initialNotes || "");
  const [vat, setVat] = useState<number>(initialVat ?? 12);
  const [markup, setMarkup] = useState<number>(initialMarkup ?? 0);
  const [cadSketchFile, setCadSketchFile] = useState<PreviewFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [revisionLabel, setRevisionLabel] = useState<string>("REVISION-00");

  const [fieldErrors, setFieldErrors] = useState<{
    delivery?: string;
    warranty?: string;
    validity?: string;
    quotationNotes?: string;
    cadSketch?: string;
    items?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) setItems(initialItems);
    if (initialValidity) setValidity(initialValidity);
    if (initialDelivery) setDelivery(initialDelivery);
    if (initialWarranty) setWarranty(initialWarranty);
    if (initialNotes) setQuotationNotes(initialNotes);
    if (initialVat !== undefined) setVat(initialVat);
    if (initialMarkup !== undefined) setMarkup(initialMarkup);
  }, [initialItems, initialValidity, initialDelivery, initialWarranty, initialNotes, initialVat, initialMarkup]);

   useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch(`/api/sales/my_request/${requestId}`);
        if (!res.ok) throw new Error("Failed to fetch request");
        const data = await res.json();

        if (data.customer) setCustomer (data.customer);
        if (data.project_name) setProject (data.project_name);
        if (data.mode) setMode (data.mode);
        
      } catch (err) {
        console.error(err);
      }
    }

    fetchRequest();
  }, [requestId]);

  useEffect(() => {
    // default validity to 30 days from today
    if (!validity) {
      const today = new Date();
      today.setDate(today.getDate() + 30);
      setValidity(today.toISOString().split("T")[0]);
    }
    
  }, [validity]);

  // === Validation helpers ===
  const validateAllFields = () => {
    let isValid = true;
    const newFieldErrors: typeof fieldErrors = {};
    const newItems = [...items];

    // global fields
    newFieldErrors.delivery = !delivery ? "Required" : undefined;
    newFieldErrors.warranty = !warranty ? "Required" : undefined;
    newFieldErrors.validity = !validity ? "Required" : undefined;

    if (!delivery || !warranty || !validity) isValid = false;

    newItems.forEach((item) => {
      const itemError: NonNullable<QuotationItem['error']> = {};

      itemError.itemName = !item.itemName ? "Required" : undefined;
      itemError.scopeOfWork = !item.scopeOfWork ? "Required" : undefined;
      itemError.quantity = toNumber(item.quantity) <= 0 ? "Required" : undefined;
      itemError.unitPrice = toNumber(item.unitPrice) <= 0 ? "Required" : undefined;

      item.materials.forEach((mat) => {
        const materialError: NonNullable<MaterialRow['error']> = {};

        materialError.name = !mat.name?.trim() ? "Required" : undefined;
        materialError.specification = !mat.specification?.trim() ? "Required" : undefined;
        materialError.quantity = toNumber(mat.quantity) <= 0 ? "Required" : undefined;
        mat.error = materialError;
      });

      if (Object.values(itemError).some(Boolean) ||
        item.materials.some(m => Object.values(m.error || {}).some(Boolean))) {
          isValid = false;
        }
      
        item.error = itemError;
    });

    setFieldErrors(newFieldErrors);
    setItems(newItems);

    if (!isValid) toast.error("Please fill all required fields.");

    return isValid;
  };

  // === Item & Material Handlers ===
  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...items];
    const updatedValue = (field === "quantity" || field === "unitPrice") ? toNumber(value) : value;
    // @ts-expect-error: dynamic field assignment
    newItems[index][field] = updatedValue;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        scopeOfWork: "",
        materials: [{ id: uid(), name: "", specification: "", quantity: 0, error: {} }],
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        error: {},
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addMaterial = (itemIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].materials.push({
      id: uid(),
      name: "",
      specification: "",
      quantity: 0,
      error: {},
    });
    setItems(newItems);
  };

  const updateMaterial = (
    itemIndex: number,
    materialIndex: number,
    field: keyof MaterialRow,
    value: string | number
  ) => {
    const newItems = [...items];
    const updatedValue = (field === "quantity") ? toNumber(value) : value;
    // @ts-expect-error: dynamic field assignment
    newItems[itemIndex].materials[materialIndex][field] = updatedValue;
    setItems(newItems);
  };

  const removeMaterial = (itemIndex: number, materialIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].materials.splice(materialIndex, 1);
    if (newItems[itemIndex].materials.length === 0) {
      newItems[itemIndex].materials.push({
        id: uid(),
        name: "",
        specification: "",
        quantity: 0,
        error: {},
      });
    }
    setItems(newItems);
  };

  // === Calculations ===
  const calculateSummary = () => {
    const subtotal = items.reduce((sum, i) => {
      return sum + toNumber(i.quantity) * toNumber(i.unitPrice);
    }, 0);
    const markupAmount = subtotal * (toNumber(markup) / 100);
    const totalWithMarkup = subtotal + markupAmount;
    const vatAmount = totalWithMarkup * (toNumber(vat) / 100);
    const grandTotal = totalWithMarkup + vatAmount;
    return { subtotal, markupAmount, vatAmount, grandTotal };
  };

  // Build items array that *always* includes totalPrice (safe for preview/save)
  const buildItemsWithTotals = () => {
    return items.map((it) => ({
      ...it,
      totalPrice: toNumber(it.quantity) * toNumber(it.unitPrice),
    }));
  };

  // === CAD Upload UI ===
  
  const renderCadUpload = () => (
    <div className="border border-[#ffb7b7] p-4 rounded-lg shadow-sm bg-white">
      <h3 className="block font-bold text-lg text-[#880c0c] border-b pb-2 mb-2">Upload CAD Sketch</h3>
      <div className="flex items-center gap-4">
        <input 
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.dwg"
          onChange={async (e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              const MAX_FILE_SIZE = 10* 1024 * 1024;

              if (file.size > MAX_FILE_SIZE) {
                toast.error(`File "${file.name}" is too large. Max is 10MB.`);
                return;
              }
              try {
                const uploadResult = await uploadCadFile(e.target.files[0]);
                if (uploadResult.success) {
                  
                  setCadSketchFile([ { id: Date.now(), name: uploadResult.file.name, filePath: uploadResult.file.filePath }, ]);
                } else {
                  toast.error("Upload failed: " + uploadResult.error);
                }
              } catch {
                toast.error("Upload failed");
              }
            }
          }}
          disabled={isSent}
          className="hidden"
          id="cad-upload"
        />
        <label
          htmlFor="cad-upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition flex item-center gap-2"
        >
          <UploadCloud size={18} />Upload File
        </label>
        {cadSketchFile.length > 0 && (
          <ul className="text-sm text-gray-700">
            {cadSketchFile.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                {f.name}
                <button
                  type="button"
                  onClick={() => setCadSketchFile(cadSketchFile.filter((_, idx) => idx !== i))}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Allowed types: PDF, JPG, PNG, DOC, XLS, DWG — Max size: 10MB
      </p>
      {fieldErrors.cadSketch && <p className="text-red-600 text-sm mt-2">{fieldErrors.cadSketch}</p>}
    </div>
  );

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleSave = async (status: "draft" | "sent") => {
    // only require validation when saving as final (sent)
    if (status === "sent" && !validateAllFields()) {
      toast.error("Please fill in all required fields before saving.");
      return;
    }

    setIsLoading(true);

    try {
      let uploadedFilePath: string | null = null;

      if (cadSketchFile.length > 0 && cadSketchFile[0] instanceof File) {
        if (cadSketchFile[0].size > MAX_FILE_SIZE) {
          toast.error("File too large. Maximum is 10MB.");
          setIsLoading(false);
          return;
        }
        const uploadResult = await uploadCadFile(cadSketchFile[0]);
        if (uploadResult.success) {
          uploadedFilePath = uploadResult.file.filePath;
        } else {
          toast.error("Failed to uplaod file: " + uploadResult.error);
          setIsLoading(false);
          return;
        }
      } else if (cadSketchFile.length > 0) {
        const first = cadSketchFile[0];
        if (!(first instanceof File)) {
          uploadedFilePath = first.filePath || null;
        }
      }

      const itemsForSave = items.map((it) => ({
        itemName: it.itemName,
        scopeOfWork: it.scopeOfWork,
        quantity: toNumber(it.quantity),
        unitPrice: toNumber(it.unitPrice),
        materials: it.materials.map((m) => ({
          name: m.name,
          specification: m.specification,
          quantity: toNumber(m.quantity),
        })),
      }));

      const attachedFiles = cadSketchFile.map((f) => 
      f instanceof File
        ? {
          fileName: f.name,
          filePath: `/uploads/${f.name}`,
        }
      : {
          fileName: f.name,
          filePath: f.filePath || `/uploads/${f.name}`,
      });

      const isUuid = (value: unknown): value is string =>
        typeof value === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value as string);
    
      const isRestoredDraft = initialId && /^[0-9a-fA-F-]{36}$/.test(initialId);
      
    const payLoad = {
        id: isRestoredDraft ? initialId : undefined,
        requestId,
        baseQuotationId: isUuid(baseId) ? baseId : undefined,
        projectName: projectName || "",
        mode: mode || "",
        validity,
        delivery,
        warranty,
        quotationNotes,
        cadSketch: uploadedFilePath,
        vat: Number(vat) || 12,
        markup: Number(markup) || 0,
        attachedFiles,
        items: itemsForSave,
        status,
      };

      console.log("Saving quotation payload:", payLoad);

      const isRestoringToDraft = status === "draft" && isRestoredDraft;
      const url = isRestoringToDraft
        ? `/api/sales/quotations/${initialId}`
        : "/api/sales/quotations";
      const method = isRestoringToDraft ? "PUT" : "POST";

      console.log("Saving draft:", { method, url, id: payLoad.id });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payLoad),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // normaize possible shapes from api
        const savedQuotation = result.data;

        setQuotationNumber(savedQuotation?.quotationNumber || "");
        setRevisionLabel(savedQuotation?.revisionLabel || "");

        toast.success(
          status === "draft"
            ? isRestoredDraft
              ? "Restored draft saved again."
              : "Draft saved successfully."
            : "Quotation saved successfully!"
        );

        if (status === "draft") {
          onSavedDraft?.({
            ...savedQuotation,
            vat: savedQuotation?.vat ?? 12,
            markup: savedQuotation?.markup ?? 0,
            items: savedQuotation?.items ?? [],
          });

          window.dispatchEvent(new CustomEvent("drafts-unlocked"));
          window.dispatchEvent(new CustomEvent("drafts-updated"));
        } else {
          onSaved?.(savedQuotation);
        }
      } else {
        toast.error(`Failed to save quotation: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving quotation:", err);
      toast.error("Error saving quotation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    
  if (!validateAllFields()) {
    toast.error("Please fix the validation errors before sending.");
    return;
  }

  setIsLoading(true);

  try {
    let uploadedFilePath: string | null = null;

    if (cadSketchFile.length > 0 && cadSketchFile[0] instanceof File) {
      if (cadSketchFile[0].size > MAX_FILE_SIZE) {
        toast.error("File too large. Max size is 10MB.");
        setIsLoading(false);
        return;
      }
      const uploadResult = await uploadCadFile(cadSketchFile[0]);
      if (uploadResult.success) {
        uploadedFilePath = uploadResult.file.filePath;
      } else {
        toast.error("Failed to upload file: " + uploadResult.error);
        setIsLoading(false);
        return;
      }
    } else if (cadSketchFile.length > 0) {
      const first = cadSketchFile[0];
      if(!(first instanceof File)) {
        uploadedFilePath = first.filePath || null;
      }
    }

    const itemsForSend = items.map((it) => ({
      itemName: it.itemName,
      scopeOfWork: it.scopeOfWork,
      quantity: toNumber(it.quantity),
      unitPrice: toNumber(it.unitPrice),
      materials: it.materials.map((m) => ({
        name: m.name,
        specification: m.specification,
        quantity: toNumber(m.quantity),
      })),
    }));

    // Build attachedFiles array
  const attachedFiles = cadSketchFile.map((f) => 
      f instanceof File
        ? {
          fileName: f.name,
          filePath: `/uploads/${f.name}`,
        }
      : {
        fileName: f.name,
        filePath: f.filePath || `/uploads/${f.name}`,
      }
    );

    const payLoad = {
      requestId,
      baseQuotationId: baseId ?? undefined,
      projectName: projectName || "",
      mode: mode || "",
      validity,
      delivery,
      warranty,
      quotationNotes,
      cadSketch: uploadedFilePath,
      vat: Number(vat) || 12,
      markup: Number(markup) || 0,
      attachedFiles,
      status: "sent",
      items: itemsForSend,
    };

    const res = await fetch("/api/sales/quotations", {
      method: "POST",
      headers: { "Content-Type" : "application/json" },
      body: JSON.stringify(payLoad),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      toast.success("Quotation sent successfully!");
      setIsSent(true);

      setQuotationNumber(result.data.quotationNumber);
      setRevisionLabel(result.data.revisionLabel);

      onSaved?.(result.data);
    } else {
      toast.error(`Failed to send quotation: ${result.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Error sending quotation:", err);
    toast.error("Error sending quotation.Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  // If preview requested, pass itemsWithTotals to PreviewDocument (so totalPrice is defined)
  if (showPreview) {
    const itemsForPreview = buildItemsWithTotals();
    return (
      <PreviewDocument
        items={itemsForPreview}
        delivery={delivery}
        warranty={warranty}
        validity={validity}
        quotationNotes={quotationNotes}
        requestId={requestId}
        projectName={projectName}
        vat={vat}
        markup={markup}
        cadSketchFile={cadSketchFile}
        revisionLabel={revisionLabel}
        baseQuotationId={baseId ?? requestId}
        quotationNumber={quotationNumber}
        customer={customer}
        onBack={() => setShowPreview(false)}
        onSend={handleSend}
        isSent={isSent}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-[#ffb7b7]">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Customer Info */}
    <div>
      <h3 className="font-bold text-lg text-[#880c0c] border-b pb-2 mb-3">Customer Information</h3>
      {customer ? (
        <div className="space-y-2">
          <p><span className="font-medium text-[#880c0c]">Company:</span> {customer.companyName}</p>
          <p><span className="font-medium text-[#880c0c]">Contact Person:</span> {customer.contactPerson}</p>
          <p><span className="font-medium text-[#880c0c]">Email:</span> {customer.email}</p>
          <p><span className="font-medium text-[#880c0c]">Phone:</span> {customer.phone}</p>
          <p><span className="font-medium text-[#880c0c]">Address:</span> {customer.address}</p>
        </div>
      ) : (
        <p className="text-gray-500">Loading customer info...</p>
      )}
    </div>

    {/* Quotation & Request Info */}
    <div>
      <h3 className="font-bold text-lg text-[#880c0c] border-b pb-2 mb-3">Quotation Details</h3>
      <div className="space-y-2">
        <p><span className="font-medium text-[#880c0c]">Quotation Number:</span> {quotationNumber || "Pending"}</p>
        <p><span className="font-medium text-[#880c0c]">Revision:</span> {revisionLabel}</p>
        <p><span className="font-medium text-[#880c0c]">Base Quotation ID:</span> {baseId ?? requestId}</p>
        <p><span className="font-medium text-[#880c0c]">Request ID:</span> {requestId}</p>
        <p><span className="font-medium text-[#880c0c]">Project Name:</span> {projectName || "Not provided"}</p>
        <p><span className="font-medium text-[#880c0c]">Mode:</span> {mode || "Not provided"}</p>
      </div>
    </div>
  </div>
</div>

      {/* CAD Upload */}
      {renderCadUpload()}

      {/* Add Item */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          + Add Item
        </button>
      </div>

      {/* Items */}
      {items.map((item, index) => {
        const itemTotal = toNumber(item.quantity) * toNumber(item.unitPrice);
        return (
          <div key={index} className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
            {/* Item Name */}
            <div>
              <label className="block text-[#880c0c] font-bold text-md mb-1">Item Name</label>
              <input
                type="text"
                value={item.itemName}
                onChange={(e) => updateItem(index, "itemName", e.target.value)}
                disabled={isSent}
                className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100 
                  ${item.error?.itemName ? "border-red-500" : item.itemName ? "border-green-500" : ""}`}
              />
              {item.error?.itemName && <p className="text-red-600 text-sm mt-1">{item.error.itemName}</p>}
            </div>

            {/* Scope of Work */}
            <div>
              <label className="block text-[#880c0c] font-bold text-md mb-1">Scope of Work</label>
              <textarea
                value={item.scopeOfWork}
                onChange={(e) => updateItem(index, "scopeOfWork", e.target.value)}
                disabled={isSent}
                className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100 
                  ${item.error?.scopeOfWork ? "border-red-500" : item.scopeOfWork ? "border-green-500" : ""}`}
                rows={3}
              />
              {item.error?.scopeOfWork && <p className="text-red-600 text-sm mt-1">{item.error.scopeOfWork}</p>}
            </div>

            {/* Materials */}
            <div>
              <label className="font-bold text-[#880c0c] text-md">Materials</label>
              {item.materials.map((mat, mi) => (
                <div key={mat.id} className="grid grid-cols-3 gap-3 items-center mt-2">

                   {/* Material Name */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-[#880c0c] mb-1">Material Name</label>
                    <input
                      type="text"
                      value={mat.name}
                      onChange={(e) => updateMaterial(index, mi, "name", e.target.value)}
                      disabled={isSent}
                      className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100
                        ${mat.error?.name ? "border-red-500" : mat.name ? "border-green-500" : "border-gray-300"}`}
                    />
                    {mat.error?.name && (
                      <p className="text-red-600 text-xs mt-1">{mat.error.name}</p>
                    )}
                  </div>

                  {/* Specification */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-[#880c0c] mb-1">Specification</label>
                    <input
                      type="text"
                      value={mat.specification}
                      onChange={(e) => updateMaterial(index, mi, "specification", e.target.value)}
                      disabled={isSent}
                      className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100 
                        ${mat.error?.specification ? "border-red-500" : mat.specification ? "border-green-500" : "border-gray-300"}`}
                    />
                    {mat.error?.specification && (
                      <p className="text-red-600 text-xs mt-1">{mat.error.specification}</p>
                    )}
                  </div>

                  <NumericInput 
                  label="Quantity"
                  value={mat.quantity}
                  setValue={(val) => updateMaterial(index, mi, "quantity", val)}
                  max={9999}
                  required
                  disabled={isSent}
                  />

                  <button
                    type="button"
                    onClick={() => removeMaterial(index, mi)}
                    className="text-red-600 hover:text-red-800 col-span-3 text-right"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addMaterial(index)} className="mt-2 text-blue-600 hover:text-blue-800">
                + Add Material
              </button>
            </div>

            {/* Item Quantity & Unit Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <NumericInput 
                  label="Item Quantity"
                  value={item.quantity}
                  setValue={(val) => updateItem(index, "quantity", val)}
                  max={9999}
                  required
                  disabled={isSent}
                  />
              </div>
              <div>
                <NumericInput 
                  label="Item - Unit Price"
                  value={item.unitPrice}
                  setValue={(val) => updateItem(index, "unitPrice", val)}
                  max={9999}
                  required
                  allowDecimal
                  disabled={isSent}
                  />
              </div>
            </div>

            {/* Item Total */}
            <p className="mt-5 font-bold text-lg text-[#880c0c]">Item - Total: ₱{itemTotal.toFixed(2)}</p>

            {/* Remove Item */}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="absolute top-4 right-4 text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 size={16} /> Remove
            </button>
          </div>
        );
      })}

      {/* Global Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
          <label className="block text-[#880c0c] text-sm font-medium mb-1">Validity</label>
          <input
            type="date"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            disabled={isSent}
            className={`w-full border rounded-lg px-3 py-2 hover:bg-gray-100
              ${fieldErrors.validity ? "border-red-500" : validity ? "border-green-500" : ""}`}
          />
          {fieldErrors.validity && <p className="text-red-600 text-sm">{fieldErrors.validity}</p>}
        </div>

        <div className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
          <label className="block text-[#880c0c] text-sm font-medium mb-1">Delivery</label>
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            disabled={isSent}
            className={`w-full border rounded-lg px-3 py-2 hover:bg-gray-100
              ${fieldErrors.delivery ? "border-red-500" : delivery ? "border-green-500" : ""}`}
          >
            <div className="bg-white rounded-lg p-2">
            <option value="">Select Delivery</option>
            <option value="3-4 Days">3–4 Days</option>
            <option value="5-7 Days">5–7 Days</option>
            <option value="7-10 Days">7–10 Days</option>
            <option value="2-3 Weeks">2–3 Weeks</option>
            <option value="30-45 Days">30–45 Days</option>
            </div>
          </select>
          {fieldErrors.delivery && <p className="text-red-600 text-sm">{fieldErrors.delivery}</p>}
        </div>

        <div className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
          <label className="block text-[#880c0c] text-sm font-medium mb-1">Warranty (Months)</label>
          <select
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            disabled={isSent}
            className={`w-full border rounded-lg px-3 py-2 hover:bg-gray-100
              ${fieldErrors.warranty ? "border-red-500" : warranty ? "bg-green-500" : ""}`}
          >
            <option value="">Select Warranty</option>
            <option value="1">1 Month</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
            <option value="24">24 Months</option>
            <option value="36">36 Months</option>
          </select>
          {fieldErrors.warranty && <p className="text-red-600 text-sm">{fieldErrors.warranty}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
        <label className="block text-gray-700 font-medium mb-1">Quotation Notes</label>
        <textarea
          value={quotationNotes}
          onChange={(e) => setQuotationNotes(e.target.value)}
          disabled={isSent}
          rows={3}
          className={`w-full border rounded px-3 py-2 ${fieldErrors.quotationNotes ? "border-red-500" : ""}`}
        />
        {fieldErrors.quotationNotes && <p className="text-red-600 text-sm">{fieldErrors.quotationNotes}</p>}
      </div>

      {/* VAT & Markup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
        <div>
          <NumericInput 
            label="VAT (%)"
            value={vat}
            setValue={(val) => setVat(Number(val) || 12)}
            max={100}
            allowDecimal
            disabled={isSent}
          />
        </div>

        <div>
        <NumericInput 
          label="Markup (%)"
          value={markup}
          setValue={(val) => setMarkup(Number(val) || 0)}
          max={100}
          allowDecimal
          disabled={isSent}
        />
        </div>
      </div>

      {/* Summary */}
      {(() => {
        const { subtotal, markupAmount, vatAmount, grandTotal } = calculateSummary();
        return (
          <div className="border border-[#ffb7b7] p-6 bg-white rounded-lg shadow-sm space-y-2 text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Markup ({markup}%):</span>
              <span>₱{markupAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT ({vat}%):</span>
              <span>₱{vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Grand Total:</span>
              <span>₱{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        );
      })()}

     {/* Actions */}
<div className="flex justify-end gap-4">
  <button
    type="button"
    onClick={() => {
      if (validateAllFields()) {
        setShowPreview(true);
      } else {
        toast.error("Complete the form before proceeding.");
      }
    }}
    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
  >
    Done
  </button>

  <button
    type="button"
    onClick={() => handleSave("draft")}
    disabled={isLoading}
    className={`px-6 py-2 rounded-lg transition ${
      isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
  >
    {isLoading ? "Saving..." : "Save as Draft"}
  </button>
</div>
{/* {!isSent ? (
  <>
  <button onClick={() => handleSave("draft")}>Save as Draft</button>
  <button onClick={() => setShowPreview(true)}>Done</button>
  </>
) : (
  <p className="text-green600 font-semibold">Quotation has been sent.</p>
)} */}
    </div>
  );
};  