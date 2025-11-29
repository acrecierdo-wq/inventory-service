// app/warehouse/replenishment_log/page.tsx

"use client";

import { Header } from "@/components/header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Replenishment } from "./types/replenishment";
import ReplenishmentActions from "./actions/replenishment_actions";
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

const ITEMS_PER_PAGE = 10;

const ReplenishmentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "Replenished" | "Draft" | "Archived"
  >("Replenished");
  const [replenishments, setReplenishments] = useState<Replenishment[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchReplenishments = async () => {
      console.log(
        "🔎 [fetchReplenishments] starting fetch to /api/replenishment"
      );
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/replenishment");
        console.log("🔎 [fetchReplenishments] response status:", res.status);

        const data = await res.json();
        console.log("🔎 [fetchReplenishments] raw data:", data);

        if (!res.ok) throw new Error(data.error || "Failed to fetch data.");

        setReplenishments(data);
        console.log(
          "🔎 [fetchReplenishments] state updated, count:",
          data.length
        );
      } catch (err: unknown) {
        console.log("🔎 [fetchReplenishments] error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error.");
        }
      } finally {
        setLoading(false);
        console.log("🔎 [fetchReplenishments] done");
      }
    };

    fetchReplenishments();
  }, []);

  const exportToCSV = () => {
    return new Promise<void>((resolve) => {
      const headers = [
        "Supplier",
        "PO Ref. No.",
        "Remarks",
        "DR Ref. No.",
        "Created At",
        "Replenished At",
        "Status",
        "Recorded By",
        "Items",
      ];
      const rows = filteredReplenishments.map((item) => [
        item.supplier,
        item.poRefNum,
        item.remarks,
        item.drRefNum,
        item.createdAt,
        item.replenishedAt,
        item.status,
        item.recordedBy,
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
      link.setAttribute("download", "Replenishment_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resolve(); // signal completion
    });
  };

  const exportToPDF = () => {
    if (typeof window === "undefined") return;

    const doc = new jsPDF("p", "pt", "a4"); // portrait, points, A4 size

    // Add a logo (use your own image or base64)
    // e.g. import logo from "@/assets/logo.png"; then use it:
    // doc.addImage(logo, "PNG", x, y, width, height);
    // Or load from URL/base64 string:
    // doc.addImage("data:image/png;base64,...", "PNG", 40, 20, 80, 40);

    // Company logo
    doc.addImage("/cticlogo.png", "PNG", 450, 15, 80, 80); // x=400, y=15, w=120 h=60

    // Company name at top
    doc.setFontSize(18);
    doc.setFont("garamond", "bold");
    doc.text("Canlubang Techno-Industrial Corporation", 40, 40);

    // Subtitle or report name
    doc.setFontSize(12);
    doc.text("Replenishment Report", 40, 60);

    // A line under header
    doc.setDrawColor(150);
    doc.setLineWidth(0.5);
    doc.line(40, 80, 420, 80);

    // Table data
    const headers = [
      "Supplier",
      "PO Ref. No.",
      "Remakrs",
      "DR Ref. No.",
      "Created At",
      "Replenished At",
      "Status",
      "Recorded By",
      "Items",
    ];

    const rows = filteredReplenishments.map((item) => [
      item.supplier,
      item.poRefNum,
      item.remarks || "None",
      item.drRefNum,
      item.createdAt,
      item.replenishedAt,
      item.status,
      item.recordedBy,
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
      styles: { fontSize: 8 },
      headStyles: { fillColor: [166, 124, 82] }, // brown header
    });

    // Footer: page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount}`, 500, 820, { align: "right" });
    }

    doc.save("Replenishment_Report.pdf");
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

  const filteredReplenishments = replenishments
    .filter((replenishments) => replenishments.status === activeTab)
    .filter((replenishments) =>
      searchTerm
        ? replenishments.supplier
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          replenishments.drRefNum
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true
    )
    .filter((replenishments) => {
      // which date to filter by: issued or created
      const raw = replenishments.replenishedAt || replenishments.createdAt;
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

  const totalPages = Math.ceil(filteredReplenishments.length / ITEMS_PER_PAGE);
  const paginatedReplenishments = filteredReplenishments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen w-full bg-[#ffedce] flex flex-col">
      <Header />
      <section className="flex flex-col lg:flex-row justify-between mt-20 sm:mt-30 lg:mt-32 px-4 sm:px-6 lg:px-10 gap-4">
        <div className="flex flex-row gap-2 sm:gap-4 overflow-x-auto">
          {/* Replenished Tab */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("Replenished");
                setCurrentPage(1);
              }}
              className={`h-10 px-3 sm:px-4 mt-3 border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 whitespace-nowrap
                        ${
                          activeTab === "Replenished"
                            ? "border-2 border-green-800 bg-green-600 hover:bg-green-800 shadow-md"
                            : "bg-white"
                        }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "Replenished"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Replenished
              </span>
            </div>
          </div>

          {/* Archived Tab */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("Archived");
                setCurrentPage(1);
              }}
              className={`h-10 px-3 sm:px-4 mt-3 border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 whitespace-nowrap
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

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
          {/* Search */}
          <div className="h-8 w-full sm:w-auto rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row flex-1 sm:flex-initial">
            <Image
              src="/search-alt-2-svgrepo-com.svg"
              width={0}
              height={0}
              alt="Search"
              className="ml-3 sm:ml-5 w-[15px] h-auto"
            />

            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="ml-2 bg-transparent focus:outline-none flex-1 text-sm"
            />
          </div>

          {/* Filter Date */}
          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-xs whitespace-nowrap">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 w-32 text-xs rounded border-[#d2bda7] border-2 bg-white px-1"
            />

            <label className="text-xs whitespace-nowrap">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 w-32 text-xs rounded border-[#d2bda7] border-2 bg-white px-1"
            />
          </div>

          {/* Log New */}
          <div className="relative">
            <Link href="/warehouse/replenishment_log/new">
              <div className="h-10 px-3 sm:px-4 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 whitespace-nowrap">
                <Image
                  src="/circle-plus-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Add"
                />
                <span className="ml-1 text-xs sm:text-sm text-[#482b0e]">
                  Log New
                </span>
              </div>
            </Link>
          </div>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`h-8 px-3 sm:px-4 rounded text-white text-xs sm:text-sm mt-1 whitespace-nowrap ${
                  isExporting
                    ? "bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="absolute right-0 z-100 bg-white shadow border rounded text-sm w-32">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <section className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 mt-5 min-h-[400px] pb-20">
        <div className="bg-[#fffcf6] rounded shadow-md mb-2 overflow-x-auto">
          {loading && <div className="text-center mt-5 py-5">Loading...</div>}
          {error && (
            <div className="text-red-500 text-center py-5">{error}</div>
          )}

          {/* Replenishment Log Table */}
          {!loading && !error && (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-[2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
                  <span>DATE | TIME</span>
                  <span>SUPPLIER</span>
                  <span>PO Number</span>
                  <span>DR No.</span>
                  <span>STATUS</span>
                  <span>ACTION</span>
                </div>

                {paginatedReplenishments.length > 0 ? (
                  paginatedReplenishments.map((replenishments) => (
                    <div
                      key={replenishments.id}
                      className="grid grid-cols-[2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center items-center"
                    >
                      <span className="text-sm">
                        {format(
                          new Date(
                            replenishments.replenishedAt ||
                              replenishments.createdAt
                          ),
                          "PPP p"
                        )}
                      </span>
                      <span className="text-sm">{replenishments.supplier}</span>
                      <span className="text-sm">
                        {replenishments.poRefNum || "-"}
                      </span>
                      <span className="text-sm">
                        {replenishments.drRefNum || "-"}
                      </span>
                      <span
                        className={`text-center px-2 text-xs py-1 rounded-full
                          ${
                            replenishments.status === "Replenished"
                              ? "bg-green-200 text-green-800"
                              : replenishments.status === "Archived"
                              ? "bg-red-200 text-red-800"
                              : replenishments.status === "Draft"
                              ? "bg-slate-300 text-white"
                              : ""
                          }`}
                      >
                        {replenishments.status}
                      </span>
                      <span className="relative flex items-center justify-center">
                        <ReplenishmentActions
                          item={replenishments}
                          onDelete={async (id: number) => {
                            try {
                              await fetch(`/api/replenishment/${id}`, {
                                method: "DELETE",
                              });
                              const updatedRes = await fetch(
                                "/api/replenishment"
                              );
                              const updatedData = await updatedRes.json();
                              setReplenishments(updatedData);
                              toast.success(
                                "Replenishment archived successfully."
                              );
                            } catch {
                              toast.error("Failed to archive replenishment.");
                            }
                          }}
                          onRestore={async (id: number) => {
                            try {
                              setReplenishments((prev) =>
                                prev.filter((i) => i.id !== id)
                              );
                              await fetch(`/api/replenishment/${id}`, {
                                method: "PATCH",
                              });
                              toast.success(
                                "Replenishment restored successfully."
                              );
                              const updatedRes = await fetch(
                                "/api/replenishment"
                              );
                              const updatedData = await updatedRes.json();
                              setReplenishments(updatedData);
                            } catch {
                              toast.error("Failed to restore replenishment.");
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

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden">
                {paginatedReplenishments.length > 0 ? (
                  paginatedReplenishments.map((replenishments) => (
                    <div
                      key={replenishments.id}
                      className="bg-white border-b border-gray-200 p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">
                            {format(
                              new Date(
                                replenishments.replenishedAt ||
                                  replenishments.createdAt
                              ),
                              "PPP p"
                            )}
                          </div>
                          <div className="font-semibold text-[#1e1d1c]">
                            {replenishments.supplier}
                          </div>
                        </div>
                        <span
                          className={`px-3 text-xs py-1 rounded-full whitespace-nowrap
                            ${
                              replenishments.status === "Replenished"
                                ? "bg-green-200 text-green-800"
                                : replenishments.status === "Archived"
                                ? "bg-red-200 text-red-800"
                                : replenishments.status === "Draft"
                                ? "bg-slate-300 text-white"
                                : ""
                            }`}
                        >
                          {replenishments.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">PO Number:</span>
                          <div className="text-[#1e1d1c]">
                            {replenishments.poRefNum || "-"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">DR No.:</span>
                          <div className="text-[#1e1d1c]">
                            {replenishments.drRefNum || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <ReplenishmentActions
                          item={replenishments}
                          onDelete={async (id: number) => {
                            try {
                              await fetch(`/api/replenishment/${id}`, {
                                method: "DELETE",
                              });
                              const updatedRes = await fetch(
                                "/api/replenishment"
                              );
                              const updatedData = await updatedRes.json();
                              setReplenishments(updatedData);
                              toast.success(
                                "Replenishment archived successfully."
                              );
                            } catch {
                              toast.error("Failed to archive replenishment.");
                            }
                          }}
                          onRestore={async (id: number) => {
                            try {
                              setReplenishments((prev) =>
                                prev.filter((i) => i.id !== id)
                              );
                              await fetch(`/api/replenishment/${id}`, {
                                method: "PATCH",
                              });
                              toast.success(
                                "Replenishment restored successfully."
                              );
                              const updatedRes = await fetch(
                                "/api/replenishment"
                              );
                              const updatedData = await updatedRes.json();
                              setReplenishments(updatedData);
                            } catch {
                              toast.error("Failed to restore replenishment.");
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))
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
      <div className="fixed bottom-0 left-0 lg:left-[285px] w-full lg:w-[calc(100%-285px)] bg-[#ffedce] py-2 flex justify-center shadow-inner z-10">
        <Pagination>
          <PaginationContent className="flex-wrap">
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index} className="hidden sm:inline-block">
                <PaginationLink
                  href="#"
                  className={
                    currentPage === index + 1 ? "bg-[#d2bda7] text-white" : ""
                  }
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem className="sm:hidden">
              <span className="px-4 text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationNext
              href="#"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            />
          </PaginationContent>
        </Pagination>
      </div>
    </main>
  );
};

export default ReplenishmentPage;
