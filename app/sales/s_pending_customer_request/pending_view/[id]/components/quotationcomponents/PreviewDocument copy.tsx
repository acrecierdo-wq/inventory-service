"use client";

import { ArrowLeft } from "lucide-react";

type MaterialRow = {
  id: string;
  name: string;
  specification: string;
  quantity: number;
};

type QuotationItem = {
  itemName: string;
  scopeOfWork: string;
  materials: MaterialRow[];
  quantity: number;
  price: number;
  totalPrice: number;
};

type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

type PreviewDocumentProps = {
  items: QuotationItem[];
  delivery: string;
  warranty: string;
  validity: string;
  notes: string;
  requestId: number;
  projectName?: string;
  vat: number;
  markup: number;
  cadSketchFile: File[];
  revisionNumber: number;
  baseQuotationId: number;
  customer: Customer | null;
  quotationNumber: string;
  mode?: string;
  onBack: () => void;
  onSend: () => void;
};

export function PreviewDocument({
  items,
  delivery,
  warranty,
  validity,
  notes,
  requestId,
  projectName,
  vat,
  markup,
  cadSketchFile,
  revisionNumber,
  baseQuotationId,
  customer,
  quotationNumber,
  mode,
  onBack,
  onSend,
}: PreviewDocumentProps) {
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalWithMarkup = subtotal + subtotal * (markup / 100);
  const totalWithVAT = totalWithMarkup + totalWithMarkup * (vat / 100);

  return (
    <div className="space-y-8 p-6 bg-gray-50">
      {/* Company Header */}
      <div className="bg-red-600 text-white rounded-t-lg p-4 relative">
        <h1 className="text-2xl font-bold">Canlubang Techno-Industrial Corporation</h1>
        <p className="text-yellow-300 italic mt-1">"Gearing Towards Excellence"</p>
      </div>

      {/* Customer Info & Quotation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="border rounded-lg p-4 bg-white space-y-2 text-gray-700">
          <h3 className="font-bold text-lg border-b pb-1 mb-2">Customer Information</h3>
          {customer ? (
            <>
              <p><strong>Name:</strong> {customer.fullName}</p>
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Address:</strong> {customer.address}</p>
            </>
          ) : (
            <p className="text-gray-500 italic">No customer information</p>
          )}
        </div>

        {/* Quotation Details */}
        <div className="border rounded-lg p-4 bg-white space-y-2 text-gray-700">
          <h3 className="font-bold text-lg border-b pb-1 mb-2">Quotation Details</h3>
          <p><strong>Quotation Number:</strong> {quotationNumber}</p>
          <p><strong>Revision:</strong> {revisionNumber}</p>
          <p><strong>Base Quotation ID:</strong> {baseQuotationId}</p>
          <p><strong>Request ID:</strong> {requestId}</p>
          <p><strong>Project Name:</strong> {projectName || "Not provided"}</p>
          <p><strong>Mode:</strong> {mode || "Not provided"}</p>
          <p><strong>Delivery:</strong> {delivery}</p>
          <p><strong>Warranty:</strong> {warranty}</p>
          <p><strong>Validity:</strong> {validity}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm bg-white shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="border px-3 py-2 text-left">Item Name</th>
              <th className="border px-3 py-2 text-left">Scope of Work</th>
              <th className="border px-3 py-2 text-left">Materials</th>
              <th className="border px-3 py-2 text-center">Qty</th>
              <th className="border px-3 py-2 text-right">Unit Price</th>
              <th className="border px-3 py-2 text-right">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{i.itemName}</td>
                <td className="border px-3 py-2 whitespace-pre-wrap">{i.scopeOfWork}</td>
                <td className="border px-3 py-2">
                  <ul className="list-disc ml-4 space-y-1">
                    {i.materials.map((m) => (
                      <li key={m.id}>
                        {m.name} ({m.specification}) - {m.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="border px-3 py-2 text-center">{i.quantity}</td>
                <td className="border px-3 py-2 text-right">₱ {i.price.toLocaleString()}</td>
                <td className="border px-3 py-2 text-right font-semibold">₱ {i.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="w-64 ml-auto space-y-2">
        <div className="flex justify-between border-b pb-1">
          <span>Subtotal:</span>
          <span>₱ {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span>Markup ({markup}%):</span>
          <span>₱ {(subtotal * (markup / 100)).toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span>VAT ({vat}%):</span>
          <span>₱ {(totalWithMarkup * (vat / 100)).toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-1 border-t mt-1">
          <span>Grand Total:</span>
          <span>₱ {totalWithVAT.toLocaleString()}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
        <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
      </div>

      {/* CAD Sketches */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-2">CAD Sketches</h4>
        {cadSketchFile.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            {cadSketchFile.map((f, idx) => (
              <li key={idx}>{f.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No files uploaded</p>
        )}
      </div>

      {/* Back & Send Buttons */}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Form
        </button>
        <button
          type="button"
          onClick={onSend}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Send Quotation
        </button>
      </div>
    </div>
  );
}
