// app/sales/s_customer_profile/s_customers/s_view_details/[customerId]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/header";
import { MoreHorizontal } from "lucide-react";
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Fetch all requests including CancelRequested
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
//   const fetchRequests = async () => {
//     //setLoading(true);
//     //setError(null);
//     try {
//       const res = await fetch("/api/sales/customer_request");
//       const data: QuotationRequest[] = await res.json();
//       setRequests(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchRequests();
//   }, []);

  // Filter requests to show in table
  const filteredRequests = Array.isArray(requests)
    ? requests.filter(
        (req) =>
            req.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];
//   const filteredRequests = Array.isArray(requests)
//   ? requests.filter(
//       (req) =>
//         ["Pending", "Accepted", "Rejected", "Cancelled", "CancelRequested"].includes(req.status) &&
//         (req.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           req.mode.toLowerCase().includes(searchQuery.toLowerCase()))
//     )
//   : [];

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

  const handleViewDetails = (requestId: number) => {
    router.push(`/sales/s_customer_profile/s_customers/s_view_details/${customerId}/request_details/${requestId}`);
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
        <div className="flex flex-row justify-end mt-5 gap-4">
          
          <div className="flex flex-row gap-4">

            {/* Search */}
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

          {/* Filter */}
          <div className="flex flex-row gap-4">
            <div className="relative">
            <button className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#fcd0d0] active:border-b-4">
              <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" className="" />
              <span className="text-sm text-[#482b0e] ml-2">Filter</span>
              {/* <ChevronDown className="ml-2 text-[#482b0e]" size={20} /> */}
            </button>
          </div>
          </div>

          {/* Sort */}
          <div className="flex flex-row gap-4 mr-10">
            <div className="relative">
            <button className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#fcd0d0] active:border-b-4">
              <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" className="" />
              <span className="text-sm text-[#482b0e] ml-2">Sort</span>
              {/* <ChevronDown className="ml-2 text-[#482b0e]" size={20} /> */}
            </button>
          </div>
          </div>

        </div>
      
<div className="flex flex-row justify-between px-4 mt-2 gap-4">
  {/* Left: Customer Profile Card */}
  <div className="flex flex-col flex-[0.4]">
    <div className=" bg-[#fcd0d0] rounded p-6 mb-2 shadow-md">
    <>
    {customer ? (
        <>
        <div className="flex flex-col items-center mb-2">
      <Image
        src="/profile-circle-svgrepo-com.svg"
        width={50}
        height={50}
        alt="Profile"
        className="mb-4"
      />
    </div>

    <div className="flex flex-col justify-center text-[#482b0e] text-base font-medium space-y-4">
      <p><span className="font-semibold">Company:</span> <br /><span className="text-sm italic">{customer.companyName}</span></p>
      <p><span className="font-semibold">Contact Person:</span> <br /><span className="text-sm italic">{customer.contactPerson}</span></p>
      <p><span className="font-semibold">Email:</span> <br /><span className="text-sm italic">{customer.email}</span></p>
      <p><span className="font-semibold">Phone:</span> <br /><span className="text-sm italic">{customer.phone}</span></p>
      <p><span className="font-semibold">Address:</span> <br /><span className="text-sm italic">{customer.address}</span></p>
    </div>
        </>
    ): (
        <p className="text-center text-gray-600 italic">Loading customer details...</p>
    )}
    </>
  </div>
  {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/sales/s_customer_profile/s_customers")}
            className="text-sm px-4 py-2 bg-white border border-[#d2bda7] text-[#5a4632] rounded-3xl shadow hover:bg-[#fcd0d0] transition-all cursor-pointer"
          >
            Back to Customers
          </button>
        </div>
  </div>

  {/* Right: Table Section */}
  <section className="flex-[1.2] overflow-y-auto">
    <div className="bg-white rounded-xl shadow-md w-full">
      {!loading && !error && (
        <>
          {/* Header */}
          <div className="bg-[#fcd0d0] grid grid-cols-[0.5fr_2fr_1fr_2fr_0.5fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center rounded">
            <span>REQUEST#</span>
            <span>PROJECT NAME</span>
            <span>STATUS</span>
            <span>DATE & TIME REQUESTED</span>
            <span>ACTION</span>
          </div>

          {/* Rows */}
          {paginatedRequests.length > 0 ? (
            paginatedRequests.map((req) => (
              <div
                key={req.id}
                className="grid grid-cols-[0.5fr_2fr_1fr_2fr_0.5fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
              >
                <span>{req.id}</span>
                <span className="uppercase text-sm">{req.project_name}</span>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    statusColors[req.status]
                  }`}
                >
                  {req.status}
                </span>
                <span>{new Date(req.created_at).toLocaleString()}</span>
                <span className="relative flex items-center justify-center">
                  <button
                    className="hover:bg-[#fcd0d0] px-1 py-1 rounded-full flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(e, req.id);
                    }}
                  >
                    <MoreHorizontal size={22} className="text-gray-600" />
                  </button>

                  {openDropdownId === req.id && (
                    <div className="absolute right-0 mt-8 bg-white shadow border rounded text-sm w-30 z-50">
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
            <div className="text-center text-gray-500 py-5 italic">
              No requests found.
            </div>
          )}
        </>
      )}
    </div>
  </section>
  
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