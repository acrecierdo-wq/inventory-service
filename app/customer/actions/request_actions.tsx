// app/customer/actions/request_actions.tsx

import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { X } from "lucide-react";


type CustomerRequestActionsProps = {
    req: QuotationRequest;
}
type QuotationRequest = {
    id: number;
    project_name: string;
    mode: string;
    message?: string;
    status: string;
    created_at: string;
    files?: { path: string }[];
    reason?: string;
        requester_name?: string;
        requester_address?: string;
        requester_contact?: string;
        requester_email?: string;
};
// request status
const statusColors: Record<string, string> = {
  Pending: "text-yellow-600 bg-yellow-100",
  Accepted: "text-green-700 bg-green-100",
  Cancelled: "text-red-600 bg--100",
  Rejected: "text-gray-600 bg-red-100",
};

const cancellationReasons = [
    "Change of plans",
    "Budget constraints",
    "Project no longer needed",
    "Other",
];

const CustomerRequestActions = ({ req }: CustomerRequestActionsProps) => {
    console.log("CustomerRequestActions props.req:", req);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [, setOpenDropdown] = useState(false);
    const [requests, setRequests] = useState<QuotationRequest[]>([]);
    const [deleteRequestId, setDeleteRequestId] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
    const [, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelRequestId, setCancelRequestId] = useState<number | null>(null);
    const [, setShowCancelRequestModal] = useState(false);
    const [modalImage, setModalImage] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const closeModal = () => setModalImage(null);
    
    const handleShowDetails = (request: QuotationRequest) => {
    setSelectedRequest(request);
    setOpenDropdownId(null);
    setSheetOpen(true);
  };

    const handleCancelRequest = (id: number) => {
    setCancelRequestId(id);
    setShowCancelModal(true);
  };

    const handleRequestCancellation = async (id: number) => {
  try {
    const res = await fetch("/api/customer/q_request", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CancelRequested" }),
    });

    if (res.ok) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "CancelRequested" } : req
        )
      );
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status: "CancelRequested" });
      }
      toast.success("Cancellation request sent successfully!");
    } else {
      toast.error("Failed to send cancellation request.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to send cancellation request due to network/server error.");
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

    const res = await fetch("/api/customer/q_request", {
      method: "PUT",
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
      toast.success(
        req.status === "Pending"
          ? "Request has been successfully cancelled!"
          : "Cancellation request sent successfully!",
      );
    } else {
      toast.error(data.error || "Failed to cancel request. Please try again.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to cancel request due to a network or server error.");
  }

  setShowCancelModal(false);
  setCancelReason("");
  setCancelRequestId(null);
};

  const confirmDeleteRequest = async () => {
    if (deleteRequestId === null) return;

    try {
      const res = await fetch("/api/customer/q_request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteRequestId }),
      });
      const data = await res.json();

      if (res.ok) {
        setRequests((prev) => prev.filter((req) => req.id !== deleteRequestId));
        if (selectedRequest?.id === deleteRequestId) setSelectedRequest(null);
        toast.success("Request has been deleted successfully.");
      } else {
        toast.error(data.error || "Failed to delete request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network or server error while deleting.");
    }

    setDeleteRequestId(null);
  };

useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setOpenDropdown(false);
    }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
    document.removeEventListener("click", handleClickOutside);
    };
}, []);

return (
    <div className="relative" ref={dropdownRef}>
        {/* Dots icon */}
        <div onClick={() => setOpenDropdownId(openDropdownId === req.id ? null : req.id)} className="cursor-pointer">
        <MoreHorizontal size={22} className="text-gray-600" />
        </div>

        {/* Dropdown options */}
        {openDropdownId === req.id && (
        <div className="absolute right-0 z-50 mt-15 mr-5 bg-white shadow border rounded text-sm w-30">
        <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleShowDetails(req)}
        >
            Show Details
        </div>

        {["Pending", "Accepted"].includes(req.status?.trim()) ? (
            <>
            {req.status.trim() === "Pending" ? (
                <div
                className="px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer"
                onClick={() => handleCancelRequest(req.id)}
                >
                Cancel Request
                </div>
            ) : (
                <div
                className="px-4 py-2 hover:bg-gray-100 text-orange-600 cursor-pointer"
                onClick={() =>
                    handleRequestCancellation(req.id)
                }
                >
                Request Cancellation
                </div>
            )}
            </>
        ) : req.status?.trim() === "Cancelled" ? (
            <div
            className="px-4 py-2 hover:bg-gray-100 text-red-700 font-bold cursor-pointer"
            onClick={() => setDeleteRequestId(req.id)}
            >
            Delete Request
            </div>
        ) : null}
        </div>
    )}

{/* View Details Sheet */}
<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
    <SheetContent>
        <SheetHeader>
            <SheetTitle className="text-center font-bold text-2xl underline">Quotation Request Details</SheetTitle>
        </SheetHeader>
        <div className="ml-4 space-y-2">
            <div><strong>Request ID:</strong> {selectedRequest?.id}</div>
            <div><strong>Project:</strong> {selectedRequest?.project_name}</div>
            <div><strong>Mode:</strong> {selectedRequest?.mode}</div>
            {/* <div><strong>Message:</strong></div> */}
            <div><strong>Status:</strong> {selectedRequest?.status}</div>
            <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              statusColors[req.status] || ""
            }`}
          >
            {req.status}
          </span>

        <div className="border-b border-gray-200"></div>

        {selectedRequest?.reason && (
          <p>
            <span className="font-semibold">Cancellation Reason: </span>
            <span className="italic">{selectedRequest.reason}</span>
          </p>
        )}

        <p>
          <span className="font-semibold">Requested At: </span>
          {new Date(req.created_at).toLocaleString()}
        </p>

        {/* Attachments */}
        {selectedRequest?.files && selectedRequest.files.length > 0 && (
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
        </div>
    </SheetContent>
</Sheet>

<AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
    <AlertDialogTitle>
    </AlertDialogTitle>
    <AlertDialogContent>
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="bg-white border shadow-2xl rounded-xl w-96 p-8 relative pointer-events-auto">
      <button
        className="absolute top-3 right-3 p-2 hover:bg-gray-200 rounded-full"
        onClick={() => setShowCancelRequestModal(false)}
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
          onClick={() => setShowCancelRequestModal(false)}
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
    </AlertDialogContent>
</AlertDialog>

<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
    <AlertDialogTitle>
    </AlertDialogTitle>
    <AlertDialogContent>
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
    </AlertDialogContent>
</AlertDialog>

{/* Sliding Details Panel */}
{/* {selectedRequest && (
  <div className="fixed top-0 right-0 h-full bg-white shadow-2xl w-[60%] max-w-5xl transform transition-transform duration-300 z-50">
    <div className="p-8 h-full relative flex flex-col">
      
      <h2 className="text-4xl font-bold mb-6 text-[#173f63]">Quotation Details</h2>

      <div className="space-y-5 overflow-y-auto flex-1 pr-3 text-lg scrollbar-hidden">
        {/* Customer Info */}
        {/* <div className="bg-gray-50 p-5 rounded-xl shadow-inner space-y-2">
          <h3 className="font-semibold text-xl mb-2 text-[#5a2347]">Customer Information</h3>
          <p>
            <span className="font-semibold">Name: </span>
            {selectedRequest.requester_name || "-"}
          </p>
          <p>
            <span className="font-semibold">Address: </span>
            {selectedRequest.requester_address || "-"}
          </p>
          <p>
            <span className="font-semibold">Contact: </span>
            {selectedRequest.requester_contact || "-"}
          </p>
          <p>
            <span className="font-semibold">Email: </span>
            {selectedRequest.requester_email || "-"}
          </p>
        </div> */}
        {/* Display Request ID */}
        {/* <p>
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
        </p> */}

        {/* ✅ Show reason if cancelled */}
        {/* {selectedRequest.reason && (
          <p>
            <span className="font-semibold">Cancellation Reason: </span>
            <span className="italic">{selectedRequest.reason}</span>
          </p>
        )}

        <p>
          <span className="font-semibold">Requested At: </span>
          {new Date(selectedRequest.created_at).toLocaleString()}
        </p> */}

        {/* Attachments */}
        {/* {selectedRequest.files && selectedRequest.files.length > 0 && (
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
)} */}

{/* Image Modal */}
{/* {modalImage && (
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
)} */}

{/* Cancel Modal */}
{/* {showCancelModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="bg-white border shadow-2xl rounded-xl w-96 p-8 relative pointer-events-auto">
      <button
        className="absolute top-3 right-3 p-2 hover:bg-gray-200 rounded-full"
        onClick={() => setShowCancelRequestModal(false)}
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
          onClick={() => setShowCancelRequestModal(false)}
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
)} */}

{/* Delete Confirmation Modal */}
{/* {deleteRequestId !== null && (
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
)} */}

{/* Toast Notification */}
{/* {toastMessage && (
    <Toast
    message={toastMessage}
    type={toastType}
    onClose={() => setToastMessage("")}
    />
)} */}

</div>
)
}

export default CustomerRequestActions;

