// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Header } from "@/components/header";
// import { Package, Truck, FileCheck, CheckCircle2 } from "lucide-react"; // added icons

// type QuotationRequest = {
//   id: number;
//   project_name: string;
//   mode: string | null;
//   status: string;
//   created_at: string;
// };

// const steps = ["Quotation", "Purchase Order", "Processing", "Out for Delivery", "Completed"]; // added placeholders

// const TrackMyOrderPage = () => {
//   const { id } = useParams();
//   const [request, setRequest] = useState<QuotationRequest | null>(null);
//   const [activeStep, setActiveStep] = useState("Quotation");

//   useEffect(() => {
//     const fetchRequest = async () => {
//       try {
//         const res = await fetch(`/api/sales/my_request/${id}`);
//         if (!res.ok) throw new Error("Failed to fetch request");
//         const data = await res.json();
//         setRequest(data);
//         if (data.status) setActiveStep(data.status);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     if (id) fetchRequest();
//   }, [id]);

//   if (!request) {
//     return (
//         <div className="min-h-screen bg-[#fed795]">
//           <div className="border-2 shadow-md">
//             <Header />
//           </div>
//           <div className="flex justify-center items-center h-[80vh]">
//             <p className="text-lg text-gray-600">Loading request...</p>
//           </div>
//         </div>
//     );
//   }

//   return (
//       <div className="bg-[#fed795] min-h-screen w-full">
//         {/* Header */}
//         <div className="border-2 shadow-md">
//           <Header />
//         </div>

//         {/* White Container */}
//         <div className="flex justify-center px-4 sm:px-6 py-8 sm:py-12">
//           <div className="bg-white rounded-2xl shadow-lg 
//                           p-4 sm:p-6 md:p-8 lg:p-10 
//                           w-full max-w-4xl 
//                           max-h-[90vh] overflow-y-auto">
            
//             {/* Order Info */}
//             <h2 className="text-2xl sm:text-3xl font-bold text-[#482b0e] mb-6">
//               Tracking Request #{request.id}
//             </h2>
//             <div className="space-y-2 mb-10">
//               <p className="text-[#482b0e]/90">
//                 <span className="font-semibold">Project:</span>{" "}
//                 {request.project_name}
//               </p>
//               <p className="text-[#482b0e]/90">
//                 <span className="font-semibold">Mode:</span>{" "}
//                 {request.mode || "N/A"}
//               </p>
//               <p className="text-[#482b0e]/90">
//                 <span className="font-semibold">Status:</span> {request.status}
//               </p>
//               <p className="text-sm text-gray-700 mt-2">
//                 Requested at:{" "}
//                 {new Date(request.created_at).toLocaleDateString("en-US", {
//                   year: "numeric",
//                   month: "short",
//                   day: "numeric",
//                 })}{" "}
//                 {new Date(request.created_at).toLocaleTimeString("en-US", {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                   hour12: true,
//                 })}
//               </p>
//             </div>

//             {/* Progress Circles */}
//             <div className="px-2 sm:px-6 py-6">
//               <div className="flex justify-between items-center relative">
//                 {steps.map((step, idx) => {
//                   const isActive = activeStep === step;

//                   return (
//                     <div
//                       key={step}
//                       className="flex flex-col items-center text-center flex-1 relative"
//                     >
//                       {/* Circle */}
//                       <div
//                         className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition cursor-pointer z-10
//                           ${
//                             isActive
//                               ? "bg-[#f59e0b] text-white"
//                               : "bg-gray-300 text-gray-500"
//                           }`}
//                         onClick={() => setActiveStep(step)}
//                       >
//                         {step === "Quotation" ? (
//                           <Package className="w-6 h-6" />
//                         ) : step === "Purchase Order" ? (
//                           <Truck className="w-6 h-6" />
//                         ) : step === "Processing" ? (
//                           <Truck className="w-6 h-6" />
//                         ) : (
//                           <CheckCircle2 className="w-6 h-6" />
//                         )}
//                       </div>

//                       {/* Label */}
//                       <button
//                         onClick={() => setActiveStep(step)}
//                         className={`mt-3 pb-1 font-semibold text-lg transition border-b-2 ${
//                           isActive
//                             ? "text-[#5a2347] border-[#5a2347]"
//                             : "text-gray-500 border-transparent hover:text-[#5a2347]"
//                         }`}
//                       >
//                         {step}
//                       </button>

//                       {/* Connector */}
//                       {idx < steps.length - 1 && (
//                         <div
//                           className={`absolute top-6 left-1/2 w-full h-1 
//                             ${
//                               activeStep === steps[idx + 1] || activeStep === step
//                                 ? "bg-[#f59e0b]"
//                                 : "bg-gray-300"
//                             }`}
//                         ></div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Step Content */}
//             <div className="bg-gray-50 rounded-xl shadow-inner p-6 mt-6 space-y-4">
//               {activeStep === "Quotation" && (
//                 <p className="text-gray-700 text-lg">
//                   Your quotation details are being processed.
//                 </p>
//               )}
//               {activeStep === "Purchase Order" && (
//                 <p className="text-gray-700 text-lg">
//                   No purchase order uploaded.
//                 </p>
//               )}
//               {activeStep === "Step 3" && (
//                 <p className="text-gray-700 text-lg">
//                   No purchase order uploaded.
//                 </p>
//               )}
//               {activeStep === "Step 4" && (
//                 <p className="text-gray-700 text-lg">
//                   No purchase order uploaded.
//                 </p>
//               )}
//               {activeStep === "Step 5" && (
//                 <p className="text-gray-700 text-lg">
//                   No purchase order uploaded.
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//   );
// };

// export default TrackMyOrderPage;

// app/customer/cus_myrequest/track_my_order/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/header-customer";
import { Package, Truck, FileCheck, CheckCircle2, LucidePersonStanding, FileText, Upload } from "lucide-react"; // added icons
import { format } from "date-fns";

interface PurchaseOrder {
  id: number;
  quotationId: number;
  poNumber: string;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  status: string;
}

type QuotationRequest = {
  id: number;
  project_name: string;
  mode: string | null;
  status: string;
  created_at: string;
  quotation?: QuotationDetail | null;
  purchaseOrder?: PurchaseOrder | null;
};

type QuotationDetail = {
  id: number;
  createdAt: string;
  file_url?: string;
  status: string;
  quotationNumber: string;
};

const statusColors: Record<string, string> = {
  Pending: "bg-gray-200 text-gray-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  "Revision Requested": "bg-yellow-100 text-yellow-700",
};

const steps = ["Quotation", "Purchase Order", "Processing", "Out for Delivery", "Completed"]; // added placeholders

const TrackMyOrderPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [activeStep, setActiveStep] = useState("Quotation");
  const [showQuotationTable, setShowQuotationTable] = useState(false);
  const [showPOTable, setShowPOTable] = useState(false);

const fetchRequest = useCallback(async () => {
  if (!id || isNaN(Number(id))) return;

  try {
    console.log("Fetching request for ID:", id);
    const res = await fetch(`/api/customer/q_request/${id}`);
    if (!res.ok) throw new Error("Failed to fetch request");

    const data = await res.json();

    // ✅ You can destructure directly from `data`
    const { quotation, purchaseOrder, quotationStatus, ...requestData } = data;

    // ✅ Combine into single state (without using any)
    setRequest({
      ...requestData,
      quotation,
      purchaseOrder,
      quotationStatus,
    });

    // ✅ Sync stepper with status
    if (quotationStatus) setActiveStep(quotationStatus);
  } catch (err) {
    console.error("Error fetching request:", err);
  }
}, [id]);

useEffect(() => {
  if (!request) return;

  if (request?.quotation?.status === "approved" && !request.purchaseOrder) {
    setActiveStep("Purchase Order");
  } else if (request?.purchaseOrder) {
    setActiveStep("Processing");
  } else {
    setActiveStep("Quotation");
  }
}, [request]);


  useEffect(() => {
    const handleStatusUpdate = () => fetchRequest();

    fetchRequest();

    window.addEventListener("quotation-status-updated", handleStatusUpdate as EventListener);
    
    return () => {
      window.removeEventListener("quotation-status-updated", handleStatusUpdate as EventListener);
    };
  }, [fetchRequest]);

  if (!request) {
    return (
        <div className="min-h-screen bg-[#ffedce]">
          <div className="">
            <CustomerHeader />
          </div>
          <div className="flex justify-center items-center h-[80vh]">
            <p className="text-lg text-gray-600 italic animate-pulse">Loading request...</p>
          </div>
        </div>
    );
  }

  const quotation = request.quotation;
  const po = request.purchaseOrder;
  const handleBack = () => router.back();

  return (
      <div className="bg-[#ffedce] min-h-screen w-full /font-sans">
        {/* Header */}
        <div className="">
          <CustomerHeader />
        </div>

         <div className="flex justify-end mr-5 mt-2">
          <button
            className="text-sm px-4 py-1 bg-white border border-[#d2bda7] text-[#5a4632] rounded-3xl shadow hover:bg-[#f59f0b1b] transition-all cursor-pointer"
            onClick={handleBack}
          >
            &larr; Back
          </button></div>
        {/* White Container */}
        <div className="flex justify-center px-4 sm:px-6 py-4">
          <div className="bg-white rounded-2xl shadow-lg 
                          p-4 sm:p-6 md:p-8 lg:p-10 
                          w-full overflow-visible">
            
            {/* Order Info */}
            <h2 className="text-lg sm:text-3xl font-bold text-gray-700 mb-4">
              Tracking Request #{request.id}
            </h2>
            <div className="space-y-2 mb-10">
              <p className="text-gray-700">
                <span className="font-semibold">Project:</span>{" "}
                <span className="uppercase">{request.project_name}</span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Mode:</span>{" "}
                {request.mode || "N/A"}
              </p>
              <p className="text-gray-700 font-semibold">Status: 
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[request.status] || ""}`}>
                         {request.status}
                      </span>
              </p>
              <p><span className="mt-2 font-semibold text-gray-700">Requested at:{" "}</span>
                <span className="italic">{new Date(request.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                {new Date(request.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}</span>
              </p>
            </div>

            {/* Progress Circles */}
            <div className="px-2 sm:px-6 py-6">
              <div className="flex justify-between items-center relative">
                
                {steps.map((step, idx) => {
                  const isActive = activeStep === step;
                  const isQuotationReady = quotation && step === "Quotation";
                  const isPOUploaded = !!request?.purchaseOrder;

                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center text-center flex-1 relative"
                    >
                      {/* Main Circle */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition cursor-pointer z-10 ${
                            step === "Purchase Order"
                              ? isPOUploaded
                                ? "bg-green-500 text-white"
                                : isQuotationReady
                                ? "bg-[#f59e0b] text-white"
                                : "bg-gray-300 text-gray-500"
                              : step === "Quotation"
                              ? isQuotationReady
                                ? "bg-green-500 text-white"
                                : isActive
                                ? "bg-[#f59e0b] text-white"
                                : "bg-gray-300 text-gray-500"
                              : isActive
                              ? "bg-[#f59e0b] text-white"
                              : "bg-gray-300 text-gray-500"
                          }`}
                          onClick={() => setActiveStep(step)}
                        >
                          {step === "Quotation" ? (
                            <Package className="w-6 h-6" />
                          ) : step === "Purchase Order" ? (
                            <FileCheck className="w-6 h-6" />
                          ) : step === "Processing" ? (
                            <LucidePersonStanding className="w-6 h-6" />
                          ) : step === "Out for Delivery" ? (
                            <Truck className="w-6 h-6" />
                          ) : (
                            <CheckCircle2 className="w-6 h-6" />
                          )}
                        </div>

                      {/* Label */}
                      <button
                        onClick={() => setActiveStep(step)}
                        className={`mt-3 pb-1 font-semibold text-lg transition border-b-2 ${
                          isActive
                            ? "text-gray-700 border-gray-700"
                            : "text-gray-300 border-transparent hover:text-gray-700"
                        }`}
                      >
                        {step}
                      </button>

                      {/* Sub Circle - must be quotation status*/}
                      {step === "Quotation" && quotation?.status && ["approved", "rejected", "revision_requested"].includes(quotation.status) && (
                        <div className="absolute top-1/2 right-0 translate-x-6 -translate-y-1/2 flex flex-col items-center">
                          <div
                            onClick={() => setActiveStep("Quotation Status")}
                            title={`Quotation ${quotation.status.replace("_", " ")}`}
                            className={`w-4 h-4 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${
                              quotation.status === "approved"
                                ? "bg-green-500 border-green-600"
                                : quotation.status === "rejected"
                                ? "bg-red-500 border-red-600"
                                : quotation.status === "revision_requested"
                                ? "bg-yellow-400 border-yellow-500"
                                : "bg-gray-300 border-gray-400"
                            }`}
                          ></div>
                          <span className="text-[10px] text-gray-600 mt-1 capitalize">
                            {quotation.status.replace("_", " ")}
                          </span>
                          {activeStep === "Quotation Status" && (
                          <span className="text-[10px] text-gray-700 mt-1 capitalize bg-white px-2 py-[2px] rounded shadow-sm border">
                            {quotation.status.replace("_", " ")}
                          </span>
                        )}
                        </div>
                      )}

                      {/* Connector */}
                      {idx < steps.length - 1 && (
                        <div
                          className={`absolute top-6 left-1/2 w-full h-1 transition-all duration-300 
                            ${
                              step === "Quotation" && quotation?.status
                                ? quotation.status === "approved"
                                  ? "bg-green-500"
                                  : quotation.status === "rejected"
                                  ? "bg-red-500"
                                  : quotation.status === "revision_requested"
                                  ? "bg-yellow-400"
                                  : "bg-gray-300"
                              : activeStep === steps[idx + 1] || activeStep === step
                                ? "bg-[#f59e0b]"
                                : "bg-gray-300"
                            }`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-[#f59f0b1b] rounded-xl shadow-inner p-6 mt-6 space-y-4">
              {/* QUOTATION STEP */}
              {activeStep === "Quotation" && (
                <>
                {!quotation ? (
                  <p className="text-gray-700 text-lg">
                    Your quotation details are being processed, please wait.
                  </p>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 text-lg">
                      Your quotation is now ready. Please click <b>Open</b>
                    </p>
                    <button
                      onClick={() => setShowQuotationTable(!showQuotationTable)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer transition"
                    >
                      {showQuotationTable ? "Hide Details" : "Open"}
                    </button>
                  </div>
                )}

                {/* Quotation table */}
                {quotation && showQuotationTable && (
                  <div className="mt-4 border border-[#f59e0b] rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f59f0bb7] text-white">
                        <tr>
                          <th className="p-3">Date Created</th>
                          <th className="p-3">Time Created</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Quotation Files</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t bg-white">
                          <td className="p-3">
                            {format(new Date(quotation.createdAt), "MMM d, yyy")}
                          </td>
                          <td className="p-3">
                            {format(new Date(quotation.createdAt), "hh:mm a")}
                          </td>
                          <td className="p-3">{quotation.status}</td>
                          <td className="p-3">
                            <button
                              onClick={() =>
                                router.push(
                                  `/customer/cus_myrequest/track_my_order/quotation_request/${request.id}`
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 cursor-pointer transition"
                            >
                              <FileText className="inline w-6 h-6"/> {quotation.quotationNumber}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </>
              )}

              {/* {activeStep === "Purchase Order" && (
                <p className="text-gray-700 text-lg">
                  No purchase order uploaded.
                </p>
              )} */}
              
              {/* PURCHASE ORDER STEP */}
{activeStep === "Purchase Order" && (
  <>
    {request?.quotation?.status === "approved" && !request?.purchaseOrder ? (
      <div className="text-gray-700 text-lg flex justify-between items-center">
        <span>
          <strong>Quotation Approved!</strong> Please upload your
          Purchase Order to continue.
        </span>
        <a
          href={`/customer/cus_myrequest/track_my_order/purchase_order/?quotationId=${request?.quotation?.id}&requestId=${request.id}`}
          className="inline-flex items-center gap-2 bg-[#f59e0b] text-white px-4 py-2 rounded-lg hover:bg-[#d48a0a] transition"
        >
          <Upload className="w-4 h-4" />
          Upload Purchase Order
        </a>
      </div>
    ) : request?.purchaseOrder ? (
      <div className="text-gray-700 text-lg">
        <div className="flex justify-between items-center">
          <p>
            A purchase order has been uploaded. Click <b>Open</b> to view details.
          </p>
          <button
            onClick={() => setShowPOTable(!showPOTable)}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            {showPOTable ? "Hide Details" : "Open"}
          </button>
        </div>

        {/* PO DETAILS TABLE */}
        {po && showPOTable && (
          <div className="mt-4 border border-[#f59e0b] rounded-lg overflow-hidden bg-white shadow-md">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f59f0b] text-white">
                <tr>
                  <th className="p-3">Date Uploaded</th>
                  <th className="p-3">Time Uploaded</th>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">File</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-white hover:bg-gray-50">
                  <td className="p-3">
                    {po.uploadedAt ? format(new Date(po.uploadedAt), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="p-3">
                    {po.uploadedAt ? format(new Date(po.uploadedAt), "hh:mm a") : "—"}
                  </td>
                  <td className="p-3">{po.poNumber || "—"}</td>
                  <td className="p-3 capitalize">{po.status || "Pending"}</td>
                  <td className="p-3">
                    {po.filePath ? (
                      <a
                        href={po.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        {po.fileName || po.filePath.split("/").pop()}
                      </a>
                    ) : (
                      <span className="text-gray-400">No file</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    ) : (
      <p className="text-gray-700 text-lg">Waiting for quotation approval.</p>
    )}
  </>
)}


              {activeStep === "Processing" && (
                <p className="text-gray-700 text-lg">
                  No purchase order uploaded. This section will update once your order progresses further.
                </p>
              )}
              {activeStep === "Out for Delivery" && (
                <p className="text-gray-700 text-lg">
                  No purchase order uploaded. This section will update once your order progresses further.
                </p>
              )}
              {activeStep === "Completed" && (
                <p className="text-gray-700 text-lg">
                  No purchase order uploaded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default TrackMyOrderPage;
