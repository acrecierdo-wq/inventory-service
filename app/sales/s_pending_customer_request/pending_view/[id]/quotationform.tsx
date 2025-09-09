"use client";

import { useState, useEffect } from "react";

type QuotationFormProps = {
  requestId: number;
  projectName?: string;
  mode?: string;
  initialNotes?: string;
  onSaved?: (data: any) => void;
};

export default function QuotationForm({
  requestId,
  projectName,
  mode,
  initialNotes,
  onSaved,
}: QuotationFormProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [materials, setMaterials] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("0");
  const [delivery, setDelivery] = useState("");
  const [validity, setValidity] = useState(""); 
  const [warranty, setWarranty] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!validity) {
      const today = new Date();
      today.setDate(today.getDate() + 30);
      setValidity(today.toISOString().split("T")[0]);
    }
  }, [validity]);

  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    setTotalPrice((qty * price).toFixed(2));
  }, [quantity, unitPrice]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/q_request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId,
          quotation_notes: notes,
          scope_of_work: scopeOfWork,
          materials,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          delivery,
          validity,
          warranty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save quotation");
      alert("Quotation saved successfully!");
      if (onSaved) onSaved(data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-[#0c2a42] border-b pb-3 mb-6">
        Quotation Entry
      </h2>

      {/* Request Info (merged with outer card) */}
      <div className="space-y-2 text-gray-800">
        <p><strong>Request ID:</strong> {requestId}</p>
        <p><strong>Project Name:</strong> {projectName || <span className="text-gray-400">Not provided</span>}</p>
        <p><strong>Mode:</strong> {mode || <span className="text-gray-400">Not provided</span>}</p>
      </div>

      {/* Scope & Materials */}
      <div className="grid gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Scope of Work</label>
          <textarea
            value={scopeOfWork}
            onChange={(e) => setScopeOfWork(e.target.value)}
            rows={3}
            placeholder="Describe the scope..."
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Materials</label>
          <textarea
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            rows={3}
            placeholder="List of materials..."
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Two-column layout for numbers, delivery, validity, warranty */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 3"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Unit Price (₱)</label>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="e.g., 5500"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Delivery</label>
          <input
            type="text"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            placeholder="3 working days"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Validity Until</label>
          <input
            type="date"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Warranty</label>
          <input
            type="text"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            placeholder="e.g., 3 months workmanship"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Total Price (₱)</label>
          <input
            type="text"
            value={totalPrice}
            readOnly
            className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-700 font-semibold"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Notes / Remarks</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add remarks..."
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Save button */}
      <div className="text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Quotation"}
        </button>
      </div>
    </div>
  );
}
