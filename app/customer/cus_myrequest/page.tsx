"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { CustomerHeader } from "@/components/header-customer";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check, Truck, Package, Search, Filter, Clock3, SortDesc } from "lucide-react";

type QuotationRequest = {
  id: number;
  project_name: string;
  mode: string | null;
  status: string;
  created_at: string;
};

const steps = [
  { key: "quotation", label: "Quotation", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "completed", label: "Completed", icon: Check },
];

const getActiveStep = (status: string) => {
  const s = status.toLowerCase();
  if (["quotation_sent", "quotation_accepted", "pending"].includes(s)) return 0;
  if (["purchase_order_created", "processing", "out_for_delivery", "accepted"].includes(s)) return 1;
  if (["completed"].includes(s)) return 2;
  return 0;
};

const timeOptions = ["All Time", "Today", "Yesterday", "This Week", "This Month"];

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

  const filterRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/customer/my_requests");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRequests(data);
        setFilteredRequests(data);
      } catch {
        setRequests([]);
        setFilteredRequests([]);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterRef.current && !filterRef.current.contains(target)) setShowFilterDropdown(false);
      if (timeRef.current && !timeRef.current.contains(target)) setShowTimeDropdown(false);
      if (sortRef.current && !sortRef.current.contains(target)) setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let updated = [...requests];

    if (statusFilter) updated = updated.filter((req) => req.status === statusFilter);

    if (searchQuery.trim()) {
      let query = searchQuery.toLowerCase().trim();
      query = query.replace(/req(uest)?\s*#?/i, "").trim();
      updated = updated.filter(
        (req) =>
          req.project_name.toLowerCase().includes(query) ||
          req.mode?.toLowerCase().includes(query) ||
          req.status.toLowerCase().includes(query) ||
          req.id.toString().includes(query)
      );
    }

    const today = new Date();
    if (timeFilter !== "All Time") {
      updated = updated.filter((req) => {
        const createdDate = new Date(req.created_at);
        if (timeFilter === "Today") return createdDate.toDateString() === today.toDateString();
        if (timeFilter === "Yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return createdDate.toDateString() === yesterday.toDateString();
        }
        if (timeFilter === "This Week") {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          return createdDate >= startOfWeek;
        }
        if (timeFilter === "This Month")
          return (
            createdDate.getMonth() === today.getMonth() && createdDate.getFullYear() === today.getFullYear()
          );
        return true;
      });
    }

    updated.sort((a, b) =>
      sortNewestFirst
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    setFilteredRequests(updated);
    setCurrentPage(1);
  }, [requests, statusFilter, searchQuery, timeFilter, sortNewestFirst]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / recordsPerPage));
  const paginatedRequests = useMemo(
    () =>
      filteredRequests.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
      ),
    [filteredRequests, currentPage]
  );

  return (
    <div className="relative min-h-screen bg-[#ffedce] text-[#4f2d12] pb-20">
      <CustomerHeader />

      {/* Hero */}
      <section className="px-4 pt-4 lg:px-10">
        <div className="rounded-[32px] border border-white/40 bg-gradient-to-r from-[#fff7ec] via-[#ffe9ce] to-[#ffdcb9] p-6 shadow-xl">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b26c27]">My Requests</p>
          <h1 className="mt-2 text-3xl font-semibold">Overview of your quotation fulfillment</h1>
          <p className="mt-2 text-sm text-[#7c4722]">
            Track each request from quotation to completion. Filter by status, time, or search for a specific project.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#7c4722]">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#c07921]" />
              {requests.length} total requests
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#c07921]" />
              {requests.filter((r) => ["processing", "out_for_delivery"].includes(r.status.toLowerCase())).length} in transit
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#c07921]" />
              {requests.filter((r) => r.status.toLowerCase() === "completed").length} completed
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="px-4 py-4 lg:px-10 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#916034]" size={18} />
            <input
              className="w-full rounded-2xl border border-[#f4d7b8] bg-white/90 px-11 py-3 text-sm text-[#5f3817] shadow-sm focus:border-[#f0b562] focus:outline-none focus:ring-2 focus:ring-[#f0d2af]"
              placeholder="Search by project, ID, or mode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Status */}
            <div className="relative" ref={filterRef}>
              <button
                className="flex items-center gap-2 rounded-2xl border border-[#f4d7b8] bg-white px-4 py-3 text-sm font-semibold text-[#5f3817] shadow-sm hover:bg-[#fff6ea]"
                onClick={() => setShowFilterDropdown((prev) => !prev)}
              >
                <Filter size={16} />
                {statusFilter || "All Status"}
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#f6e2cb] bg-white shadow-lg">
                  {["", "Pending", "Accepted", "Cancelled", "Rejected"].map((status) => (
                    <button
                      key={status || "all"}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#fff5e4] ${
                        statusFilter === status ? "font-semibold text-[#b26c27]" : "text-[#6e4420]"
                      }`}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
                      }}
                    >
                      {status || "All Status"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time */}
            <div className="relative" ref={timeRef}>
              <button
                className="flex items-center gap-2 rounded-2xl border border-[#f4d7b8] bg-white px-4 py-3 text-sm font-semibold text-[#5f3817] shadow-sm hover:bg-[#fff6ea]"
                onClick={() => setShowTimeDropdown((prev) => !prev)}
              >
                <Clock3 size={16} />
                {timeFilter}
              </button>
              {showTimeDropdown && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-[#f6e2cb] bg-white shadow-lg">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#fff5e4] ${
                        timeFilter === time ? "font-semibold text-[#b26c27]" : "text-[#6e4420]"
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
                className="flex items-center gap-2 rounded-2xl border border-[#f4d7b8] bg-white px-4 py-3 text-sm font-semibold text-[#5f3817] shadow-sm hover:bg-[#fff6ea]"
                onClick={() => setShowSortDropdown((prev) => !prev)}
              >
                <SortDesc size={16} />
                {sortNewestFirst ? "Newest → Oldest" : "Oldest → Newest"}
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#f6e2cb] bg-white shadow-lg">
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#fff5e4] ${
                      sortNewestFirst ? "font-semibold text-[#b26c27]" : "text-[#6e4420]"
                    }`}
                    onClick={() => {
                      setSortNewestFirst(true);
                      setShowSortDropdown(false);
                    }}
                  >
                    Newest → Oldest
                  </button>
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#fff5e4] ${
                      !sortNewestFirst ? "font-semibold text-[#b26c27]" : "text-[#6e4420]"
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

        {/* Status pills */}
        <div className="px-4 lg:px-10 flex flex-wrap gap-2">
          {["All", "Pending", "Accepted", "Processing", "Completed"].map((label) => {
            const value = label === "All" ? "" : label;
            return (
              <button
                key={label}
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === value
                    ? "bg-[#173f63] text-white shadow-lg"
                    : "bg-white/80 text-[#6e4420] border border-[#f4d7b8] hover:bg-[#fff3dd]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Requests list */}
      <section className="px-4 lg:px-10 space-y-4">
        {paginatedRequests.length === 0 ? (
          <div className="rounded-3xl bg-white/90 border border-[#f4d7b8] p-10 text-center text-[#7c4722]">
            No requests found. Adjust your filters or submit a new request.
          </div>
        ) : (
          paginatedRequests.map((req) => {
            const activeStep = getActiveStep(req.status);
            return (
              <div
                key={req.id}
                className="rounded-[32px] border border-[#f4d7b8] bg-white/95 p-6 shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-[#b26c27]">
                      Request #{req.id}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold uppercase">{req.project_name}</h3>
                    <p className="mt-1 text-sm text-[#7c4722]">
                      Mode: {req.mode || "N/A"} • Status: <span className="font-semibold">{req.status}</span>
                    </p>
                    <p className="text-xs text-[#a36b3b] mt-1">
                      {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/customer/cus_myrequest/track_my_order/${req.id}`}
                    className="rounded-full bg-[#f59e0b] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#dd8b07]"
                  >
                    Track Order
                  </Link>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex items-center">
                    {steps.map((step, index) => {
                      const isActive = index <= activeStep;
                      return (
                        <div key={step.key} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full shadow-lg",
                                isActive ? "bg-[#1f8a4b]" : "bg-[#f0d2ad]"
                              )}
                            >
                              <step.icon className="text-white" />
                            </div>
                            <span className="mt-2 text-xs text-[#6e4420]">{step.label}</span>
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={cn(
                                "mx-3 h-1 flex-1 rounded-full",
                                index < activeStep ? "bg-[#1f8a4b]" : "bg-[#f0d2ad]"
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#fbe8cf] via-[#ffedce]/90 to-transparent py-4 shadow-[0_-15px_30px_rgba(255,237,206,0.6)] flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              currentPage === 1
                ? "bg-white/70 text-gray-400 cursor-not-allowed"
                : "bg-[#173f63] text-white shadow-lg hover:bg-[#0f2b45]"
            }`}
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-[#6e4420]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              currentPage === totalPages
                ? "bg-white/70 text-gray-400 cursor-not-allowed"
                : "bg-[#173f63] text-white shadow-lg hover:bg-[#0f2b45]"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;