 
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
  initialPayment?: string;
  initialDelivery?: string;
  initialWarranty?: string;
  initialValidity?: string;
  initialCadSketch?: PreviewFile[];
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
  cadSketch?: [];
  vat?: number;
  markup?: number;
  customer?: Customer;
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

console.log("📥 Upload route hit");
async function uploadCadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/sales/uploads", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();

  if (!data.secure_url) throw new Error("No URL returned from Cloudinary");

  // Return an object compatible with PreviewFile
  return {
    success: true,
    file: {
      name: file.name,
      filePath: data.secure_url, // Cloudinary URL
    },
  };
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
  initialCadSketch,
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
  const [savedQuotation, setSavedQuotation] = useState<SavedQuotation | null>(null);

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

  const [payment, setPayment] = useState(initialPayment || "");
  const [validity, setValidity] = useState(initialValidity || "");
  const [delivery, setDelivery] = useState(initialDelivery || "");
  const [warranty, setWarranty] = useState(initialWarranty || "");
  const [quotationNotes, setQuotationNotes] = useState(initialNotes || "");
  const [vat, setVat] = useState<number>(initialVat ?? 12);
  const [markup, setMarkup] = useState<number>(initialMarkup ?? 5);
  const [cadSketchFile, setCadSketchFile] = useState<PreviewFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);

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

  useEffect(() => {
    if (initialItems && initialItems.length > 0) setItems(initialItems);
    if (initialPayment) setPayment(initialPayment);
    if (initialValidity) setValidity(initialValidity);
    if (initialDelivery) setDelivery(initialDelivery);
    if (initialWarranty) setWarranty(initialWarranty);
    if (initialCadSketch) setCadSketchFile(initialCadSketch);
    if (initialNotes) setQuotationNotes(initialNotes);
    if (initialVat !== undefined) setVat(initialVat);
    if (initialMarkup !== undefined) setMarkup(initialMarkup);
  }, [initialItems, initialPayment, initialValidity, initialDelivery, initialWarranty, initialCadSketch, initialNotes, initialVat, initialMarkup]);

  useEffect(() => {
    if (initialCadSketch && initialCadSketch.length > 0) {
      console.log("Restoring CAD file from draft:", initialCadSketch);
      setCadSketchFile(initialCadSketch);
    }
  }, [initialCadSketch]);

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
        if (data.project_name) setProject (data.project_name);
        if (data.mode) setMode (data.mode);
        
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

    if (!isValid) return;

    return isValid;
  };

  // === Item & Material Handlers ===
  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
  const newItems = [...items];
  const updatedValue =
    field === "quantity" || field === "unitPrice"
      ? toNumber(value)
      : value;

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

  const updateMaterial = (itemIndex: number, materialIndex: number, field: keyof MaterialRow, value: string | number) => {
    const newItems = [...items];

    // determine whether value is numeric or string
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

    // ensure error object exists before assigning
    newItems[itemIndex].materials[materialIndex].error = {
      ...(newItems[itemIndex].materials[materialIndex].error || {}),
      [field]: newError,
    };

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
      <h3 className="block font-bold text-lg text-[#880c0c] border-b pb-2 border-[#ffb7b7] mb-2">Upload CAD Sketch</h3>
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
              const uploadResult = await uploadCadFile(file);
              if (uploadResult.success) {
                setCadSketchFile([
                  {
                    id: Date.now(),
                    name: uploadResult.file.name,
                    filePath: uploadResult.file.filePath,
                  },
                ]);
                toast.success("File uploaded successfully!");
              }
            } catch (err) {
              console.error("CAD upload failed:", err);
              toast.error("Upload failed: " + (err instanceof Error ? err.message : ""));
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
                <a
                  href={f.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {f.name}
                </a>
                {!isSent && (
                  <button
                  type="button"
                  onClick={() => setCadSketchFile(cadSketchFile.filter((_, idx) => idx !== i))}
                  className="text-red-600 hover:text-red-800"
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
        Allowed types: PDF, JPG, PNG, DOC, XLS, DWG — Max size: 10MB
      </p>
      {fieldErrors.cadSketch && <p className="text-red-600 text-sm mt-2">{fieldErrors.cadSketch}</p>}
    </div>
  );

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleSave = async (status: "draft" | "sent" | "restoring") => {
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
          toast.error("Failed to uplaod file");
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
        materials: (it.materials || []).map((m) => ({
          name: m.name,
          specification: m.specification,
          quantity: toNumber(m.quantity),
        })),
      }));

      const attachedFiles = cadSketchFile.map((f) => 
      f instanceof File
        ? {
          fileName: f.name,
          filePath: f.filePath,
        }
      : {
          fileName: f.name,
          filePath: f.filePath,
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
        payment,
        validity,
        delivery,
        warranty,
        quotationNotes,
        cadSketch: uploadedFilePath,
        vat: Number(vat) || 12,
        markup: Number(markup) || 5,
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
        // normalize possible shapes from api
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
        
        if (status === "draft" && sessionStorage.getItem("activeRestoreDraftId")) {
          sessionStorage.removeItem("activeRestoringDraftId");
        }

        if (status === "draft") {
          onSavedDraft?.({
            ...savedQuotation,
            vat: savedQuotation?.vat ?? 12,
            markup: savedQuotation?.markup ?? 5,
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
  setHasSubmitted(true);

  if (!validateAllFields()) return;

  setIsLoading(true);

  try {
    let uploadedFilePath: string | null = null;

    // Upload file if needed
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
        toast.error("Failed to upload file: ");
        setIsLoading(false);
        return;
      }
    } else if (cadSketchFile.length > 0) {
      const first = cadSketchFile[0];
      if (!(first instanceof File)) {
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

    const attachedFiles = cadSketchFile.map((f) => ({
      fileName: f.name,
      filePath: f.filePath
    })
    );

    // ✅ Detect if this is a restored draft (UUID check)
    const isRestoredDraft =
      initialId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(initialId);

    const payLoad = {
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
      cadSketch: uploadedFilePath,
      vat: Number(vat) || 12,
      markup: Number(markup) || 5,
      attachedFiles,
      status: "sent",
      items: itemsForSend,
    };

    // ✅ Use PUT when restoring, POST otherwise
    const url = isRestoredDraft
      ? `/api/sales/quotations/${initialId}`
      : "/api/sales/quotations";

    const method = isRestoredDraft ? "PUT" : "POST";

    console.log(`Sending quotation via ${method}:`, payLoad);

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payLoad),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      toast.success("Quotation sent successfully!");
      window.dispatchEvent(new CustomEvent("quotation-sent"));

      setIsSent(true);
      setQuotationNumber(result.data.quotationNumber);
      setRevisionLabel(result.data.revisionLabel);
      setCustomer((prev) => prev ?? result.data.customer ?? prev);
      setSavedQuotation(result.data);

      onSaved?.(result.data);
    } else {
      toast.error(`Failed to send quotation: ${result.error || "Unknown error"}`);
    }
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
      
      // <PreviewDocument
      //   items={itemsForPreview}
      //   payment={payment}
      //   delivery={delivery}
      //   warranty={warranty}
      //   validity={validity}
      //   quotationNotes={quotationNotes}
      //   requestId={requestId}
      //   projectName={projectName}
      //   vat={vat}
      //   markup={markup}
      //   cadSketchFile={cadSketchFile}
      //   //revisionLabel={revisionLabel}
      //   revisionLabel={revisionLabel || String(savedQuotation?.revisionLabel ?? "REV_00")}
      //   baseQuotationId={baseId ?? requestId}
      //   quotationNumber={quotationNumber}
      //   //customer={customer}
      //   customer={customer || savedQuotation?.customer || null}
      //   onBack={() => setShowPreview(false)}
      //   onSend={handleSend}
      //   isSent={isSent}
      //   quotation={{ createdAt: new Date().toISOString() }}
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
        cadSketchFile={cadSketchFile || []}
        revisionLabel={(
          revisionLabel ||
          (savedQuotation?.revisionLabel
            ? savedQuotation.revisionLabel
            : savedQuotation?.revisionNumber !== undefined
            ? `REV-${String(savedQuotation.revisionNumber).padStart(2, "0")}`
            : "REV-00"
          )
        )}
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
      <h3 className="font-bold text-lg text-[#880c0c] border-b pb-2 border-[#ffb7b7] mb-3">Customer Information</h3>
      {customer ? (
        <div className="space-y-2">
          <p><span className="font-medium text-[#880c0c]">Company:</span> {customer.companyName}</p>
          {/* <p><span className="font-medium text-[#880c0c]">Email:</span> {customer.email}</p> */}
          <p><span className="font-medium text-[#880c0c]">Address:</span> {customer.address}</p>
          <p><span className="font-medium text-[#880c0c]">Phone:</span> {customer.phone}</p>
          <p><span className="font-medium text-[#880c0c]">TIN:</span> {customer.tinNumber}</p>
          <p><span className="font-medium text-[#880c0c]">Contact Person:</span> {customer.contactPerson}</p>
        </div>
      ) : (
        <p className="text-gray-500">Loading customer info...</p>
      )}
    </div>

    {/* Quotation & Request Info */}
    <div>
      <h3 className="font-bold text-lg text-[#880c0c] border-b border-[#ffb7b7] pb-2 mb-3">Quotation Details</h3>
      <div className="space-y-2">
        <p><span className="font-medium text-[#880c0c]">Quotation Number:</span> {quotationNumber || "Pending"}</p>
        <p><span className="font-medium text-[#880c0c]">Revision:</span> {revisionLabel}</p>
        <p><span className="font-medium text-[#880c0c]">Base Quotation ID:</span> {baseId ?? requestId}</p>
        <p><span className="font-medium text-[#880c0c]">Request ID:</span> {requestId}</p>
        <p><span className="font-medium text-[#880c0c]">Project Name:</span> <span className="uppercase">{projectName || "Not provided"}</span></p>
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
          <div key={index} className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
            {/* Item Name */}
            <div>
              <label className="block text-[#880c0c] font-bold text-md mb-1">Item Name <span className="text-red-400"> *</span></label>
              
              <input
                type="text"
                value={item.itemName}
                onChange={(e) => updateItem(index, "itemName", e.target.value)}
                disabled={isSent}
                className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100 uppercase
                  ${item.error?.itemName ? "border-red-500" : item.itemName ? "border-green-500" : "border-[#d2bda7]"}`}
              />
              {item.error?.itemName && <p className="text-red-600 text-xs mt-1 italic">{item.error.itemName}</p>}
            </div>

            {/* Scope of Work */}
            <div>
              <label className="block text-[#880c0c] font-bold text-md mb-1">Scope of Work <span className="text-red-400"> *</span></label>

              <textarea
                value={item.scopeOfWork}
                onChange={(e) => updateItem(index, "scopeOfWork", e.target.value)}
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
              <label className="font-bold text-[#880c0c] text-md">Materials</label>

              {(item.materials || []).map((mat, mi) => (
              <div key={mat.id} className="mt-4 pb-2">
                {/* The top row for inputs */}
                <div className="grid grid-cols-3 gap-3 items-start">
                  {/* Material Name */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-[#880c0c] mb-1">
                      Material Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={mat.name}
                      onChange={(e) => updateMaterial(index, mi, "name", e.target.value)}
                      disabled={isSent}
                      className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100
                        ${mat.error?.name ? "border-red-500" : mat.name ? "border-green-500" : "border-[#d2bda7]"}`}
                    />
                    {mat.error?.name && (
                      <p className="text-red-600 text-xs mt-1 italic">{mat.error.name}</p>
                    )}
                  </div>

                  {/* Specification */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-[#880c0c] mb-1">
                      Specification <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={mat.specification}
                      onChange={(e) => updateMaterial(index, mi, "specification", e.target.value)}
                      disabled={isSent}
                      className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100
                        ${mat.error?.specification ? "border-red-500" : mat.specification ? "border-green-500" : "border-[#d2bda7]"}`}
                    />
                    {mat.error?.specification && (
                      <p className="text-red-600 text-xs mt-1 italic">{mat.error.specification}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col">
                    <NumericInput 
                      label="Quantity"
                      value={mat.quantity === 0 ? "" : mat.quantity}
                      setValue={(val) => updateMaterial(index, mi, "quantity", val)}
                      max={9999}
                      required
                      disabled={isSent}
                      showError={hasSubmitted}
                    />
                  </div>
                </div>

                {/* Remove button below, aligned to far right */}
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
                className="mt-2 text-blue-600 hover:text-blue-800 cursor-pointer">
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
            <p className="mt-5 font-bold text-lg text-[#880c0c]">Item - Total: ₱{itemTotal.toFixed(2)}</p>

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
            { label: "Payment", value: payment, setValue: setPayment, key: "payment" },
            { label: "Delivery", value: delivery, setValue: setDelivery, key: "delivery" },
            { label: "Validity", value: validity, setValue: setValidity, key: "validity" },
            { label: "Warranty", value: warranty, setValue: setWarranty, key: "warranty" },
          ] as const
        ).map((field) => {
          const { label, value, setValue, key } = field;
          const error = fieldErrors[key];

          return (
            <div
              key={label}
              className="border border-[#ffb7b7] rounded-xl p-2 bg-white shadow-sm space-y-2 flex flex-col justify-between"
            >
              <label className="block text-[#880c0c] text-sm font-medium">{label}</label>

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
                    ${error ? "border-red-500" : value.trim() ? "border-green-500" : ""}`}
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

              {error && <p className="text-red-600 text-xs mt-1 italic">{error}</p>}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="border border-[#ffb7b7] rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
        <label className="block text-[#880c0c] text-sm font-medium">Quotation Notes</label>
        <textarea
          value={quotationNotes}
          onChange={(e) => setQuotationNotes(e.target.value)}
          disabled={isSent}
          rows={3}
          className={`w-full border rounded px-2 py-2 hover:bg-gray-100 text-sm ${fieldErrors.quotationNotes ? "border-red-500" : ""}`}
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
        const { subtotal, markupAmount, vatAmount, grandTotal } = calculateSummary();
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
      isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 text-white hover:bg-blue-800"
    }`}
  >
    Done
  </button>

  <button
    type="button"
    onClick={() => handleSave("draft")}
    disabled={isLoading}
    className={`px-6 py-2 rounded-lg transition ${
      isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-white text-gray-500 hover:bg-gray-100"
    }`}
  >
    {isLoading ? "Saving..." : "Save as Draft"}
  </button>
</div>

    </div>
  );
};  