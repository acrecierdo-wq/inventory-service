// app/warehouse/internal_usage_log/page.tsx

"use client";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { InternalUsage } from "./types/internal";
import InternalUsageActions from "./actions/usage_actions";

const ITEMS_PER_PAGE = 10;

const InternalUsagePage = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<"Utilized" | "Archived">("Utilized");
    const [internal_usages, setInternalUsages] = useState<InternalUsage[]>([]);

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

    const filteredInternalUsages = internal_usages
    .filter((usages) => usages.status === activeTab)
    .filter((usages) =>
        searchTerm
            ? usages.personnelName.toLowerCase().includes(searchTerm.toLowerCase())
            : true
    );

    const totalPages = Math.ceil(filteredInternalUsages.length / ITEMS_PER_PAGE);
    const paginatedInternalUsages = filteredInternalUsages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <WarehousemanClientComponent>
        <main className="h-screen w-full bg-[#ffedce] flex flex-col">
            <Header />
            <div className="mx-auto mt-2">

            <section className="flex flex-row gap-4 mt-4">
                <span className="text-3xl text-[#173f63] font-bold">Internal Usage</span>

                {/* Utilized Tab */}
                <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("Utilized");
                        setCurrentPage(1);
                    }}
                    className={`h-5 w-15 mt-3 bg-white border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 
                        ${activeTab === "Utilized" ? "border-b-4 border-green-800" : ""}`}
                    >
                        <span className={`text-xs ${activeTab === "Utilized" ? "text-green-800" : "text-gray-500"}`}>
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
                    className={`h-5 w-15 mt-3 bg-white border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4
                        ${activeTab === "Archived" ? "border-b-4 border-red-800" : ""}`}
                    >
                        <span className={`text-xs ${activeTab === "Archived" ? "text-red-800" : "text-gray-500"}`}>
                            Archived
                        </span>
                        </div>
                </div>

                {/* Search */}
                <div className="h-8 w-70 mt-2 ml-30 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
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
                
                {/* Filter */}
                <div className="relative">
                    <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                        <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" className="" />
                        <span className="text-sm text-[#482b0e] ml-2">Filter</span>
                    </div>
                </div>

                {/* Log New */}
                <div className="relative">
                <Link href="/warehouse/internal_usage_log/new">
                    <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                        <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
                        <span className="ml-1 text-sm text-[#482b0e]">Log New</span>
                    </div>
                </Link>
                </div>

                <button
                onClick={() => {}} // {isExporting ? "Exporting..." : "Export"} either csv or pdf
                className="bg-green-600 h-8 text-white px-2 rounded hover:bg-green-700 cursor-pointer">
                    Export to CSV
                </button>
            </section>
            </div>

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
        </WarehousemanClientComponent>
    );
};

export default InternalUsagePage;

