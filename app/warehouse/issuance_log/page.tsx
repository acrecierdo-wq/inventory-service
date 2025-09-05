// app/warehouse/issuance_log/page.tsx

"use client";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import IssuanceActions from "./issuance_actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { IssuanceItem } from "./types/issuance";

const ITEMS_PER_PAGE = 10;

const IssuanceLogPage = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [item_issuances, setItemIssuances] = useState<IssuanceItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<"Issued" | "Draft" | "Archived">("Issued");

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

    const filteredIssuances = item_issuances
    .filter((issuance) => issuance.status === activeTab)
    .filter((issuance) => issuance.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredIssuances.length / ITEMS_PER_PAGE);
    const paginatedIssuances = filteredIssuances.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <WarehousemanClientComponent>
        <main className="h-screen w-full bg-[#ffedce] flex flex-col">
            <Header />
            <div className="mx-auto mt-2">

            <section className="flex flex-row gap-4 mt-4">
                <span className="text-3xl text-[#173f63] font-bold">Issuance Log</span>

                {/* Issued Tab */}
                <div className="relative">
                    <div
                    onClick={() => setActiveTab("Issued")}
                    className={`h-5 w-15 mt-3 bg-white border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 
                        ${activeTab === "Issued" ? "border-b-4 border-green-800" : ""}`}
                    >
                        <span className={`text-xs ${activeTab === "Issued" ? "text-green-800" : "text-gray-500"}`}>
                            Issued
                        </span>
                    </div>
                </div>

                {/* Draft Tab */}
                <div className="relative">
                    <div
                    onClick={() => setActiveTab("Draft")}
                    className={`h-5 w-15 mt-3 bg-white border-b-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4
                        ${activeTab === "Draft" ? "border-b-4 border-slate-500" : ""}`}
                    >
                        <span className={`text-xs ${activeTab === "Issued" ? "text-slate-500" : "text-gray-500"}`}>
                            Draft
                        </span>
                        </div>
                </div>

                {/* Archived Tab */}
                <div className="relative">
                    <div
                    onClick={() => setActiveTab("Archived")}
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
                <Link href="/warehouse/issuance_log/new">
                    <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                        <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
                        <span className="ml-1 text-sm text-[#482b0e]">Log New</span>
                    </div>
                </Link>
                </div>

                <button
                className="bg-green-600 h-8 text-white px-2 rounded hover:bg-green-700 cursor-pointer">
                    Export to CSV
                </button>
            </section>
            </div>

            <section className="flex-1 overflow-y-auto px-10 mt-5 min-h-[400px]">
                <div className="bg-[#fffcf6] rounded shadow-md mb-2">
                {loading && <div className="text-center mt-5">Loading...</div>}
                {error && <div className="text-red-500 text-center">{error}</div>}

                {/* Issuance Log Table */}
                {!loading && ! error && (
                <>
                <div className="grid grid-cols-[2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
                <span>CLIENT</span>
                <span>DATE | TIME</span>
                <span>DISPATCHER</span>
                <span>DR No.</span>
                <span>STATUS</span>
                <span>ACTION</span>
                </div>

            {paginatedIssuances.length > 0 ? (
                paginatedIssuances.map((issuance) => (
                    <div 
                    key={issuance.id} 
                    className="grid grid-cols-[2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
                    >
                    <span>{issuance.clientName}</span>
                    <span className="text-sm">
                        {format(
                            new Date(issuance.issuedAt || issuance.createdAt),
                            "PPP p"
                        )}
                    </span>
                    <span>{issuance.dispatcherName}</span>
                    <span>{issuance.drNumber || "-"}</span>
                    <span className={`text-center px-5 text-sm py-1 rounded-4xl
                        ${issuance.status === 'Issued' ? 'bg-green-200 text-green-800' :
                            issuance.status === 'Archived' ? 'bg-red-200 text-red-800' :
                            issuance.status === 'Draft' ? 'bg-slate-300 text-white' :
                            ''}`}>
                        {issuance.status}
                    </span>
                    <span className="relative flex items-center justify-center">
                        <IssuanceActions item={issuance} onDelete={async (id:number) => {

                    try {
                        await fetch(`/api/issuances/${id}`, { 
                        method: "DELETE", 
                    });
                    // Re-fetch the updated list
                    const updatedRes = await fetch("/api/issuances");
                    const updatedData = await updatedRes.json();
                    setItemIssuances(updatedData);

                    toast.success("Issuance archived successfully.");
                  } catch {
                    toast.error("Failed to archive issuance.");
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

export default IssuanceLogPage;

// Latest version - Sept.2