"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Search, ChevronDown, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

type QuotationRequest = {
  id: number;
  project_name: string;
  mode: string;
  status: string;
  message?: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  Pending: "text-yellow-600 bg-yellow-100",
  Accepted: "text-green-700 bg-green-100",
  Rejected: "text-red-600 bg-red-100",
  Cancelled: "text-gray-600 bg-gray-100",
  CancelRequested: "text-orange-600 bg-orange-100",
};

const SPendingCustomerRequestPage = () => {
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const [actionRequestId, setActionRequestId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"Accepted" | "Rejected" | "Cancelled" | null>(null);
  const [showActionConfirm, setShowActionConfirm] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const router = useRouter();

  // Fetch all requests including CancelRequested
  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/q_request");
      const data: QuotationRequest[] = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests to show in table
  const filteredRequests = requests.filter(
    (req) =>
      ["Pending", "Accepted", "Rejected", "Cancelled", "CancelRequested"].includes(req.status) &&
      (req.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.mode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleDropdown = (id: number) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleViewDetails = (id: number) => {
    router.push(`/sales/s_pending_customer_request/pending_view/${id}`);
  };

  // Show confirmation before updating
  const handleAccept = (id: number, type: "Accepted" | "Cancelled") => {
    setActionRequestId(id);
    setActionType(type);
    setShowActionConfirm(true);
  };

  const handleReject = (id: number) => {
    setActionRequestId(id);
    setActionType("Rejected");
    setShowActionConfirm(true);
  };

  const confirmAction = async () => {
    if (!actionRequestId || !actionType) return;
    setShowActionConfirm(false);

    try {
      const res = await fetch("/api/q_request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: actionRequestId, status: actionType }),
      });

      if (!res.ok) throw new Error("Failed to update request");

      setRequests((prev) =>
        prev.map((req) =>
          req.id === actionRequestId ? { ...req, status: actionType } : req
        )
      );

      setToastMessage(`Request ${actionType.toLowerCase()} successfully!`);
      setToastType("success");
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to update request.");
      setToastType("error");
    }

    setActionRequestId(null);
    setActionType(null);

    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-[#ffedce] min-h-screen w-full relative">
      <Header />
      <div className="px-10 py-6 w-full">
        <h1 className="text-4xl font-bold text-[#0c2a42] mb-6">
          QUOTATION REQUESTS
        </h1>

        {/* Search & Buttons */}
        <div className="flex justify-end items-center gap-3 mb-4 relative z-10">
          <div className="relative">
            <button className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
              <span className="text-[#482b0e] font-medium text-lg">Filter</span>
              <ChevronDown className="ml-2 text-[#482b0e]" size={20} />
            </button>
          </div>

          <div className="relative">
            <button className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
              <span className="text-[#482b0e] font-medium text-lg">Sort</span>
              <ChevronDown className="ml-2 text-[#482b0e]" size={20} />
            </button>
          </div>

          <div className="h-12 w-96 rounded-3xl border-b-2 border-[#d2bda7] bg-white flex items-center px-3 text-[#8a6f56] text-lg">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 w-full bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto bg-white rounded-xl shadow relative z-0 scrollbar-hidden w-full">
          <table className="min-w-full text-base text-left text-gray-700">
            <thead className="bg-[#0c2a42] text-white uppercase">
              <tr>
                <th className="px-6 py-4">REQUEST ID</th>
                <th className="px-6 py-4">PROJECT NAME</th>
                <th className="px-6 py-4">MODE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">DATE & TIME REQUESTED</th>
                <th className="px-6 py-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold">{req.id}</td>
                    <td className="px-6 py-4">{req.project_name}</td>
                    <td className="px-6 py-4">{req.mode}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusColors[req.status]}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(req.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-200"
                        onClick={() => toggleDropdown(req.id)}
                      >
                        <MoreHorizontal size={22} className="text-gray-600" />
                      </button>

                      {openDropdownId === req.id && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border rounded-md shadow-lg z-50">
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => handleViewDetails(req.id)}
                          >
                            View Details
                          </button>

                          {/* Actions */}
                          {req.status === "Pending" && (
                            <>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-green-600"
                                onClick={() => handleAccept(req.id, "Accepted")}
                              >
                                Accept
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                onClick={() => handleReject(req.id)}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Cancellation request from customer */}
                          {req.status === "CancelRequested" && (
                            <>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-green-600"
                                onClick={() => handleAccept(req.id, "Cancelled")}
                              >
                                Approve Cancellation
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                onClick={() => handleReject(req.id)}
                              >
                                Reject Cancellation
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Floating confirmation box */}
        {showActionConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96 pointer-events-auto">
              <h2 className="text-xl font-bold mb-2">
                {actionType === "Accepted" ? "Accept Request" : actionType === "Cancelled" ? "Approve Cancellation" : "Reject Request"}
              </h2>
              <p className="mb-4">
                Are you sure you want to {actionType?.toLowerCase()} this request?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowActionConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-white ${
                    actionType === "Accepted" || actionType === "Cancelled"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={confirmAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-5 right-5 px-6 py-3 rounded-xl text-white shadow-lg z-50 ${
              toastType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default SPendingCustomerRequestPage;
