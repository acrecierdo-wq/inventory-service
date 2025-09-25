"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Trash2, X } from "lucide-react";
import { PreviewDocument } from "./components/quotationcomponents/PreviewDocument";

type QuotationFormProps = {
  requestId: number;
  projectName?: string;
  customerId?: string;
  mode?: string;
  initialNotes?: string;
  baseQuotationId?: number; // pass this if creating a revision
  initialRevisionNumber?: number; // initial revision (0 = original)
  onSaved?: (data: SavedQuotation) => void;
  onSavedDraft?: (data: SavedQuotation) => void;
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
  price: number;
  error?: {
    itemName?: string;
    scopeOfWork?: string;
    quantity?: string;
    price?: string;
  };
};

type SavedQuotation = {
  id: number;
  quotationNumber: string;
  revisionNumber: number;
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
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

// Generate quotation number (local mock — real app should use DB counter)
function generateQuotationNumber() {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 900) + 100;
  return `Q-${year}-${String(seq).padStart(3, "0")}`;
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

export default function QuotationForm({
  requestId,
  projectName,
  mode,
  initialNotes,
  baseQuotationId,
  initialRevisionNumber = 0,
  onSaved,
  customerId,
}: QuotationFormProps) {

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [project, setProject] = useState<string>("");
  const [modeName, setMode] = useState<string>("");
  const [quotationNumber, setQuotationNumber] = useState<string>("");
  const [revisionNumber] = useState<number>(initialRevisionNumber);
  const [baseId] = useState<number | null>(baseQuotationId ?? null);

  const [items, setItems] = useState<QuotationItem[]>([
    {
      itemName: "",
      scopeOfWork: "",
      materials: [{ id: uid(), name: "", specification: "", quantity: 0, error: {} }],
      quantity: 0,
      price: 0,
      error: {},
    },
  ]);
  const [validity, setValidity] = useState("");
  const [delivery, setDelivery] = useState("");
  const [warranty, setWarranty] = useState("");
  const [notes, setNotes] = useState(initialNotes || "");
  const [cadSketchFile, setCadSketchFile] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [vat, setVat] = useState<number>(12);
  const [markup, setMarkup] = useState<number>(0);

  const [fieldErrors, setFieldErrors] = useState<{
    delivery?: string;
    warranty?: string;
    validity?: string;
    notes?: string;
    cadSketch?: string;
    items?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch(`/api/q_request/${requestId}`);
        if (!res.ok) throw new Error("Failed to fetch request");
        const data = await res.json();

        if (data.customer) setCustomer (data.customer);
        if (data.project_name) setProject (data.project_name);
        if (data.mode) setMode (data.mode);
        if (data.message) setNotes(data.message);
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
    // generate a quotation number once (demo/local)
    if (!quotationNumber) {
      setQuotationNumber(generateQuotationNumber());
    }
  }, [validity, quotationNumber]);

  // === Validation helpers ===
  const validateAllFields = () => {
    let isValid = true;
    const newFieldErrors: typeof fieldErrors = {};
    const newItems = [...items];

    // Validate global fields
    if (!delivery) {
      newFieldErrors.delivery = "Delivery is required";
      isValid = false;
    }
    if (!warranty) {
      newFieldErrors.warranty = "Warranty is required";
      isValid = false;
    }
    if (!validity) {
      newFieldErrors.validity = "Validity is required";
      isValid = false;
    }
    if (!notes) {
      newFieldErrors.notes = "Quotation notes are required";
      isValid = false;
    }
    if (cadSketchFile.length === 0) {
      newFieldErrors.cadSketch = "CAD Sketch is required";
      isValid = false;
    }

    // Validate items and materials
    newItems.forEach((item, itemIndex) => {
      const itemError: NonNullable<QuotationItem['error']> = {};
      if (!String(item.itemName).trim()) {
        itemError.itemName = "Item Name is required";
        isValid = false;
      }
      if (!String(item.scopeOfWork).trim()) {
        itemError.scopeOfWork = "Scope of Work is required";
        isValid = false;
      }
      if (toNumber(item.quantity) <= 0) {
        itemError.quantity = "Quantity must be > 0";
        isValid = false;
      }
      if (toNumber(item.price) <= 0) {
        itemError.price = "Unit Price must be > 0";
        isValid = false;
      }

      item.error = itemError;

      item.materials.forEach((mat, materialIndex) => {
        const materialError: NonNullable<MaterialRow['error']> = {};
        if (!String(mat.name).trim()) {
          materialError.name = "Material Name required";
          isValid = false;
        }
        if (!String(mat.specification).trim()) {
          materialError.specification = "Specification required";
          isValid = false;
        }
        if (toNumber(mat.quantity) <= 0) {
          materialError.quantity = "Qty must be > 0";
          isValid = false;
        }
        mat.error = materialError;
      });
    });

    if (newItems.some(i => Object.values(i.error || {}).some(Boolean)) ||
      newItems.some(i => i.materials.some(m => Object.values(m.error || {}).some(Boolean)))) {
      isValid = false;
    }

    setFieldErrors(newFieldErrors);
    setItems(newItems);

    return isValid;
  };

  // === Item & Material Handlers ===
  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...items];
    const updatedValue = (field === "quantity" || field === "price") ? toNumber(value) : value;
    // @ts-ignore
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
        price: 0,
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
    // @ts-ignore
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
      return sum + toNumber(i.quantity) * toNumber(i.price);
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
      totalPrice: toNumber(it.quantity) * toNumber(it.price),
    }));
  };

  // === CAD Upload UI ===
  const renderCadUpload = () => (
    <div className="border p-4 rounded-lg bg-gray-50">
      <label className="block text-gray-700 font-medium mb-2">Upload CAD Sketch</label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".pdf,.jpg,.png,.dwg"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              setCadSketchFile(Array.from(e.target.files));
            }
          }}
          className="hidden"
          id="cad-upload"
        />
        <label
          htmlFor="cad-upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition flex items-center gap-2"
        >
          <UploadCloud size={18} /> Upload File
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
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {fieldErrors.cadSketch && <p className="text-red-600 text-sm mt-2">{fieldErrors.cadSketch}</p>}
    </div>
  );

  const handleSave = async (status: "draft" | "sent") => {
     if (!validateAllFields()) {
    alert("Please fix the validation errors before saving.");
    return;
  }

  setIsLoading(true);

  const itemsForSave = items.map((it) => ({
    itemName: it.itemName,
    scopeOfWork: it.scopeOfWork,
    quantity: toNumber(it.quantity),
    unitPrice: toNumber(it.price), 
    materials: it.materials.map((m) => ({
      name: m.name,
      specification: m.specification,
      quantity: toNumber(m.quantity),
    })),
  }));

  // Build attachedFiles array
  const attachedFiles = cadSketchFile.map((f) => ({
    fileName: f.name,
    filePath: `/uploads/${f.name}`, // ✅ adjust to your storage logic
  }));

  const savedData = {
    requestId,
    quotationNumber,
    revisionNumber,
    baseQuotationId: baseId ?? undefined,
    projectName: projectName || "",
    mode: mode || "",
    validity,
    delivery,
    warranty,
    quotationNotes: notes, // ✅ renamed
    cadSketch: cadSketchFile.length > 0 ? cadSketchFile[0].name : null,
    vat,
    markup,
    attachedFiles,
    items: itemsForSave,
    status,
  };
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savedData),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert("Quotation saved successfully!");
        onSaved?.(result.quotation); // optional callback
      } else {
        alert(`Failed to save quotation: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving quotation:", err);
      alert("Error saving quotation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
  if (!validateAllFields()) {
    alert("Please fix the validation errors before sending.");
    return;
  }

  setIsLoading(true);

  try {
    const itemsForSend = items.map((it) => ({
      itemName: it.itemName,
      scopeOfWork: it.scopeOfWork,
      quantity: toNumber(it.quantity),
      unitPrice: toNumber(it.price),
      materials: it.materials.map((m) => ({
        name: m.name,
        specification: m.specification,
        quantity: toNumber(m.quantity),
      })),
    }));

    const attachedFiles = cadSketchFile.map((f) => ({
      fileName: f.name,
      filePath: `/uploads/${f.name}`,
    }));

    const payload = {
      requestId,
      quotationNumber,
      revisionNumber,
      baseQuotationId: baseId ?? undefined,
      projectName: projectName || "",
      mode: mode || "",
      validity,
      delivery,
      warranty,
      quotationNotes: notes,
      cadSketch: cadSketchFile.length > 0 ? cadSketchFile[0].name : null,
      vat,
      markup,
      status: "sent",
      attachedFiles,
      items: itemsForSend,
    };

    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      alert("Quotation sent successfully!");
      setShowPreview(false); // go back to form
      onSaved?.(result.quotation); // optional callback
    } else {
      alert(`Failed to send quotation: ${result.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error sending quotation. Please try again.");
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
        notes={notes}
        requestId={requestId}
        projectName={projectName}
        vat={vat}
        markup={markup}
        cadSketchFile={cadSketchFile}
        revisionNumber={revisionNumber}
        baseQuotationId={baseId ?? requestId}
        quotationNumber={quotationNumber}
        customer={customer}
        onBack={() => setShowPreview(false)}
        onSend={handleSend}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Customer Info */}
    <div>
      <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Customer Information</h3>
      {customer ? (
        <div className="space-y-2 text-gray-700">
          <p><span className="font-medium">Name:</span> {customer.fullName}</p>
          <p><span className="font-medium">Email:</span> {customer.email}</p>
          <p><span className="font-medium">Phone:</span> {customer.phone}</p>
          <p><span className="font-medium">Address:</span> {customer.address}</p>
        </div>
      ) : (
        <p className="text-gray-500">Loading customer info...</p>
      )}
    </div>

    {/* Quotation & Request Info */}
    <div>
      <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Quotation Details</h3>
      <div className="space-y-2 text-gray-700">
        <p><span className="font-medium">Quotation Number:</span> {quotationNumber}</p>
        <p><span className="font-medium">Revision:</span> {revisionNumber}</p>
        <p><span className="font-medium">Base Quotation ID:</span> {baseId ?? requestId}</p>
        <p><span className="font-medium">Request ID:</span> {requestId}</p>
        <p><span className="font-medium">Project Name:</span> {projectName || "Not provided"}</p>
        <p><span className="font-medium">Mode:</span> {mode || "Not provided"}</p>
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
        const itemTotal = toNumber(item.quantity) * toNumber(item.price);
        return (
          <div key={index} className="border rounded-xl p-6 space-y-4 bg-white shadow-sm relative">
            {/* Item Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Item Name</label>
              <input
                type="text"
                value={item.itemName}
                onChange={(e) => updateItem(index, "itemName", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 ${item.error?.itemName ? "border-red-500" : ""}`}
              />
              {item.error?.itemName && <p className="text-red-600 text-sm mt-1">{item.error.itemName}</p>}
            </div>

            {/* Scope of Work */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Scope of Work</label>
              <textarea
                value={item.scopeOfWork}
                onChange={(e) => updateItem(index, "scopeOfWork", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 ${item.error?.scopeOfWork ? "border-red-500" : ""}`}
                rows={3}
              />
              {item.error?.scopeOfWork && <p className="text-red-600 text-sm mt-1">{item.error.scopeOfWork}</p>}
            </div>

            {/* Materials */}
            <div>
              <h4 className="font-semibold">Materials</h4>
              {item.materials.map((mat, mi) => (
                <div key={mat.id} className="grid grid-cols-3 gap-3 items-center mt-2">
                  <input
                    type="text"
                    placeholder="Material Name"
                    value={mat.name}
                    onChange={(e) => updateMaterial(index, mi, "name", e.target.value)}
                    className={`border rounded px-2 py-1 ${mat.error?.name ? "border-red-500" : ""}`}
                  />
                  <input
                    type="text"
                    placeholder="Specification"
                    value={mat.specification}
                    onChange={(e) => updateMaterial(index, mi, "specification", e.target.value)}
                    className={`border rounded px-2 py-1 ${mat.error?.specification ? "border-red-500" : ""}`}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={mat.quantity === 0 ? "" : mat.quantity}
                    onChange={(e) => updateMaterial(index, mi, "quantity", e.target.value)}
                    className={`border rounded px-2 py-1 ${mat.error?.quantity ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeMaterial(index, mi)}
                    className="text-red-600 hover:text-red-800 col-span-3 text-right"
                  >
                    Remove
                  </button>
                  {mat.error?.name && <p className="text-red-600 text-xs col-span-3">{mat.error.name}</p>}
                  {mat.error?.specification && <p className="text-red-600 text-xs col-span-3">{mat.error.specification}</p>}
                  {mat.error?.quantity && <p className="text-red-600 text-xs col-span-3">{mat.error.quantity}</p>}
                </div>
              ))}
              <button type="button" onClick={() => addMaterial(index)} className="mt-2 text-blue-600 hover:text-blue-800">
                + Add Material
              </button>
            </div>

            {/* Item Quantity & Unit Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={item.quantity === 0 ? "" : item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 ${item.error?.quantity ? "border-red-500" : ""}`}
                />
                {item.error?.quantity && <p className="text-red-600 text-sm mt-1">{item.error.quantity}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Unit Price</label>
                <input
                  type="number"
                  value={item.price === 0 ? "" : item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 ${item.error?.price ? "border-red-500" : ""}`}
                />
                {item.error?.price && <p className="text-red-600 text-sm mt-1">{item.error.price}</p>}
              </div>
            </div>

            {/* Item Total */}
            <p className="font-medium">Item Total: ₱{itemTotal.toFixed(2)}</p>

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
        <div>
          <label className="block text-gray-700 font-medium mb-1">Validity</label>
          <input
            type="date"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            className={`w-full border rounded px-3 py-2 ${fieldErrors.validity ? "border-red-500" : ""}`}
          />
          {fieldErrors.validity && <p className="text-red-600 text-sm">{fieldErrors.validity}</p>}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Delivery</label>
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className={`w-full border rounded px-3 py-2 ${fieldErrors.delivery ? "border-red-500" : ""}`}
          >
            <option value="">Select Delivery</option>
            <option value="3-4 Days">3–4 Days</option>
            <option value="5-7 Days">5–7 Days</option>
            <option value="7-10 Days">7–10 Days</option>
            <option value="2-3 Weeks">2–3 Weeks</option>
            <option value="30-45 Days">30–45 Days</option>
          </select>
          {fieldErrors.delivery && <p className="text-red-600 text-sm">{fieldErrors.delivery}</p>}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Warranty (Months)</label>
          <select
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            className={`w-full border rounded px-3 py-2 ${fieldErrors.warranty ? "border-red-500" : ""}`}
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
      <div>
        <label className="block text-gray-700 font-medium mb-1">Quotation Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`w-full border rounded px-3 py-2 ${fieldErrors.notes ? "border-red-500" : ""}`}
        />
        {fieldErrors.notes && <p className="text-red-600 text-sm">{fieldErrors.notes}</p>}
      </div>

      {/* VAT & Markup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">VAT (%)</label>
          <input
            type="number"
            value={vat}
            onChange={(e) => setVat(toNumber(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Markup (%)</label>
          <input
            type="number"
            value={markup}
            onChange={(e) => setMarkup(toNumber(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Summary */}
      {(() => {
        const { subtotal, markupAmount, vatAmount, grandTotal } = calculateSummary();
        return (
          <div className="p-6 bg-gray-50 rounded-lg shadow-sm space-y-2 text-right">
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
        alert("Complete the form before proceeding.");
      }
    }}
    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
  >
    Next
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
    </div>
  );
};  