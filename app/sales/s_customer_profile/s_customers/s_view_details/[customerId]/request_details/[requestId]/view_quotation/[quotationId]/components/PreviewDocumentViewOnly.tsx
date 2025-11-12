// "use client";

// import React from "react";
// import { format } from "date-fns";
// import Image from "next/image";

// interface MaterialRow {
//   id: string;
//   name: string;
//   specification: string;
//   quantity: number;
// }

// interface QuotationItem {
//   itemName: string;
//   scopeOfWork: string;
//   materials: MaterialRow[];
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
// }

// interface PreviewFile {
//   id: string | number;
//   name: string;
//   filePath: string;
//   url?: string;
// }

// interface CustomerInfo {
//   companyName?: string;
//   contactPerson?: string;
//   email?: string;
//   address?: string;
// }

// interface QuotationData {
//   id: string;
//   quotationNumber: string;
//   revisionLabel: string;
//   requestId: number;
//   createdAt: string;
//   status: string;
//   items?: QuotationItem[];
//   payment?: string;
//   delivery?: string;
//   validity?: string;
//   warranty?: string;
//   quotationNotes?: string;
//   customer?: CustomerInfo;
//   vat?: number;
//   markup?: number;
//   projectName?: string;
//   cadSketchFile?: PreviewFile[];
// }

// interface Props {
//   quotation: QuotationData;
// }

// const currency = (amount: number | undefined) =>
//   amount ? `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "—";

// export default function PreviewDocumentViewOnly({ quotation }: Props) {
//   const { customer, items = [] } = quotation;

//   const grandTotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
//   const vatAmount = quotation.vat ? grandTotal * (quotation.vat / 100) : 0;
//   const markupAmount = quotation.markup ? grandTotal * (quotation.markup / 100) : 0;
//   const totalWithAddons = grandTotal + vatAmount + markupAmount;

//   return (
//     <div className="bg-white p-8 rounded-lg shadow-md text-sm text-gray-800">
//       {/* HEADER */}
//       <div className="text-center border-b border-gray-300 pb-6 mb-6">
//         <div className="flex justify-center mb-2">
//           <Image
//             src="/images/company-logo.png"
//             alt="Company Logo"
//             width={120}
//             height={120}
//             className="object-contain"
//           />
//         </div>
//         <h1 className="text-2xl font-bold text-[#173f63] uppercase">Quotation</h1>
//         <p className="mt-2 text-gray-700">
//           <strong>{quotation.quotationNumber}</strong> — {quotation.revisionLabel}
//         </p>
//         <p className="text-gray-500 text-sm">
//           Date Issued: {format(new Date(quotation.createdAt), "PPP")}
//         </p>
//       </div>

//       {/* CUSTOMER AND PROJECT INFO */}
//       <div className="grid grid-cols-2 gap-8 mb-8">
//         <div>
//           <h2 className="font-semibold text-gray-800 underline mb-2">Customer Information</h2>
//           <p><strong>Company:</strong> {customer?.companyName || "—"}</p>
//           <p><strong>Contact Person:</strong> {customer?.contactPerson || "—"}</p>
//           <p><strong>Email:</strong> {customer?.email || "—"}</p>
//           <p><strong>Address:</strong> {customer?.address || "—"}</p>
//         </div>

//         <div>
//           <h2 className="font-semibold text-gray-800 underline mb-2">Project Information</h2>
//           <p><strong>Project Name:</strong> {quotation.projectName || "—"}</p>
//           <p><strong>Request ID:</strong> {quotation.requestId}</p>
//           <p><strong>Status:</strong> {quotation.status}</p>
//         </div>
//       </div>

//       {/* ITEMS TABLE */}
//       <div className="mb-10">
//         <h2 className="font-semibold text-gray-800 underline mb-3">Quotation Items</h2>
//         {items.length === 0 ? (
//           <p className="text-gray-500 italic">No items found.</p>
//         ) : (
//           <table className="w-full border border-gray-300 border-collapse text-sm">
//             <thead className="bg-gray-100 text-gray-700">
//               <tr>
//                 <th className="border p-2 text-left">Item</th>
//                 <th className="border p-2 text-left">Scope of Work</th>
//                 <th className="border p-2 text-center">Qty</th>
//                 <th className="border p-2 text-right">Unit Price</th>
//                 <th className="border p-2 text-right">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50">
//                   <td className="border p-2 align-top">{item.itemName}</td>
//                   <td className="border p-2 align-top">{item.scopeOfWork}</td>
//                   <td className="border p-2 text-center align-top">{item.quantity}</td>
//                   <td className="border p-2 text-right align-top">{currency(item.unitPrice)}</td>
//                   <td className="border p-2 text-right align-top">{currency(item.totalPrice)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* SUMMARY */}
//       <div className="flex justify-end">
//         <div className="w-1/3 text-sm">
//           <div className="flex justify-between border-b py-1">
//             <span>Subtotal:</span>
//             <span>{currency(grandTotal)}</span>
//           </div>
//           {quotation.vat ? (
//             <div className="flex justify-between border-b py-1">
//               <span>VAT ({quotation.vat}%):</span>
//               <span>{currency(vatAmount)}</span>
//             </div>
//           ) : null}
//           {quotation.markup ? (
//             <div className="flex justify-between border-b py-1">
//               <span>Markup ({quotation.markup}%):</span>
//               <span>{currency(markupAmount)}</span>
//             </div>
//           ) : null}
//           <div className="flex justify-between font-semibold py-2">
//             <span>Grand Total:</span>
//             <span>{currency(totalWithAddons)}</span>
//           </div>
//         </div>
//       </div>

//       {/* TERMS */}
//       <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
//         <div>
//           <h2 className="font-semibold text-gray-800 underline mb-2">Payment Terms</h2>
//           <p>{quotation.payment || "—"}</p>
//         </div>
//         <div>
//           <h2 className="font-semibold text-gray-800 underline mb-2">Delivery</h2>
//           <p>{quotation.delivery || "—"}</p>
//         </div>
//         <div>
//           <h2 className="font-semibold text-gray-800 underline mb-2">Validity</h2>
//           <p>{quotation.validity || "—"}</p>
//         </div>
//         <div>
//           <h2 className="font-semibold text-gray-800 underline mb-2">Warranty</h2>
//           <p>{quotation.warranty || "—"}</p>
//         </div>
//       </div>

//       {/* NOTES */}
//       <div className="mt-6">
//         <h2 className="font-semibold text-gray-800 underline mb-2">Notes</h2>
//         <p className="whitespace-pre-wrap">{quotation.quotationNotes || "—"}</p>
//       </div>

//       {/* FILES */}
//       {quotation.cadSketchFile && quotation.cadSketchFile.length > 0 && (
//         <div className="mt-8 text-sm">
//           <h2 className="font-semibold text-gray-800 underline mb-2">Attached Files</h2>
//           <ul className="list-disc ml-6 space-y-1">
//             {quotation.cadSketchFile.map((file) => (
//               <li key={file.id}>
//                 <a
//                   href={file.filePath}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:underline"
//                 >
//                   {file.name}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* FOOTER */}
//       <div className="mt-10 text-center text-gray-500 text-xs italic">
//         Prepared by CTIC Sales Department — This document is system-generated.
//       </div>
//     </div>
//   );
// }

// app/sales/s_customer_profile/s_customers/s_view_details/[customerId]/request_details/[requestId]/view_quotation/[quotationId]/components/PreviewDocumentViewOnly.tsx

"use client";

import React from "react";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MaterialRow {
  id: string;
  name: string;
  specification: string;
  quantity: number;
}

interface QuotationItem {
  itemName: string;
  scopeOfWork: string;
  materials: MaterialRow[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PreviewFile {
  id: string | number;
  name: string;
  filePath: string;
  url?: string;
}

interface Customer {
  id?: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  address?: string;
  phone?: string;
}

interface QuotationData {
  quotationNumber: string;
  revisionLabel: string;
  payment?: string;
  delivery?: string;
  warranty?: string;
  validity?: string;
  quotationNotes?: string;
  projectName?: string;
  vat?: number;
  markup?: number;
  cadSketchFile?: PreviewFile[];
  items?: QuotationItem[];
  customer?: Customer | null;
  createdAt?: string;
}

interface Props {
  quotation: QuotationData;
}

/** Helper functions **/
function getFileName(f: PreviewFile) {
  return f.name;
}

function getFilePath(f: PreviewFile) {
  return f.filePath;
}

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

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

function calculateSummary(items: QuotationItem[] = [], vat = 0, markup = 0) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);
  const numericMarkup = Number(markup);
  const numericVat = Number(vat);

  const markupAmount = subtotal * (numericMarkup / 100);
  const totalWithMarkup = subtotal + markupAmount;
  const vatAmount = totalWithMarkup * (numericVat / 100);
  const grandTotal = totalWithMarkup + vatAmount;

  return { subtotal, markupAmount, vatAmount, grandTotal };
};


export default function PreviewDocumentViewOnly({ quotation }: Props) {
  const {
    quotationNumber,
    revisionLabel,
    payment = "",
    delivery = "",
    warranty = "",
    validity = "",
    quotationNotes,
    projectName,
    vat = 0,
    markup = 0,
    cadSketchFile = [],
    items = [],
    customer,
    createdAt,
  } = quotation;

  const { subtotal, markupAmount, vatAmount, grandTotal } = calculateSummary(items, vat, markup);
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <main className="bg-[#ffedce] min-h-screen w-full">
      <div className="flex justify-end">
        <button
            className="text-sm px-4 py-2 bg-white border border-[#d2bda7] text-[#5a4632] rounded-3xl shadow hover:bg-[#fcd0d0] transition-all"
            onClick={handleBack}
          >
            &larr; Back
          </button>
      </div>
    <div className="font-sans p-4 flex justify-center min-h-screen">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 relative border border-gray-200">
        {/* Header */}
        <header className="h-30 rounded-2xl bg-gradient-to-r from-[#e3ae01] via-[#dc5034] to-[#faf0c5] p-4 mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="bg-white h-20 w-full rounded flex flex-row items-center justify-center space-x-3">
            <Image src="/cticlogo.png" alt="CTIC Logo" width={50} height={50} />
            <div className="flex flex-col text-center">
              <span className="font-extrabold text-xl">CANLUBANG TECHNO-INDUSTRIAL CORPORATION</span>
              <span className="text-red-500 italic text-xs font-serif">&quot;GEARING TOWARDS EXCELLENCE&quot;</span>
            </div>
          </div>
        </header>

        {/* Quotation Info */}
        <div className="text-right text-gray-700 mt-4">
          <p className="font-bold">Quotation No: {quotationNumber}</p>
          <p className="font-bold">Revision: {revisionLabel}</p>
        </div>
        {createdAt && <p className="text-sm">{format(new Date(createdAt), "MMMM d, yyyy")}</p>}

        {/* Customer Info */}
        {customer ? (
          <div className="mt-4 text-gray-700">
            <p className="font-bold text-xl">{customer.companyName}</p>
            <p className="font-semibold">{customer.address}</p>
            <div className="mt-3 text-sm space-y-1">
              <p><span className="font-bold underline">Attention:</span> {customer.contactPerson}</p>
              <p><span className="font-bold underline">Project:</span> <span className="uppercase">{projectName || "N/A"}</span></p>
            </div>
          </div>
        ) : (
          <p className="italic text-gray-500 text-sm mt-4">No customer information available.</p>
        )}

        {/* Intro */}
        {customer && (
          <section className="mt-4 text-sm text-gray-700 leading-relaxed">
            <p>Dear Ma&apos;am/Sir {customer.contactPerson?.split(" ")[0]},</p>
            <p>
              Thank you for considering Canlubang Techno-Industrial Corporation for your project needs.
              We are pleased to present our formal quotation for your approval and evaluation.
            </p>
          </section>
        )}

        {/* Scope of Work */}
        <section className="mt-6">
          <h2 className="font-bold underline text-gray-800 mb-2">SCOPE OF WORK:</h2>
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={idx} className="p-2 mb-2 border border-gray-200 rounded">
                <p className="font-semibold uppercase">{item.itemName}</p>
                <p className="text-sm pl-2 whitespace-pre-wrap">{item.scopeOfWork}</p>
              </div>
            ))
          ) : (
            <p className="italic text-gray-500 text-sm">No scope of work defined.</p>
          )}
        </section>

        {/* Materials */}
        <section className="mt-6">
          <h2 className="font-bold underline text-gray-800 mb-2">MATERIALS:</h2>
          {items.some(i => i.materials.length > 0) ? (
            items.map((item, idx) => (
              <div key={idx} className="p-2 mb-2 border border-gray-200 rounded">
                <p className="font-semibold uppercase">{item.itemName}</p>
                <ul className="list-disc pl-6 text-sm">
                  {item.materials.map((mat, i2) => (
                    <li key={i2}>{mat.name} ({mat.specification}) - Qty: {mat.quantity}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="italic text-gray-500 text-sm">No materials listed.</p>
          )}
        </section>

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

        {/* Totals */}
        <section className="mt-6 flex flex-col sm:flex-row justify-between gap-6">
          {/* Quotation Details */}
        <div className="space-y-4 text-sm text-gray-700 mb-4 bg-[#fef4e4] w-[400px] p-2 rounded">
          <div></div>
          <p className="flex justify-between"><span className="font-bold">Payment:</span> {formatField("Payment", payment)}</p>
          <p className="flex justify-between"><span className="font-bold">Delivery:</span> {formatField("Delivery", delivery)}</p>
          <p className="flex justify-between"><span className="font-bold">Validity:</span> {formatField("Validity", validity)}</p>
          <p className="flex justify-between"><span className="font-bold">Warranty:</span> {formatField("Warranty", warranty)}</p>
        </div>
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

        {/* Notes */}
        <div className="mt-6">
          <h3 className="font-semibold">Additional Notes:</h3>
          <p className="text-sm bg-gray-50 border rounded p-3">
            {quotationNotes || "No additional notes provided."}
          </p>
        </div>

        {/* CAD Sketch */}
        <div className="mt-6 border-b pb-4">
          <h3 className="font-semibold">CAD Sketch</h3>
          {cadSketchFile.length > 0 ? (
            cadSketchFile.map((file, i) => (
              <div key={i} className="mt-2">
                <a href={getFilePath(file)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {getFileName(file)}
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-sm">No uploaded file.</p>
          )}
        </div>
        {/* FOOTER */}
      <div className="mt-4 text-center text-gray-500 text-xs italic">
         Prepared by CTIC Sales Department — This document is system-generated.
       </div>
      </div>
    </div>
    </main>
  );
}
