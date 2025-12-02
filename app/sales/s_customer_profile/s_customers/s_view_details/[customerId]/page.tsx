// app/sales/s_customer_profile/s_customers/s_view_details/[customerId]/page.tsx

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Header } from "@/components/header";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

type Customer = {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  clientCode?: string;
};

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
  "Cancel Requested": "text-orange-600 bg-orange-100",
};

const SPendingCustomerRequestPage = () => {
  const { customerId } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const [actionRequestId, setActionRequestId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"Accepted" | "Rejected" | "Cancelled" | null>(null);
  const [showActionConfirm, setShowActionConfirm] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Table column widths for resizable table
  const [colWidths, setColWidths] = useState([10, 30, 15, 30, 15]); // in percent
  const resizingCol = useRef<number | null>(null);
  const startX = useRef(0);
  const startWidths = useRef<number[]>([]);

  const fetchCustomerData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/customer_request?customerId=${customerId}`);
      if (!res.ok) throw new Error("Failed to fetch customer data");
      const data = await res.json();

      setCustomer(data.customer || null);
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) fetchCustomerData();
  }, [customerId, fetchCustomerData]);

  const filteredRequests = Array.isArray(requests)
    ? requests.filter(
        (req) =>
          req.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setDropdownPos(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleViewDetails = (requestId: number) => {
    router.push(
      `/sales/s_customer_profile/s_customers/s_view_details/${customerId}/request_details/${requestId}`
    );
  };

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
        prev.map((req) => (req.id === actionRequestId ? { ...req, status: actionType } : req))
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

  // Column resizing handlers
  const startResize = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    resizingCol.current = colIndex;
    startX.current = e.clientX;
    startWidths.current = [...colWidths];
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizingCol.current === null) return;
    const deltaX = e.clientX - startX.current;
    const tableWidth = document.getElementById("requests-table")?.offsetWidth || 1;
    const newWidths = [...startWidths.current];
    const deltaPercent = (deltaX / tableWidth) * 100;
    newWidths[resizingCol.current] = Math.max(5, startWidths.current[resizingCol.current] + deltaPercent);
    setColWidths(newWidths);
  };

  const stopResize = () => {
    resizingCol.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopResize);
  };

  return (
    <main className="h-screen w-full bg-[#ffedce] flex flex-col relative">
      <Header />
      <div>
        {/* Page Title */}
        <div className="px-10 mt-6">
          <h1 className="text-3xl font-bold text-[#5a4632]">Requests</h1>
        </div>

        {/* Breadcrumb / Tab */}
        <div className="px-10 mt-2 flex items-center gap-2 text-sm text-[#5a4632]">
          <button
            onClick={() => router.push("/sales/s_customer_profile/s_customers")}
            className="font-normal hover:font-bold cursor-pointer transition-all"
          >
            Customer Profile
          </button>
          <span className="text-gray-400">{">"}</span>
        <span className="font-bold">
    {customer ? customer.companyName : "Loading..."}
  </span>
</div>

        {/* Search & Buttons */}
        <div className="flex flex-row justify-end mt-5 gap-4">
          <div className="flex flex-row gap-4">
            <div className="h-8 w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row text-[#8a6f56] mt-1 hover:bg-gray-100">
              <Image
                src="/search-alt-2-svgrepo-com.svg"
                width={15}
                height={15}
                alt="Search"
                className="ml-5"
              />
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 w-full bg-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-row gap-4">
            <div className="relative">
              <button className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#fcd0d0] active:border-b-4">
                <Image
                  src="/filter-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Filter"
                />
                <span className="text-sm text-[#482b0e] ml-2">Filter</span>
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="flex flex-row gap-4 mr-10">
            <div className="relative">
              <button className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#fcd0d0] active:border-b-4">
                <Image
                  src="/sort-ascending-fill-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Sort"
                />
                <span className="text-sm text-[#482b0e] ml-2">Sort</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 mt-4 relative">
          <div className="bg-white rounded-2xl shadow-xl p-6 pb-20">
            <div className="flex flex-row justify-between px-6 mt-2 gap-6">
              {/* Left: Customer Profile Card */}
              <div className="flex flex-col flex-[0.4]">
                <div className="bg-white rounded-2xl p-6 mb-2 shadow-lg flex flex-col h-full">
                  {customer ? (
                    <>
                      <div className="flex flex-col items-center justify-center flex-[0.5]">
                        <div className="h-28 w-28 rounded-full bg-[#fcd0d0] text-[#482b0e] flex items-center justify-center text-5xl font-bold shadow-md">
                          {customer.companyName.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-[#482b0e] mt-4 text-center tracking-wide">
                          <span className="text-base font-medium italic text-[#6a4a2b]">
                            {customer.companyName}
                          </span>
                        </h2>
                      </div>

                      <div className="flex-[0.5] mt-4 space-y-2 text-[#482b0e]">
                        <div className="grid grid-cols-2 text-sm">
                          <span className="font-semibold">Contact Person:</span>
                          <span className="italic">{customer.contactPerson}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                          <span className="font-semibold">Email:</span>
                          <span className="italic break-words">{customer.email}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                          <span className="font-semibold">Phone:</span>
                          <span className="italic">{customer.phone}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                          <span className="font-semibold">Address:</span>
                          <span className="italic break-words">{customer.address}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-gray-600 italic">
                      Loading customer details...
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Resizable Table Section */}
              <section className="flex-[1.2] overflow-y-auto">
                <div
                  id="requests-table"
                  className="bg-white rounded-2xl shadow-xl w-full overflow-x-auto border border-[#debca3]"
                >
                  {/* Header */}
                  <div className="flex bg-[#fcd0d0] text-[#5a4632] font-bold border-b border-[#d2bda7] rounded-t-2xl">
                    {["REQUEST#", "PROJECT NAME", "STATUS", "DATE & TIME REQUESTED", "ACTION"].map(
                      (header, i) => (
                        <div
                          key={i}
                          className="relative flex items-center justify-center py-4 px-3 border-r border-[#d2bda7] text-sm tracking-wide"
                          style={{ width: colWidths[i] + "%" }}
                        >
                          {header}
                          <div
                            onMouseDown={(e) => startResize(e, i)}
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#b79d87] transition"
                          />
                        </div>
                      )
                    )}
                  </div>

                  {/* Rows */}
                  {paginatedRequests.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">No requests found.</div>
                  ) : (
                    paginatedRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex border-b border-[#e5d5c4] hover:bg-[#fff8ea] transition"
                      >
                        <div
                          className="py-3 px-3 text-center border-r border-[#e5d5c4]"
                          style={{ width: colWidths[0] + "%" }}
                        >
                          {req.id}
                        </div>
                        <div
                          className="py-3 px-3 border-r border-[#e5d5c4]"
                          style={{ width: colWidths[1] + "%" }}
                        >
                          {req.project_name.toUpperCase()}
                        </div>
                        <div
                          className="py-3 px-3 border-r border-[#e5d5c4]"
                          style={{ width: colWidths[2] + "%" }}
                        >
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-semibold ${
                              statusColors[req.status]
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <div
                          className="py-3 px-3 border-r border-[#e5d5c4]"
                          style={{ width: colWidths[3] + "%" }}
                        >
                          {new Date(req.created_at).toLocaleString()}
                        </div>
                        <div
                          className="py-3 px-3 flex justify-center items-center"
                          style={{ width: colWidths[4] + "%" }}
                        >
                          <button
                            className="px-4 py-1 text-sm font-semibold border border-[#d2bda7] bg-white rounded-full shadow-sm hover:bg-[#ffe7b6] transition"
                            onClick={() => handleViewDetails(req.id)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Floating confirmation box */}
        {showActionConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96 pointer-events-auto">
              <h2 className="text-xl font-bold mb-2">
                {actionType === "Accepted"
                  ? "Accept Request"
                  : actionType === "Cancelled"
                  ? "Approve Cancellation"
                  : "Reject Request"}
              </h2>
              <p className="mb-4">Are you sure you want to {actionType?.toLowerCase()} this request?</p>
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
