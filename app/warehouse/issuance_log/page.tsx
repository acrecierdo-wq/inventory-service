// app/warehouse/issuance_log/page.tsx

"use client";
import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import IssuanceActions from "./issuance_actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { IssuanceItem } from "./types/issuance";
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

//const ITEMS_PER_PAGE = 10;

const IssuanceLogPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [item_issuances, setItemIssuances] = useState<IssuanceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"Issued" | "Draft" | "Archived">(
    "Issued"
  );
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchIssuances = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/issuances");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch data.");

        setItemIssuances(data);
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

    fetchIssuances();
  }, []);

  const exportToCSV = () => {
    return new Promise<void>((resolve) => {
      const headers = [
        "Client Name",
        "Dispatcher Name",
        "Customer PO No.",
        "PRF No.",
        "DR No.",
        "Created At",
        "Issued At",
        "Status",
        "Items",
      ];
      const rows = filteredIssuances.map((item) => [
        item.clientName,
        item.dispatcherName,
        item.customerPoNumber,
        item.prfNumber,
        item.drNumber,
        item.createdAt,
        item.issuedAt,
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
      link.setAttribute("download", "Issuance_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resolve();
    });
  };

  const exportToPDF = () => {
    if (typeof window === "undefined") return;

    const doc = new jsPDF("p", "pt", "a4");

    doc.addImage("/cticlogo.png", "PNG", 450, 15, 80, 80);

    doc.setFontSize(18);
    doc.setFont("garamond", "bold");
    doc.text("Canlubang Techno-Industrial Corporation", 40, 40);

    doc.setFontSize(12);
    doc.text("Issuance Report", 40, 60);

    doc.setDrawColor(150);
    doc.setLineWidth(0.5);
    doc.line(40, 80, 420, 80);

    const headers = [
      "Client Name",
      "Dispatcher Name",
      "Customer PO No.",
      "PRF No.",
      "DR No.",
      "Created At",
      "Issued At",
      "Status",
      "Items",
    ];

    const rows = filteredIssuances.map((item) => [
      item.clientName,
      item.dispatcherName,
      item.customerPoNumber,
      item.prfNumber,
      item.drNumber,
      item.createdAt,
      item.issuedAt,
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
      styles: { fontSize: 8 },
      headStyles: { fillColor: [166, 124, 82] },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount}`, 500, 820, { align: "right" });
    }

    doc.save("Issuance_Report.pdf");
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

  const filteredIssuances = item_issuances
    .filter((issuance) => issuance.status === activeTab)
    .filter((issuance) =>
      searchTerm
        ? issuance.clientName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          issuance.drNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issuance.dispatcherName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true
    )
    .filter((issuance) => {
      const raw = issuance.issuedAt || issuance.createdAt;
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

    const totalPages = Math.ceil(filteredIssuances.length / recordsPerPage);
  const paginatedIssuances = filteredIssuances.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // const totalPages = Math.ceil(filteredIssuances.length / ITEMS_PER_PAGE);
  // const paginatedIssuances = filteredIssuances.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE
  // );

  return (
    <main className="min-h-screen w-full bg-[#ffedce] flex flex-col">
      <Header />

      {/* Tabs and Controls Section - Responsive */}
      <section className="flex flex-col lg:flex-row lg:justify-between mt-32 lg:mt-22 px-3 sm:px-4 lg:px-6 gap-4">
        {/* Tabs */}
        <div className="flex flex-row gap-2 sm:gap-4 overflow-x-auto">
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("Issued");
                setCurrentPage(1);
              }}
              className={`h-10 w-20 sm:w-24 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 
                      ${
                        activeTab === "Issued"
                          ? "border-2 border-green-800 bg-green-600 shadow-md hover:bg-green-800"
                          : "bg-white border-b-2 border-[#d2bda7]"
                      }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "Issued"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Issued
              </span>
            </div>
          </div>

          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("Draft");
                setCurrentPage(1);
              }}
              className={`h-10 w-20 sm:w-24 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4
                      ${
                        activeTab === "Draft"
                          ? "border-2 border-slate-700 bg-slate-500 hover:bg-slate-700 shadow-md"
                          : "bg-white border-b-2 border-[#d2bda7]"
                      }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "Draft"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Draft
              </span>
            </div>
          </div>

          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("Archived");
                setCurrentPage(1);
              }}
              className={`h-10 w-20 sm:w-24 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4
                      ${
                        activeTab === "Archived"
                          ? "border-2 border-red-800 bg-red-600 hover:bg-red-800 shadow-md"
                          : "bg-white border-b-2 border-[#d2bda7]"
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

        {/* Controls Section */}
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          {/* First Row: Search and Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Search */}
            <div className="h-10 w-full sm:w-60 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row items-center">
              <Image
                src="/search-alt-2-svgrepo-com.svg"
                width={15}
                height={15}
                alt="Search"
                className="ml-3 sm:ml-5"
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

            {/* Log New Button */}
            <div className="relative w-full sm:w-auto">
              <Link href="/warehouse/issuance_log/new">
                <div className="h-10 w-full sm:w-auto bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                  <Image
                    src="/circle-plus-svgrepo-com.svg"
                    width={20}
                    height={20}
                    alt="Add"
                  />
                  <span className="ml-1 text-sm text-[#482b0e]">Log New</span>
                </div>
              </Link>
            </div>

            {/* Export Button */}
            <div className="w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`h-10 px-4 rounded text-white w-full sm:w-auto ${
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
          </div>

          {/* Second Row: Date Filters */}
          <div className="flex gap-2 items-center">
            <label className="text-xs">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 flex-1 sm:w-32 text-xs rounded border-[#d2bda7] border-2 bg-white px-2"
            />

            <label className="text-xs">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 flex-1 sm:w-32 text-xs rounded border-[#d2bda7] border-2 bg-white px-2"
            />
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="flex-1 overflow-x-auto px-3 sm:px-4 lg:px-6 mt-2 pb-15">
        <div className="bg-[#fffcf6] rounded shadow-md min-w-full">
          
          {loading && <div className="text-center py-8">Loading...</div>}
          {error && (
            <div className="text-red-500 text-center py-8">{error}</div>
          )}

          {!loading && !error && (
            <>
              {/* Desktop/Tablet Table Header */}
              <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center text-sm">
                <span>DATE | TIME</span>
                <span>CLIENT</span>
                {/* <span>DISPATCHER</span> */}
                <span>DR No.</span>
                <span>STATUS</span>
                <span>ACTION</span>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {paginatedIssuances.length > 0 ? (
                  paginatedIssuances.map((issuance) => (
                    <div
                      key={issuance.id}
                      className="px-4 py-3 bg-white border-b border-gray-200 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(issuance.issuedAt || issuance.createdAt),
                              "PPP p"
                            )}
                          </p>
                          <p className="font-semibold text-sm">
                            {issuance.clientName}
                          </p>
                          {/* <p className="text-xs text-gray-600">
                            {issuance.dispatcherName}
                          </p> */}
                          <p className="text-xs text-gray-600">
                            DR: {issuance.drNumber || "-"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-center px-3 text-xs py-1 rounded-full
                            ${
                              issuance.status ===
                              "Issued"
                                ? "bg-green-200 text-green-800"
                                : issuance.status ===
                                  "Archived"
                                ? "bg-red-200 text-red-800"
                                : issuance.status ===
                                  "Draft"
                                ? "bg-slate-300 text-white"
                                : ""
                            }`}
                          >
                            {issuance.status}
                          </span>
                          <IssuanceActions
                            item={issuance}
                            onDelete={async (id: number) => {
                              try {
                                await fetch(`/api/issuances/${id}`, {
                                  method: "DELETE",
                                });
                                const updatedRes = await fetch(
                                  "/api/issuances"
                                );
                                const updatedData = await updatedRes.json();
                                setItemIssuances(updatedData);
                                toast.success(
                                  "Issuance archived successfully."
                                );
                              } catch {
                                toast.error("Failed to archive issuance.");
                              }
                            }}
                            onRestore={async (id: number) => {
                              try {
                                setItemIssuances((prev) =>
                                  prev.filter((i) => i.id !== id)
                                );
                                await fetch(`/api/issuances/${id}`, {
                                  method: "PATCH",
                                });
                                toast.success(
                                  "Issuance restored successfully."
                                );
                                const updatedRes = await fetch(
                                  "/api/issuances"
                                );
                                const updatedData = await updatedRes.json();
                                setItemIssuances(updatedData);
                              } catch {
                                toast.error("Failed to restore issuance.");
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No records found.
                  </div>
                )}
              </div>

              {/* Desktop/Tablet Table View */}
              <div className="hidden md:block">
                {paginatedIssuances.length > 0 ? (
                  paginatedIssuances.map((issuance) => (
                    <div
                      key={issuance.id}
                      className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center items-center"
                    >
                      <span className="text-sm">
                        {format(
                          new Date(issuance.issuedAt || issuance.createdAt),
                          "PPP p"
                        )}
                      </span>
                      <span className="text-sm">{issuance.clientName}</span>
                      {/* <span>{issuance.dispatcherName}</span> */}
                      <span>{issuance.drNumber || "-"}</span>
                      <span
                        className={`text-center px-5 text-sm py-1 rounded-4xl
                                                ${
                                                  issuance.status === "Issued"
                                                    ? "bg-green-200 text-green-800"
                                                    : issuance.status ===
                                                      "Archived"
                                                    ? "bg-red-200 text-red-800"
                                                    : issuance.status ===
                                                      "Draft"
                                                    ? "bg-slate-300 text-white"
                                                    : ""
                                                }`}
                      >
                        {issuance.status}
                      </span>
                      <span className="relative flex items-center justify-center">
                        <IssuanceActions
                          item={issuance}
                          onDelete={async (id: number) => {
                            try {
                              await fetch(`/api/issuances/${id}`, {
                                method: "DELETE",
                              });
                              const updatedRes = await fetch("/api/issuances");
                              const updatedData = await updatedRes.json();
                              setItemIssuances(updatedData);
                              toast.success("Issuance archived successfully.");
                            } catch {
                              toast.error("Failed to archive issuance.");
                            }
                          }}
                          onRestore={async (id: number) => {
                            try {
                              setItemIssuances((prev) =>
                                prev.filter((i) => i.id !== id)
                              );
                              await fetch(`/api/issuances/${id}`, {
                                method: "PATCH",
                              });
                              toast.success("Issuance restored successfully.");
                              const updatedRes = await fetch("/api/issuances");
                              const updatedData = await updatedRes.json();
                              setItemIssuances(updatedData);
                            } catch {
                              toast.error("Failed to restore issuance.");
                            }
                          }}
                        />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No records found.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Pagination */}
      <div className="
      fixed bottom-0 left-0 
      lg:left-[250px] 
      w-full lg:w-[calc(100%-250px)] 
      bg-transparent py-3 
      flex justify-center items-center gap-2 
      z-10
    ">

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

export default IssuanceLogPage;
