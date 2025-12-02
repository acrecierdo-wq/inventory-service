"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/header-customer";
import {
  Package,
  Truck,
  FileCheck,
  CheckCircle2,
  LucidePersonStanding,
  FileText,
  Upload,
} from "lucide-react";
import { format } from "date-fns";

// TYPES ---------------------------------------------------------
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

// Colors ----------------------------------------------------------
const statusColors: Record<string, string> = {
  Pending: "bg-gray-200 text-gray-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  "Revision Requested": "bg-yellow-100 text-yellow-700",
};

// The NEW simplified progress steps ------------------------------
const steps = ["Processing", "Out for Delivery", "Completed"];

// MAIN COMPONENT --------------------------------------------------
const TrackMyOrderPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [activeStep, setActiveStep] = useState("Processing");
  const [showQuotationTable, setShowQuotationTable] = useState(false);
  const [showPOTable, setShowPOTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [phaseUpdates, setPhaseUpdates] = useState<Record<number, { status: string; notes?: string; created_at: string }[]>>({});

  // Fetch phase updates from sales API
const fetchPhaseUpdates = useCallback(async () => {
  if (!id) return;

  try {
    const res = await fetch(`/api/sales/phase_updates?requestId=${id}`);
    if (!res.ok) throw new Error("Failed to fetch phase updates");

    const data = await res.json();

    // Create a map with arrays of updates per phase
    const updatesMap: Record<number, { status: string; notes?: string; created_at: string }[]> = {};
    data.data.forEach((update: any) => {
      if (!updatesMap[update.phaseIndex]) updatesMap[update.phaseIndex] = [];
      updatesMap[update.phaseIndex].push(update);
    });

    // Sort each phase array by newest first
    Object.keys(updatesMap).forEach((key) => {
      updatesMap[Number(key)].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    setPhaseUpdates(updatesMap);
  } catch (err) {
    console.error("Error fetching phase updates:", err);
  }
}, [id]);


// Run on mount and when id changes
useEffect(() => {
  fetchPhaseUpdates();
}, [fetchPhaseUpdates]);

const getPhaseIndex = (phase: string): number => {
  switch (phase) {
    case "Material Procurement": return 0;
    case "Fabrication Process": return 1;
    case "Finalization": return 2;
    case "Out for Delivery":
    case "Ready for Pickup":
    case "Dropoff":
      return 3; // last phase
    default:
      return 3;
  }
};

  const modePhaseLabel: Record<string, string> = {
  Delivery: "Out for Delivery",
  Pickup: "Ready for Pickup",
  Other: "Out for Delivery",
  // add more modes if needed
};

const lastPhase = request?.mode ? modePhaseLabel[request.mode] || "Out for Delivery" : "Out for Delivery";

const phases = ["Material Procurement", "Fabrication Process", "Finalization", lastPhase];



  const phaseByMode: Record<string, string[]> = {

  };

// Expanded steps for the modal
const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

const togglePhase = (phase: string) => {
  setExpandedPhase((prev) => (prev === phase ? null : phase));
};

  // FETCH REQUEST -------------------------------------------------
  const fetchRequest = useCallback(async () => {
    if (!id || isNaN(Number(id))) return;

    try {
      const res = await fetch(`/api/customer/q_request/${id}`);
      if (!res.ok) throw new Error("Failed to fetch request");

      const data = await res.json();
      // keep original field names flexible
      const { quotation, purchaseOrder, quotationStatus, ...requestData } = data;

      setRequest({
        ...requestData,
        quotation,
        purchaseOrder,
        quotationStatus,
      });

      // Sync active step based on presence of purchase order or explicit status
      if (data.purchaseOrder) {
        setActiveStep("Processing");
      } else if (data.status && ["Out for Delivery", "Completed"].includes(data.status)) {
        setActiveStep(data.status);
      } else {
        setActiveStep("Processing");
      }
    } catch (err) {
      console.error("Error fetching request:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
    window.addEventListener("quotation-status-updated", fetchRequest as EventListener);
    return () => window.removeEventListener("quotation-status-updated", fetchRequest as EventListener);
  }, [fetchRequest]);

  if (!request) {
    return (
      <div className="min-h-screen bg-[#ffedce]">
        <CustomerHeader />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-lg text-gray-600 italic animate-pulse">Loading request...</p>
        </div>
      </div>
    );
  }

  const quotation = request.quotation;
  const po = request.purchaseOrder;

  // Helper: renders small stepper for processing/delivery/completed
  const renderStepper = () => {
    return (
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
        {steps.map((s, idx) => {
          const isActive = activeStep === s;
          // Completed if activeStep is later in array
          const activeIndex = steps.indexOf(activeStep);
          const isCompleted = activeIndex > idx;

          return (
            <div key={s} className="flex-1 text-center relative px-2">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center shadow-md transition cursor-pointer z-10
  ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-[#f59e0b] text-white" : "bg-gray-300 text-gray-600"}`}>
  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> 
   : s === "Processing" ? <LucidePersonStanding className="w-6 h-6" /> 
   : s === "Out for Delivery" ? <Truck className="w-6 h-6" /> 
   : <LucidePersonStanding className="w-6 h-6" />}
</div>

              <div className={`mt-3 text-sm font-semibold ${isActive ? "text-gray-700" : "text-gray-500"}`}>{s}</div>

              {idx < steps.length - 1 && (
                <div className={`absolute top-6 right-0 left-0 mx-auto h-1 w-full -translate-x-1/2 z-0`}
                     style={{
                       left: "50%",
                       transform: "translateX(50%)",
                     }}
                >
                  <div className={`h-1 rounded-full ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // UI START ------------------------------------------------------
  return (
    <div className="bg-[#ffedce] min-h-screen w-full">
      <CustomerHeader />

      {/* BACK BUTTON */}
      <div className="flex justify-end mr-5 mt-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-1 text-sm bg-white border border-[#d2bda7] text-[#5a4632] rounded-3xl shadow hover:bg-[#f59f0b1b] transition cursor-pointer"
        >
          ← Back
        </button>
      </div>

      <div className="flex justify-center p-4 sm:p-6">
  <div className="bg-white w-full rounded-2xl shadow-lg p-6 sm:p-10 flex gap-10">

  

   {/* ================= LEFT SIDE VERTICAL TRACKER ================= */}
<div className="w-72 bg-gray-100 border border-gray-300 rounded-xl p-6 shadow-sm">
  <h3 className="text-lg font-bold text-gray-700 mb-6">Request Progress</h3>

  {request && (() => {
    // Shared mapping for delivery mode
    const modePhaseLabel: Record<string, string> = {
      Delivery: "Out for Delivery",
      Pickup: "Ready for Pickup",
      Dropoff: "Out for Dropoff",
    };

    // Compute the last phase once
    const lastPhase = request.mode ? modePhaseLabel[request.mode] ?? "Out for Delivery" : "Out for Delivery";

    // Shared phases array
    const phases = ["Material Procurement", "Fabrication Process", "Finalization", lastPhase];

    const getDescription = (phase: string) => {
      if (phase === "Material Procurement") return "Materials are being sourced";
      if (phase === "Fabrication Process") return "Order is being fabricated";
      if (phase === "Finalization") return "Final touches are being done";
      if (phase === lastPhase) {
        if (request.mode === "Pickup") return "Ready for customer pickup";
        if (request.mode === "Dropoff") return "Order is being dropped off";
        return "Courier is delivering your item";
      }
      return "";
    };

    const getIcon = (phase: string) => {
      if (phase === "Material Procurement") return LucidePersonStanding;
      if (phase === "Fabrication Process") return FileCheck;
      if (phase === "Finalization") return FileText;
      return Truck;
    };

    return (
      <div className="flex flex-col items-start relative">
        {/* Tracker */}
        {phases.map((phase, idx) => {
          const isActive = expandedPhase === phase;
          const isLast = idx === phases.length - 1;
          const Icon = getIcon(phase);

          return (
            <div key={phase} className="flex items-start gap-4 mb-3 relative">
              <div className="relative flex flex-col items-center">
                <div
  className={`w-10 h-10 rounded-full flex justify-center items-center shadow z-10 cursor-pointer
    ${phaseUpdates[getPhaseIndex(phase)]?.[0]?.status === "Completed" ? "bg-green-500 text-white" 
      : isActive ? "bg-blue-500 text-white" 
      : "bg-gray-400 text-white"}`}
>
  {phaseUpdates[getPhaseIndex(phase)]?.[0]?.status === "Completed" ? (
    <CheckCircle2 className="w-5 h-5" />
  ) : (
    <Icon className="w-5 h-5" />
  )}
</div>
                {!isLast && <div className="w-[3px] h-20 bg-gray-300 mt-3 mb-[1px] rounded"></div>}
              </div>

              <div className="ml-2">
                <p className={`font-semibold ${isActive ? "text-gray-900" : "text-gray-700"}`}>{phase}</p>
                <p className="text-xs text-gray-600">
  {phaseUpdates[getPhaseIndex(phase)]?.[0]
    ? `${phaseUpdates[getPhaseIndex(phase)][0].status} - ${phaseUpdates[getPhaseIndex(phase)][0].notes || ""}`
    : getDescription(phase)}
</p>

              </div>
            </div>
          );
        })}

        {/* View Details Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              setExpandedPhase(phases[3]); // Expand the 4th phase by default
              setShowModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            View Details
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-[480px] p-7 shadow-2xl border border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 hover:text-black text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {phases.map((phase) => {
                  const Icon = getIcon(phase);
                  const isActive = expandedPhase === phase;

                  return (
                    <div key={phase} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => togglePhase(phase)}
                        className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-gray-700 hover:bg-gray-50 transition rounded-t-lg text-lg"
                      >
                        {phase}
                        <span className="ml-2">{isActive ? "▲" : "▼"}</span>
                      </button>

                      {isActive && (
                        <div className="px-6 py-4 border-t border-gray-200 text-gray-600 text-base flex items-center gap-2">
                          <Icon className="w-5 h-5" /> {getDescription(phase)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  })()}
</div>



     {/* ================= RIGHT SIDE ORIGINAL CONTENT ================= */}
    <div className="flex-1">

          {/* HEADER INFO */}
          <h2 className="text-3xl font-bold text-gray-700 mb-5">Tracking Request #{request.id}</h2>

          <div className="space-y-2 mb-6 text-gray-700">
            <p><b>Project:</b> {request.project_name?.toUpperCase() || "-"}</p>
            <p><b>Mode:</b> {request.mode || "N/A"}</p>
            <p>
              <b>Status:</b>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${statusColors[request.status] || "bg-gray-200 text-gray-700"}`}>{request.status}</span>
            </p>
            <p>
              <b>Requested at:</b> {new Date(request.created_at).toLocaleString()}
            </p>
          </div>

          {/* ========================================================= */}
          {/*                QUOTATION CONTAINER                        */}
          {/* ========================================================= */}

          <div className="bg-[#fff7e6] border border-[#f59e0b] rounded-xl p-5 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5" /> Quotation Details
              </h3>

              {quotation && (
                <button
                  onClick={() => setShowQuotationTable(!showQuotationTable)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  {showQuotationTable ? "Hide" : "Open"}
                </button>
              )}
            </div>

            {/* Quotation states & instructions */}
            {!quotation && (
              <p className="text-gray-700">Your quotation is still being prepared by our sales team. We will notify you when it is ready.</p>
            )}

            {quotation && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${quotation.status === "approved" ? "bg-green-100 text-green-700" : quotation.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {quotation.status.replace("_", " ")}
                  </span>

                  <span className="text-sm text-gray-600">Created: {format(new Date(quotation.createdAt), "MMM d, yyyy hh:mm a")}</span>
                </div>

                {showQuotationTable && (
                  <div className="overflow-hidden border border-[#f59e0b] rounded-lg mt-4 bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-[#f59e0b] text-white">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Time</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Quotation File</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="bg-white border-t hover:bg-gray-50">
                          <td className="p-3">{format(new Date(quotation.createdAt), "MMM d, yyyy")}</td>
                          <td className="p-3">{format(new Date(quotation.createdAt), "hh:mm a")}</td>
                          <td className="p-3 capitalize">{quotation.status.replace("_", " ")}</td>
                          <td className="p-3">
                            <button
                              onClick={() => router.push(`/customer/cus_myrequest/track_my_order/quotation_request/${request.id}`)}
                              className="text-blue-600 hover:underline flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" /> {quotation.quotationNumber}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/*              PURCHASE ORDER CONTAINER                     */}
          {/* ========================================================= */}

          <div className="bg-[#fff7e6] border border-[#f59e0b] rounded-xl p-5 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5" /> Purchase Order
              </h3>

              {quotation?.status === "approved" && !po && (
                <a
                  href={`/customer/cus_myrequest/track_my_order/purchase_order/?quotationId=${quotation.id}&requestId=${request.id}`}
                  className="bg-[#f59e0b] text-white px-4 py-2 rounded-lg hover:bg-[#d48a0a] transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload PO
                </a>
              )}

              {po && (
                <button
                  onClick={() => setShowPOTable(!showPOTable)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  {showPOTable ? "Hide" : "Open"}
                </button>
              )}
            </div>

            {!po && quotation?.status !== "approved" && (
              <p className="text-gray-700">Waiting for quotation approval before you can upload a PO.</p>
            )}

            {!po && quotation?.status === "approved" && (
              <p className="text-gray-700">Quotation approved — please upload your purchase order to proceed.</p>
            )}

            {po && (
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${po.status === "verified" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {po.status || "Pending"}
                  </span>

                  <span className="text-sm text-gray-600">Uploaded: {po.uploadedAt ? format(new Date(po.uploadedAt), "MMM d, yyyy hh:mm a") : "—"}</span>
                </div>

                {showPOTable && (
                  <div className="overflow-hidden border border-[#f59e0b] rounded-lg mt-4 bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-[#f59e0b] text-white">
                        <tr>
                          <th className="p-3">Date Uploaded</th>
                          <th className="p-3">Time Uploaded</th>
                          <th className="p-3">PO Number</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">File</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="bg-white border-t hover:bg-gray-50">
                          <td className="p-3">{po.uploadedAt ? format(new Date(po.uploadedAt), "MMM d, yyyy") : "—"}</td>
                          <td className="p-3">{po.uploadedAt ? format(new Date(po.uploadedAt), "hh:mm a") : "—"}</td>
                          <td className="p-3">{po.poNumber || "—"}</td>
                          <td className="p-3 capitalize">{po.status || "Pending"}</td>
                          <td className="p-3">
                            {po.filePath ? (
                              <a href={po.filePath} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                <FileText className="w-4 h-4" /> {po.fileName || po.filePath.split("/").pop()}
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
            )}
          </div>

          {/* FOOTER / NOTES */}
          <div className="text-sm text-gray-600 mt-4">
            <p>Note: Quotation is prepared by our sales personnel. Purchase Orders are uploaded by customers after quotation approval.</p>
          </div>

{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-4xl p-8 shadow-2xl border border-gray-200 overflow-y-auto max-h-[90vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">
          {request?.project_name ? request.project_name.toUpperCase() : "Project"}
        </h2>
        <button
          onClick={() => setShowModal(false)}
          className="text-gray-600 hover:text-black text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-gray-600 font-semibold mb-4">Request Phases</p>

      {/* Steps */}
<div className="space-y-4">
  {["Material Procurement", "Fabrication Process", "Finalization", "Out for Delivery"].map((phase) => (
    <div key={phase} className="border border-gray-200 rounded-lg">
      <button
        onClick={() => togglePhase(phase)}
        className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-gray-700 hover:bg-gray-50 transition rounded-t-lg text-lg"
      >
        {phase}
        <span className="ml-2">{expandedPhase === phase ? "▲" : "▼"}</span>
      </button>

      {expandedPhase === phase && (
        <div className="px-6 py-4 border-t border-gray-200 text-gray-600 text-base space-y-1">
 {phaseUpdates[getPhaseIndex(phase)] ? (
  phaseUpdates[getPhaseIndex(phase)].map((update, idx) => (
    <div key={idx} className="mb-2">
      <p><b>Status:</b> {update.status}</p>
      {update.notes && <p><b>Notes:</b> {update.notes}</p>}
      <p className="text-xs text-gray-500">
        Updated at: {new Date(update.created_at).toLocaleString()}
      </p>
    </div>
  ))
) : (
  <p>No updates yet for this phase.</p>
)}

</div>

      )}
    </div>
  ))}
</div>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
    </div>
  );
};

export default TrackMyOrderPage;
