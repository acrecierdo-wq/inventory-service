/// app/customer/cus_myrequest/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { CustomerHeader } from "@/components/header-customer";
import Link from "next/link";
import Image from "next/image";
import { Check, Truck, Package } from "lucide-react";

type QuotationRequest = {
  id: number;
  project_name: string;
  mode: string | null;
  status: string;
  created_at: string;
};

const MyOrdersPage = () => {
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuotationRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const steps = [
    { key: "quotation", label: "Quotation", icon: Package },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { key: "completed", label: "Completed", icon: Check },
  ];

  const getActiveStep = (status: string) => {
    const s = status.toLowerCase();
    if (["quotation_sent", "quotation_accepted"].includes(s)) return 0;
    if (["purchase_order_created", "processing", "out_for_delivery"].includes(s)) return 1;
    if (s === "completed") return 2;
    return 0;
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/customer/my_requests");

        if (!res.ok) {
          console.error("Failed to fetch requests:", res.statusText);
          return;
        }
        
        const data = await res.json();
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error("Network or parsing error", err);
      }
    };
    fetchRequests();
  }, []);

  // Filtering + Sorting
  useEffect(() => {
    let updated = [...requests];

    // Status filter
    if (statusFilter) {
      updated = updated.filter((req) => req.status === statusFilter);
    }

if (searchQuery.trim()) {
  let query = searchQuery.toLowerCase().trim();

  // Handle "request #199", "req 199", "req#199", etc.
  query = query.replace(/req(uest)?\s*#?/i, "").trim();

  updated = updated.filter(
    (req) =>
      req.project_name.toLowerCase().includes(query) ||
      req.mode?.toLowerCase().includes(query) ||
      req.status.toLowerCase().includes(query) ||
      req.id.toString().includes(query)
  );
}

    // Time filter
    const today = new Date();
    if (timeFilter !== "All Time") {
      updated = updated.filter((req) => {
        const createdDate = new Date(req.created_at);
        if (timeFilter === "Today") {
          return createdDate.toDateString() === today.toDateString();
        }
        if (timeFilter === "Yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return createdDate.toDateString() === yesterday.toDateString();
        }
        if (timeFilter === "This Week") {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
          return createdDate >= startOfWeek;
        }
        if (timeFilter === "This Month") {
          return (
            createdDate.getMonth() === today.getMonth() &&
            createdDate.getFullYear() === today.getFullYear()
          );
        }
        return true;
      });
    }

    // Sorting
    updated.sort((a, b) =>
      sortNewestFirst
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    setFilteredRequests(updated);
    setCurrentPage(1);
  }, [requests, statusFilter, timeFilter, searchQuery, sortNewestFirst]);

  const filterRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
              setShowFilterDropdown(false);
      }
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) {
              setShowTimeDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
              setShowSortDropdown(false);
      }
      };
      document.addEventListener("click", handleClickOutside);
      return () => {
      document.removeEventListener("click", handleClickOutside);
      };
  }, []);
  

  // Pagination slice
  // const indexOfLast = currentPage * requestsPerPage;
  // const indexOfFirst = indexOfLast - requestsPerPage;
  // const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  // const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

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
    
      <main className="bg-[url('/customer_p&s(1).jpg')] bg-cover bg-center h-full w-full overflow-y-auto flex flex-col relative">
        <CustomerHeader />

        {/* Controls */}
        <div className="px-10 py-2">

          <div className="flex items-center gap-3 justify-end mt-2 relative">
            {/* Search */}
            <div className="h-8 w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row text-[#8a6f56] mt-1 hover:bg-gray-100">
              <Image src="/search-alt-2-svgrepo-com.svg" width={15} height={15} alt="Search" className="ml-5" />
              <input
                type="text"
                className="ml-2 w-full bg-transparent outline-none"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative" ref={filterRef}>
              <button
                className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                onClick={() => setShowFilterDropdown((prev) => !prev)}
              >
                <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" className="" />
                <span className="text-sm text-[#482b0e] ml-1">
                  {statusFilter || "Status"}
                </span>
                {/* <ChevronDown className="ml-2 text-[#482b0e]" size={20} /> */}
              </button>
              {showFilterDropdown && (
                <div className="absolute mt-1 right-0 w-32 bg-white border rounded-md shadow-lg z-50">
                  {["", "Pending", "Accepted", "Cancelled", "Rejected"].map((status) => (
                    <button
                      key={status}
                      className={`w-full text-center px-4 py-1 hover:bg-gray-100 text-sm ${
                        statusFilter === status ? "font-bold bg-gray-200" : ""
                      }`}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
                      }}
                    >
                      {status || "All Statuses"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Filter */}
            <div className="relative" ref={timeRef}>
              <button
                className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                onClick={() => setShowTimeDropdown((prev) => !prev)}
              >
                <Image src="/document-text-svgrepo-com.svg" width={20} height={20} alt="Filter" className="" />
                <span className="text-sm text-[#482b0e] ml-1">
                  {timeFilter}
                </span>
                {/* <ChevronDown className="ml-2 text-[#482b0e]" size={20} /> */}
              </button>
              {showTimeDropdown && (
                <div className="absolute mt-1 right-0 w-30 bg-white border rounded-md shadow-lg z-50">
                  {["All Time", "Today", "Yesterday", "This Week", "This Month"].map((time) => (
                    <button
                      key={time}
                      className={`w-full text-center px-4 py-1 hover:bg-gray-100 text-sm ${
                        timeFilter === time ? "font-bold bg-gray-200" : ""
                      }`}
                      onClick={() => {
                        setTimeFilter(time);
                        setShowTimeDropdown(false);
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                onClick={() => setShowSortDropdown((prev) => !prev)}
              >
                <Image
                  src="/sort-ascending-fill-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Sort"
                  className=""
                />
                <span className="text-sm text-[#482b0e] ml-1">Sort</span>
              </button>
              {showSortDropdown && (
                <div className="absolute mt-1 right-0 w-48 bg-white border rounded-md shadow-lg z-50">
                  <button
                    className={`w-full text-center px-4 py-1 hover:bg-gray-100 text-sm ${
                      sortNewestFirst ? "font-bold" : ""
                    }`}
                    onClick={() => {
                      setSortNewestFirst(true);
                      setShowSortDropdown(false);
                    }}
                  >
                    Newest → Oldest
                  </button>
                  <button
                    className={`w-full text-center px-4 py-1 hover:bg-gray-100 text-sm ${
                      !sortNewestFirst ? "font-bold" : ""
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

          </div>
        </div>

        {/* Orders */}
        <div className="px-10 space-y-6 mb-2">
          {paginatedRequests.length === 0 ? (
            <p className="text-gray-600 italic">No requests found.</p>
          ) : (
            paginatedRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl bg-white shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Details */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#482b0e]">Request #{req.id}</h3>
                    <p className="text-[#482b0e]/80">
                      <span className="font-semibold">Project:</span> <span className="uppercase">{req.project_name}</span>
                    </p>
                    <p className="text-[#482b0e]/80">
                      <span className="font-semibold">Mode:</span> {req.mode || "N/A"}
                    </p>
                    <p className="text-[#482b0e]/80">
                      <span className="font-semibold">Status:</span> {req.status}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    Requested at:{" "}
                    {new Date(req.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {new Date(req.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>

                {/* Progress Tracker + Button */}
                <div className="flex items-center justify-between px-6 ml-6 mr-6">
                  {/* <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center shadow-lg">
                        <Package className="text-white w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shadow-lg">
                        <Truck className="text-white w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shadow-lg">
                        <Check className="text-white w-6 h-6" />
                      </div>
                    </div> */}
                    {steps.map((step, index) => {
                      const isActive = index <= getActiveStep(req.status);
                      return (
                        <div key={step.key} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                isActive ? "bg-green-500" : "bg-gray-300"
                              }`}
                            >
                              <step.icon className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xs mt-1"></span>
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`flex-1 h-1 mx-2 ${
                                index < getActiveStep(req.status) ? "bg-green-500" : "bg-gray-300"
                              }`}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                    <Link
                    href={`/customer/cus_myrequest/track_my_order/${req.id}`}
                    className="px-4 py-2 rounded-3xl bg-[#f59e0b] text-white font-semibold shadow hover:bg-[#e68908] transition"
                  >
                    Track Order
                  </Link>
                  </div>

                  
                </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {/* {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === i + 1
                    ? "bg-[#173f63] text-white font-bold shadow"
                    : "bg-white text-[#173f63] hover:bg-[#f0d2ad]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )} */}
{/* Pagination */}
{totalPages > 1 && (
  <div className="absolute bottom-0 left-0 w-full bg-[#ffedce] py-3 flex justify-center items-center gap-2 z-50">
    <button
      onClick={handlePrevPage}
      disabled={currentPage === 1}
      className={`h-8 px-4 rounded-md transition ${
        currentPage === 1
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-[#0c2a42] text-white hover:bg-[#163b5f]"
      }`}
    >
      Prev
    </button>

    <span className="text-[#5a4632] text-sm font-medium">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={handleNextPage}
      disabled={currentPage === totalPages}
      className={`h-8 px-4 rounded-md transition ${
        currentPage === totalPages
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-[#0c2a42] text-white hover:bg-[#163b5f]"
      }`}
    >
      Next
    </button>
  </div>
)}

        
      </main>
  );
};

export default MyOrdersPage;
