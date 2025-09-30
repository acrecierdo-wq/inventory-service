// app/sales/s_pending_customer_request/pending_view/[id]/components/quotationcomponents/PreviewDocument.tsx

"use client";

import React from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { PreviewFile, QuotationItem, Customer } from "@/app/sales/types/quotation";

// Types

type PreviewDocumentProps = {
  items: QuotationItem[];
  delivery: string;
  warranty: string;
  validity: string;
  quotationNotes?: string;
  requestId: number;
  projectName?: string;
  vat: number;
  markup: number;
  cadSketchFile: PreviewFile[];
  revisionLabel: string;
  baseQuotationId: number;
  customer: Customer | null;
  quotationNumber: string;
  mode?: string;
  onBack: () => void;
  onSend: () => void;
  isSent: boolean;
};

/** Helper */
function getFileName(f: PreviewFile) {
  return f instanceof File ? f.name : f.name;
}

function getFilePath(f: PreviewFile) {
  return f instanceof File
    ? URL.createObjectURL(f)
    : f.filePath;
}

// Currency formatter
const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Calculate summary
const calculateSummary = (items: QuotationItem[], vat: number, markup: number) => {
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const markupAmount = subtotal * (markup / 100);
  const totalWithMarkup = subtotal + markupAmount;
  const vatAmount = totalWithMarkup * (vat / 100);
  const grandTotal = totalWithMarkup + vatAmount;
  return { subtotal, markupAmount, vatAmount, grandTotal };
};

export function PreviewDocument({
  items,
  delivery,
  warranty,
  validity,
  quotationNotes,
  quotationNumber,
  revisionLabel,
  customer,
  onBack,
  onSend,
  vat,
  markup,
  projectName,
  cadSketchFile,
  requestId,
  isSent,
}: PreviewDocumentProps) {
  const { subtotal, markupAmount, vatAmount, grandTotal } = calculateSummary(items, vat, markup);

  //const revisionLabel = `REVISION-${String(revisionNumber ?? 0).padStart(2, "0")}`;

  return (
<div className="font-sans bg-gray-100 p-4 sm:p-6 md:p-8 flex justify-center min-h-screen">
  <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 sm:p-8 relative border border-gray-200">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition z-10"
          aria-label="Back to form"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <header className="pb-4 mb-6 border-b-2 border-yellow-400 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-gray-700">Logo</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase leading-tight">Canlubang Techno-Industrial Corporation</h1>
              <p className="text-xs sm:text-sm italic text-gray-600">&quot;GEARING TOWARDS EXCELLENCE&quot;</p>
            </div>
          </div>
        </header>

          <div className="text-right text-sm text-gray-700">
          <p><span className="font-semibold">Quotation No:</span> {quotationNumber}</p>
          <p><span className="font-semibold">Revision:</span> {revisionLabel}</p>
          <p><span className="font-semibold">Request ID:</span> {requestId}</p>
        </div>

          <div className="text-sm text-gray-700 font-medium">
            <p>Date: {format(new Date(), "MMMM d, yyyy")}</p>
          </div>

        {/* Customer Info & Quotation Details */}
 
          <div>
            {customer ? (
              <div className="mt-4 text-sm text-gray-700">
                <p><span className="font-semibold">To:</span> {customer.companyName}</p>
                <p><span className="font-semibold"></span> {customer.address}</p>
                <p><span className="font-semibold"></span> {customer.email}</p>
                <p><span className="font-semibold"></span> {customer.phone}</p>

              <div className="mt-4 text-sm text-gray-700"> 
                <p><span className="font-semibold">Attention:</span> {customer.contactPerson}</p>
                <p><span className="font-semibold">Project:</span> {projectName || "N/A"}</p>
              </div>

              </div>
            ) : (
              <p className="italic text-gray-500 text-sm">No customer information available.</p>
            )}
          </div>

            {/* Introductory Message */}
        <div className="mt-4 text-sm text-gray-700">
        <section className="mb-8 text-sm text-gray-700 leading-relaxed">
          {customer && <p className="mb-2">Dear {customer.contactPerson.split(" ")[0]},</p>}
          <p>
            Thank you for considering Canlubang Techno-Industrial Corporation for your project needs. We are pleased to present our formal quotation for your approval and evaluation.
          </p>
        </section>
        </div>
            {/* Scope of Work */}
            <div className="mb-6">
              <h2 className="font-bold text-base text-gray-800 mb-2">SCOPE OF WORK:</h2>
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="p-2 bg-white border border-gray-200 rounded-md">
                      <p className="font-semibold text-sm">{item.itemName}</p>
                      <p className="pl-2 mt-1 whitespace-pre-wrap text-sm text-gray-700">{item.scopeOfWork}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-gray-500 text-sm">No scope of work defined.</p>
              )}
            </div>

          {/* Materials */}
          <div className="mb-6">
            <h2 className="font-bold text-base text-gray-800 mb-2">MATERIALS:</h2>
            {items.length > 0 && items.some(item => item.materials.length > 0) ? (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="p-2 bg-white border border-gray-200 rounded-md">
                    <p className="font-semibold text-sm">{item.itemName}</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-700">
                      {item.materials.map((mat, mIdx) => (
                        <li key={mIdx}>
                          <span className="font-medium">{mat.name}</span> ({mat.specification}) - Qty: {mat.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="italic text-gray-500 text-sm">No materials listed.</p>
            )}
          </div>

        {/* Quotation Summary */}
          <section className="mb-8">
            <div className="flex justify-between items-end pb-2 mb-4 border-b border-gray-300">
              <h2 className="font-bold text-xl text-gray-800">Quotation Summary</h2>
            </div>

            <div className="space-y-2 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-base text-gray-800">
                  <span>{item.itemName} (x{item.quantity})</span>
                  <span className="font-medium">{currencyFormatter.format(item.totalPrice)}</span>
                </div>
              ))}
            </div>

        {/* Totals without box */}
        <div className="w-full sm:w-80 ml-auto space-y-2 text-gray-700 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{currencyFormatter.format(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Markup ({markup}%):</span>
            <span>{currencyFormatter.format(markupAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed pt-2 mt-2">
            <span>Amount before VAT:</span>
            <span>{currencyFormatter.format(subtotal + markupAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT ({vat}%):</span>
            <span>{currencyFormatter.format(vatAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-3 border-t-2 border-gray-400 mt-3 text-gray-900">
        <span>GRAND TOTAL (VAT INC.):</span>
        <span>{currencyFormatter.format(grandTotal)}</span>
      </div>
        </div>
      </section>

         {/* Quotation Details */}
        <div className="space-y-1 text-sm text-gray-700 mb-4">
          {/* <p><span className="font-semibold">Base Quotation ID:</span> {baseQuotationId}</p> */}
          <p><span className="font-semibold">Validity:</span> {validity}</p>
          <p><span className="font-semibold">Delivery:</span> {delivery}</p>
          <p><span className="font-semibold">Warranty:</span> {warranty}</p>

          <h2 className="font-semibold mt-1">Additional Notes:</h2>
          <div className="border rounded-md p-3 bg-gray-50 mt-1">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {quotationNotes || "No additional notes provided for this quotation."}
            </p>
          </div>
        </div>

{/* CAD Sketches */}
{cadSketchFile && cadSketchFile.length > 0 && (
  <div className="mt-4">
    <h4 className="font-semibold text-gray-800 mb-2">CAD Sketch</h4>
    {cadSketchFile.map((file, idx) => {
      const name = getFileName(file);
      const url = getFilePath(file);

      const size = file instanceof File ? file.size : 0;
      const isTooLarge = size > 10 * 1024 * 1024;

      const isImage = /\.(png|jpeg|jpg)$/i.test(name);
      const isPDF = /\.pdf$/i.test(name);
      const isDoc = /\.(doc|docx|xls|xlsx)$/i.test(name);

      return (
        <div key={idx} className="mb-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {name}
          </a>

          {isTooLarge && (
            <p className="text-red-600 text-sm mt-1">
              ⚠️ File is too large to preview (&gt;{(size / 1024 / 1024).toFixed(1)}MB).  
              Please download instead.
            </p>
          )}

          {!isTooLarge && (
            <>
            {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={name}
              className="mt-2 max-h-48 border rounded-lg"
            />
          )}

          {isPDF && (
            <iframe
              src={url}
              className="mt-2 w-full h-64 border rounded-lg"
            />
          )}

          {isDoc && (
            <p className="text-gray-600 mt-2 text-sm">
              Preview not supported.{" "}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Download {name}
              </a>
            </p>
          )}
          </>
          )}
        </div>
      );
    })}
  </div>
)}


        {/* Action Buttons */}
<footer className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-200">
  {!isSent? (
    <>
      <button
        type="button"
        onClick={onBack}
        className="px-6 py-2 rounded-lg transition bg-gray-200 text-gray-800 hover:bg-gray-300"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onSend}
        className="px-6 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Send Quotation
      </button>
    </>
  ) : (
    <p className="text-gray-500 italic text-sm">This quotation has already been sent.</p>
  )}
</footer>

      </div>
    </div>
  );
}