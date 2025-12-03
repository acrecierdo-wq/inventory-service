// app/warehouse/w_inventory/w_physical/list/page.tsx
"use client";

import { Header } from "@/components/header";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

interface SessionItem {
    id: number;
    itemName: string;
    category: string;
    unit: string;
    variant: string | null;
    size: string | null;
    physicalQty: number | null;
}
interface Session {
  id: string;
  createdBy: string;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  status: string;
  remarks?: string | null;
  createdAt: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  items: SessionItem[];
}

function getLastAutoTableFinalY(doc: jsPDF): number | undefined {
  const table = (doc as unknown as { lastAutoTable?: { finalY: number } })
    .lastAutoTable;

  return table?.finalY;
}

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

export default function SessionsListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [searchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const recordsPerPage = 10;

const handleExportToPDF = (sessions: Session[]) => {
  const doc = new jsPDF();

  sessions.forEach((session, index) => {
    doc.setFontSize(14);
    doc.text("PHYSICAL INVENTORY REPORT", 14, 20);

    doc.setFontSize(10);
    doc.text(`Session ID: ${session.id}`, 14, 28);
    doc.text(`Warehouseman: ${session.createdBy}`, 14, 34);
    doc.text(`Status: ${session.status}`, 14, 40);
    doc.text(
      `Date Created: ${new Date(session.createdAt).toLocaleString()}`,
      14,
      46
    );

    if (session.remarks) {
      doc.text(`Remarks: ${session.remarks}`, 14, 52);
    }

    const tableData: (string | number)[][] =
      (session.items ?? []).map((item) => [
        item.itemName,
        item.category,
        item.variant ?? "-",
        item.size ?? "-",
        item.unit,
        item.physicalQty ?? 0,
      ]);

    const tableOptions: UserOptions = {
      startY: 60,
      head: [["Item Name", "Category", "Variant", "Size", "Unit", "Quantity"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [240, 240, 240] },
      styles: { fontSize: 9 },
    };

    autoTable(doc, tableOptions);

    const finalY = getLastAutoTableFinalY(doc) ?? 60;
    doc.text(`Total Items: ${tableData.length}`, 14, finalY + 10);

    if (index < sessions.length - 1) {
      doc.addPage();
    }
  });

  doc.save("physical_inventory_report.pdf");
};

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/admin/physical_inventory");
        const data: { sessions?: Session[]; error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load sessions");
        setSessions(data.sessions || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleLogNew = () => {
    router.push("/warehouse/w_inventory/w_physical/start");
  };

  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };
  
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredSessions = sessions
    .filter(
      (session) =>
        session.status.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!selectedStatus || session.status === selectedStatus)
    )
    .filter((session) => {
      const raw = session.createdAt;
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

  const totalPages = Math.ceil(filteredSessions.length / recordsPerPage);
  const paginatedSessions = filteredSessions.slice(
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
  <main className="min-h-screen w-full bg-[#ffedce] flex flex-col">
    <Header />

    <div className="p-2 max-w-7xl">

{/* New Physical Count Button */}
<div className="flex flex-row sm:flex-row justify-end items-start sm:items-center mb-6 gap-4 pr-5">
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

{/* Status Filter */}
<div className="relative w-full sm:w-auto" ref={statusRef}>
  <div
    className="h-10 w-full sm:w-auto sm:min-w-[100px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-between px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
    onClick={() => setOpenDropdown(!openDropdown)}
>
  <div className="flex items-center gap-2">
    <Image
      src="/filter-svgrepo-com.svg"
      width={20}
      height={20}
      alt="Filter"
    />
    <span className="text-sm text-[#482b0e] capitalize">
      {selectedStatus || "Filter"}
    </span>
  </div>
</div>
          
{openDropdown && (
  <div className="absolute z-20 bg-white border border-gray-200 mt-1 w-full sm:min-w-[180px] rounded shadow-lg">
    <div
      className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm font-medium"
      onClick={() => {
        setSelectedStatus("");
        setOpenDropdown(false);
      }}
    >
      All Status
    </div>
    {[
      "pending",
      "submitted",
      "approved",
      "rejected",
      ].map((status) => (
          <div
          key={status}
          className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => {
            setSelectedStatus(status);
            setOpenDropdown(false);
          }}
        >
          <span className="capitalize">{status}</span>
        </div>
      ))}
    </div>
  )}
</div>

<button
  onClick={() => handleExportToPDF(sessions)}
  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
>
  Export / Print
</button>

<button
  onClick={handleLogNew}
  className="h-10 w-full sm:w-auto sm:min-w-[100px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-between px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
>
  New Physical Count
</button>

</div>

{/* Table Section */}
<section className="flex-1 overflow-x-auto px-3 sm:px-4 lg:px-6 mt-2 pb-15">
  <div className="bg-[#fffcf6] rounded shadow-md min-w-full">

    {/* Loading */}
    {loading && (
      <div className="text-center py-8 italic animate-pulse">Loading...</div>
    )}

    {/* Error */}
    {error && (
      <div className="text-red-500 text-center py-8">{error}</div>
    )}

    {/* Content */}
    {!loading && !error && (
      <>
        {/* Desktop / Tablet Header */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center text-sm">
          <span>DATE | TIME</span>
          <span>WAREHOUSEMAN</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {paginatedSessions.length > 0 ? (
            paginatedSessions.map((session) => (
              <div
                key={session.id}
                className="px-4 py-3 bg-white border-b border-gray-200 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      {format(new Date(session.createdAt), "PPP p")}
                    </p>
                    <p className="font-semibold text-sm">
                      {session.createdBy}
                    </p>
                    <p className="text-xs text-gray-600">
                      Status: {session.status}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 text-xs py-1 rounded-full text-center
                      ${
                        session.status === "In Progress"
                          ? "bg-slate-300 text-white"
                          : session.status === "Completed"
                          ? "bg-green-200 text-green-800"
                          : session.status === "Archived"
                          ? "bg-red-200 text-red-800"
                          : ""
                      }`}
                    >
                      {session.status}
                    </span>

                    <button
                      onClick={() =>router.push(`/warehouse/w_inventory/w_physical/${session.id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8 italic">
              No records found.
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          {paginatedSessions.length > 0 ? (
            paginatedSessions.map((session) => (
              <div
                key={session.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center items-center"
              >
                <span className="text-sm">
                  {format(new Date(session.createdAt), "PPP p")}
                </span>
                <span className="text-sm">{session.createdBy}</span>

                <span
                  className={`text-center px-4 text-sm py-1 rounded-4xl uppercase
                  ${
                    session.status === "submitted"
                      ? "bg-yellow-200 text-yellow-800"
                      : session.status === "approved"
                      ? "bg-green-200 text-green-800"
                      : session.status === "rejected"
                      ? "bg-red-200 text-red-800"
                      : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {session.status}
                </span>

                <span className="relative flex items-center justify-center">
                  <button
                      onClick={() =>router.push(`/warehouse/w_inventory/w_physical/${session.id}`)}
                      className="bg-slate-200 rounded-full px-4 hover:bg-slate-400 cursor-pointer"
                    >
                      View
                    </button>
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

    </div>

    {/* Pagination (unchanged) */}
    <div
      className="
        fixed bottom-0 left-0 
        lg:left-[250px] 
        w-full lg:w-[calc(100%-250px)] 
        bg-transparent py-3 
        flex justify-center items-center gap-2 
        z-10"
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
}