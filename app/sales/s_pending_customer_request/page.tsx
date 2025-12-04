
// app/sales/s_pending_customer_request/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  const [, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const [actionRequestId, setActionRequestId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"Accepted" | "Rejected" | "Cancelled" | null>(null);
  const [showActionConfirm, setShowActionConfirm] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [loading, ] = useState(false);
  const [error, ] = useState<string | null>(null);

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  const router = useRouter();

  // Fetch all requests including CancelRequested
  const fetchRequests = async () => {
    //setLoading(true);
    //setError(null);
    try {
      const res = await fetch("/api/sales/customer_request");
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
  const filteredRequests = Array.isArray(requests)
  ? requests.filter(
      (req) =>
        ["Pending", "Accepted", "Rejected", "Cancelled", "CancelRequested"].includes(req.status) &&
        (req.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.mode.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  : [];

  const toggleDropdown = (event: React.MouseEvent, id: number) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPos(null);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPos({ top: rect.top, left: rect.left });
    setOpenDropdownId(id);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setDropdownPos(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleViewDetails = (id: number) => {
    router.push(`/sales/s_pending_customer_request/pending_view/${id}`);
  };

  // Show confirmation before updating
  // const handleAccept = (id: number, type: "Accepted" | "Cancelled") => {
  //   setActionRequestId(id);
  //   setActionType(type);
  //   setShowActionConfirm(true);
  // };

  // const handleReject = (id: number) => {
  //   setActionRequestId(id);
  //   setActionType("Rejected");
  //   setShowActionConfirm(true);
  // };

  const confirmAction = async () => {
    if (!actionRequestId || !actionType) return;
    setShowActionConfirm(false);

    try {
      const res = await fetch("/api/sales/customer_request", {
        method: "PUT",
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

   const statusRef = useRef<HTMLDivElement | null>(null);

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
    <main className="h-screen w-full bg-[#ffedce] flex flex-col relative">
      <Header />
      <div className="">

        {/* Search & Buttons */}
        <div className="flex flex-row justify-end mt-2 gap-4">
          
          <div className="flex flex-row gap-4">

            {/* Search */}
            <div className="h-8 w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row text-[#8a6f56] mt-1">
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

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto" ref={statusRef}>
            <div
              className="h-10 w-full sm:w-auto sm:min-w-[100px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-between px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/filter-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Filter"
                />
                <span className="text-sm text-[#482b0e]">
                  {selectedStatus || "Filter"}
                </span>
              </div>
            </div>

            {statusDropdownOpen && (
              <div className="absolute z-20 bg-white border border-gray-200 mt-1 w-full sm:min-w-[180px] rounded shadow-lg">
                <div
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                  onClick={() => {
                    setSelectedStatus("");
                    setStatusDropdownOpen(false);
                  }}
                >
                  All Status
                </div>
                {[
                  "Pending",
                  "Accepted",
                  "Cancelled",
                  "Rejected"
                ].map((status) => (
                  <div
                    key={status}
                    className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSelectedStatus(status);
                      setStatusDropdownOpen(false);
                    }}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="flex flex-row gap-4 mr-10">
            <div className="relative">
            <button className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
              <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" className="" />
              <span className="text-sm text-[#482b0e] ml-2">Sort</span>
              {/* <ChevronDown className="ml-2 text-[#482b0e]" size={20} /> */}
            </button>
          </div>
          </div>

        </div>

        {/* Table */}
        <section className="flex-1 overflow-y-auto px-10 mt-2">
        <div className="bg-white rounded shadow-md mb-2">
          {!loading && !error && (
        <>
        {/* Header */}
        <div className=" bg-[#fcd0d0] grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
          <span>REQUEST #</span>
          <span>PROJECT NAME</span>
          <span>MODE</span>
          <span>STATUS</span>
          <span>DATE & TIME REQUESTED</span>
          <span>ACTION</span>
        </div>

        {/* Rows */}
        {paginatedRequests.length > 0 ? (
          paginatedRequests.map((req) => (
            <div
              key={req.id}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
            >
              <span>{req.id}</span>
              <span className="uppercase text-sm">{req.project_name}</span>
              <span>{req.mode}</span>
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  statusColors[req.status]
                }`}
              >
                {req.status}
              </span>
              <span>{new Date(req.created_at).toLocaleString()}</span>
              <span className="relative flex items-center justify-center">
                {/* Action Dropdown */}
                <button
                  className="hover:bg-[#fcd0d0] px-1 py-1 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(e, req.id);
                  }}
                >
                  <MoreHorizontal size={22} className="text-gray-600" />
                </button>

                {openDropdownId === req.id && (
                  <div className="fixed right-0 z-50 mt-15 mr-5 bg-white shadow border rounded text-sm w-30">
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleViewDetails(req.id)}
                    >
                      View Details
                    </div>
                  </div>
                )}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-5 italic">No requests found.</div>
        )}
      </>
    )}
  </div>
</section>

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

      {/* Pagination */}
      <div className="absolute bottom-0 left-0 w-full bg-[#ffedce] py-3 flex justify-center items-center gap-2 z-50">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`h-8 w-15 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f]"
          }`}
        >
          Prev
        </button>

        <span className="text-[#5a4632] text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`h-8 w-15 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f]"
          }`}
        >
          Next
        </button>
      </div>
    </main>
  );
};

export default SPendingCustomerRequestPage;