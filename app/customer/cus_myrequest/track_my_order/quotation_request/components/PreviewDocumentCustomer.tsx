// app/customer/cus_myrequest/track_my_order/quotation_request/[id]/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { PreviewDocument } from "@/app/sales/s_pending_customer_request/pending_view/[id]/components/quotationcomponents/PreviewDocument";
// import { toast } from "sonner";

// export default function CustomerQuotationView({ params }: { params: { id: string } }) {
//     const [quotation, setQuotation] = useState<any | null>(null);
//     const [loading, setLoading] = useState(true);

// useEffect(() => {
//     const fetchQuotation = async () => {
//         try {
//             const res = await fetch(`/api/sales/quotations/${params.id}`);
//             const data = await res.json();

//             if (!res.ok || !data.success) {
//                 toast.error(data.error || "Failed to fetch quotation.");
//             }

//             setQuotation(data.data);
//         } catch (err) {
//             console.error("Failed to load quotation.");
//         } finally {
//             setLoading(false);
//         }
//         };

//     fetchQuotation();
//     }, [params.id]);

//     if (loading) return <p className="p-4 text-gray-500 italic">Loading quotation...</p>;
//     if (!quotation) return <p className="p-4 text-red-500 italic">Quotation not found.</p>;

// return (
//     <PreviewDocument 
//         items={quotation.items || []}
//         payment={quotation.payment || ""}
//         delivery={quotation.delivery || ""}
//         validity={quotation.validity || ""}
//         warranty={quotation.warranty || ""}
//         quotationNotes={quotation.quotationNotes || ""}
//         requestId={quotation.requestId}
//         projectName={quotation.projectName}
//         vat={Number(quotation.vat)}
//         markup={Number(quotation.markup)}
//         cadSketchFile={quotation.cadSketchFile || []}
//         revisionLabel={quotation.revisionLabel}
//         baseQuotationId={quotation.baseQuotationId}
//         customer={quotation.customer || null}
//         quotationNumber={quotation.quotationNumber}
//         mode={quotation.mode}
//         isSent={true} // hide send button
//         onBack={() => history.back()}
//         onSend={() => {}}
//     />
// );
// }

// app/customer/cus_myrequest/track_my_order/quotation_request/[id]/page.tsx

// "use client";

// import React, { useEffect, useState } from "react";
// import { PreviewDocument } from "@/app/sales/s_pending_customer_request/pending_view/[id]/components/quotationcomponents/PreviewDocument";
// import { toast } from "sonner";
// import { CustomerHeader } from "@/components/header-customer";

// // export default function CustomerQuotationView({ params }: { params: { id: string } }) {
// export default function CustomerQuotationView({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = React.use(params);

//     const [quotation, setQuotation] = useState<any | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [confirmAction, setConfirmAction] = useState<"accepted" | "rejected" | "revision_requested" | null>(null);
//     const [showConfirm, setShowConfirm] = useState(false);

// const handleCustomerAction = async (status: "accepted" | "rejected" | "revision_requested") => {
//     try {
//         const res = await fetch(`/api/customer/q_request/${params.id}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ status }),
//         });

//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to update status.");

//         toast.success(`Quotation ${status.replace("_", " ")} successfully!`);
//         history.back();
//     } catch (err) {
//         console.error(err);
//         toast.error("Failed to process your action.");
//     }
// };

// useEffect(() => {
//     const fetchQuotation = async () => {
//         try {
//             const res = await fetch(`/api/sales/quotations/${id}`);
//             const data = await res.json();

//             if (!res.ok || !data.success) {
//                 toast.error(data.error || "Failed to fetch quotation.");
//             }

//             setQuotation(data.data);
//         } catch (err) {
//             console.error("Failed to load quotation.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     fetchQuotation();
// }, [id]);

// const handleCustomerAction = async (status: "accepted" | "rejected" | "revision_requested") => {

//     setConfirmAction(status);
//     setShowConfirm(true);
// };

// const confirmCustomerAction = async () => {
//     if (!confirmAction) return;

//     try {
//         const res = await fetch(`/api/customer/q_request/${quotation.requestId}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ status: confirmAction }),
//         });

//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to update status.");

//         toast.success(`Quotation ${confirmAction.replace("_", " ")} successfully!`);

//         window.dispatchEvent(new CustomEvent("quotation-status-updated", { detail: { status: confirmAction } }));

//         setShowConfirm(false);
//         setConfirmAction(null);

//         history.back()
//     } catch (err) {
//         console.error(err);
//         toast.error("Failed to process your action.");
//     }
// };

// if (loading) return <p className="p-4 text-gray-500 italic">Loading quotation...</p>
// if (!quotation) return <p className="p-4 text-red-500 italic">Quotation not found.</p>

// return (
//     <main className="">
//     <>
//     <CustomerHeader />
//     <PreviewDocument 
//         items={quotation.items || []}
//         payment={quotation.payment || ""}
//         delivery={quotation.delivery || ""}
//         validity={quotation.validity || ""}
//         warranty={quotation.warranty || ""}
//         quotationNotes={quotation.quotationNotes || ""}
//         requestId={quotation.requestId}
//         projectName={quotation.projectName}
//         vat={Number(quotation.vat)}
//         markup={Number(quotation.markup)}
//         cadSketchFile={quotation.cadSketchFile || []}
//         revisionLabel={quotation.revisionLabel}
//         baseQuotationId={quotation.baseQuotationId}
//         customer={quotation.customer || null}
//         quotationNumber={quotation.quotationNumber}
//         //mode="customer"
//         isSent={true} // hide send button
//         onBack={() => history.back()}
//         onSend={() => {}}
//         //onCustomerAction={handleCustomerAction}
//     />

//     {showConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
//                 <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Action</h2>
//                 <p className="text-gray-600 mb-2">
//                     Are you sure you want to {" "}
//                 <b className="capitalized">{confirmAction?.replace("_", " ")}</b> this quotation?
//                 </p>
//                 <div className="flex justify-center gap-3">
//                     <button
//                         onClick={() => setShowConfirm(false)}
//                         className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={confirmCustomerAction}
//                         className={`px-4 py-2 rounded-md text-white ${
//                             confirmAction === "accepted"
//                                 ? "bg-green-600 hover:bg-green-700"
//                                 : confirmAction === "rejected"
//                                 ? "bg-red-600 hover:bg-red-700"
//                                 : "bg-yellow-500 hover:bg-yellow-600"
//                         }`}
//                     >
//                         Confirm
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )}
//     </>
//     </main>
// );
// }

// app/customer/cus_myrequest/track_my_order/quotation_request/cumponents/PreviewDocumentCustomer.page.tsx

"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PreviewFile, QuotationItem, Customer } from "@/app/sales/types/quotation";
import { useRouter } from "next/navigation";

type PreviewDocumentCustomerProps = {
  items?: QuotationItem[];
  payment: string;
  delivery: string;
  warranty: string;
  validity: string;
  quotationNotes?: string;
  requestId?: number;
  projectName?: string;
  vat: number;
  markup: number;
  cadSketchFile?: PreviewFile[];
  revisionLabel: string;
  baseQuotationId?: number;
  customer?: Customer | null;
  createdAt: string;
  quotationNumber: string;
  status: string;
  customerActionAt?: string;
  onBack: () => void;
  onCustomerAction: (status: "approved" | "rejected" | "revision_requested") => Promise<{ success: boolean; message?: string, timestamp: string }>;
};

/** Helper: get file name/path **/
function getFileName(f: PreviewFile) {
  return f instanceof File ? f.name : f.name;
}
function getFilePath(f: PreviewFile) {
  return f instanceof File ? URL.createObjectURL(f) : f.filePath;
}

/** Helper: field formatting **/
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
    const num = Number(count.split("-")[0]); // handles ranges like 3-4
    if (isNaN(num) || num === 1 || num === 0) {
      return unit.replace(/s$/, ""); // singular for 0 and 1
    }
    return unit.endsWith("s") ? unit : unit + "s";
  };

  const formattedUnit =
    /^\d+(-\d+)?$/.test(numberPart) && unitPart
      ? pluralize(numberPart, unitPart)
      : unitPart;

  switch (label) {
    case "Delivery":
      if (/day|week|month/.test(unitPart)) {
        return `${numberPart} working ${formattedUnit.includes("day") ? "days" : formattedUnit} upon receipt of P.O.`;
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

/** Safe summary calculator **/
function calculateSummary(items: QuotationItem[] = [], vat = 0, markup = 0) {
  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.totalPrice) || 0),
    0
  );
  const markupAmount = subtotal * (markup / 100);
  const totalWithMarkup = subtotal + markupAmount;
  const vatAmount = totalWithMarkup * (vat / 100);
  const grandTotal = totalWithMarkup + vatAmount;
  return { subtotal, markupAmount, vatAmount, grandTotal };
}

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function PreviewDocumentCustomer({
  items = [],
  payment,
  delivery,
  warranty,
  validity,
  quotationNotes,
  quotationNumber,
  revisionLabel,
  customer,
  createdAt,
  onBack,
  vat,
  markup,
  projectName,
  status,
  customerActionAt,
  cadSketchFile = [],
  onCustomerAction,
}: PreviewDocumentCustomerProps) {

  // 🧮 Memoized safe totals
  const { subtotal, markupAmount, vatAmount, grandTotal } = useMemo(
    () => calculateSummary(items, vat, markup),
    [items, vat, markup]
  );

 const [actionStatus, setActionStatus] = useState<
  "none" | "approved" | "rejected" | "revision_requested"
>(
  status === "approved" || 
  status === "rejected" || 
  status === "revision_requested" 
    ? status 
    : "none"
);

const [actionTimestamp, setActionTimestamp] = useState<string | null>(
  customerActionAt 
    ? format(new Date(customerActionAt), "MMM d, yyyy, h:mm a") 
    : null
);

  const router = useRouter();

  // const handleCustomerAction = (status: "approved" | "rejected" | "revision_requested") => {
  //   onCustomerAction(status);
  //   setActionStatus(status);
  //   setActionTimeStamp(format(new Date(), "MMM d, yyyy, h:mm a"));

  //   if (status === "approved") {
  //     toast.success("Quotation approved succssfully!");
  //   } else if (status === "rejected") {
  //     toast.error("Quotation rejected.");
  //   } else if (status === "revision_requested") {
  //     toast("Revision request sent.");
  //   }
  // };

  const handleCustomerActionInternal = async (selectedStatus: "approved" | "rejected" | "revision_requested") => {
    try {
      const result = await onCustomerAction(selectedStatus);

      if (!result.success) {
        toast.error(result.message || "Failed to update quotation.");
        return;
      }

      setActionStatus(selectedStatus);
      setActionTimestamp(result.timestamp 
        ? format(new Date(result.timestamp), "MMM d, yyyy, h:mm a")
        : format(new Date(), "MMM d, yyyy, h:mm a"));

      router.refresh();

      if (selectedStatus === "approved") toast.success("Quotation approved successfully!");
      else if (selectedStatus === "rejected") toast.error("Quotation rejected.");
      else toast("Revision request sent.");
    } catch (err) {
      console.error("Error updating status",  err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (!items.length) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 italic">
        Loading quotation details...
      </div>
    );
  }

  return (
    <div className="font-sans p-4 sm:p-6 md:p-8 flex justify-center min-h-screen">
        
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 sm:p-8 relative border border-gray-200">

        {/* Header */}
        <header className="h-30 rounded-2xl bg-gradient-to-r from-[#e3ae01] via-[#dc5034] to-[#faf0c5] p-4 mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="bg-white h-20 w-full rounded flex flex-row items-center justify-center space-x-3 mb-4 sm:mb-0">
            <div>
              <Image src="/cticlogo.png" alt="CTIC" width={50} height={50} />
            </div>
            <div className="flex flex-col text-center">
              <span className="font-extrabold text-xl">
                CANLUBANG TECHNO-INDUSTRIAL CORPORATION
              </span>
              <span className="text-red-500 italic text-xs font-serif">
                &quot;GEARING TOWARDS EXCELLENCE&quot;!
              </span>
            </div>
          </div>
        </header>

        <div className="text-right text-gray-700 mt-5">
          <p className="font-bold"><span className="font-bold">Quotation No:</span> {quotationNumber}</p>
          <p className="font-bold"><span className="font-bold">Revision:</span> {revisionLabel}</p>
          {/* <p><span className="font-semibold">Request ID:</span> {requestId}</p> */}
        </div>

        {createdAt && <p className="text-sm">{format(new Date(createdAt), "MMMM d, yyyy")}</p>}

        {/* Customer Info */}
        {customer && (
          <div className="mt-4 text-sm text-gray-700">
            <p className="font-bold text-lg">{customer.companyName}</p>
            <p className="font-bold">{customer.address}</p>

            <div className="mt-4 text-sm text-gray-700 space-y-2"> 
                <p className="font-bold"><span className="font-bold underline">Attention:</span> {customer.contactPerson}</p>
                <p className="font-bold"><span className="font-bold underline">Project:</span> <span className="uppercase">{projectName || "N/A"}</span></p>
              </div>
          </div>
        )}

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
        <footer className="flex justify-between items-center gap-4 mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
          >
            Back
          </button>

          {actionStatus !== "none" ? (
            <div className="text-sm text-gray-700 italic">
              {actionStatus === "approved" && (
                <p>
                  This quotation has been <span className="font-semibold text-green-600">approved</span>
                  {customer && ` by ${customer.contactPerson}`}.<br/>
                  <span className="text-gray-500">{actionTimestamp}</span>
                </p>
              )}
              {actionStatus === "rejected" && (
                <p>
                  This quotation has been <span className="font-semibold text-red-600">rejected</span>.
                  {customer && ` by ${customer.contactPerson}`}<br />
                  <span className="text-gray-500">{actionTimestamp}</span>
                </p>
              )}
              {actionStatus === "revision_requested" && (
                <p>
                  Revision has been <span className="font-semibold text-yellow-600">requested</span>.
                  <br />
                  <span className="text-gray-500">{actionTimestamp}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
            <button
              onClick={() => handleCustomerActionInternal("approved")}
              
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer"
            >
              Approve
            </button>
            <button
              onClick={() => handleCustomerActionInternal("revision_requested")}
              className="px-6 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer"
            >
              Request Revision
            </button>
            <button
              onClick={() => handleCustomerActionInternal("rejected")}
              className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Reject
            </button>
          </div>
          )}
        </footer>
      </div>
    </div>
  );
}
