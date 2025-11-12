// app/sales/s_customer_profile/s_customers/s_view_details/[customerId]/request_details/[requestId]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/header";
import { MoreHorizontal } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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
  //CancelRequested: "text-orange-600 bg-orange-100",
};

const SalesViewDetailsCPage = () => {
  const { customerId, requestId } = useParams();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [, setNewStatus] = useState("");
  const [request, setRequest] = useState<RequestData | null>(null);
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder[]>([]);

  // Fetch only the selected request for this customer
useEffect(() => {
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
  if (requestId) fetchRequest();
}, [requestId]);

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

useEffect(() => {
  fetchQuotations();
}, [fetchQuotations]);

const fetchPurchaseOrders = useCallback(async () => {
  if (!requestId || !customerId) return;

  try {
    const res = await fetch(
      `/api/sales/purchase_orders?customerId=${customerId}&requestId=${requestId}`
    );
    const data = await res.json();

    if (res.ok && data.purchaseOrders) {
      setPurchaseOrder(data.purchaseOrders);
    } else {
      console.error("Failed to fetch purchase orders:", data.error);
      setPurchaseOrder([]);
    }
  } catch (err) {
    console.error("Error fetching purchase orders:", err);
    setPurchaseOrder([]);
  }
}, [customerId, requestId]);

useEffect(() => {
  fetchPurchaseOrders();
}, [fetchPurchaseOrders]);

  // ✅ Handle PO Modal logic
  const handleDotClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setNewStatus(po.status);
    setModalOpen(true);
  };

  // const handleStatusChange = () => {
  //   if (!selectedPO) return;
  //   setPurchaseOrder((prev) =>
  //     prev.map((po) =>
  //       po.id === selectedPO.id ? { ...po, status: newStatus } : po
  //     )
  //   );
  //   setModalOpen(false);
  // };

  const handleViewDetails = (id: number) => {
    router.push(`/sales/s_pending_customer_request/pending_view/${id}`);
  };

  const handleViewQuotation = (customerId: number, requestId: number, quotationId: string) => {
  console.log("Navigate to quotation:", { customerId, requestId, quotationId });
  router.push(
    `/sales/s_customer_profile/s_customers/s_view_details/${customerId}/request_details/${requestId}/view_quotation/${quotationId}`
  );
};

const handleBack = () => router.back();

  return (
    
      <div className="min-h-screen w-full bg-[#ffedce] pb-10">
        <Header />

        {/* BACK BUTTON */}
        <div className="px-5 pt-4 flex justify-end">
          <button
            onClick={handleBack}
            className="text-sm px-4 py-2 bg-white border border-[#d2bda7] text-[#5a4632] rounded-3xl shadow hover:bg-[#fcd0d0] transition-all"
          >
            &larr; Back
          </button>
        </div>

        <div className="mt-6 px-10 space-y-12">
          {/* REQUEST TABLE (same as pending_request behavior) */}
          <div className="w-full max-w-[90rem]">
            <div className="bg-[#880c0c9e] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md">
              Request
            </div>
            <div className="bg-white rounded shadow-md mb-2 overflow-hidden">
              <div className="bg-[#fcd0d0] grid grid-cols-[1fr_2fr_1fr_1fr_2fr_0.5fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
                <span>REQUEST #</span>
                <span>PROJECT NAME</span>
                <span>MODE</span>
                <span>STATUS</span>
                <span>DATE | TIME REQUESTED</span>
                <span>ACTION</span>
              </div>

              {request ? (
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_0.5fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center">
                  <span>{request.id}</span>
                  <span className="uppercase text-sm">{request.project_name}</span>
                  <span>{request.mode}</span>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${
                      statusColors[request.status] || "text-gray-600 bg-gray-100"
                    }`}
                  >
                    {request.status}
                  </span>
                  <span>{new Date(request.created_at).toLocaleString()}</span>
                  <span className="relative flex items-center justify-center">
                    <button
                      className="hover:bg-[#fcd0d0] px-1 py-1 rounded-full flex items-center justify-center"
                      onClick={() => handleViewDetails(request.id)}
                    >
                      <MoreHorizontal size={22} className="text-gray-600" />
                    </button>
                  </span>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-5 italic">
                  No request found.
                </div>
              )}
            </div>
          </div>

          {/* QUOTATION TABLE (still aligned) */}
          <div className="w-full max-w-[90rem]">
            <div className="bg-[#880c0c9e] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md">
              Quotation
            </div>
            <div className="bg-white rounded shadow-md mb-2 overflow-hidden">
              <div className="bg-[#fcd0d0] grid grid-cols-[1fr_2fr_1fr_1fr_2fr_0.5fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
                <span>QUOTATION #</span>
                <span>LINKED REQUEST</span>
                <span>REVISION</span>
                <span>STATUS</span>
                <span>DATE | TIME CREATED</span>
                <span>ACTION</span>
              </div>

              {quotations.length > 0 ? (
                quotations.map((q) => (
                  <div 
                    key={q.id}
                    className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_0.5fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center">
                  <span className="text-sm">{q.quotationNumber}</span>
                  <span className="">{q.requestId}</span>
                  <span>{q.revisionLabel}</span>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${
                      quotationStatusColors[q.status] || "text-gray-600 bg-gray-100"
                    }`}
                  >
                    {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                  </span>
                  <span>{new Date(q.createdAt).toLocaleString()}</span>
                  <span className="relative flex items-center justify-center">
                    <button
                      className="hover:bg-[#fcd0d0] px-1 py-1 rounded-full flex items-center justify-center"
                      onClick={() => handleViewQuotation(Number(customerId), Number(requestId), q.id)}
                    >
                      <MoreHorizontal size={22} className="text-gray-600" />
                    </button>
                  </span>
                </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-5 italic">
                  No quotation found.
                </div>
              )}
            </div>
          </div>

          {/* PURCHASE ORDER TABLE */}
          <div className="w-full max-w-[90rem]">
            <div className="bg-[#880c0c9e] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md">
              Purchase Order
            </div>
            <div className="bg-white rounded shadow-md mb-2 overflow-hidden">
              <div className="bg-[#fcd0d0] grid grid-cols-[1fr_2fr_1fr_1fr_2fr_0.5fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
                <span>CUSTOMER PO #</span>
                <span>LINKED QUOTATION</span>
                <span>PROJECT AMOUNT</span>
                <span>STATUS</span>
                <span>DATE | TIME UPLOADED</span>
                <span>ACTION</span>
              </div>
              
              {purchaseOrder.length > 0 ? (
                purchaseOrder.map((po) => (
                  <div
                    key={po.id}
                    className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_0.5fr] gap-4 px-5 py-3 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
                  >
                    <span>{po.poNumber}</span>
                    <span className="text-sm">{po.quotationNumber || po.quotationId}</span>
                    <span>{po.projectAmount
                      ? `₱${Number(po.projectAmount).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}`
                      : "—"}</span>
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        po.status === "Pending"
                          ? "text-blue-700 bg-blue-100"
                          : "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {po.status}
                    </span>
                    <span>{new Date(po.uploadedAt).toLocaleString()}</span>
                    <span className="flex justify-center items-center">
                      {/* <Image 
                        src="/dots-vertical-rounded-svgrepo-com.svg"
                        width={22}
                        height={22}
                        alt="Actions"
                        className="cursor-pointer hover:opacity-70"
                        onClick={() => handleDotClick(po)}
                      /> */}
                      <button
                      className="hover:bg-[#fcd0d0] px-1 py-1 rounded-full flex items-center justify-center"
                      onClick={() => handleDotClick(po)}
                    >
                      <MoreHorizontal size={22} className="text-gray-600" />
                    </button>
                    </span>
                  </div>
                ))
              ): (
                <div className="text-center text-gray-500 py-5 italic">
                  No purchase orders found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PO STATUS MODAL */}
        {modalOpen && selectedPO && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[450px] shadow-xl">
              
              <div className="flex justify-end">
                <button
                  className="text-sm bg-gray-200 rounded-full hover:bg-gray-300 px-2 py-1 cursor-pointer"
                  onClick={() => setModalOpen(false)}
                >
                  X
                </button>
              </div>

              <h2 className="text-lg font-bold mb-4 text-[#880c0c] border-b border-gray-200">Purchase Order Details</h2>

              <div className="space-y-3 text-sm text-gray-700">
                <p><span className="font-semibold">Customer PO #:</span> {selectedPO.poNumber}</p>
                <p><span className="font-semibold">Linked Quotation:</span> {selectedPO.quotationNumber}</p>
                <p>
                  <span className="font-semibold">Project Amount:</span>{" "}
                  {selectedPO.projectAmount
                    ? `₱${Number(selectedPO.projectAmount).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                    })}`
                    : "—"}
                </p>
                <p>
                  <span className="font-semibold">Date & Time Uploaded:</span>{" "}
                  {new Date(selectedPO.uploadedAt).toLocaleString()}
                </p>

                <div className="mt-3">
                  <span className="font-semibold">Uploaded PO File:</span>
                  {selectedPO.filePath ? (
                    <div className="mt-1">
                      <a
                        href={selectedPO.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                      >
                        {selectedPO.fileName || "View File"}
                      </a>
                    </div>
                  ) : (
                    <p className="italic text-gray-500 text-sm mt-1">No file available.</p>
                  )}
                </div>
              </div>

              {/* ACTION buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/sales/purchase_orders/${selectedPO.id}/status`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "Accepted" }),
                      });
                      if (res.ok) {
                        setPurchaseOrder((prev) =>
                        prev.map((po) =>
                        po.id === selectedPO.id ? { ...po, status: "Accepted" } : po));
                        setModalOpen(false);
                      }
                    } catch (err) {
                      console.error("error accepting PO:", err);
                    }
                  }}
                >
                  Accept
                </button>
                <button
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/sales/purchase_orders/${selectedPO.id}/status`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "Rejected" }),
                      });
                      if (res.ok) {
                        setPurchaseOrder((prev) => 
                        prev.map((po) =>
                        po.id === selectedPO.id ? { ...po, status: "Rejected" } : po));
                        setModalOpen(false);
                      }
                    } catch (err) {
                      console.error("Error rejecting PO:", err);
                    }
                  }}
                > Reject
                </button>
              </div>
            </div>
          </div>
        )}
        {/* {modalOpen && (
          <div className="fixed inset-0 bg-black/40 /bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Update PO Status</h2>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Select New Status:
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm bg-[#173f63] text-white rounded hover:bg-[#1b4b7f]"
                  onClick={handleStatusChange}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )} */}

      </div>
  );
};

export default SalesViewDetailsCPage;
