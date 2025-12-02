"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/header";
import { useRouter, useParams } from "next/navigation";
import { Pencil } from "lucide-react"; // Add icons
import React from 'react';

type Customer = {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  clientCode?: string;
};

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
  quotationNumber: string;
  projectAmount: number;
}

interface RequestData {
  id: number;
  project_name: string;
  mode: string;
  status: string;
  created_at: string;
}

interface QuotationData {
  id: string;
  quotationNumber: string;
  revisionLabel: string;
  requestId: number;
  createdAt: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Pending: "text-yellow-600 bg-yellow-100",
  Accepted: "text-green-700 bg-green-100",
  Rejected: "text-red-600 bg-red-100",
  Cancelled: "text-gray-600 bg-gray-100",
  CancelRequested: "text-orange-600 bg-orange-100",
};

const quotationStatusColors: Record<string, string> = {
  sent: "text-yellow-600 bg-yellow-100",
  approved: "text-green-700 bg-green-100",
  expired: "text-red-600 bg-red-100",
  "request revision": "text-gray-600 bg-gray-100",
};

const SalesViewDetailsCPage = () => {
  const { customerId, requestId } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "progress">("summary");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [, setNewStatus] = useState("");
  const [request, setRequest] = useState<RequestData | null>(null);
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder[]>([]); 
  const isPOAccepted: boolean = purchaseOrder.some((po: PurchaseOrder) => po.status === "Accepted");

  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  
  const [updateNotes, setUpdateNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>();

  const [modalLatestNotes, setModalLatestNotes] = useState<string>("");

  const phaseMap: Record<string, number> = {
  "Material Procurement": 0,
  "Fabrication Process": 1,
  "Finalization": 2,
  Delivery: 3,
  "Pickup": 3,
  Other: 3,
};

const [phaseUpdates, setPhaseUpdates] = useState<Record<string, { status: string; notes?: string }>>({
  "Material Procurement": { status: "Pending" },
  "Fabrication Process": { status: "Pending" },
  "Finalization": { status: "Pending" },
  Delivery: { status: "Pending" },
  "Pick-up": { status: "Pending" },
  Other: { status: "Pending" },
});

const getPhaseKey = (phase: string) => {
  if (phase === "Material Procurement") return "Phase1";
  if (phase === "Fabrication Process") return "Phase2";
  if (phase === "Finalization") return "Phase3";
  return "Phase4"; // Delivery / Pick-up / Other all map to Phase4
};

// const getPhase4Label = (mode: string | undefined) => {
//   if (!mode) return "Other";
//   if (mode.toLowerCase() === "delivery") return "Delivery";
//   if (mode.toLowerCase() === "pickup") return "Pickup";
//   return "Other";
// };


const isPhaseEditable = (phase: string) => {
  const key = getPhaseKey(phase);

  if (key === "Phase1") return true;
  if (key === "Phase2")
    return phaseUpdates["Phase1"]?.status === "Complete";
  if (key === "Phase3")
    return phaseUpdates["Phase2"]?.status === "Complete";
  if (key === "Phase4")
    return phaseUpdates["Phase3"]?.status === "Complete";

  return false;
};

// const resolvePhaseKey = (phase: string) => {
//   if (["Material Procurement", "Fabrication Process", "Finalization"].includes(phase)) {
//     return phase; // return exact name
//   }

//   // Phase 4 keys should match what UI uses for display
//   if (phase === "Delivery") return "Delivery";
//   if (phase === "Pick-up") return "Pick-up";
//   return "Other";
// };


  // Function to open modal with selected phase
const openPhaseModal = (phase: string) => {
  setSelectedPhase(phase);

  const key = getPhaseKey(phase);
  const existing = phaseUpdates[key] || { status: "Pending", notes: "", timestamp: "" };
 
  setSelectedStatus(existing.status);
  setUpdateNotes(""); // clear textarea for new note
  setModalLatestNotes(existing.status); // <-- new state to show latest update

  setModalOpen(true);
};


  // Fetch Quotations
  const fetchQuotations = useCallback(async () => {
    if (!requestId) return;
    try {
      const res = await fetch(`/api/sales/quotations?requestId=${requestId}`);
      const data = await res.json();
      if (data.success) setQuotations(data.quotations);
    } catch (err) {
      console.error("Failed to fetch quotations", err);
    }
  }, [requestId]);

  // Fetch Purchase Orders
  const fetchPurchaseOrders = useCallback(async () => {
    if (!requestId || !customerId) return;
    try {
      const res = await fetch(
        `/api/sales/purchase_orders?customerId=${customerId}&requestId=${requestId}`
      );
      const data = await res.json();
      if (res.ok && data.purchaseOrders) setPurchaseOrder(data.purchaseOrders);
      else setPurchaseOrder([]);
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setPurchaseOrder([]);
    }
  }, [customerId, requestId]);

    const fetchPhaseUpdates = async () => {
  if (!request?.id) return;

  try {
    const res = await fetch(`/api/sales/phase_updates?requestId=${request.id}`);
    if (!res.ok) { 
      console.error("Failed request:", res.status, await res.text());
      return;
    }
    
    const data = await res.json();

    if (data.success) {
      const latestPerPhase: Record<string, { status: string; notes: string; timestamp: string }> = {};

      data.data
        .sort((a: any, b: any) => b.id - a.id) // newest first
        .forEach((update: any) => {
          // Phase1,2,3 = index + 1, Phase4 = all others
          const key = update.phaseIndex < 3 ? `Phase${update.phaseIndex + 1}` : "Phase4";

          // Store only the first (latest) update per phase
          if (!latestPerPhase[key]) {
            latestPerPhase[key] = { 
  status: update.status, 
  notes: update.notes || "",
  timestamp: update.created_at || update.updated_at || "" 
};
          }
        });

      setPhaseUpdates(latestPerPhase);
    }
  } catch (err) {
    console.error("Failed to fetch phase updates:", err);
  }
};

//USEEFFECTS
  // Fetch Customer by customerId
  useEffect(() => {
    if (!customerId) return;
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/sales/customer_request?customerId=${customerId}`);
        if (!res.ok) throw new Error("Failed to fetch customer data");
        const data = await res.json();
        setCustomer(data.customer || null);
      } catch (err) {
        console.error("Error fetching customer:", err);
      }
    };
    fetchCustomer();
  }, [customerId]);

  // Fetch Request
  useEffect(() => {
    if (!requestId) return;
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/sales/customer_request/${requestId}`);
        if (!res.ok) throw new Error("Failed to fetch request");
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        console.error("Failed to fetch request", err);
      }
    };
    fetchRequest();
  }, [requestId]);

    useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  useEffect(() => {
    if (request?.id) {
      fetchPhaseUpdates();
    }
  }, [request?.id]);

  const handleDotClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setNewStatus(po.status);
    setModalOpen(true);
  };

  const handleViewDetails = (id: number) => {
    router.push(`/sales/s_pending_customer_request/pending_view/${id}`);
  };

  const handleViewQuotation = (customerId: number, requestId: number, quotationId: string) => {
    router.push(
      `/sales/s_customer_profile/s_customers/s_view_details/${customerId}/request_details/${requestId}/view_quotation/${quotationId}`
    );
  };

// const modeFourthPhaseStyle: Record<string, { label: string; className: string }> = {
//   Delivery: { label: "Phase 4: Delivery Complete", className: "bg-green-100 border-green-400" },
//   "Pickup": { label: "Phase 4: Pickup Complete", className: "bg-blue-100 border-blue-400" },
// };

//const defaultFourthPhase = { label: "Phase 4: Other", className: "bg-yellow-100 border-yellow-400" };

// const defaultPhases = ["Phase 1", "Phase 2", "Phase 3"];
// const fourthPhase = request?.mode
//   ? modeFourthPhaseStyle[request.mode] || defaultFourthPhase
//   : defaultFourthPhase;
// const currentPhases = [...defaultPhases, fourthPhase];

// const modeFourthPhase: Record<string, string> = {
//   Delivery: "Delivery",
//   "Pick-up": "Pick-up",
//   Other: "Other",
// };

//const displayPhase4Status = phaseUpdates["Phase4"]?.status || "Pending";

  return (
    <div className="min-h-screen w-full bg-[#ffedce] pb-10">
      <Header />

      {/* Page Title */}
      <div className="px-10 mt-8">
        <h1 className="text-3xl font-extrabold text-[#5a4632] tracking-wide">
          Request Details
        </h1>
      </div>

      {/* Breadcrumb / Tab */}
      <div className="px-10 mt-2 flex items-center gap-2 text-sm text-[#5a4632]">
        {/* Customer Profile link */}
        <button
          onClick={() => router.push("/sales/s_customer_profile/s_customers")}
          className="font-normal hover:font-bold cursor-pointer transition-all"
        >
          Customer Profile
        </button>
        <span className="text-gray-400">{">"}</span>

        {/* Customer Name clickable */}
        {customer ? (
          <button
            onClick={() =>
              router.push(
                `/sales/s_customer_profile/s_customers/s_view_details/${customer.id}`
              )
            }
            className="font-semibold hover:font-bold cursor-pointer transition-all"
          >
            {customer.companyName}
          </button>
        ) : (
          <span className="font-semibold">Loading...</span>
        )}
        <span className="text-gray-400">{">"}</span>

        {/* Request / Project Name */}
        <span className="font-bold">{request ? request.project_name : "Loading..."}</span>
      </div>

      {/* Tabs */}
      <div className="mt-6 px-10 flex gap-6 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-3 text-lg font-semibold transition ${
            activeTab === "summary"
              ? "border-b-4 border-[#880c0c] text-[#880c0c]"
              : "text-gray-600 hover:text-[#880c0c]"
          }`}
        >
          Request Details
        </button>

        <button
          onClick={() => setActiveTab("progress")}
          className={`pb-3 text-lg font-semibold transition ${
            activeTab === "progress"
              ? "border-b-4 border-[#880c0c] text-[#880c0c]"
              : "text-gray-600 hover:text-[#880c0c]"
          }`}
        >
          Request Status
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6 px-10 space-y-6">
        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <div className="space-y-10">
            {/* Request Section */}
            {request ? (
              <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 flex justify-between items-start hover:shadow-xl transition">
                <div className="space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-xl">Project: {request.project_name}</p>
                  <p className="text-[15px]">Request #: {request.id}</p>
                  <p className="text-[15px]">Mode: {request.mode}</p>
                  <p
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[request.status]}`}
                  >
                    {request.status}
                  </p>
                  <p className="text-[15px]">
                    Date: {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-white bg-[#880c0c] hover:bg-[#a31212] transition font-semibold shadow-sm"
                  onClick={() => handleViewDetails(request.id)}
                >
                  Details
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-5 italic">No request found.</div>
            )}

            {/* Quotation Section */}
            <div className="space-y-4">
              {quotations.length > 0 ? (
                quotations.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 flex justify-between items-start hover:shadow-xl transition"
                  >
                    <div className="space-y-1.5 leading-relaxed">
                      <p className="font-semibold text-xl">Quotation #: {q.quotationNumber}</p>
                      <p className="text-[15px]">Linked Request: {q.requestId}</p>
                      <p className="text-[15px]">Revision: {q.revisionLabel}</p>
                      <p
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${quotationStatusColors[q.status]}`}
                      >
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </p>
                      <p className="text-[15px]">
                        Date Created: {new Date(q.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg text-white bg-[#880c0c] hover:bg-[#a31212] transition font-semibold shadow-sm"
                      onClick={() =>
                        handleViewQuotation(Number(customer?.id), Number(request?.id), q.id)
                      }
                    >
                      Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-5 italic">No quotation found.</div>
              )}
            </div>

            {/* Purchase Order Section */}
            <div className="space-y-4">
              {purchaseOrder.length > 0 ? (
                purchaseOrder.map((po) => (
                  <div
                    key={po.id}
                    className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 flex justify-between items-start hover:shadow-xl transition"
                  >
                    <div className="space-y-1.5 leading-relaxed">
                      <p className="font-semibold text-xl">Customer PO #: {po.poNumber}</p>
                      <p className="text-[15px]">
                        Linked Quotation: {po.quotationNumber || po.quotationId}
                      </p>
                      <p className="text-[15px]">
                        Amount:{" "}
                        {po.projectAmount
                          ? `₱${Number(po.projectAmount).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })}`
                          : "—"}
                      </p>
                      <p
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          po.status === "Pending"
                            ? "text-blue-700 bg-blue-100"
                            : "text-gray-700 bg-gray-100"
                        }`}
                      >
                        {po.status}
                      </p>
                      <p className="text-[15px]">
                        Date Uploaded: {new Date(po.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg text-white bg-[#880c0c] hover:bg-[#a31212] transition font-semibold shadow-sm"
                      onClick={() => handleDotClick(po)}
                    >
                      Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-5 italic">No purchase orders found.</div>
              )}
            </div>
          </div>
        )}

{/* PROGRESS TAB */}
{activeTab === "progress" && (
  <div className="flex gap-6 px-10 mt-6 h-[calc(100vh-180px)]">
    {/* Left Container - Request Status */}
    <div className="w-1/2 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col">
      {isPOAccepted ? (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3">
            Request Status
          </h2>

{/* STEPPER BASED ON PHASES */}
<div className="w-full flex items-center justify-between px-4 my-4">
  {["Material Procurement", "Fabrication Process", "Finalization", request?.mode || "Other"].map(
    (phase, index) => {
      const phaseKey = index < 3 ? getPhaseKey(phase) : "Phase4";
      const status = phaseUpdates[phaseKey]?.status;

      // Determine completion and in-progress based on phase and mode
      const isComplete =
        index < 3
          ? status === "Complete" // Phases 1-3
          : request?.mode === "Delivery"
          ? status === "Delivered"
          : request?.mode === "Pickup"
          ? status === "Collected"
          : status === "Complete";

      const isInProgress =
        index < 3
          ? status === "In-Progress"
          : request?.mode === "Delivery"
          ? status === "In-Transit"
          : request?.mode === "Pickup"
          ? status === "Ready"
          : status === "In-Progress";

      return (
        <React.Fragment key={phase}>
          {/* STEP */}
          <div className="flex flex-col items-center text-center w-24">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-bold transition-all
                ${
                  isComplete
                    ? "bg-green-500 border-green-500 text-white"
                    : isInProgress
                    ? "border-blue-500 text-blue-500"
                    : "border-gray-300 text-gray-400"
                }`}
            >
              {isComplete ? "✓" : index + 1}
            </div>

            <span className="text-[10px] mt-1 text-gray-700">{phase}</span>
          </div>

          {/* LINE CONNECTOR */}
          {index !== 3 && (
            <div
              className={`flex-1 h-[2px] mx-2 transition-all ${
                isComplete || isInProgress ? "bg-blue-500" : "bg-gray-300"
              }`}
            ></div>
          )}
        </React.Fragment>
      );
    }
  )}
</div>



          {/* Phases */}
          <div className="flex flex-col gap-4 mt-4">
            {["Material Procurement", "Fabrication Process", "Finalization"].map(
              (phase, index) => (
                <div
                  key={index}
                  className="p-5 text-lg font-semibold bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300 text-white font-bold">
                      {index + 1}
                    </div>
                    <span>{phase}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700">
                    {phaseUpdates[getPhaseKey(phase)]?.status || "Pending"}


                    </span>

                    <Pencil
                      className={`text-gray-500 hover:text-gray-800 cursor-pointer ${
                        !isPhaseEditable(phase) ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                      size={18}
                      onClick={() => {
                        if (isPhaseEditable(phase)) openPhaseModal(phase);
                      }}
                    />
                  </div>
                </div>
              )
            )}

            {request && (
  <div
    className={`p-5 text-lg font-semibold rounded-xl border shadow-sm hover:shadow-md transition flex justify-between items-center ${
      request.mode === "Delivery"
        ? "bg-green-100 border-green-400"
        : request.mode === "Pick-up"
        ? "bg-blue-100 border-blue-400"
        : "bg-yellow-100 border-yellow-400"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300 text-white font-bold">
        4
      </div>
      <span>{request.mode}</span>
    </div>

    <div className="flex items-center gap-3">
      <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700">
        {phaseUpdates[getPhaseKey(request.mode)]?.status || "Pending"}
      </span>
      <Pencil
        className="text-gray-500 hover:text-gray-800 cursor-pointer"
        size={18}
        onClick={() => {
          if (isPhaseEditable(request.mode)) openPhaseModal(request.mode);
        }}
      />
    </div>
  </div>
)}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic text-lg mt-10">
          Request Status will appear here once a purchase order has been accepted.
        </p>
      )}
    </div>

    {/* Right Container - Request Details */}
            <div className="w-1/2 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col">
              <div className="p-6 flex-1 flex flex-col justify-start space-y-6 overflow-y-auto">
                <h2 className="text-xl font-extrabold text-[#880c0c]">Request Details</h2>

                {request ? (
                  <div className="flex flex-col gap-6 h-full">
                    <div className="space-y-2">
                      <p><span className="font-semibold">Project:</span> {request.project_name}</p>
                      <p><span className="font-semibold">Request #:</span> {request.id}</p>
                      <p><span className="font-semibold">Mode:</span> {request.mode}</p>
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        <span className={`inline-block px-2 py-1 rounded-full ${statusColors[request.status]}`}>
                          {request.status}
                        </span>
                      </p>
                      <p><span className="font-semibold">Date Submitted:</span> {new Date(request.created_at).toLocaleString()}</p>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Quotation Status */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-700">Quotation</h3>
                      {quotations.length > 0 ? (
                        quotations.map((q) => (
                          <div key={q.id} className="flex items-center gap-2">
                            <span className="text-sm font-medium">{q.quotationNumber}</span>
                            <span className={`ml-auto inline-block px-2 py-1 rounded-full text-sm font-semibold ${quotationStatusColors[q.status]}`}>
                              {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No quotations found.</p>
                      )}
                    </div>

                    <hr className="border-gray-200" />

                    {/* Purchase Order Status */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-700">Purchase Order</h3>
                      {purchaseOrder.length > 0 ? (
                        purchaseOrder.map((po) => (
                          <div key={po.id} className="flex items-center gap-2">
                            <span className="text-sm font-medium">{po.poNumber}</span>
                            <span
                              className={`ml-auto inline-block px-2 py-1 rounded-full text-sm font-semibold ${
                                po.status === "Pending"
                                  ? "text-blue-700 bg-blue-100"
                                  : po.status === "Accepted"
                                  ? "text-green-700 bg-green-100"
                                  : po.status === "Rejected"
                                  ? "text-red-600 bg-red-100"
                                  : "text-gray-600 bg-gray-100"
                              }`}
                            >
                              {po.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No purchase orders found.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No request data available.</p>
                )}
              </div>
            </div>
    
    {/* Modal */}
    {modalOpen && selectedPhase && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl w-full max-w-[700px] p-10 shadow-2xl border border-gray-200 flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedPhase} Updates
            </h2>
            <button
              className="text-gray-600 hover:text-black text-3xl font-bold"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
          </div>

          {modalLatestNotes && (
  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
    <h3 className="font-semibold text-gray-700 mb-2">Latest Update</h3>
    <p className="text-gray-700 whitespace-pre-line">
      {modalLatestNotes}
    </p>
  </div>
)}

          {/* Status Dropdown */}
          <div className="flex flex-col gap-3 mb-6">
            <label className="font-semibold text-gray-700 text-lg">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-[#880c0c] text-gray-700 text-lg ${
                ["Material Procurement", "Fabrication Process", "Finalization"].includes(selectedPhase)
                  ? "border-gray-300 bg-gray-50"
                  : request?.mode?.toLowerCase() === "delivery"
                  ? "border-green-400 bg-green-100"
                  : request?.mode?.toLowerCase() === "pickup"
                  ? "border-blue-400 bg-blue-100"
                  : "border-yellow-400 bg-yellow-100"
              }`}
            >
              {( ["Material Procurement","Fabrication Process","Finalization"].includes(selectedPhase)
                ? ["Pending", "In-Progress", "Complete"]
                : request?.mode?.toLowerCase() === "delivery"
                ? ["Pending", "In-Transit", "Delivered"]
                : request?.mode?.toLowerCase() === "pickup"
                ? ["Pending", "Ready", "Collected"]
                : ["Pending", "In-Progress", "Complete"]
              ).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-gray-700 text-lg">Update Notes</label>
            <textarea
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#880c0c] focus:border-[#880c0c] text-gray-700 text-lg"
              placeholder={`Enter updates for ${selectedPhase.toLowerCase()}...`}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-2xl text-lg hover:bg-gray-400 transition"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-3 bg-[#880c0c] text-white font-semibold rounded-2xl text-lg shadow-md hover:bg-[#a31212] transition"
              onClick={async () => {
                if (!selectedPhase || !request?.id || !selectedStatus) return;
                const phaseIndex = phaseMap[selectedPhase];
                if (phaseIndex === undefined) return;

                const payload = {
                  requestId: request.id,
                  phaseIndex,
                  status: selectedStatus,
                  notes: updateNotes,
                };

                try {
                  const res = await fetch("/api/sales/phase_updates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("Phase update saved successfully!");
                    setModalOpen(false);

                    // Update the current status in the UI
                    setPhaseUpdates((prev) => ({
                      ...prev,
                      [getPhaseKey(selectedPhase)]: { status: selectedStatus, notes: updateNotes}
                    }));
                    
                  } else {
                    alert("Failed to save update: " + data.error);
                  }
                } catch (err) {
                  console.error(err);
                  alert("Error saving phase update.");
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}


        {/* PO Modal */}
{modalOpen && selectedPO && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-[480px] p-7 shadow-2xl border border-gray-200">
      <div className="flex justify-end">
        <button
          className="text-gray-600 hover:text-black text-lg font-bold"
          onClick={() => setModalOpen(false)}
        >
          ×
        </button>
      </div>

      <h2 className="text-xl font-extrabold text-[#880c0c] pb-3 border-b border-gray-200">
        Purchase Order Details
      </h2>

      <div className="mt-4 space-y-3 text-[15px] text-gray-700">
        <p>
          <span className="font-semibold">Customer PO #:</span> {selectedPO.poNumber}
        </p>
        <p>
          <span className="font-semibold">Linked Quotation:</span> {selectedPO.quotationNumber}
        </p>
        <p>
          <span className="font-semibold">Project Amount:</span>{" "}
          {selectedPO.projectAmount
            ? `₱${Number(selectedPO.projectAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
            : "—"}
        </p>
        <p>
          <span className="font-semibold">Date & Time Uploaded:</span>{" "}
          {new Date(selectedPO.uploadedAt).toLocaleString()}
        </p>
        <div>
          <span className="font-semibold">Uploaded PO File:</span>{" "}
          {selectedPO.filePath ? (
            <a
              href={selectedPO.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {selectedPO.fileName || "View File"}
            </a>
          ) : (
            <p className="italic text-gray-500 text-sm mt-1">No file available.</p>
          )}
        </div>

        {selectedPO.status === "Accepted" && (
          <div className="mt-5 px-4 py-3 text-green-800 bg-green-100 border border-green-300 rounded-lg font-semibold">
            ✓ This Purchase Order has been ACCEPTED.
          </div>
        )}
        {selectedPO.status === "Rejected" && (
          <div className="mt-5 px-4 py-3 text-red-800 bg-red-100 border border-red-300 rounded-lg font-semibold">
            ✕ This Purchase Order has been REJECTED.
          </div>
        )}
      </div>

      {selectedPO.status === "Pending" && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            onClick={async () => {
              if (!confirm("Are you sure you want to ACCEPT this Purchase Order?")) return;
              try {
                const res = await fetch(`/api/sales/purchase_orders/${selectedPO.id}/status`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "Accepted" }),
                });
                if (res.ok) {
                  setPurchaseOrder((prev) =>
                    prev.map((po) => (po.id === selectedPO.id ? { ...po, status: "Accepted" } : po))
                  );
                  setSelectedPO((prev) => (prev ? { ...prev, status: "Accepted" } : prev));
                } else {
                  alert("Failed to accept PO.");
                }
              } catch (err) {
                console.error(err);
                alert("Error accepting PO.");
              }
            }}
          >
            Accept
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            onClick={async () => {
              if (!confirm("Are you sure you want to REJECT this Purchase Order?")) return;
              try {
                const res = await fetch(`/api/sales/purchase_orders/${selectedPO.id}/status`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "Rejected" }),
                });
                if (res.ok) {
                  setPurchaseOrder((prev) =>
                    prev.map((po) => (po.id === selectedPO.id ? { ...po, status: "Rejected" } : po))
                  );
                  setSelectedPO((prev) => (prev ? { ...prev, status: "Rejected" } : prev));
                } else {
                  alert("Failed to reject PO.");
                }
              } catch (err) {
                console.error(err);
                alert("Error rejecting PO.");
              }
            }}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default SalesViewDetailsCPage;