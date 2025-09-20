"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import { Plus, MoreHorizontal, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";



type QuotationRequest = {
  id: number;
  project_name: string;
  mode: string;
  message?: string;
  status: string;
  created_at: string;
  files?: { path: string }[];
  reason?: string; 
};

const statusColors: Record<string, string> = {
  Pending: "text-yellow-600 bg-yellow-100",
  Approved: "text-green-700 bg-green-100",
  Cancelled: "text-red-600 bg--100",
  Rejected: "text-gray-600 bg-red-100",
};

const cancellationReasons = [
  "Change of plans",
  "Budget constraints",
  "Project no longer needed",
  "Other",
];

// Toast Component
type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

const Toast = ({ message, type = "success", onClose }: ToastProps) => {
  const colors = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-5 animate-slide-in ${colors[type]} z-50 max-w-2xl text-xl`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="text-white text-2xl hover:opacity-70">
        ✕
      </button>
    </div>
  );
};

const QuotationRequestPage = () => {
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuotationRequest[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelRequestId, setCancelRequestId] = useState<number | null>(null);

  const [deleteRequestId, setDeleteRequestId] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const [searchQuery, setSearchQuery] = useState("");
  
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [profileComlete, setProfileComplete] = useState(false);
  
  const searchParams = useSearchParams();
const initialStatus = searchParams.get("status") as
  | "Pending"
  | "Approved"
  | "Cancelled"
  | "Accepted"
  | null;

const [statusFilter, setStatusFilter] = useState(initialStatus || "");

useEffect(() => {
  if (!Array.isArray(requests)) return;

  let filtered = requests;

  if (statusFilter) {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }
  setFilteredRequests(filtered);
}, [requests, statusFilter]);
  

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch("/api/customer");
        if (res.ok) {
          const data = await res.json();
          if (data?.phone && data?.address) {
            setProfileComplete(true);
          }  else {
            setProfileComplete(false);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }
    checkProfile();
  },[]);

  const router = useRouter();
 const handleNewRequest = () => {
  if (!profileComlete) {
    toast.warning("⚠️ Please complete your profile first (phone & address).");
    router.push("/customer/cus_profile");
    return;
  }

  // Step 2: Confirmation
  const confirmSend = window.confirm("📨 Are you sure you want to create a new request?");
  if (confirmSend) {
    router.push("/customer/quotation_request/NewRequest");
  }
};


  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/q_request");
        const data = await res.json();
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
        showToast("Failed to fetch requests", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    let updated = [...requests];

    if (statusFilter) {
      updated = updated.filter((req) => req.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      updated = updated.filter(
        (req) =>
          req.project_name.toLowerCase().includes(query) ||
          req.mode.toLowerCase().includes(query)
      );
    }

    updated.sort((a, b) =>
      sortNewestFirst
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    setFilteredRequests(updated);
  }, [requests, statusFilter, searchQuery, sortNewestFirst]);

  // SINGLE DROPDOWN OPEN LOGIC
  const closeAllDropdowns = () => {
    setOpenDropdownId(null);
    setShowFilterDropdown(false);
    setShowSortDropdown(false);
  };

  const toggleDropdown = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    setOpenDropdownId(openDropdownId === id ? null : id);
    setShowFilterDropdown(false);
    setShowSortDropdown(false);
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown((prev) => !prev);
    setShowSortDropdown(false);
    setOpenDropdownId(null);
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown((prev) => !prev);
    setShowFilterDropdown(false);
    setOpenDropdownId(null);
  };

  const handleShowDetails = (request: QuotationRequest) => {
    setSelectedRequest(request);
    setOpenDropdownId(null);
  };

  const handleCancelClick = (id: number) => {
    setCancelRequestId(id);
    setShowCancelModal(true);
  };

  const handleCancelApprovedRequest = async (id: number) => {
  try {
    const res = await fetch("/api/q_request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CancelRequested" }),
    });

    const data = await res.json();

    if (res.ok) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "CancelRequested" } : req
        )
      );
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status: "CancelRequested" });
      }
      showToast("Cancellation request sent successfully!", "success");
    } else {
      showToast(data.error || "Failed to send cancellation request.", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to send cancellation request due to network/server error.", "error");
  }
};

const confirmCancelRequest = async () => {
  if (!cancelReason || cancelRequestId === null) return;

  try {
    // Find the request
    const req = requests.find(r => r.id === cancelRequestId);
    if (!req) return;

    // Determine new status
    const newStatus = req.status === "Pending" ? "Cancelled" : "CancelRequested";

    const res = await fetch("/api/q_request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cancelRequestId, status: newStatus }),
    });

    const data = await res.json();

    if (res.ok) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === cancelRequestId ? { ...r, status: newStatus } : r
        )
      );
      if (selectedRequest?.id === cancelRequestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      showToast(
        req.status === "Pending"
          ? "Request has been successfully cancelled!"
          : "Cancellation request sent successfully!",
        "success"
      );
    } else {
      showToast(data.error || "Failed to cancel request. Please try again.", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to cancel request due to a network or server error.", "error");
  }

  setShowCancelModal(false);
  setCancelReason("");
  setCancelRequestId(null);
};

  const confirmDeleteRequest = async () => {
    if (deleteRequestId === null) return;

    try {
      const res = await fetch("/api/q_request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteRequestId }),
      });
      const data = await res.json();

      if (res.ok) {
        setRequests((prev) => prev.filter((req) => req.id !== deleteRequestId));
        if (selectedRequest?.id === deleteRequestId) setSelectedRequest(null);
        showToast("Request has been deleted successfully.", "success");
      } else {
        showToast(data.error || "Failed to delete request.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network or server error while deleting.", "error");
    }

    setDeleteRequestId(null);
  };

  const closeDetailsPanel = () => setSelectedRequest(null);
  const openModal = (path: string) => setModalImage(path);
  const closeModal = () => setModalImage(null);

  return (
    <CustomerClientComponent>
      <div className="bg-[#fed795] min-h-screen w-full relative">
        <CustomerHeader />

        {/* Header & Controls */}
        <div className="px-10 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-[#173f63]">QUOTATION REQUESTS</h1>
            {/* <Link
              href="/customer/quotation_request/NewRequest"
              className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 shadow"
            >
              <Plus size={24} className="text-[#482b0e]" />
              <span className="ml-3 text-[#482b0e] font-medium text-lg">New Request</span>
            </Link> */}
            <button
              onClick={handleNewRequest}
              className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 shadow"
            >
              <Plus size={24} className="text-[#482b0e]" />
              <span className="ml-3 text-[#482b0e] font-medium text-lg">New Request</span>
            </button>
          </div>

          <div className="flex items-center gap-3 justify-end mt-4 relative z-10">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                onClick={toggleFilterDropdown}
              >
                <span className="text-[#482b0e] font-medium text-lg">
                  {statusFilter ? statusFilter : "Filter"}
                </span>
                <ChevronDown className="ml-2 text-[#482b0e]" size={20} />
              </button>
              {showFilterDropdown && (
                <div className="absolute mt-1 right-0 w-48 bg-white border rounded-md shadow-lg z-50">
                  {["", "Pending", "Approved", "Cancelled", "Accepted"].map((status) => (
                    <button
                      key={status}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        statusFilter === status ? "font-bold text-blue-600" : ""
                      }`}
                      onClick={() => {
                        setStatusFilter(status as any);
                        setShowFilterDropdown(false);
                      }}
                    >
                      {status || "All Statuses"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                onClick={toggleSortDropdown}
              >
                <span className="text-[#482b0e] font-medium text-lg">
                  {sortNewestFirst ? "Sort" : "Sort"}
                </span>
                <ChevronDown className="ml-2 text-[#482b0e]" size={20} />
              </button>
              {showSortDropdown && (
                <div className="absolute mt-1 right-0 w-48 bg-white border rounded-md shadow-lg z-50">
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      sortNewestFirst ? "font-bold text-blue-600" : ""
                    }`}
                    onClick={() => {
                      setSortNewestFirst(true);
                      setShowSortDropdown(false);
                    }}
                  >
                    Newest → Oldest
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      !sortNewestFirst ? "font-bold text-blue-600" : ""
                    }`}
                    onClick={() => {
                      setSortNewestFirst(false);
                      setShowSortDropdown(false);
                    }}
                  >
                    Oldest → Newest
                  </button>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="h-12 w-96 rounded-3xl border-b-2 border-[#d2bda7] bg-white flex items-center px-3 text-[#8a6f56] text-lg">
              <Image src="/search-alt-2-svgrepo-com.svg" width={20} height={20} alt="Search" />
              <input
                type="text"
                className="ml-2 w-full bg-transparent outline-none"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

         {/* Table */}
<div className="mt-4 overflow-x-auto bg-white rounded-xl shadow relative z-0 scrollbar-hidden">
  <table className="min-w-full text-base text-left text-gray-700">
    <thead className="bg-[#173f63] text-white uppercase">
      <tr>
        <th className="px-6 py-4">Request ID</th>
        <th className="px-6 py-4">Project Name</th>
        <th className="px-6 py-4">Mode</th>
        <th className="px-6 py-4">Status</th>
        <th className="px-6 py-4">Date & Time Requested</th>
        <th className="px-6 py-4 text-center">Action</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
            Loading requests...
          </td>
        </tr>
      ) : filteredRequests.length > 0 ? (
        filteredRequests.map((req, index) => (
          <tr key={req.id ?? index} className="border-b">
            <td className="px-6 py-4 font-semibold">{req.id ?? "-"}</td>
            <td className="px-6 py-4">{req.project_name ?? "-"}</td>
            <td className="px-6 py-4">{req.mode ?? "-"}</td>
            <td className="px-6 py-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[req.status] || ""
                }`}
              >
                {req.status ?? "-"}
              </span>
            </td>
            <td className="px-6 py-4">
              {req.created_at ? new Date(req.created_at).toLocaleString() : "-"}
            </td>
            <td className="px-6 py-4 text-center relative">
              <button
                className="p-2 rounded-full hover:bg-gray-200"
                onClick={(e) => toggleDropdown(req.id ?? index, e)}
              >
                <MoreHorizontal size={22} className="text-gray-600" />
              </button>

              {openDropdownId === (req.id ?? index) && (
                <div
                  className="fixed bg-white border rounded-md shadow-lg z-50"
                  style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                  }}
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleShowDetails(req)}
                  >
                    Show Details
                  </button>

                  {/* Action Buttons */}
                  {["Pending", "Approved"].includes(req.status?.trim()) ? (
                    <>
                      {req.status.trim() === "Pending" ? (
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          onClick={() => handleCancelClick(req.id)}
                        >
                          Cancel Request
                        </button>
                      ) : (
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-orange-600"
                          onClick={() => handleCancelApprovedRequest(req.id)}
                        >
                          Request Cancellation
                        </button>
                      )}
                    </>
                  ) : req.status?.trim() === "Cancelled" ? (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-700 font-bold"
                      onClick={() => setDeleteRequestId(req.id)}
                    >
                      Delete Request
                    </button>
                  ) : null}
                </div>
              )}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
            No quotation requests found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

</div>

     {/* Sliding Details Panel */}
{selectedRequest && (
  <div className="fixed top-0 right-0 h-full bg-white shadow-2xl w-[60%] max-w-5xl transform transition-transform duration-300 z-50">
    <div className="p-8 h-full relative flex flex-col">
      <button
        className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full"
        onClick={closeDetailsPanel}
      >
        <X size={28} />
      </button>

      <h2 className="text-4xl font-bold mb-6 text-[#173f63]">Quotation Details</h2>

      <div className="space-y-5 overflow-y-auto flex-1 pr-3 text-lg scrollbar-hidden">
        {/* Display Request ID */}
        <p>
          <span className="font-semibold">Request ID: </span>
          {selectedRequest.id}
        </p>

        <p>
          <span className="font-semibold">Project Name: </span>
          {selectedRequest.project_name}
        </p>
        <p>
          <span className="font-semibold">Mode: </span>
          {selectedRequest.mode}
        </p>
        <p>
          <span className="font-semibold">Message: </span>
          <span className="whitespace-pre-wrap">{selectedRequest.message || "-"}</span>
        </p>
        <p>
          <span className="font-semibold">Status: </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              statusColors[selectedRequest.status] || ""
            }`}
          >
            {selectedRequest.status}
          </span>
        </p>

        {/* ✅ Show reason if cancelled */}
        {selectedRequest.reason && (
          <p>
            <span className="font-semibold">Cancellation Reason: </span>
            <span className="italic">{selectedRequest.reason}</span>
          </p>
        )}

        <p>
          <span className="font-semibold">Requested At: </span>
          {new Date(selectedRequest.created_at).toLocaleString()}
        </p>

        {/* Attachments */}
        {selectedRequest.files && selectedRequest.files.length > 0 && (
          <div>
            <span className="font-semibold text-lg">Attachments:</span>
            <div className="mt-3 flex flex-wrap gap-4">
              {selectedRequest.files.map((file, index) => {
                const ext = file.path.split(".").pop()?.toLowerCase();
                const isImage = ["jpg", "jpeg", "png", "gif"].includes(ext || "");

                return (
                  <div
                    key={index}
                    className="w-32 p-2 border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-200 bg-gray-50"
                    onClick={() =>
                      isImage ? setModalImage(file.path) : window.open(file.path, "_blank")
                    }
                  >
                    {isImage ? (
                      <Image
                        src={file.path}
                        alt={`Attachment ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-cover w-20 h-20 rounded-md mb-2"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center rounded-md bg-red-100 mb-2">
                        <span className="text-red-600 font-bold text-2xl">
                          {ext === "pdf" ? "📄" : "📁"}
                        </span>
                      </div>
                    )}
                    <span className="text-center text-sm break-all">
                      {file.path.split("/").pop()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* Image Modal */}
{modalImage && (
  <div
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-60"
    onClick={closeModal}
  >
    <div className="relative max-w-6xl max-h-[95%] w-full">
      <button
        className="absolute top-3 right-3 text-white p-2 hover:bg-gray-700 rounded-full z-10"
        onClick={closeModal}
      >
        <X size={28} />
      </button>
      <Image
        src={modalImage}
        alt="Full-size attachment"
        width={1600}
        height={1600}
        className="object-contain max-h-[95vh] w-auto"
      />
    </div>
  </div>
)}

{/* Cancel Modal */}
{showCancelModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="bg-white border shadow-2xl rounded-xl w-96 p-8 relative pointer-events-auto">
      <button
        className="absolute top-3 right-3 p-2 hover:bg-gray-200 rounded-full"
        onClick={() => setShowCancelModal(false)}
      >
        <X size={24} />
      </button>
      <h2 className="text-2xl font-bold mb-4 text-[#173f63]">Cancel Request</h2>
      <p className="mb-4 text-lg">Select a reason for cancelling this request:</p>

      <div className="flex flex-wrap gap-3 mb-6">
        {cancellationReasons.map((reason) => (
          <button
            key={reason}
            className={`px-4 py-2 rounded-full border text-base ${
              cancelReason === reason
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => setCancelReason(reason)}
          >
            {reason}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-base"
          onClick={() => setShowCancelModal(false)}
        >
          Close
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-base"
          disabled={!cancelReason}
          onClick={confirmCancelRequest}
        >
          Confirm Cancel
        </button>
      </div>
    </div>
  </div>
)}
        {/* Delete Confirmation Modal */}
        {deleteRequestId !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white border shadow-2xl rounded-xl w-96 p-8 relative pointer-events-auto">
              <button
                className="absolute top-3 right-3 p-2 hover:bg-gray-200 rounded-full"
                onClick={() => setDeleteRequestId(null)}
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-[#173f63]">Delete Request</h2>
              <p className="mb-4 text-lg">Are you sure you want to delete this cancelled request?</p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-base"
                  onClick={() => setDeleteRequestId(null)}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-base"
                  onClick={confirmDeleteRequest}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage("")}
          />
        )}
      </div>
    </CustomerClientComponent>
  );
};

export default QuotationRequestPage;
