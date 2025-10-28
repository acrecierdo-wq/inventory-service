// app/sales/s_pending_customer_request/pending_view/[id]/components/quotationcomponents/PreviewDocument.tsx

"use client";

import React from "react";
import { format } from "date-fns";
import { PreviewFile, QuotationItem, Customer } from "@/app/sales/types/quotation";
import Image from "next/image"; 

// Types

type PreviewDocumentProps = {
  items: QuotationItem[];
  payment: string;
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
  quotation : {
    createdAt: string;
  }
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

function formatField(label: string, rawValue: string) {
  if (!rawValue?.trim()) return "N/A";

  const value = rawValue.trim().toLowerCase();

  const parts = value.split(" ");
  const numberPart = parts[0];
  let unitPart = parts[1]?.toLowerCase() || "";

  // 🧠 Auto-detect and assign sensible default units if missing
  if (!unitPart && /^\d+(-\d+)?$/.test(numberPart)) {
    switch (label) {
      case "Payment":
        unitPart = "days";
        break;
      case "Delivery":
        unitPart = "working days";
        break;
      case "Validity":
        unitPart = "months";
        break;
      case "Warranty":
        unitPart = "months";
        break;
      default:
        unitPart = "";
    }
  }

  const pluralize = (count: string, unit: string) => {
  const num = Number(count.split("-")[0]);
  if (isNaN(num) || num === 1) return unit.replace(/s$/, ""); // singular
  return unit.endsWith("s") ? unit : unit + "s"; // plural
};

  const formattedUnit =
    /^\d+(-\d+)?$/.test(numberPart) && unitPart
      ? pluralize(numberPart, unitPart)
      : unitPart;

  switch (label) {
    case "Delivery":
      if (/day|week|month/.test(unitPart)) {
        return `${numberPart} working ${formattedUnit} upon receipt of P.O.`;
      }
      return value;

    case "Payment":
      if (/day|week|month/.test(unitPart)) {
        return `${numberPart} ${formattedUnit} terms`;
      }
      return value;

    case "Validity":
      if (/day|week|month/.test(unitPart)) {
        return `${numberPart} ${formattedUnit} from date of quotation`;
      }
      return value;

    case "Warranty":
      if (/day|week|month|year/.test(unitPart)) {
        return `${numberPart} ${formattedUnit} against workmanship`;
      }
      return value;

    default:
      return value;
  }
}


// Currency formatter
const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Calculate summary
// const calculateSummary = (items: QuotationItem[], vat: number, markup: number) => {
//   const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
//   const markupAmount = subtotal * (markup / 100);
//   const totalWithMarkup = subtotal + markupAmount;
//   const vatAmount = totalWithMarkup * (vat / 100);
//   const grandTotal = totalWithMarkup + vatAmount;
//   return { subtotal, markupAmount, vatAmount, grandTotal };
// };

const calculateSummary = (items: QuotationItem[], vat: number, markup: number) => {
  const subtotal = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);
  const numericMarkup = Number(markup);
  const numericVat = Number(vat);

  const markupAmount = subtotal * (numericMarkup / 100);
  const totalWithMarkup = subtotal + markupAmount;
  const vatAmount = totalWithMarkup * (numericVat / 100);
  const grandTotal = totalWithMarkup + vatAmount;

  return { subtotal, markupAmount, vatAmount, grandTotal };
};

export function PreviewDocument({
  items,
  payment,
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
  //requestId,
  isSent,
  quotation,
}: PreviewDocumentProps) {
  const { subtotal, markupAmount, vatAmount, grandTotal } = calculateSummary(items, vat, markup);

  //const revisionLabel = `REVISION-${String(revisionNumber ?? 0).padStart(2, "0")}`;

  return (
<div className="font-sans bg-gray-100 p-4 sm:p-6 md:p-8 flex justify-center min-h-screen">
  <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 sm:p-8 relative border border-gray-200">
        {/* Back Button */}
        {/* <button
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition z-10"
          aria-label="Back to form"
        >
          <X size={24} />
        </button> */}

        {/* Header */}
        <header className="h-30 rounded-2xl bg-gradient-to-r from-[#e3ae01] via-[#dc5034] to-[#faf0c5] p-4 mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="bg-white h-20 w-full rounded flex flex-row items-center justify-center space-x-3 mb-4 sm:mb-0">
            <div>
              <Image src="/cticlogo.png" alt="CTIC" width={50} height={50} />
            </div>
            <div className="flex flex-col text-center">
              <span className="font-extrabold text-xl">CANLUBANG TECHNO-INDUSTRIAL CORPORATION</span>
              <span className="text-red-500 italic text-xs font-serif">&quot;GEARING TOWARDS EXCELLENCE&quot;!</span>
            </div>
          </div>
        </header>

          <div className="text-right text-gray-700 mt-5">
          <p className="font-bold"><span className="font-bold">Quotation No:</span> {quotationNumber}</p>
          <p className="font-bold"><span className="font-bold">Revision:</span> {revisionLabel}</p>
          {/* <p><span className="font-semibold">Request ID:</span> {requestId}</p> */}
        </div>

          {/* <div className=" text-gray-700 font-medium">
            <p>{format(new Date(), "MMMM d, yyyy")}</p>
          </div> */}
          {quotation?.createdAt && (
            <p>{format(new Date(quotation.createdAt), "MMM d, yyyy")}</p>
          )}

        {/* Customer Info & Quotation Details */}
 
          <div>
            {customer ? (
              <div className="mt-4 text-gray-700">
                <p className="font-bold text-xl"> {customer.companyName}</p>
                <p className="font-semibold"> {customer.address}</p>
                {/* <p><span className="font-semibold"></span> {customer.email}</p>
                <p><span className="font-semibold"></span> {customer.phone}</p> */}

              <div className="mt-4 text-sm text-gray-700 space-y-2"> 
                <p className="font-bold"><span className="font-bold underline">Attention:</span> {customer.contactPerson}</p>
                <p className="font-bold"><span className="font-bold underline">Project:</span> <span className="uppercase">{projectName || "N/A"}</span></p>
              </div>

              </div>
            ) : (
              <p className="italic text-gray-500 text-sm">No customer information available.</p>
            )}
          </div>

            {/* Introductory Message */}
        <div className="mt-4 text-sm text-gray-700">
        <section className="mb-8 text-sm text-gray-700 leading-relaxed">
          {customer && <p className="mb-2">Dear Ma&apos;am/Sir {customer.contactPerson.split(" ")[0]},</p>}
          <p>
            Thank you for considering Canlubang Techno-Industrial Corporation for your project needs. We are pleased to present our formal quotation for your approval and evaluation.
            Please review the details below and respond accordingly.
          </p>
        </section>
        </div>
            {/* Scope of Work */}
            <div className="mb-6">
              <h2 className="font-bold text-base text-gray-800 mb-2 underline">SCOPE OF WORK:</h2>
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="p-2 bg-white border border-gray-200 rounded-md">
                      <p className="font-semibold text-sm uppercase">{item.itemName}</p>
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
            <h2 className="font-bold text-base text-gray-800 mb-2 underline">MATERIALS:</h2>
            {items.length > 0 && items.some(item => item.materials.length > 0) ? (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="p-2 bg-white border border-gray-200 rounded-md">
                    <p className="font-semibold text-sm uppercase">{item.itemName}</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-700">
                      {item.materials.map((mat, mIdx) => (
                        <li key={mIdx}>
                          <span className="font-medium">{mat.name}</span> ({mat.specification}) - Quantity: {mat.quantity}
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
              <h2 className="font-bold text-xl text-gray-800 uppercase">Quotation</h2>
            </div>

            <div className="space-y-2 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-base text-gray-800">
                  <span className="uppercase">{item.itemName} </span>
                  <span className="font-medium">{currencyFormatter.format(item.unitPrice)}/unit</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-base text-gray-800">
                  <span>QUANTITY: {item.quantity} unit/s</span>
                  <span className="font-medium">{currencyFormatter.format(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="border-b border-gray-300" />
      </section>

      <section className="flex flex-row justify-between">

      {/* Quotation Details */}
        <div className="space-y-4 text-sm text-gray-700 mb-4 bg-[#fef4e4] w-[400px] p-2 rounded">
          <div></div>
          <p className="flex justify-between"><span className="font-bold">Payment:</span> {formatField("Payment", payment)}</p>
          <p className="flex justify-between"><span className="font-bold">Delivery:</span> {formatField("Delivery", delivery)}</p>
          <p className="flex justify-between"><span className="font-bold">Validity:</span> {formatField("Validity", validity)}</p>
          <p className="flex justify-between"><span className="font-bold">Warranty:</span> {formatField("Warranty", warranty)}</p>
        </div>

        {/* Totals without box */}
        <div className="w-full sm:w-80  space-y-2 text-gray-700 text-sm bg-gray-100 p-2 rounded">
          <div className="flex justify-between">
            <span className="font-bold">Subtotal:</span>
            <span>{currencyFormatter.format(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Markup ({markup}%):</span>
            <span>{currencyFormatter.format(markupAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed pt-2 mt-2">
            <span className="font-bold">Amount before VAT:</span>
            <span>{currencyFormatter.format(subtotal + markupAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">VAT ({vat}%):</span>
            <span>{currencyFormatter.format(vatAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-3 border-t-2 border-gray-400 mt-3 text-gray-900">
        <span>GRAND TOTAL (VAT INC.):</span>
        <span>{currencyFormatter.format(grandTotal)}</span>
      </div>
        </div>
      </section>
      
        <h2 className="font-semibold mt-1">Additional Notes:</h2>
          <div className="border rounded-md p-3 bg-gray-50 mt-1">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {quotationNotes || "No additional notes provided for this quotation."}
            </p>
          </div>

{/* CAD Sketches */}
<div className="mt-4">
    <h4 className="font-semibold text-gray-800 mb-2">CAD Sketch</h4>
  {cadSketchFile && cadSketchFile.length > 0 ? (
    cadSketchFile.map((file, idx) => {
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
    })
  ) : (
    // ✅ This shows if no cadSketch file
    <p className="text-gray-500 italic">No uploaded file.</p>
  )}
</div>


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
    <p className="text-gray-500 italic text-sm">This quotation has been sent.</p>
  )}
</footer>

      </div>
    </div>
  );
}

// app/sales/s_pending_customer_request/pending_view/[id]/components/quotationcomponents/PreviewDocument.tsx

// "use client";

// import React from "react";
// import { X } from "lucide-react";
// import { format } from "date-fns";
// import { PreviewFile, QuotationItem, Customer } from "@/app/sales/types/quotation";
// import Image from "next/image";

// // Types

// type PreviewDocumentProps = {
//   items: QuotationItem[];
//   payment: string;
//   delivery: string;
//   warranty: string;
//   validity: string;
//   quotationNotes?: string;
//   requestId: number;
//   projectName?: string;
//   vat: number;
//   markup: number;
//   cadSketchFile: PreviewFile[];
//   revisionLabel: string;
//   baseQuotationId: number;
//   customer: Customer | null;
//   quotationNumber: string;
//   mode?: string;
//   onCustomerAction?: (status: "accepted" | "rejected" | "revision_requested") => void;
//   onBack: () => void;
//   onSend: () => void;
//   isSent: boolean;
// };

// /** Helper */
// function getFileName(f: PreviewFile) {
//   return f instanceof File ? f.name : f.name;
// }

// function getFilePath(f: PreviewFile) {
//   return f instanceof File
//     ? URL.createObjectURL(f)
//     : f.filePath;
// }

// // Currency formatter
// const currencyFormatter = new Intl.NumberFormat("en-PH", {
//   style: "currency",
//   currency: "PHP",
//   minimumFractionDigits: 2,
//   maximumFractionDigits: 2,
// });

// // Calculate summary
// const calculateSummary = (items: QuotationItem[], vat: number, markup: number) => {
//   const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
//   const markupAmount = subtotal * (markup / 100);
//   const totalWithMarkup = subtotal + markupAmount;
//   const vatAmount = totalWithMarkup * (vat / 100);
//   const grandTotal = totalWithMarkup + vatAmount;
//   return { subtotal, markupAmount, vatAmount, grandTotal };
// };

// export function PreviewDocument({
//   items,
//   payment,
//   delivery,
//   warranty,
//   validity,
//   quotationNotes,
//   quotationNumber,
//   revisionLabel,
//   customer,
//   onBack,
//   onSend,
//   vat,
//   markup,
//   projectName,
//   cadSketchFile,
//   requestId,
//   isSent,
//   mode,
//   onCustomerAction,
// }: PreviewDocumentProps) {
//   const { subtotal, markupAmount, vatAmount, grandTotal } = calculateSummary(items, vat, markup);

//   //const revisionLabel = `REVISION-${String(revisionNumber ?? 0).padStart(2, "0")}`;

//   return (
// <div className="font-sans bg-gray-100 p-4 sm:p-6 md:p-8 flex justify-center min-h-screen">
//   <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 sm:p-8 relative border border-gray-200">
//         {/* Back Button */}
//         <button
//           onClick={onBack}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition z-10"
//           aria-label="Back to form"
//         >
//           <X size={24} />
//         </button>

//         {/* Header */}
//         <header className="h-25 rounded-2xl bg-gradient-to-r from-[#e3ae01] via-[#dc5034] to-[#faf0c5] p-4 mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
//           <div className="bg-white h-15 w-full rounded flex flex-row items-center justify-center space-x-3 mb-4 sm:mb-0">
//             <div>
//               <Image src="/cticlogo.png" alt="CTIC" width={50} height={50} />
//             </div>
//             <div className="flex flex-col text-center">
//               <span className="font-extrabold text-lg">CANLUBANG TECHNO-INDUSTRIAL CORPORATION</span>
//               <span className="text-red-500 italic text-xs font-serif">&quot;GEARING TOWARDS EXCELLENCE&quot;!</span>
//             </div>
//           </div>
//         </header>

//           <div className="text-right text-sm text-gray-700 mt-5">
//           <p><span className="font-semibold">Quotation No:</span> {quotationNumber}</p>
//           <p><span className="font-semibold">Revision:</span> {revisionLabel}</p>
//           {/* <p><span className="font-semibold">Request ID:</span> {requestId}</p> */}
//         </div>

//           <div className="text-sm text-gray-700 font-medium">
//             <p>{format(new Date(), "MMMM d, yyyy")}</p>
//           </div>

//         {/* Customer Info & Quotation Details */}
 
//           <div>
//             {customer ? (
//               <div className="mt-4 text-sm text-gray-700">
//                 <p className="font-bold text-lg"> {customer.companyName}</p>
//                 <p className="font-bold"> {customer.address}</p>
//                 {/* <p><span className="font-semibold"></span> {customer.email}</p>
//                 <p><span className="font-semibold"></span> {customer.phone}</p> */}

//               <div className="mt-4 text-sm text-gray-700"> 
//                 <p className="font-bold"><span className="font-bold underline">Attention:</span> {customer.contactPerson}</p>
//                 <p className="font-bold"><span className="font-bold underline">Project:</span> {projectName || "N/A"}</p>
//               </div>

//               </div>
//             ) : (
//               <p className="italic text-gray-500 text-sm">No customer information available.</p>
//             )}
//           </div>

//             {/* Introductory Message */}
//         <div className="mt-4 text-sm text-gray-700">
//         <section className="mb-8 text-sm text-gray-700 leading-relaxed">
//           {customer && <p className="mb-2">Dear Ma'am/Sir {customer.contactPerson.split(" ")[0]},</p>}
//           <p>
//             Thank you for considering Canlubang Techno-Industrial Corporation for your project needs. We are pleased to present our formal quotation for your approval and evaluation.
//           </p>
//         </section>
//         </div>
//             {/* Scope of Work */}
//             <div className="mb-6">
//               <h2 className="font-bold text-base text-gray-800 mb-2 underline">SCOPE OF WORK:</h2>
//               {items.length > 0 ? (
//                 <div className="space-y-2">
//                   {items.map((item, index) => (
//                     <div key={index} className="p-2 bg-white border border-gray-200 rounded-md">
//                       <p className="font-semibold text-sm">{item.itemName}</p>
//                       <p className="pl-2 mt-1 whitespace-pre-wrap text-sm text-gray-700">{item.scopeOfWork}</p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="italic text-gray-500 text-sm">No scope of work defined.</p>
//               )}
//             </div>

//           {/* Materials */}
//           <div className="mb-6">
//             <h2 className="font-bold text-base text-gray-800 mb-2 underline">MATERIALS:</h2>
//             {/* {items.length > 0 && items.some(item => item.materials.length > 0) ? (
//               <div className="space-y-2">
//                 {items.map((item, idx) => (
//                   <div key={idx} className="p-2 bg-white border border-gray-200 rounded-md">
//                     <p className="font-semibold text-sm">{item.itemName}</p>
//                     <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-700">
//                       {item.materials.map((mat, mIdx) => (
//                         <li key={mIdx}>
//                           <span className="font-medium">{mat.name}</span> ({mat.specification}) - Qty: {mat.quantity}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="italic text-gray-500 text-sm">No materials listed.</p>
//             )} */}
//             {Array.isArray(items) && items.length > 0 && items.some(item => Array.isArray(item.materials) && item.materials.length > 0) ? (
//               <div className="space-y-2">
//                 {items.map((item, idx) => (
//                   <div key={idx} className="p-2 bg-white border border-gray-200 rounded-md">
//                     <p className="font-semibold text-sm">{item.itemName || "Unnamed Item"}</p>

//                     {Array.isArray(item.materials) && item.materials.length > 0 ? (
//                       <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-700">
//                       {item.materials.map((mat, mIdx) => (
//                         <li key={mIdx}>
//                           <span className="font-medium">{mat.name}</span> ({mat.specification}) - Qty: {mat.quantity}
//                         </li>
//                       ))}
//                     </ul>
//                     ) : (
//                       <p className="italic text-gray-500 text-sm">No materials listed for this item.</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="italic text-gray-500 text-sm">No materials listed.</p>
//             )}
//           </div>

//         {/* Quotation Summary */}
//           <section className="mb-8">
//             <div className="flex justify-between items-end pb-2 mb-4 border-b border-gray-300">
//               <h2 className="font-bold text-xl text-gray-800">Quotation Summary</h2>
//             </div>

//             <div className="space-y-2 mb-6">
//               {items.map((item, index) => (
//                 <div key={index} className="flex justify-between items-center text-base text-gray-800">
//                   <span>{item.itemName} (x{item.quantity})</span>
//                   <span className="font-medium">{currencyFormatter.format(item.totalPrice)}</span>
//                 </div>
//               ))}
//             </div>

//         {/* Totals without box */}
//         <div className="w-full sm:w-80 ml-auto space-y-2 text-gray-700 text-sm">
//           <div className="flex justify-between">
//             <span>Subtotal:</span>
//             <span>{currencyFormatter.format(subtotal)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Markup ({markup}%):</span>
//             <span>{currencyFormatter.format(markupAmount)}</span>
//           </div>
//           <div className="flex justify-between border-t border-dashed pt-2 mt-2">
//             <span>Amount before VAT:</span>
//             <span>{currencyFormatter.format(subtotal + markupAmount)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>VAT ({vat}%):</span>
//             <span>{currencyFormatter.format(vatAmount)}</span>
//           </div>
//           <div className="flex justify-between font-semibold text-base pt-3 border-t-2 border-gray-400 mt-3 text-gray-900">
//         <span>GRAND TOTAL (VAT INC.):</span>
//         <span>{currencyFormatter.format(grandTotal)}</span>
//       </div>
//         </div>
//       </section>

//          {/* Quotation Details */}
//         <div className="space-y-1 text-sm text-gray-700 mb-4">
//           {/* <p><span className="font-semibold">Base Quotation ID:</span> {baseQuotationId}</p> */}
//           <p><span className="font-semibold">Payment:</span> {payment}</p>
//           <p><span className="font-semibold">Validity:</span> {validity}</p>
//           <p><span className="font-semibold">Delivery:</span> {delivery}</p>
//           <p><span className="font-semibold">Warranty:</span> {warranty}</p>

//           <h2 className="font-semibold mt-1">Additional Notes:</h2>
//           <div className="border rounded-md p-3 bg-gray-50 mt-1">
//             <p className="text-sm text-gray-700 whitespace-pre-wrap">
//               {quotationNotes || "No additional notes provided for this quotation."}
//             </p>
//           </div>
//         </div>

// {/* CAD Sketches */}
// {cadSketchFile && cadSketchFile.length > 0 && (
//   <div className="mt-4">
//     <h4 className="font-semibold text-gray-800 mb-2">CAD Sketch</h4>
//     {cadSketchFile.map((file, idx) => {
//       const name = getFileName(file);
//       const url = getFilePath(file);

//       const size = file instanceof File ? file.size : 0;
//       const isTooLarge = size > 10 * 1024 * 1024;

//       const isImage = /\.(png|jpeg|jpg)$/i.test(name);
//       const isPDF = /\.pdf$/i.test(name);
//       const isDoc = /\.(doc|docx|xls|xlsx)$/i.test(name);

//       return (
//         <div key={idx} className="mb-3">
//           <a
//             href={url}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-600 underline hover:text-blue-800"
//           >
//             {name}
//           </a>

//           {isTooLarge && (
//             <p className="text-red-600 text-sm mt-1">
//               ⚠️ File is too large to preview (&gt;{(size / 1024 / 1024).toFixed(1)}MB).  
//               Please download instead.
//             </p>
//           )}

//           {!isTooLarge && (
//             <>
//             {isImage && (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img
//               src={url}
//               alt={name}
//               className="mt-2 max-h-48 border rounded-lg"
//             />
//           )}

//           {isPDF && (
//             <iframe
//               src={url}
//               className="mt-2 w-full h-64 border rounded-lg"
//             />
//           )}

//           {isDoc && (
//             <p className="text-gray-600 mt-2 text-sm">
//               Preview not supported.{" "}
//               <a
//                 href={url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 underline"
//               >
//                 Download {name}
//               </a>
//             </p>
//           )}
//           </>
//           )}
//         </div>
//       );
//     })}
//   </div>
// )}


//         {/* Action Buttons */}
// {/* <footer className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-200">
//   {!isSent? (
//     <>
//       <button
//         type="button"
//         onClick={onBack}
//         className="px-6 py-2 rounded-lg transition bg-gray-200 text-gray-800 hover:bg-gray-300"
//       >
//         Back
//       </button>
//       <button
//         type="button"
//         onClick={onSend}
//         className="px-6 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//       >
//         Send Quotation
//       </button>
//     </>
//   ) : (
//     <p className="text-gray-500 italic text-sm">This quotation has been sent.</p>
//   )}
// </footer> */}
// <footer className="flex justify-end gap-4 mt-8 pt-4 border-t bprder-gray-200">
//   {mode === "sales" && !isSent && (
//     <>
//     <button
//       type="button"
//       onClick={onBack}
//       className="px-6 py-2 rounded-lg transition bg-gray-200 text-gray-800 hover:bg-gray-300"
//     >
//       Back
//     </button>
//     <button
//       type="button"
//       onClick={onSend}
//       className="px-6 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//     >
//       Send Quotation
//     </button>
//     </>
//   )}

//   {mode === "sales" && isSent && (
//     <p className="text-gray-500 italic text-sm">This quotation has been sent.</p>
//   )}

//   {mode === "customer" && (
//     <div className="flex gap-3">
//       <button
//         onClick={() => onCustomerAction?.("accepted")}
//         className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-700"
//       >
//         Accept
//       </button>
//       <button
//         onClick={() => onCustomerAction?.("rejected")}
//         className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
//       >
//         Reject
//       </button>
//       <button
//         onClick={() => onCustomerAction?.("revision_requested")}
//         className="bg-yellow-500 etxt-white px-5 py-2 rounded-lg hover:bg-yellow-600"
//       >
//         Request Revision
//       </button>
//     </div>
//   )}
// </footer>

//       </div>
//     </div>
//   );
// }