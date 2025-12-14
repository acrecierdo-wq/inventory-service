// app/purchasing/physical_inventory/page.tsx
"use client";

import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface Session {
  id: string;
  createdBy: string;
  submittedAt?: string | null;
  status: string;
  totalItems?: number;
  totalDiscrepancies?: number;
  remarks?: string;
}

export default function PurchasingSessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setApprovedBy] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [searchTerm] = useState("");
  const { user } = useUser();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/admin/physical_inventory");
        const data = await res.json();
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

  useEffect(() => {
      if (user) {
        setApprovedBy(
          user.username ||
            user.fullName ||
            user.firstName ||
            user.primaryEmailAddress?.emailAddress ||
            ""
        );
      }
    }, [user]);

    const filteredSessions = sessions
    .filter(
      (session) =>
        session.status.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
    <main className="min-h-screen bg-[#ffedce]">
        <Header />
        <div className="p-10 max-w-7xl mx-auto /mt-20 bg-[#ffedce]">
      <h1 className="text-3xl font-bold font-sans mb-4 text-[#4f2d12]">Physical Inventory Review</h1>
      {loading ? (
        <p>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div className="overflow-x-autorounded border-2 border-[#ffdcb9]/95 shadow">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-[#fffcf6] text-left text-[#5a4632]">
                <th className="p-3 border-b">SUBMITTED AT</th>
                <th className="p-3 border-b">WAREHOUSEMAN</th>
                <th className="p-3 border-b">STATUS</th>
                <th className="p-3 border-b">TOTAL ITEMS</th>
                <th className="p-3 border-b">TOTAL DISCREPANCIES</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {paginatedSessions.map((s) => (
                <tr
                  key={s.id}
                  className="border-b hover:bg-gray-50 text-[#4f2d12]"
                >
                  {/* SUBMITTED AT */}
                  <td className="p-1">
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "-"}
                  </td>

                  {/* WAREHOUSEMAN */}
                  <td className="p-1">{s.createdBy}</td>

                  {/* STATUS */}
                  <td className="p-2">
                    <span
                      className={`
                        px-3 text-xs py-1 rounded-full text-center capitalize
                        ${
                          s.status === "submitted"
                            ? "bg-yellow-200 text-yellow-800"
                            : s.status === "approved"
                            ? "bg-green-200 text-green-800"
                            : s.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : "bg-slate-200 text-slate-700"
                        }
                      `}
                    >
                      {s.status}
                    </span>
                  </td>

                  {/* TOTAL ITEMS */}
                  <td className="p-1">{s.totalItems ?? "-"}</td>

                  {/* TOTAL DISCREPANCIES */}
                  <td className="p-1">{s.totalDiscrepancies ?? "-"}</td>

                  {/* ACTIONS */}
                  <td className="p-1 text-center">
                    <button
                      onClick={() =>router.push(`/purchasing/physical_inventory/${s.id}`)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 rounded-full cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
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
