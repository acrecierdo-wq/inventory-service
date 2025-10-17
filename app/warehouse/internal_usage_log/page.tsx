// app/warehouse/internal_usage_log/page.tsx

"use client";

import { Header } from "@/components/header";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { InternalUsage } from "./types/internal";
import InternalUsageActions from "./actions/usage_actions";
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

const InternalUsagePage = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<"Utilized" | "Archived">("Utilized");
    const [internal_usages, setInternalUsages] = useState<InternalUsage[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState(""); 

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
                const headers = ["Personnel Name", "Department", "Purpose", "Authorized By", "Note", "Logged At", "Logged By", "Status", "Items"];
                const rows = filteredInternalUsages.map((item) => [
                item.personnelName,
                item.department,
                item.purpose,
                item.authorizedBy,
                item.note,
                item.loggedAt,
                item.loggedBy,
                item.status,
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
                link.setAttribute("download", "Internal Usage_Report.csv");
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
      doc.text("Internal Usage Report", 40, 60);
    
      // A line under header
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(40, 80, 420, 80);
    
      // Table data
      const headers = [
        "Personnel", "Department", "Purpose", "Authorized", "Note", "Logged At", "Logged By", "Status", "Items"
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
    
      doc.save("Internal Usage_Report.pdf");
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
            ? usages.personnelName.toLowerCase().includes(searchTerm.toLowerCase())
                || usages.purpose.toLowerCase().includes(searchTerm.toLowerCase())
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
            return date >= start
        }
        if (!start && end) {
            return date <= end;
        }
        return true;
    });

    const totalPages = Math.ceil(filteredInternalUsages.length / ITEMS_PER_PAGE);
    const paginatedInternalUsages = filteredInternalUsages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <main className="h-screen w-full bg-[#ffedce] flex flex-col">
            <Header />
            <section className="flex flex-row justify-between mt-5">

                {/* <span className="text-3xl text-[#173f63] font-bold">Internal Usage</span> */}

            <div className="flex flex-row gap-4 ml-10">
                {/* Utilized Tab */}
                <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("Utilized");
                        setCurrentPage(1);
                    }}
                    className={`h-10 w-20 mt-3 border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 
                        ${activeTab === "Utilized" ? "border-2 border-green-800 bg-green-600 hover:bg-green-800 shadow-md" : "bg-white"}`}
                    >
                        <span className={`text-sm ${activeTab === "Utilized" ? "text-white font-semibold" : "text-gray-500"}`}>
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
                <Link href="/warehouse/internal_usage_log/new">
                    <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                        <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
                        <span className="ml-1 text-sm text-[#482b0e]">Log New</span>
                    </div>
                </Link>
                </div>

                {/* <button
                onClick={() => {}} // {isExporting ? "Exporting..." : "Export"} either csv or pdf
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

                {/* Internal Usage Log Table */}
                {!loading && ! error && (
                <>
                <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
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
                    className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
                    >
                    <span className="text-sm">
                        {usages.loggedAt
                        ? format(new Date(usages.loggedAt), "PPP p")
                    : "N/A"}
                    </span>
                    <span>{usages.personnelName}</span>
                    <span>{usages.purpose}</span>
                    <span className={`text-center px-5 text-sm py-1 rounded-4xl
                        ${usages.status === 'Utilized' ? 'bg-green-200 text-green-800' :
                         usages.status === 'Archived' ? 'bg-red-200 text-red-800' :
                            ''}`}>
                        {usages.status}
                    </span>
                    <span className="relative flex items-center justify-center">
                        <InternalUsageActions 
                        item={usages} onDelete={async (id:number) => {

                    try {
                        await fetch(`/api/internal_usages/${id}`, { 
                        method: "DELETE", 
                    });
                    // Re-fetch the updated list
                    const updatedRes = await fetch("/api/internal_usages");
                    const updatedData = await updatedRes.json();
                    setInternalUsages(updatedData);

                    toast.success("Internal usage record archived successfully.");
                  } catch {
                    toast.error("Failed to archive internal usage record.");
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

export default InternalUsagePage;

