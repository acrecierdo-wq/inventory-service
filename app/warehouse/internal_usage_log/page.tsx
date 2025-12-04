// app/warehouse/internal_usage_log/page.tsx

"use client";

import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { InternalUsage } from "./types/internal";
import InternalUsageActions from "./actions/usage_actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function normalizeStart(
  dateInput: string | Date | null | undefined
): Date | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function normalizeEnd(
  dateInput: string | Date | null | undefined
): Date | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}



const InternalUsagePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"Utilized" | "Archived">(
    "Utilized"
  );
  const [internal_usages, setInternalUsages] = useState<InternalUsage[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchInternalUsages = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/internal_usages");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch data.");

        setInternalUsages(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInternalUsages();
  }, [activeTab, currentPage, searchTerm]);

  const exportToCSV = () => {
    return new Promise<void>((resolve) => {
      const headers = [
        "Personnel Name",
        "Department",
        "Purpose",
        "Authorized By",
        "Note",
        "Logged At",
        "Logged By",
        "Status",
        "Items",
      ];
      const rows = filteredInternalUsages.map((item) => [
        item.personnelName,
        item.department,
        item.purpose,
        item.authorizedBy,
        item.note,
        item.loggedAt,
        item.loggedBy,
        item.status,
        item.items
          .map(
            (item) =>
              `${item.itemName} (${item.sizeName || "No Size"} | ${
                item.variantName || "No Variant"
              } | ${item.unitName || "No Unit"}) = ${item.quantity}`
          )
          .join(", "),
      ]);

      const BOM = "\uFEFF";
      const csvContent =
        BOM +
        [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");

      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Internal Usage_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resolve(); // signal completion
    });
  };

const exportToPDF = () => {
  if (typeof window === "undefined") return;

  const now = new Date();

  // --- Display Format for PDF Header ---
  const formattedDisplay = now.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // --- Filename Format ---
  const formattedFileName = now
    .toISOString()
    .replace(/[:]/g, "-")
    .replace("T", "_")
    .slice(0, 16); // YYYY-MM-DD_HH-MM

  const doc = new jsPDF("p", "pt", "a4");

  // ---- LOGO ----
  doc.addImage("/cticlogo.png", "PNG", 450, 15, 80, 80);

  // ---- HEADER ----
  doc.setFontSize(18);
  doc.setFont("garamond", "bold");
  doc.text("Canlubang Techno-Industrial Corporation", 40, 40);

  doc.setFontSize(12);
  doc.text("Internal Usage Report", 40, 60);

  // Export date
  doc.setFontSize(10);
  doc.text(`Exported: ${formattedDisplay}`, 40, 75);

  doc.setDrawColor(150);
  doc.setLineWidth(0.5);
  doc.line(40, 85, 420, 85);

  // ---- TABLE ----
  const headers = [
    "Personnel",
    "Department",
    "Purpose",
    "Authorized",
    "Note",
    "Logged At",
    "Logged By",
    "Status",
    "Items",
  ];

  const rows = filteredInternalUsages.map((item) => [
    item.personnelName,
    item.department,
    item.purpose,
    item.authorizedBy,
    item.note || "-",
    item.loggedAt,
    item.loggedBy,
    item.status,
    item.items
      .map(
        (i) =>
          `${i.itemName} (${i.sizeName || "No Size"} | ${
            i.variantName || "No variant"
          } | ${i.unitName || "No Unit"}) = ${i.quantity}`
      )
      .join(", "),
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 100,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [166, 124, 82],
    },
    columnStyles: {
      5: { cellWidth: 60 }, // Logged At
      6: { cellWidth: 60 }, // Logged By
      8: { cellWidth: 160 }, // Items (more space, readable)
    },
  });

  // ---- FOOTER PAGE NUMBERS ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(`Page ${i} of ${pageCount}`, 500, 820, { align: "right" });
  }

  // ---- FILE SAVE ----
  doc.save(`InternalUsage_Report_${formattedFileName}.pdf`);
};

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      if (format === "csv") {
        await exportToCSV();
      }
      if (format === "pdf") {
        exportToPDF();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const filteredInternalUsages = internal_usages
    .filter((usages) => usages.status === activeTab)
    .filter((usages) =>
      searchTerm
        ? usages.personnelName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          usages.purpose.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .filter((usages) => {
      // filter by date
      const raw = usages.loggedAt;
      if (!raw) return false;

      const date = new Date(raw);
      const start = normalizeStart(startDate);
      const end = normalizeEnd(endDate);

      if (start && end) {
        return date >= start && date <= end;
      }
      if (start && !end) {
        return date >= start;
      }
      if (!start && end) {
        return date <= end;
      }
      return true;
    });

  // const totalPages = Math.ceil(filteredInternalUsages.length / ITEMS_PER_PAGE);
  // const paginatedInternalUsages = filteredInternalUsages.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE
  // );

  const totalPages = Math.ceil(filteredInternalUsages.length / recordsPerPage);
  const paginatedInternalUsages = filteredInternalUsages.slice(
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
    <main className="h-screen w-full bg-[#ffedce] flex flex-col ">
      <Header />

      {/* Top Section - Tabs, Search, Filters, Actions */}
      <section className="flex flex-col lg:flex-row justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Tabs */}
        <div className="flex flex-row mt-4 gap-2 sm:gap-4">
          {/* Utilized Tab */}
          <div className="relative">
            <div
              onClick={() => {
                setActiveTab("Utilized");
                setCurrentPage(1);
              }}
              className={`h-10 w-20 sm:w-24 border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 
                      ${
                        activeTab === "Utilized"
                          ? "border-2 border-green-800 bg-green-600 hover:bg-green-800 shadow-md"
                          : "bg-white"
                      }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "Utilized"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Utilized
              </span>
            </div>
          </div>

          {/* Archived Tab */}
          <div className="relative">
            <div
              onClick={() => {
                setActiveTab("Archived");
                setCurrentPage(1);
              }}
              className={`h-10 w-20 sm:w-24 border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4
                      ${
                        activeTab === "Archived"
                          ? "border-2 border-red-800 bg-red-600 hover:bg-red-800 shadow-md"
                          : "bg-white"
                      }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "Archived"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Archived
              </span>
            </div>
          </div>
        </div>

        {/* Search, Filters, and Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
          {/* Search */}
          <div className="h-10 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row items-center px-3 w-full sm:w-auto">
            <Image
              src="/search-alt-2-svgrepo-com.svg"
              width={15}
              height={15}
              alt="Search"
              className="flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="ml-2 bg-transparent focus:outline-none w-full text-sm"
            />
          </div>

          {/* Filter Date */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <label className="whitespace-nowrap">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-2 text-xs rounded border-[#d2bda7] border-2 bg-white flex-1 sm:flex-none sm:w-32"
            />

            <label className="whitespace-nowrap">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-2 text-xs rounded border-[#d2bda7] border-2 bg-white flex-1 sm:flex-none sm:w-32"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Log New */}
            <Link
              href="/warehouse/internal_usage_log/new"
              className="flex-1 sm:flex-none"
            >
              <div className="h-10 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-center px-2 sm:px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 whitespace-nowrap">
                <Image
                  src="/circle-plus-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Add"
                  className="flex-shrink-0"
                />
                <span className="ml-1 text-xs sm:text-sm text-[#482b0e]">
                  Log New
                </span>
              </div>
            </Link>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`h-10 px-3 sm:px-4 rounded text-white text-xs sm:text-sm whitespace-nowrap flex-1 sm:flex-none ${
                    isExporting
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700 cursor-pointer"
                  }`}
                >
                  {isExporting ? "Exporting..." : "Export"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow border rounded text-sm w-32 z-50">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 mt-1 min-h-[400px]">
        <div className="bg-[#fffcf6] rounded shadow-md mb-2">
          {loading && <div className="text-center py-5">Loading...</div>}
          {error && (
            <div className="text-red-500 text-center py-5">{error}</div>
          )}

          {/* Internal Usage Log Table */}
          {!loading && !error && (
            <>
              {/* Desktop Table View (hidden on mobile) */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center text-sm">
                  <span>DATE | TIME</span>
                  <span>PERSONNEL</span>
                  <span>PURPOSE</span>
                  <span>STATUS</span>
                  <span>ACTION</span>
                </div>

                {paginatedInternalUsages.length > 0 ? (
                  paginatedInternalUsages.map((usages) => (
                    <div
                      key={usages.id}
                      className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 bg-white border-b border-gray-200 text-[#1e1d1c] text-center items-center"
                    >
                      <span className="text-sm">
                        {usages.loggedAt
                          ? format(new Date(usages.loggedAt), "PPP p")
                          : "N/A"}
                      </span>
                      <span className="text-sm">{usages.personnelName}</span>
                      <span className="text-sm">{usages.purpose}</span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full inline-block
                        ${
                          usages.status === "Utilized"
                            ? "bg-green-200 text-green-800"
                            : usages.status === "Archived"
                            ? "bg-red-200 text-red-800"
                            : ""
                        }`}
                      >
                        {usages.status}
                      </span>
                      <span className="flex items-center justify-center">
                        <InternalUsageActions
                          item={usages}
                          onDelete={async (id: number) => {
                            try {
                              await fetch(`/api/internal_usages/${id}`, {
                                method: "DELETE",
                              });
                              const updatedRes = await fetch(
                                "/api/internal_usages"
                              );
                              const updatedData = await updatedRes.json();
                              setInternalUsages(updatedData);
                              toast.success(
                                "Internal usage record archived successfully."
                              );
                            } catch {
                              toast.error(
                                "Failed to archive internal usage record."
                              );
                            }
                          }}
                        />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-5">
                    No records found.
                  </div>
                )}
              </div>

              {/* Mobile Card View (visible only on mobile) */}
              <div className="md:hidden">
                {paginatedInternalUsages.length > 0 ? (
                  <div className="space-y-3 p-4">
                    {paginatedInternalUsages.map((usages) => (
                      <div
                        key={usages.id}
                        className="bg-white rounded-lg border border-[#d2bda7] p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">
                              Date & Time
                            </div>
                            <div className="text-sm font-medium text-[#1e1d1c]">
                              {usages.loggedAt
                                ? format(new Date(usages.loggedAt), "PPP p")
                                : "N/A"}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap
                            ${
                              usages.status === "Utilized"
                                ? "bg-green-200 text-green-800"
                                : usages.status === "Archived"
                                ? "bg-red-200 text-red-800"
                                : ""
                            }`}
                          >
                            {usages.status}
                          </span>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div>
                            <div className="text-xs text-gray-500">
                              Personnel
                            </div>
                            <div className="text-sm text-[#1e1d1c]">
                              {usages.personnelName}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">Purpose</div>
                            <div className="text-sm text-[#1e1d1c]">
                              {usages.purpose}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-200">
                          <InternalUsageActions
                            item={usages}
                            onDelete={async (id: number) => {
                              try {
                                await fetch(`/api/internal_usages/${id}`, {
                                  method: "DELETE",
                                });
                                const updatedRes = await fetch(
                                  "/api/internal_usages"
                                );
                                const updatedData = await updatedRes.json();
                                setInternalUsages(updatedData);
                                toast.success(
                                  "Internal usage record archived successfully."
                                );
                              } catch {
                                toast.error(
                                  "Failed to archive internal usage record."
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-5">
                    No records found.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Pagination */}
      <div
        className="
      fixed bottom-0 left-0 
      lg:left-[250px] 
      w-full lg:w-[calc(100%-250px)] 
      bg-transparent py-3 
      flex justify-center items-center gap-2 
      z-10
    "
      >
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
          <strong>
            Page {currentPage} of {totalPages}
          </strong>
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

export default InternalUsagePage;
