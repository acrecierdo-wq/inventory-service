"use client";

import { useEffect, useState } from "react";
import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Link from "next/link";
import Image from "next/image";
import { Check, Truck, Package, ChevronDown } from "lucide-react";

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
  const requestsPerPage = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/my_request");
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error(err);
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

    // Search filter
    // Search filter
// Search filter
// Search filter
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

  // Pagination slice
  const indexOfLast = currentPage * requestsPerPage;
  const indexOfFirst = indexOfLast - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  return (
    <CustomerClientComponent>
      <div className="bg-[#fed795] min-h-screen w-full">
        <CustomerHeader />

        {/* Controls */}
        <div className="px-10 py-6">
          <h1 className="text-4xl font-extrabold text-[#173f63]">MY ORDERS</h1>

          <div className="flex items-center gap-3 justify-end mt-4 relative">
            {/* Status Filter */}
            <div className="relative">
              <button
                className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 hover:bg-[#f0d2ad] active:border-b-4"
                onClick={() => setShowFilterDropdown((prev) => !prev)}
              >
                <span className="text-[#482b0e] font-medium text-lg">
                  {statusFilter || "Status"}
                </span>
                <ChevronDown className="ml-2 text-[#482b0e]" size={20} />
              </button>
              {showFilterDropdown && (
                <div className="absolute mt-1 right-0 w-48 bg-white border rounded-md shadow-lg z-50">
                  {["", "Pending", "Accepted", "Cancelled", "Rejected"].map((status) => (
                    <button
                      key={status}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        statusFilter === status ? "font-bold text-blue-600" : ""
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
            <div className="relative">
              <button
                className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 hover:bg-[#f0d2ad] active:border-b-4"
                onClick={() => setShowTimeDropdown((prev) => !prev)}
              >
                <span className="text-[#482b0e] font-medium text-lg">
                  {timeFilter}
                </span>
                <ChevronDown className="ml-2 text-[#482b0e]" size={20} />
              </button>
              {showTimeDropdown && (
                <div className="absolute mt-1 right-0 w-48 bg-white border rounded-md shadow-lg z-50">
                  {["All Time", "Today", "Yesterday", "This Week", "This Month"].map((time) => (
                    <button
                      key={time}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        timeFilter === time ? "font-bold text-blue-600" : ""
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
            <div className="relative">
              <button
                className="h-12 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 hover:bg-[#f0d2ad] active:border-b-4"
                onClick={() => setShowSortDropdown((prev) => !prev)}
              >
                <span className="text-[#482b0e] font-medium text-lg">Sort</span>
                <ChevronDown className="ml-2 text-[#482b0e]" size={20} />
              </button>
              {showSortDropdown && (
                <div className="absolute mt-1 right-0 w-48 bg-white border rounded-md shadow-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setSortNewestFirst(true);
                      setShowSortDropdown(false);
                    }}
                  >
                    Newest → Oldest
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
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

            {/* Search */}
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
        </div>

        {/* Orders */}
        <div className="px-10 space-y-6">
          {currentRequests.length === 0 ? (
            <p className="text-gray-600">No requests found.</p>
          ) : (
            currentRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl bg-white shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Details */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#482b0e]">Request #{req.id}</h3>
                    <p className="text-[#482b0e]/80">
                      <span className="font-semibold">Project:</span> {req.project_name}
                    </p>
                    <p className="text-[#482b0e]/80">
                      <span className="font-semibold">Mode:</span> {req.mode || "N/A"}
                    </p>
                    <p className="text-[#482b0e]/80">
                      <span className="font-semibold">Status:</span> {req.status}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
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
                <div className="flex items-center justify-between px-6">
                  <div className="flex items-center flex-1">
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
                    </div>
                  </div>

                  <Link
                    href={`/customer/cus_myrequest/track_my_order/${req.id}`}
                    className="ml-6 px-5 py-2 rounded-3xl bg-[#f59e0b] text-white font-semibold shadow hover:bg-[#e68908] transition"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
        )}
      </div>
    </CustomerClientComponent>
  );
};

export default MyOrdersPage;
