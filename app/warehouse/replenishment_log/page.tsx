// app/warehouse/replenishment_log/page.tsx

"use client";

import { Header } from "@/components/header";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Replenishment } from "./types/replenishment";
import ReplenishmentActions from "./actions/replenishment_actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function normalizeStart(dateInput: string | Date | null | undefined): Date | null {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function normalizeEnd(dateInput: string | Date | null | undefined): Date | null {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

const ITEMS_PER_PAGE = 10;

const ReplenishmentPage = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<"Replenished" | "Draft" | "Archived">("Replenished");
    const [replenishments, setReplenishments] = useState<Replenishment[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchReplenishments = async () => {
            console.log("🔎 [fetchReplenishments] starting fetch to /api/replenishment");
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/replenishment");
                console.log("🔎 [fetchReplenishments] response status:", res.status);

                const data = await res.json();
                console.log("🔎 [fetchReplenishments] raw data:", data);

                if (!res.ok) throw new Error(data.error || "Failed to fetch data.");

                setReplenishments(data);
                console.log("🔎 [fetchReplenishments] state updated, count:", data.length);
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
                const headers = ["Supplier", "PO Ref. No.", "Remarks", "DR Ref. No.", "Created At", "Replenished At", "Status", "Recorded By", "Items"];
                const rows = filteredReplenishments.map((item) => [
                item.supplier,
                item.poRefNum,
                item.remarks,
                item.drRefNum,
                item.createdAt,
                item.replenishedAt,
                item.status,
                item.recordedBy,
                item.items.map((item) => `${item.itemName} (${item.sizeName || "No Size"} | ${item.variantName || "No Variant"} | ${item.unitName || "No Unit"}) = ${item.quantity}`).join(", "),
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
            ? replenishments.supplier.toLowerCase().includes(searchTerm.toLowerCase())
                || replenishments.drRefNum.toLowerCase().includes(searchTerm.toLowerCase())
            : true
    ).filter((replenishments) => {
        // which date to filter by: issued or created
        const raw = replenishments.replenishedAt  ||  replenishments.createdAt;
        if (!raw) return false;

        const date = new Date(raw);
        const start = normalizeStart(startDate);
        const end = normalizeEnd(endDate);

        if (start && end) {
            return date >= start && date <= end;
        }
        if (start && !end) { 
            return date >= start
        }
        if (!start && end) {
            return date <= end;
        }
        return true;
    });

    const totalPages = Math.ceil(filteredReplenishments.length / ITEMS_PER_PAGE);
    const paginatedReplenishments = filteredReplenishments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <main className="h-screen w-full bg-[#ffedce] flex flex-col">
            <Header />
            <section className="flex flex-row justify-between mt-5">
                {/* <span className="text-3xl text-[#173f63] font-bold mr-2">Replenishment Log</span> */}

            <div className="flex flex-row gap-4 ml-10">
                {/* Replenished Tab */}
                <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("Replenished");
                        setCurrentPage(1);
                    }}
                    className={`h-10 w-21 mt-3 border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 
                        ${activeTab === "Replenished" ? "border-2 border-green-800 bg-green-600 hover:bg-green-800 shadow-md" : "bg-white"}`}
                    >
                        <span className={`text-sm ${activeTab === "Replenished" ? "text-white font-semibold" : "text-gray-500"}`}>
                            Replenished
                        </span>
                    </div>
                </div>

                {/* Draft Tab */}
                {/* <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("Draft");
                        setCurrentPage(1);
                    }}
                    className={`h-10 w-20 mt-3 border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4
                        ${activeTab === "Draft" ? "border-2 border-slate-700 bg-slate-500 hover:bg-slate-700 shadow-md" : "bg-white"}`}
                    >
                        <span className={`text-sm ${activeTab === "Draft" ? "text-white font-semibold" : "text-gray-500"}`}>
                            Draft
                        </span>
                        </div>
                </div> */}

                {/* Archived Tab */}
                <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("Archived");
                        setCurrentPage(1);
                    }}
                    className={`h-10 w-20 mt-3 border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4
                        ${activeTab === "Archived" ? "border-2 border-red-800 bg-red-600 hover:bg-red-800 shadow-md" : "bg-white"}`}
                    >
                        <span className={`text-sm ${activeTab === "Archived" ? "text-white font-semibold" : "text-gray-500"}`}>
                            Archived
                        </span>
                        </div>
                </div>
            </div>

            <div className="flex flex-row gap-4 mr-10 mt-2">
                {/* Search */}
                <div className="h-8 w-70 mt-2 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
                    <Image src="/search-alt-2-svgrepo-com.svg" width={0} height={0} alt="Search" className="ml-5 w-[15px] h-auto" />

                    <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => 
                        {setSearchTerm(e.target.value)
                        setCurrentPage(1);
                        }}
                    className="ml-2 bg-transparent focus:outline-none" />
                </div>

                {/* Filter Date */}
                <div className="flex gap-2 items-center">
                    <label className="text-xs">From:</label>
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-8 w-25 text-xs rounded border-[#d2bda7] border-2 bg-white"
                    />

                    <label className="text-xs">To:</label>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-8 w-25 text-xs rounded border-[#d2bda7] border-2 bg-white"
                    />
                </div>
                
                {/* Filter */}
                {/* <div className="relative">
                    <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                        <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" className="" />
                        <span className="text-sm text-[#482b0e] ml-2">Filter</span>
                    </div>
                </div> */}

                {/* Log New */}
                <div className="relative">
                <Link href="/warehouse/replenishment_log/new">
                    <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                        <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
                        <span className="ml-1 text-sm text-[#482b0e]">Log New</span>
                    </div>
                </Link>
                </div>

                {/* <button
                // {isExporting ? "Exporting..." : "Export"} either csv or pdf
                className="bg-green-600 h-8 text-white px-2 rounded hover:bg-green-700 cursor-pointer">
                    Export to CSV
                </button> */}
                 <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={`h-8 px-2 rounded text-white mt-1 ${isExporting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
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

            <section className="flex-1 overflow-y-auto px-10 mt-5 min-h-[400px]">
                <div className="bg-[#fffcf6] rounded shadow-md mb-2">
                {loading && <div className="text-center mt-5">Loading...</div>}
                {error && <div className="text-red-500 text-center">{error}</div>}

                {/* Replenishment Log Table */}
                {!loading && ! error && (
                <>
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
                    className="grid grid-cols-[2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
                    >
                    <span className="text-sm">
                        {format(
                            new Date(replenishments.replenishedAt || replenishments.createdAt),
                            "PPP p"
                        )}
                    </span>
                    <span>{replenishments.supplier}</span>
                    <span>{replenishments.poRefNum || "-"}</span>
                    <span>{replenishments.drRefNum || "-"}</span>
                    <span className={`text-center px-5 text-sm py-1 rounded-4xl
                        ${replenishments.status === 'Replenished' ? 'bg-green-200 text-green-800' :
                            replenishments.status === 'Archived' ? 'bg-red-200 text-red-800' :
                            replenishments.status === 'Draft' ? 'bg-slate-300 text-white' :
                            ''}`}>
                        {replenishments.status}
                    </span>
                    <span className="relative flex items-center justify-center">
                        <ReplenishmentActions 
                        item={replenishments} 
                        onDelete={async (id:number) => {

                    try {
                        await fetch(`/api/replenishment/${id}`, { 
                        method: "DELETE", 
                    });
                    // Re-fetch the updated list
                    const updatedRes = await fetch("/api/replenishment");
                    const updatedData = await updatedRes.json();
                    setReplenishments(updatedData);

                    toast.success("Replenishment archived successfully.");
                  } catch {
                    toast.error("Failed to archive replenishment.");
                  }
                }}
                onRestore={async (id:number) => {
                try {
                    // instantly remove from list
                    setReplenishments(prev => prev.filter(i => i.id !== id));
                
                    // then sync with backend
                    await fetch(`/api/replenishment/${id}`, { method: "PATCH" });
                
                    toast.success("Replenishment restored successfully.");
                
                    // optionally: re-fetch to ensure data is up-to-date
                    const updatedRes = await fetch("/api/replenishment");
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
                    <div className="text-center text-gray-500 py-5">No records found.</div>
                )}
                </>
                )}
                </div>
            </section>

            {/* Pagination */}
          <div className="fixed bottom-0 left-[285px] w-[calc(100%-285px)] bg-[#ffedce] py-2 flex justify-center //shadow-inner z-10">
              <Pagination>
      <PaginationContent>
        <PaginationPrevious 
        href="#" 
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        />
        {Array.from({ length: totalPages }, (_, index) => (
          <PaginationItem key={index}>
            <PaginationLink 
            href="#"
            className={currentPage === index + 1 ? "bg-[#d2bda7] text-white" : ""}
            onClick={() => setCurrentPage(index + 1)}
            >
               {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationNext 
        href="#" 
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        />
      </PaginationContent>
    </Pagination>
          </div>     
        </main>
    );
};

export default ReplenishmentPage;