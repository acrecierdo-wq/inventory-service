// app/customer/quotation_request/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import { MoreHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";

type StatusFilter = "" | "Pending" | "Accepted" | "Cancelled" | "CancelRequested" | "Rejected";


type QuotationRequest = {
  id: number;
  project_name: string;
  mode: string;
  message?: string;
  status: string;
  created_at: string;
  files?: { path: string, publicId: string, filename: string }[];
  reason?: string;
};

const statusColors: Record<string, string> = {
  Pending: "text-yellow-600 bg-yellow-100",
  Accepted: "text-green-700 bg-green-100",
  Cancelled: "text-red-600 bg-red-100",
  "CancelRequested": "text-orange-600 bg-orange-100",
  Rejected: "text-gray-600 bg-red-100",
};

// const cancellationReasons = [
//   "Change of plans",
//   "Budget constraints",
//   "Project no longer needed",
//   "Other",
// ];

const QuotationRequestPage = () => {
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuotationRequest[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [ ,setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, setShowCancelModal] = useState(false);
  //const [cancelReason, setCancelReason] = useState("");
  const [, setCancelRequestId] = useState<number | null>(null);
  const [modalFileId, setModalFileId] = useState<string | null>(null);

  const [deleteRequestId, setDeleteRequestId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const searchParams = useSearchParams();
const initialStatus = searchParams.get("status") as
  | "Pending"
  | "Accepted"
  | "Cancelled"
  | null;

const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus || "");

const statusRef = useRef<HTMLDivElement | null>(null);
const sortRef = useRef<HTMLDivElement | null>(null);


useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Node;

          if (
            statusRef.current &&
            !statusRef.current.contains(target)
          ) { 
            setShowFilterDropdown(false);
          }
          if (
            sortRef.current &&
            !sortRef.current.contains(target)
          ) {
            setShowSortDropdown(false);
          }
        }

        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
      }, []);

useEffect(() => {
  if (!Array.isArray(requests)) return;

  let filtered = requests;

  if (statusFilter) {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }
  setFilteredRequests(filtered);
}, [requests, statusFilter]);

  const router = useRouter();
 const handleNewRequest = async () => {
  try {
    const res = await fetch("/api/customer");
    const result = await res.json();

    console.log("PROFILE DATA:", result); 

    if (result.status !== "ok") {
      toast.warning("⚠️ Please complete your profile first (name, phone, address, & client code).");
      // router.push("/customer/cus_profile");
      return;
    }

    // ✅ profile is complete → continue with request
    // Example: navigate to new request form
    router.push("/customer/quotation_request/NewRequest");
  } catch (err) {
    console.error("Error checking profile:", err);
    toast.error("Something went wrong. Please try again.");
  }
};

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/customer/q_request");
        const result = await res.json();

        if (!res.ok) {
          console.log("Failed to fetch requests:", result.error || res.statusText);
          setRequests([]);
          setFilteredRequests([]);
          return;
        }

        if (result.status === "ok") {
          setRequests(result.data || []);
          setFilteredRequests(result.data || []);
        } else if (result.status === "no-profile") {
          console.warn("No profile found. Redirecting to profile setup...");
          setRequests([]);
          setFilteredRequests([]);

          toast.error("Please complete your profile first before making any requests.");
          //router.push("/customer/cus_profile");
        } else if (result.status === "incomplete-profile") {
          console.warn("Profile incomplete.");
          setRequests([]);
          setFilteredRequests([]);

          toast.error("Profile incomplete. Please update your details.");
          //.push("/customer/cus_profile");
        } else {
          console.error("Unexpected response:", result);
          setRequests([]);
          setFilteredRequests([]);
        }
      } catch (err) {
        console.error("Failed to fetch requests:", err);

        toast.error("Failed to fetch requests");
        setRequests([]);
        setFilteredRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!Array.isArray(requests)) {
      setFilteredRequests([]);
      return;
    }

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
  const toggleDropdown = (event: React.MouseEvent, id: number) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      //setDropdownPosition(null);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPosition({ top: rect.top, left: rect.left });
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  useEffect(() => {
      const handleClickOutside = () => {
        setOpenDropdownId(null);
        setDropdownPos(null);
      };
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }, []);


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

  const handleCancelAcceptedRequest = async (id: number) => {
  try {
    const res = await fetch(`/api/customer/q_request/${id}`, {
      method: "PUT",
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
      toast.success("Cancellation request sent successfully!");
    } else {
      toast.error(data.error || "Failed to send cancellation request.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to send cancellation request due to network/server error.");
  }
};

// const confirmCancelRequest = async () => {
//   if (!cancelReason || cancelRequestId === null) return;

//   try {
//     // Find the request
//     const req = requests.find(r => r.id === cancelRequestId);
//     if (!req) return;

//     // Determine new status
//     const newStatus = req.status === "Pending" ? "Cancelled" : "CancelRequested";

//     const res = await fetch("/api/customer/q_request", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: cancelRequestId, status: newStatus }),
//     });

//     const data = await res.json();

//     if (res.ok) {
//       setRequests((prev) =>
//         prev.map((r) =>
//           r.id === cancelRequestId ? { ...r, status: newStatus } : r
//         )
//       );
//       if (selectedRequest?.id === cancelRequestId) {
//         setSelectedRequest({ ...selectedRequest, status: newStatus });
//       }
//       toast.success(
//         req.status === "Pending"
//           ? "Request has been successfully cancelled!"
//           : "Cancellation request sent successfully!"
//       );
//     } else {
//       toast.error(data.error || "Failed to cancel request. Please try again.");
//     }
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to cancel request due to a network or server error.");
//   }

//   setShowCancelModal(false);
//   setCancelReason("");
//   setCancelRequestId(null);
// };

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

  const closeDetailsPanel = () => setSelectedRequest(null);
  const closeModal = () => { setModalImage(null); setModalFileId(null); };

  const totalPages = Math.ceil(filteredRequests.length / recordsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
      <main className="bg-[url('/customer_p&s(1).jpg')] bg-cover bg-center h-screen w-full overflow-y-auto flex flex-col relative">
        <CustomerHeader />

        {/* Header & Controls */}
        <div className="">

<section className="flex items-center gap-3 justify-end mt-4 relative z-10 mr-10">
  {/* Search Input */}
  <div className="relative">
    <div className="h-8 w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row text-[#8a6f56] mt-1 hover:bg-gray-100">
    <Image src="/search-alt-2-svgrepo-com.svg" width={15} height={15} alt="Search" className="ml-5" />
    <input
      type="text"
      placeholder="Search..."
      className="ml-2 w-full bg-transparent outline-none"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  </div>

  {/* Filter Dropdown */}
  <div className="relative" ref={statusRef}>
    <div
      className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
      onClick={toggleFilterDropdown}
    >
      <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" className="" />
      <span className="text-sm text-[#482b0e] ml-1">
        {statusFilter || "All Status"}
      </span>
    {/* <ChevronDown className="ml-2 text-[#482b0e]" size={20} /> */}
  </div>
  
{showFilterDropdown && (
  <div className="absolute z-20 bg-white border-gray-200 mt-1 w-35 rounded shadow">
    <div
    className={`py-1 hover:bg-gray-100 cursor-pointer text-sm text-center ${
      statusFilter === status ? "font-bold bg-gray-200" : ""
    }`}
    onClick={() => {
      setStatusFilter(""); // Clear filter
      setShowFilterDropdown(false);
    }}
    >
      All Status
      </div>
    {["Pending", "Accepted", "Cancelled"].map((status) => (
      <div
    key={status}
    className={`py-1 hover:bg-gray-100 cursor-pointer text-sm text-center ${
      statusFilter === status ? "font-bold bg-gray-200" : ""
    }`}
    onClick={() => {
      setStatusFilter(status as StatusFilter);
      setShowFilterDropdown(false);
    }}
    >
      {status}
    </div>
  ))}
</div>
)}
</div>

{/* Sort Dropdown */}
<div className="relative" ref={sortRef}>
<div
  className="h-10 w-25 rounded-md border-[#d2bda7] border-b-2 bg-white flex items-center px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
  onClick={toggleSortDropdown}
>
  <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" className="" />
  <span className="ml-2 text-sm text-[#482b0e]">
    {sortNewestFirst ? "N -> O" : "O -> N"}
  </span>
  {/* <ChevronDown className="ml-2 text-[#482b0e]" size={20} /> */}
</div>
{showSortDropdown && (
  <div className="absolute mt-1 right-0 w-48 bg-white border rounded-md shadow-lg z-50">
    <button
      className={`w-full text-center px-4 py-2 hover:bg-gray-100 text-sm ${
        sortNewestFirst ? "font-bold bg-gray-200" : ""
      }`}
      onClick={() => {
        setSortNewestFirst(true);
        setShowSortDropdown(false);
      }}
    >
      Newest → Oldest
    </button>
  <button
    className={`w-full text-center px-4 py-2 hover:bg-gray-100 text-sm ${
      !sortNewestFirst ? "font-bold bg-gray-200" : ""
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

<button
  onClick={handleNewRequest}
  className="h-10 w-35 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
>
  {/* <Plus size={24} className="text-[#482b0e]" /> */}
  <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
  <span className="ml-2 text-sm text-[#482b0e] font-bold">New Request</span>
</button>



</section>

{/* Table */}
<section className="flex-1 overflow-y-auto px-10 mt-2">
  <div className="bg-white rounded shadow-md mb-2">
    {!loading && !error && (
      <>
        {/* Header */}
        <div className="bg-[#f59e0b] grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-3 text-white font-semibold border-b border-[#d2bda7] text-center">
          <span>REQUEST ID</span>
          <span>PROJECT NAME</span>
          <span>MODE</span>
          <span>STATUS</span>
          <span>DATE & TIME REQUESTED</span>
          <span>ACTION</span>
        </div>

        {/* Rows */}
        {paginatedRequests.length > 0 ? (
          paginatedRequests.map((req, index) => (
            <div
              key={req.id ?? index}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
            >
              <span className="font-semibold">{req.id ?? "-"}</span>
              <span className="uppercase text-sm">{req.project_name ?? "-"}</span>
              <span>{req.mode ?? "-"}</span>
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  statusColors[req.status] || ""
                }`}
              >
                {req.status ?? "-"}
              </span>
              <span>
                {req.created_at
                  ? new Date(req.created_at).toLocaleString()
                  : "-"}
              </span>

              {/* Action Dropdown */}
              <span className="relative flex items-center justify-center">
                <button
                  className="hover:bg-gray-100 px-1 py-1 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(e, req.id);
                  }}
                >
                  <MoreHorizontal size={22} className="text-gray-600" />
                </button>

                {openDropdownId === (req.id ?? index) && (
                  <div className="fixed right-0 z-50 mt-15 mr-5 bg-white shadow border rounded text-sm w-35">
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
                            className="px-4 py-2 hover:bg-gray-100 text-red-600 text-xs cursor-pointer"
                            onClick={() => handleCancelClick(req.id)}
                          >
                            Cancel Request
                          </div>
                        ) : (
                          <div
                            className="px-4 py-2 hover:bg-gray-100 text-orange-600 cursor-pointer"
                            onClick={() =>
                              handleCancelAcceptedRequest(req.id)
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
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-5 italic">
            No quotation requests found.
          </div>
        )}
      </>
    )}
  </div>
</section>

</div>

     {/* Sliding Details Panel */}
{selectedRequest && (
  <div className="fixed top-0 right-0 h-full bg-white shadow-2xl w-[30%] /max-w-5xl transform transition-transform duration-300 z-50">
    <div className="p-6 h-full relative flex flex-col">
      <button
        className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full cursor-pointer"
        onClick={closeDetailsPanel}
      >
        <X size={20} />
      </button>

      <h2 className="text-center font-bold text-2xl">Request for Quotation Details</h2>
      <div className="border-b border-gray-200 mt-4"></div>
      <div className="space-y-4 overflow-y-auto flex-1 pr-3 scrollbar-hidden mt-2">

        {/* Display Request ID */}
        {/* <p><strong>Request #:</strong> {selectedRequest.id}</p> */}
        <p><strong>Project Name: </strong><span className="uppercase text-sm">{selectedRequest.project_name}</span></p>
        <p><strong>Selected mode:</strong> {selectedRequest.mode}</p>
        <p><strong>Message:</strong> {selectedRequest.message || "-"}</p>
        <p><strong>Status:</strong>
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
          <p><strong>CancellationReason:</strong><span className="italic"> {selectedRequest.reason}</span></p>
        )}
        <p><strong>Requested at:</strong><span className="italic"> {format(new Date(selectedRequest.created_at), "MMM d, yyy | hh:mm a")}</span></p>

        {/* Attachments */}
{selectedRequest.files && selectedRequest.files.length > 0 && (
  <div>
    <strong>Attachments:</strong>
    <div className="mt-3 ml-4 flex flex-wrap gap-4 mb-6">
      {selectedRequest.files.map((file, index) => {
        const ext = file.path.split(".").pop()?.toLowerCase();
        const isImage = ["jpg", "jpeg", "png", "gif"].includes(ext || "");

        return (
          <div
            key={index}
            className="w-full p-2 border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-200 bg-gray-50"
            onClick={(e) => {
              e.preventDefault();
              setModalImage(file.path);
              setModalFileId(file.publicId);
            }}
          >
            {isImage ? (
              <Image
                src={file.path}
                alt={`Attachment ${index + 1}`}
                width={100}
                height={100}
                className="object-cover w-50 h-20 rounded-md mb-2"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center rounded-md bg-gray-200 mb-2">
                <span className="text-gray-700 font-bold text-2xl">📁</span>
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

{/* Image / File Modal */}
{modalImage && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60" onClick={closeModal}>
    <div className="relative max-w-6xl max-h-[95%] w-full p-4" onClick={(e) => e.stopPropagation()}>
      <button className="absolute top-3 right-3 text-white p-2 hover:bg-red-300 rounded-full z-10 cursor-pointer" onClick={closeModal}>
        <X size={28} />
      </button>

      {["jpg", "jpeg", "png", "gif"].some(ext => modalImage.endsWith(ext)) ? (
        <Image src={modalImage} alt="Full-size attachment" width={1600} height={1600} className="object-contain max-h-[95vh] w-auto mx-auto" />
      ) : (
        <div className="inset-0 bg-black/40 p-6 rounded-xl flex flex-col items-center justify-center">
          <div className="text-5xl mb-4">📎</div>
          <p className="text-white mb-4 text-center">Preview not supported for this file type.</p>
          <p className="mb-2 text-sm font-medium break-all text-center text-white">{modalImage.split("/").pop()}</p>

          {modalFileId && (
  <button
    onClick={async () => {
      try {
        const res = await fetch(`/api/download/${encodeURIComponent(modalFileId)}`);
        if (!res.ok) throw new Error("Failed to download file");

        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = modalImage.split("/").pop() || "file";
        link.click();

        // Clean up memory
        window.URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error(err);
        alert("Failed to download file");
      }
    }}
    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
  >
    Download File
  </button>
)}


        </div>
      )}
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

      {/* Pagination */}
      <div className="absolute bottom-0 left-0 w-full bg-transparent py-3 flex justify-center items-center gap-2 z-50">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`h-8 w-15 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f] cursor-pointer"
          }`}
        >
          Prev
        </button>

        <span className="text-[#5a4632] text-sm">
          <strong>Page {currentPage} of {totalPages}</strong>
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`h-8 w-15 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f] cursor-pointer"
          }`}
        >
          Next
        </button>
      </div>
      </main>
  );
};

export default QuotationRequestPage;
