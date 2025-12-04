// app/sales/s_pending_customer_request/pending_view/[id]/quotationform.tsx

"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { UploadCloud, Trash2 } from "lucide-react";
import { PreviewDocument } from "./components/quotationcomponents/PreviewDocument";
import { toast } from "sonner";
import { NumericInput } from "./components/NumericInput";
import { MaterialAutocompleteInput } from "@/components/MaterialAutocompleteInput"; // ✅ NEW IMPORT
import { useMaterialAutocomplete } from "@/hooks/useMaterialAutoComplete";
 // ✅ NEW IMPORT

interface QuotationFile {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt?: string;
  base64?: string;
}

type QuotationFormProps = {
  requestId: number;
  projectName?: string;
  customerId?: string;
  mode?: string;

  initialNotes?: string;
  initialItems?: QuotationItem[];
  initialVat?: number;
  initialMarkup?: number;
  initialPayment?: string;
  initialDelivery?: string;
  initialWarranty?: string;
  initialValidity?: string;
  initialAttachedFiles?: QuotationFile[];
  //initialCadSketch?: PreviewFile[];
  baseQuotationId?: number; // pass this if creating a revision
  initialRevisionNumber?: number; // initial revision (0 = original)
  initialId?: string | null;
  initialDeliveryType?: string;
  initialDeliveryDeadline?: Date | null;
  onSaved?: (data: SavedQuotation) => void;
  onSavedDraft?: (data: SavedQuotation) => void;
  onSendQuotation: () => void;
  setActiveDraftId?: Dispatch<SetStateAction<string | null>>;
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
  revisionLabel: string;
  revisionNumber?: number;
  baseQuotationId: number;
  status?: string;
  items: (QuotationItem & { totalPrice: number })[];
  payment: string;
  validity: string;
  delivery: string;
  warranty: string;
  quotation_notes?: string;
  //cadSketch?: [];
  attachedFiles?: QuotationFile[];
  vat?: number;
  markup?: number;
  customer?: Customer;
  deliveryType?: string;
  deliveryDeadline?: string | null;
};

type Customer = {
  id: string;
  companyName: string;
  contactPerson: string;
  tinNumber: string;
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
async function uploadFileToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/sales/uploads", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  if (!data.success || !data.file?.filePath) {
    throw new Error("No URL returned from Cloudinary");
  }

  return {
    success: true,
    file: {
      name: file.name,
      filePath: data.file.filePath, // Cloudinary URL
      publicId: data.file.publicId,
    },
  };
}

console.log("📥 Upload route hit");
// async function uploadCadSketch(file: File) {
//   return uploadFileToCloudinary(file);
// }

async function uploadAttachedFiles(file: File) {
  return uploadFileToCloudinary(file);
}

export default function QuotationForm({
  requestId,
  projectName,
  mode,
  initialNotes,
  initialItems,
  initialVat,
  initialMarkup,
  initialPayment,
  initialDelivery,
  initialWarranty,
  initialValidity,
  //initialCadSketch,
  initialAttachedFiles,
  baseQuotationId,
  initialId,
  initialDeliveryType,
  initialDeliveryDeadline,
  onSaved,
  onSavedDraft,
}: //customerId, //
QuotationFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [project, setProject] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modeName, setMode] = useState<string>("");
  const [quotationNumber, setQuotationNumber] = useState<string>("");
  const [baseId] = useState<number | null>(baseQuotationId ?? null);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [savedQuotation, setSavedQuotation] = useState<SavedQuotation | null>(
    null
  );

  const [items, setItems] = useState<QuotationItem[]>(
    initialItems && initialItems.length > 0
      ? initialItems
      : [
          {
            itemName: "",
            scopeOfWork: "",
            materials: [
              {
                id: uid(),
                name: "",
                specification: "",
                quantity: 0,
                error: {},
              },
            ],
            quantity: 0,
            unitPrice: 0,
            totalPrice: 0,
            error: {},
          },
        ]
  );

  const [payment, setPayment] = useState(initialPayment || "");
  const [validity, setValidity] = useState(initialValidity || "");
  const [delivery, setDelivery] = useState(initialDelivery || "");
  const [warranty, setWarranty] = useState(initialWarranty || "");
  const [quotationNotes, setQuotationNotes] = useState(initialNotes || "");
  const [vat, setVat] = useState<number>(initialVat ?? 12);
  const [markup, setMarkup] = useState<number>(initialMarkup ?? 5);
  //const [cadSketchFile, setCadSketchFile] = useState<PreviewFile[]>(initialCadSketch ||[]);
  const [attachedFiles, setAttachedFiles] = useState<QuotationFile[]>(
    initialAttachedFiles || []
  );
  const [showPreview, setShowPreview] = useState(false);

  const [deliveryType, setDeliveryType] = useState<string>(
    initialDeliveryType || ""
  );
  const [deliveryDeadline, setDeliveryDeadline] = useState<Date | null>(
    initialDeliveryDeadline || null
  );

  const [revisionLabel, setRevisionLabel] = useState<string>("-");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    payment?: string;
    delivery?: string;
    warranty?: string;
    validity?: string;
    quotationNotes?: string;
    cadSketch?: string;
    items?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW: Material autocomplete hook
  const { materials } = useMaterialAutocomplete();

  useEffect(() => {
    if (initialItems && initialItems.length > 0) setItems(initialItems);
    if (initialPayment) setPayment(initialPayment);
    if (initialValidity) setValidity(initialValidity);
    if (initialDelivery) setDelivery(initialDelivery);
    if (initialWarranty) setWarranty(initialWarranty);
    if (initialAttachedFiles) setAttachedFiles(initialAttachedFiles);
    //if (initialCadSketch) setCadSketchFile(initialCadSketch);
    if (initialNotes) setQuotationNotes(initialNotes);
    if (initialVat !== undefined) setVat(initialVat);
    if (initialMarkup !== undefined) setMarkup(initialMarkup);
    if (initialDeliveryType) setDeliveryType(initialDeliveryType);
    if (initialDeliveryDeadline) setDeliveryDeadline(initialDeliveryDeadline);
  }, [
    initialItems,
    initialPayment,
    initialValidity,
    initialDelivery,
    initialWarranty,
    initialAttachedFiles,
    initialNotes,
    initialVat,
    initialMarkup,
    initialDeliveryType,
    initialDeliveryDeadline,
  ]);

  // useEffect(() => {
  //   if (initialCadSketch && initialCadSketch.length > 0) {
  //     console.log("Restoring CAD file from draft:", initialCadSketch);
  //     setCadSketchFile(initialCadSketch);
  //   }
  // }, [initialCadSketch]);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch(`/api/sales/customer_request/${requestId}`);
        if (!res.ok) throw new Error("Failed to fetch request");
        const data = await res.json();

        if (data.customer) {
          const c = data.customer;
          setCustomer({
            id: c.id,
            companyName: c.companyName || c.company_name || "",
            contactPerson: c.contactPerson || c.contact_person || "",
            tinNumber: c.tinNumber || c.tin_number || "",
            email: c.email || "",
            phone: c.phone || "",
            address: c.address || "",
          });
        }
        if (data.project_name) setProject(data.project_name);
        if (data.mode) setMode(data.mode);
      } catch (err) {
        console.error(err);
      }
    }
    fetchRequest();
  }, [requestId]);

  useEffect(() => {
    async function checkIfSent() {
      try {
        const res = await fetch(`/api/sales/quotations?requestId=${requestId}`);
        if (!res.ok) throw new Error("Failed to check quotation status");

        const result = await res.json();
        const data: SavedQuotation[] = result.quotations ?? [];

        // if any quotation has status "sent"
        const alreadySent = data.some((q) => q.status === "sent");
        setIsSent(alreadySent);
      } catch (err) {
        console.error("Error checking sent quotations:", err);
      }
    }
    checkIfSent();
  }, [requestId]);

  // === Validation helpers ===
  const validateAllFields = () => {
    let isValid = true;
    const newFieldErrors: typeof fieldErrors = {};
    const newItems = [...items];

    // global fields
    newFieldErrors.payment = !payment ? "Required" : undefined;
    newFieldErrors.delivery = !delivery ? "Required" : undefined;
    newFieldErrors.warranty = !warranty ? "Required" : undefined;
    newFieldErrors.validity = !validity ? "Required" : undefined;

    if (!payment || !delivery || !warranty || !validity) isValid = false;

    newItems.forEach((item) => {
      const itemError: NonNullable<QuotationItem["error"]> = {};

      itemError.itemName = !item.itemName ? "Required" : undefined;
      itemError.scopeOfWork = !item.scopeOfWork ? "Required" : undefined;
      itemError.quantity =
        toNumber(item.quantity) <= 0 ? "Required" : undefined;
      itemError.unitPrice =
        toNumber(item.unitPrice) <= 0 ? "Required" : undefined;

      item.materials.forEach((mat) => {
        const materialError: NonNullable<MaterialRow["error"]> = {};

        materialError.name = !mat.name?.trim() ? "Required" : undefined;

        // ✅ NEW: Only require specification if the selected material has specifications
        const selectedMaterial = materials.find(
          (m) => m.materialName === mat.name
        );
        const hasSpecifications = selectedMaterial?.specifications;

        if (hasSpecifications) {
          materialError.specification = !mat.specification?.trim()
            ? "Required"
            : undefined;
        } else {
          materialError.specification = undefined; // No error if material has no specs
        }

        materialError.quantity =
          toNumber(mat.quantity) <= 0 ? "Required" : undefined;
        mat.error = materialError;
      });

      if (
        Object.values(itemError).some(Boolean) ||
        item.materials.some((m) => Object.values(m.error || {}).some(Boolean))
      ) {
        isValid = false;
      }

      item.error = itemError;
    });

    setFieldErrors(newFieldErrors);
    setItems(newItems);

    return isValid;
  };

  // === Item & Material Handlers ===
  const updateItem = (
    index: number,
    field: keyof QuotationItem,
    value: string | number
  ) => {
    const newItems = [...items];
    const updatedValue =
      field === "quantity" || field === "unitPrice" ? toNumber(value) : value;

    // ✅ Update value
    // @ts-expect-error dynamic field assignment
    newItems[index][field] = updatedValue;

    // ✅ Update error based on new value
    const currentError = newItems[index].error || {};
    let newError: string | undefined;

    if (field === "quantity" || field === "unitPrice") {
      const numericValue = toNumber(updatedValue);
      newError = numericValue > 0 ? undefined : "Required";
    } else {
      const stringValue = String(updatedValue);
      newError = stringValue.trim() ? undefined : "Required";
    }

    newItems[index].error = {
      ...currentError,
      [field]: newError,
    };

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        scopeOfWork: "",
        materials: [
          { id: uid(), name: "", specification: "", quantity: 0, error: {} },
        ],
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
    if (!newItems[itemIndex].materials) newItems[itemIndex].materials = [];

    newItems[itemIndex].materials.push({
      id: uid(),
      name: "",
      specification: "",
      quantity: 0,
      error: {},
    });

    setItems(newItems);
  };

  // ✅ UPDATED: Material update handler with specification reset
  const updateMaterial = (
    itemIndex: number,
    materialIndex: number,
    field: keyof MaterialRow,
    value: string | number
  ) => {
    const newItems = [...items];

    let updatedValue: string | number = value;
    let newError: string | undefined;

    if (field === "quantity") {
      const numericValue = toNumber(value);
      updatedValue = numericValue;
      newError = numericValue > 0 ? undefined : "Required";
    } else {
      const stringValue = String(value);
      updatedValue = stringValue;
      newError = stringValue.trim() ? undefined : "Required";
    }

    // @ts-expect-error: dynamic field assignment
    newItems[itemIndex].materials[materialIndex][field] = updatedValue;

    // ✅ NEW: If material name changes, clear specification
    if (field === "name") {
      newItems[itemIndex].materials[materialIndex].specification = "";
      newItems[itemIndex].materials[materialIndex].error = {
        ...newItems[itemIndex].materials[materialIndex].error,
        specification: "Required",
      };
    }

    newItems[itemIndex].materials[materialIndex].error = {
      ...(newItems[itemIndex].materials[materialIndex].error || {}),
      [field]: newError,
    };

    setItems(newItems);
  };

  // ✅ UPDATED: Auto-fill specification when material name is selected
  const handleMaterialNameSelect = (
    itemIndex: number,
    materialIndex: number,
    material: { materialName: string; specifications: string | null }
  ) => {
    const newItems = [...items];
    newItems[itemIndex].materials[materialIndex].name = material.materialName;

    // ✅ Auto-fill specification if available, otherwise clear it
    if (material.specifications) {
      newItems[itemIndex].materials[materialIndex].specification =
        material.specifications;
      newItems[itemIndex].materials[materialIndex].error = {
        ...newItems[itemIndex].materials[materialIndex].error,
        specification: undefined, // Clear error
      };
    } else {
      // Material has no specification - clear field and mark as not required
      newItems[itemIndex].materials[materialIndex].specification = "";
      newItems[itemIndex].materials[materialIndex].error = {
        ...newItems[itemIndex].materials[materialIndex].error,
        specification: undefined, // No error if material has no specs
      };
    }

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

  // const renderCadUpload = () => (
  //   <div className="border border-[#ffb7b7] p-4 rounded-lg shadow-sm bg-white w-full">
  //     <h3 className="block font-bold text-lg text-[#880c0c] border-b pb-2 border-[#ffb7b7] mb-2">Upload CAD Sketch</h3>
  //     <div className="flex items-center gap-4">
  //       <input
  //         type="file"
  //         accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.dwg"
  //         onChange={async (e) => {
  //           if (e.target.files && e.target.files[0]) {
  //             const file = e.target.files[0];
  //             const MAX_FILE_SIZE = 10* 1024 * 1024;

  //             if (file.size > MAX_FILE_SIZE) {
  //               toast.error(`File "${file.name}" is too large. Max is 10MB.`);
  //               return;
  //             }
  //             try {
  //             const uploadResult = await uploadCadSketch(file);
  //             if (uploadResult.success) {
  //               setCadSketchFile([
  //                 {
  //                   id: Date.now(),
  //                   name: uploadResult.file.name,
  //                   filePath: uploadResult.file.filePath,
  //                 },
  //               ]);
  //               toast.success("File uploaded successfully!");
  //             }
  //           } catch (err) {
  //             console.error("CAD upload failed:", err);
  //             toast.error("Upload failed: " + (err instanceof Error ? err.message : ""));
  //           }

  //           }
  //         }}
  //         disabled={isSent}
  //         className="hidden"
  //         id="cad-upload"
  //       />
  //       <label
  //         htmlFor="cad-upload"
  //         className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition flex item-center gap-2"
  //       >
  //         <UploadCloud size={18} />Upload File
  //       </label>
  //       {cadSketchFile.length > 0 && (
  //         <ul className="text-sm text-gray-700">
  //           {cadSketchFile.map((f, i) => (
  //             <li key={i} className="flex items-center gap-2">
  //               <a
  //                 href={f.filePath}
  //                 target="_blank"
  //                 rel="noopener noreferrer"
  //                 className="text-blue-600 hover:underline"
  //               >
  //                 {f.name}
  //               </a>
  //               {!isSent && (
  //                 <button
  //                 type="button"
  //                 onClick={() => setCadSketchFile(cadSketchFile.filter((_, idx) => idx !== i))}
  //                 className="text-red-600 hover:text-red-800"
  //               >
  //                 ✕
  //               </button>
  //               )}
  //             </li>
  //           ))}
  //         </ul>
  //       )}
  //     </div>
  //     <p className="text-xs text-gray-500 mt-2">
  //       Allowed types: PDF, JPG, PNG, DOC, XLS, DWG — Max size: 10MB - 1 File Only
  //     </p>
  //   </div>
  // );

  //type QuotationFilePreview = QuotationFile | File;

  const renderAttachmentsUpload = () => (
    <div className="border border-[#ffb7b7] p-4 rounded-lg shadow-sm bg-white w-full">
      <h3 className="block font-bold text-lg text-[#880c0c] border-b pb-2 border-[#ffb7b7] mb-2">
        Upload Attachment/s
      </h3>

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

            if (!allowedTypes.includes(file.type)) {
              toast.error(
                `File "${file.name}" is not a supported image type (JPG/JPEG/PNG).`
              );
              return;
            }

            if (file.size > MAX_FILE_SIZE) {
              toast.error(`File "${file.name}" is too large. Max is 10MB.`);
              return;
            }

            try {
              const uploadResult = await uploadAttachedFiles(file);
              if (uploadResult.success) {
                // push the record returned by upload (filePath already Cloudinary/public URL)
                setAttachedFiles((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    fileName: uploadResult.file.name,
                    filePath: uploadResult.file.filePath,
                    uploadedAt: new Date().toISOString(),
                  },
                ]);
                toast.success("File uploaded successfully!");
              }
            } catch (err) {
              console.error("Other file upload failed:", err);
              toast.error(
                "Upload failed: " + (err instanceof Error ? err.message : "")
              );
            } finally {
              // clear input value so same file can be reselected if needed
              if (e.target) (e.target as HTMLInputElement).value = "";
            }
          }}
          disabled={isSent}
          className="hidden"
          id="attachment-upload"
        />

        <label
          htmlFor="attachment-upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition flex items-center gap-2"
        >
          <UploadCloud size={18} /> Upload File
        </label>

        {attachedFiles.length > 0 && (
          <ul className="text-sm text-gray-700">
            {attachedFiles.map((f) => (
              <li key={f.id} className="flex items-center gap-2">
                <a
                  href={f.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {f.fileName}
                </a>
                {!isSent && (
                  <button
                    type="button"
                    onClick={() =>
                      setAttachedFiles((prev) =>
                        prev.filter((file) => file.id !== f.id)
                      )
                    }
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Allowed types: JPG, PNG, JPEG — Max size: 10MB
      </p>
    </div>
  );

  //const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleSave = async (status: "draft" | "sent" | "restoring") => {
    if (status === "sent" && !validateAllFields()) {
      toast.error("Please fill in all required fields before saving.");
      return;
    }

    setIsLoading(true);

    try {
      // --- Build items ---
      const itemsForSave = items.map((it) => ({
        itemName: it.itemName,
        scopeOfWork: it.scopeOfWork,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        materials: (it.materials || []).map((m) => ({
          name: m.name,
          specification: m.specification,
          quantity: Number(m.quantity),
        })),
      }));

      // --- Build attached files for backend ---
      const attachedFilesPayload = attachedFiles
        .filter((f) => f.filePath)
        .map((f) => ({
          fileName: f.fileName,
          filePath: f.filePath,
          base64: f.base64, // include if uploading a new file
        }));

      const isRestoredDraft =
        initialId &&
        /^[0-9a-fA-F-]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          initialId
        );

      // --- Quotation Payload ---
      const quotationPayload = {
        id: isRestoredDraft ? initialId : undefined,
        requestId,
        baseQuotationId: baseId ?? undefined,
        projectName: projectName || "",
        mode: mode || "",
        payment,
        validity,
        delivery,
        warranty,
        quotationNotes,
        vat: Number(vat) || 12,
        markup: Number(markup) || 5,
        items: itemsForSave,
        attachedFiles: attachedFilesPayload,
        deliveryType,
        deliveryDeadline: deliveryDeadline?.toISOString() ?? null,
        status,
      };

      const method = isRestoredDraft ? "PUT" : "POST";
      const url = isRestoredDraft
        ? `/api/sales/quotations/${initialId}`
        : "/api/sales/quotations";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotationPayload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(
          `Failed to save quotation: ${result.error || "Unknown error"}`
        );
        setIsLoading(false);
        return;
      }

      const savedQuotation = result.data;

      // Update state with returned attached files to keep preview
      setAttachedFiles(savedQuotation.attachedFiles || []);

      toast.success(
        status === "draft"
          ? isRestoredDraft
            ? "Restored draft saved again."
            : "Draft saved successfully."
          : "Quotation saved successfully!"
      );

      onSavedDraft?.(savedQuotation);
      onSaved?.(savedQuotation);
    } catch (err) {
      console.error("Error saving quotation:", err);
      toast.error("Error saving quotation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    setHasSubmitted(true);
    if (!validateAllFields()) return;

    setIsLoading(true);

    try {
      // --- Build items ---
      const itemsForSend = items.map((it) => ({
        itemName: it.itemName,
        scopeOfWork: it.scopeOfWork,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        materials: (it.materials || []).map((m) => ({
          name: m.name,
          specification: m.specification,
          quantity: Number(m.quantity),
        })),
      }));

      // --- Build attached files for backend ---
      const attachedFilesPayload = attachedFiles
        .filter((f) => f.filePath)
        .map((f) => ({
          fileName: f.fileName,
          filePath: f.filePath,
          base64: f.base64,
        }));

      const isRestoredDraft =
        initialId &&
        /^[0-9a-fA-F-]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          initialId
        );

      // --- Final payload ---
      const quotationPayload = {
        id: isRestoredDraft ? initialId : undefined,
        requestId,
        baseQuotationId: baseId ?? undefined,
        projectName: projectName || "",
        payment,
        validity,
        delivery,
        warranty,
        quotationNotes,
        vat: Number(vat) || 12,
        markup: Number(markup) || 5,
        items: itemsForSend,
        attachedFiles: attachedFilesPayload,
        deliveryType,
        deliveryDeadline: deliveryDeadline?.toISOString() ?? null,
        status: "sent",
      };

      const method = isRestoredDraft ? "PUT" : "POST";
      const url = isRestoredDraft
        ? `/api/sales/quotations/${initialId}`
        : "/api/sales/quotations";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotationPayload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(
          `Failed to send quotation: ${result.error || "Unknown error"}`
        );
        return;
      }

      const sentQuotation = result.data;

      // Update state with returned attached files to keep preview
      setAttachedFiles(sentQuotation.attachedFiles || []);

      toast.success("Quotation sent successfully!");
      setIsSent(true);
      setQuotationNumber(sentQuotation.quotationNumber);
      setRevisionLabel(sentQuotation.revisionLabel);
      setSavedQuotation(sentQuotation);

      window.dispatchEvent(new CustomEvent("quotation-sent"));
      onSaved?.(sentQuotation);
    } catch (err) {
      console.error("Error sending quotation:", err);
      toast.error("Error sending quotation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If preview requested, pass itemsWithTotals to PreviewDocument (so totalPrice is defined)
  if (showPreview) {
    console.log("PreviewDocument props:", {
      customer,
      revisionLabel,
      quotationNumber,
    });
    const itemsForPreview = buildItemsWithTotals();
    return (
      <PreviewDocument
        items={itemsForPreview}
        payment={payment || ""}
        delivery={delivery || ""}
        warranty={warranty || ""}
        validity={validity || ""}
        quotationNotes={quotationNotes || ""}
        requestId={requestId}
        projectName={projectName || ""}
        vat={vat || 0}
        markup={markup || 0}
        attachedFiles={attachedFiles || []}
        //cadSketchFile={cadSketchFile || []}
        //otherFiles={otherFiles || []}
        revisionLabel={
          revisionLabel ||
          (savedQuotation?.revisionLabel
            ? savedQuotation.revisionLabel
            : savedQuotation?.revisionNumber !== undefined
            ? `REV-${String(savedQuotation.revisionNumber).padStart(2, "0")}`
            : "REV-00")
        }
        baseQuotationId={baseId ?? requestId}
        quotationNumber={quotationNumber}
        //customer={customer}
        customer={customer || savedQuotation?.customer || null}
        onBack={() => setShowPreview(false)}
        onSend={handleSend}
        isSent={isSent}
        quotation={{ createdAt: new Date().toISOString() }}
      />
    );
  }

  return (
    <div className="space-y-2 mt-6">
      {/* <div>Cancel</div> */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-[#ffb7b7]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-bold text-lg text-[#880c0c] border-b pb-2 border-[#ffb7b7] mb-3">
              Customer Information
            </h3>
            {customer ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-[#880c0c]">Company:</span>{" "}
                  {customer.companyName}
                </p>
                {/* <p><span className="font-medium text-[#880c0c]">Email:</span> {customer.email}</p> */}
                <p>
                  <span className="font-medium text-[#880c0c]">Address:</span>{" "}
                  {customer.address}
                </p>
                <p>
                  <span className="font-medium text-[#880c0c]">Phone:</span>{" "}
                  {customer.phone}
                </p>
                <p>
                  <span className="font-medium text-[#880c0c]">TIN:</span>{" "}
                  {customer.tinNumber || "-"}
                </p>
                <p>
                  <span className="font-medium text-[#880c0c]">
                    Contact Person:
                  </span>{" "}
                  {customer.contactPerson}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Loading customer info...</p>
            )}
          </div>

          {/* Quotation & Request Info */}
          <div>
            <h3 className="font-bold text-lg text-[#880c0c] border-b border-[#ffb7b7] pb-2 mb-3">
              Quotation Details
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium text-[#880c0c]">
                  Quotation Number:
                </span>{" "}
                {quotationNumber || "Pending"}
              </p>
              <p>
                <span className="font-medium text-[#880c0c]">Revision:</span>{" "}
                {revisionLabel}
              </p>
              <p>
                <span className="font-medium text-[#880c0c]">
                  Base Quotation ID:
                </span>{" "}
                {baseId ?? requestId}
              </p>
              <p>
                <span className="font-medium text-[#880c0c]">Request ID:</span>{" "}
                {requestId}
              </p>
              <p>
                <span className="font-medium text-[#880c0c]">
                  Project Name:
                </span>{" "}
                <span className="uppercase">
                  {projectName || "Not provided"}
                </span>
              </p>
              <p>
                <label className="font-medium text-[#880c0c]">Mode: </label>
                <input
                  type="text"
                  value={mode}
                  readOnly
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="flex flex-row gap-2">
        {/* CAD Upload */}
        {/* {renderCadUpload()} */}
        {renderAttachmentsUpload()}
      </section>

      {/* Add Item */}
      <div className="flex justify-end">
        <button
          type="button"
          title="Click to add another item"
          onClick={addItem}
          className="px-4 py-2 bg-white text-[#880c0c] rounded-lg hover:bg-[#cf3a3a] hover:text-white transition cursor-pointer"
        >
          + Add Item
        </button>
      </div>

      {/* Items */}
      {(items || []).map((item, index) => {
        const itemTotal = toNumber(item.quantity) * toNumber(item.unitPrice);
        return (
          <div
            key={index}
            className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative"
          >
            {/* Item Name */}
            <div>
              <label className="block text-[#880c0c] font-bold text-md mb-1">
                Item Name <span className="text-red-400"> *</span>
              </label>

              <input
                type="text"
                value={item.itemName}
                onChange={(e) => updateItem(index, "itemName", e.target.value)}
                disabled={isSent}
                className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100 uppercase
                  ${
                    item.error?.itemName
                      ? "border-red-500"
                      : item.itemName
                      ? "border-green-500"
                      : "border-[#d2bda7]"
                  }`}
              />
              {item.error?.itemName && (
                <p className="text-red-600 text-xs mt-1 italic">
                  {item.error.itemName}
                </p>
              )}
            </div>

            {/* Scope of Work */}
            <div>
              <label className="block text-[#880c0c] font-bold text-md mb-1">
                Scope of Work <span className="text-red-400"> *</span>
              </label>

              <textarea
                value={item.scopeOfWork}
                onChange={(e) =>
                  updateItem(index, "scopeOfWork", e.target.value)
                }
                disabled={isSent}
                className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100
                  ${
                    item.error?.scopeOfWork
                      ? "border-red-500"
                      : item.scopeOfWork
                      ? "border-green-500"
                      : "border-[#d2bda7]"
                  }`}
                rows={3}
              />

              {item.error?.scopeOfWork && (
                <p className="text-red-600 text-xs mt-1 italic">
                  {item.error.scopeOfWork}
                </p>
              )}
            </div>

            {/* Materials */}
            <div className="border-t pt-2 w-full border-b pb-2 border-[#ffb7b7]">
              <label className="font-bold text-[#880c0c] text-md">
                Materials
              </label>

              {(item.materials || []).map((mat, mi) => (
                <div key={mat.id} className="mt-4 pb-2">
                  <div className="grid grid-cols-3 gap-3 items-start">
                    {/* ✅ Material Name Dropdown */}
                    <MaterialAutocompleteInput
                      label="Material Name"
                      value={mat.name}
                      onChange={(value) =>
                        updateMaterial(index, mi, "name", value)
                      }
                      onSelectMaterial={(material) =>
                        handleMaterialNameSelect(index, mi, material)
                      }
                      materials={materials}
                      disabled={isSent}
                      error={mat.error?.name}
                      placeholder="Select material..."
                    />

                    {/* ✅ Specification Dropdown (Dependent on Material Name) */}
                    <MaterialAutocompleteInput
                      label="Specification"
                      value={mat.specification}
                      onChange={(value) =>
                        updateMaterial(index, mi, "specification", value)
                      }
                      materials={materials}
                      disabled={isSent || !mat.name} // ✅ Disabled until material name is selected
                      error={mat.error?.specification}
                      placeholder={
                        !mat.name
                          ? "Select material first"
                          : "Select specification..."
                      }
                      showSpecifications={true}
                      selectedMaterialName={mat.name} // ✅ Pass selected material name
                    />

                    {/* Quantity */}
                    <div className="flex flex-col">
                      <NumericInput
                        label="Quantity"
                        value={mat.quantity === 0 ? "" : mat.quantity}
                        setValue={(val) =>
                          updateMaterial(index, mi, "quantity", val)
                        }
                        max={9999}
                        required
                        disabled={isSent}
                        showError={hasSubmitted}
                      />
                    </div>
                  </div>

                  {/* Remove button */}
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      title="Click to remove material"
                      onClick={() => removeMaterial(index, mi)}
                      className="text-red-600 hover:text-red-800 cursor-pointer font-sans"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                title="Click to add another material"
                onClick={() => addMaterial(index)}
                className="mt-2 text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                + Add Material
              </button>
            </div>

            {/* Item Quantity & Unit Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <NumericInput
                  label="Item Quantity"
                  value={item.quantity === 0 ? "" : item.quantity}
                  setValue={(val) => updateItem(index, "quantity", val)}
                  max={9999}
                  required
                  disabled={isSent}
                  showError={hasSubmitted}
                />
              </div>
              <div>
                <NumericInput
                  label="Item - Unit Price"
                  value={item.unitPrice === 0 ? "" : item.unitPrice}
                  setValue={(val) => updateItem(index, "unitPrice", val)}
                  max={999999999}
                  required
                  allowDecimal
                  disabled={isSent}
                  showError={hasSubmitted}
                />
              </div>
            </div>

            {/* Item Total */}
            <p className="mt-5 font-bold text-lg text-[#880c0c]">
              Item - Total: ₱{itemTotal.toFixed(2)}
            </p>

            {/* Remove Item */}
            <button
              type="button"
              title="Click to remove Item"
              onClick={() => removeItem(index)}
              className="absolute top-4 right-4 text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer font-sans"
            >
              <Trash2 size={16} /> Remove
            </button>
          </div>
        );
      })}

      {/* Global Fields - Payment, Delivery, Validity, Warranty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1">
        {(
          [
            {
              label: "Payment",
              value: payment,
              setValue: setPayment,
              key: "payment",
            },
            {
              label: "Delivery",
              value: delivery,
              setValue: setDelivery,
              key: "delivery",
            },
            {
              label: "Validity",
              value: validity,
              setValue: setValidity,
              key: "validity",
            },
            {
              label: "Warranty",
              value: warranty,
              setValue: setWarranty,
              key: "warranty",
            },
          ] as const
        ).map((field) => {
          const { label, value, setValue, key } = field;
          const error = fieldErrors[key];

          return (
            <div
              key={label}
              className="border border-[#ffb7b7] rounded-xl p-2 bg-white shadow-sm space-y-2 flex flex-col justify-between"
            >
              <label className="block text-[#880c0c] text-sm font-medium">
                {label}
              </label>

              <div className="flex items-stretch gap-1">
                <input
                  type="text"
                  placeholder="e.g. 3-4"
                  value={value}
                  onChange={(e) => {
                    const newValue = e.target.value; // ✅ allow spaces
                    setValue(newValue);

                    // ✅ dynamically clear or set error
                    setFieldErrors((prev) => ({
                      ...prev,
                      [key]: newValue.trim() ? undefined : "Required",
                    }));
                  }}
                  disabled={isSent}
                  className={`flex-[0.7] border rounded-lg px-2 py-2 hover:bg-gray-100 text-sm
                    ${
                      error
                        ? "border-red-500"
                        : value.trim()
                        ? "border-green-500"
                        : ""
                    }`}
                />
                <select
                  onChange={(e) => {
                    const baseValue = value.split(" ")[0] || "";
                    const newValue = `${baseValue} ${e.target.value}`;
                    setValue(newValue);

                    setFieldErrors((prev) => ({
                      ...prev,
                      [key]: newValue.trim() ? undefined : "Required",
                    }));
                  }}
                  disabled={isSent}
                  className="flex-[0.3] border rounded-lg px-2 py-2 hover:bg-gray-100 text-sm appearance-none"
                >
                  <option value="">Unit</option>
                  <option value="Days">Day/s</option>
                  <option value="Weeks">Week/s</option>
                  <option value="Months">Month/s</option>
                  <option value="Years">Year/s</option>
                </select>
              </div>

              {error && (
                <p className="text-red-600 text-xs mt-1 italic">{error}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
        <label className="block text-[#880c0c] text-sm font-medium">
          Quotation Notes
        </label>
        <textarea
          value={quotationNotes}
          onChange={(e) => setQuotationNotes(e.target.value)}
          disabled={isSent}
          rows={3}
          className={`w-full border rounded px-2 py-2 hover:bg-gray-100 text-sm ${
            fieldErrors.quotationNotes ? "border-red-500" : ""
          }`}
        />
        {fieldErrors.quotationNotes && (
          <p className="text-red-600 text-sm">{fieldErrors.quotationNotes}</p>
        )}
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
            showError={hasSubmitted}
          />
        </div>

        <div>
          <NumericInput
            label="Markup (%)"
            value={markup}
            setValue={(val) => setMarkup(Number(val) || 5)}
            max={100}
            allowDecimal
            disabled={isSent}
            showError={hasSubmitted}
          />
        </div>
      </div>

      {/* Summary */}
      {(() => {
        const { subtotal, markupAmount, vatAmount, grandTotal } =
          calculateSummary();
        return (
          <div className="border border-[#ffb7b7] p-6 bg-white rounded-lg shadow-sm space-y-2 text-[#880c0c] font-bold text-md text-right">
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
            <div className="flex justify-between font-bold text-lg border-t pt-2">
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
              toast.error("Please fill in all required fields before saving.");
            }
          }}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
          }`}
        >
          Done
        </button>

        <button
          type="button"
          onClick={() => handleSave("draft")}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-white text-gray-500 hover:bg-gray-100 cursor-pointer"
          }`}
        >
          {isLoading ? "Saving..." : "Save as Draft"}
        </button>
      </div>
    </div>
  );
}
