// app/admin/audit_trails/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type StaffUser = {
  id: string;
  username: string;
  role: string;
};

type AuditLog = {
  id: number;
  entity: string;
  entityId: string;
  action: string;
  description: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  module: string;
  timestamp: string;
};

export default function AuditTrailPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>(""); // clerkId
  const [selectedRole, setSelectedRole] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

  // fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      let url = "/api/admin/audit_logs"; // new API route
      if (selectedUser) url += `?userId=${selectedUser}`;
      if (selectedRole && selectedRole !== "all")
        url += selectedUser ? `&role=${selectedRole}` : `?role=${selectedRole}`;


      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setLogs(data.logs || []);
      else toast.error(data.error || "Failed to load audit logs");
    } catch (err) {
      console.error(err);
      toast.error("Network error fetching audit logs");
    } finally {
      setLoadingLogs(false);
    }
  }, [selectedUser, selectedRole]);

  // fetch all staff
  async function fetchStaff() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setStaff(data.staff || []);
      else toast.error(data.error || "Failed to load staff");
    } catch (err) {
      console.error(err);
      toast.error("Network error fetching staff");
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const totalPages = Math.ceil(logs.length / recordsPerPage);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUser, selectedRole]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <main className="bg-[#ffedce] h-full w-full relative">
      <Header />

      <section className="p-4 space-y-4">

        {/* Filter Section */}
        <div className="flex gap-4 flex-wrap items-center">
          {/* User Search */}
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[200px] border p-2 rounded bg-white border-[#d2bda7] hover:bg-gray-100 cursor-pointer">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.username} <span className="capitalize">({u.role})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[200px] border p-2 rounded bg-white border-[#d2bda7] hover:bg-gray-100 cursor-pointer">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="warehouseman">Warehouse</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="purchasing">Purchasing</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters button */}
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-800 cursor-pointer"
            onClick={() => {
              setSelectedUser("");
              setSelectedRole("");
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white p-2 rounded shadow mt-2 relative">
          <ScrollArea className="h-full">
            <table className="min-w-full text-left border-collapse">
              <thead className="sticky top-0 z-0">
                <tr className="bg-[#fff4e0] rounded shadow">
                  <th className="p-2 w-[10%] rounded">Date</th>
                  <th className="p-2 w-[15%]">User</th>
                  <th className="p-2 w-[10%]">Role</th>
                  <th className="p-2 w-[10%]">Action</th>
                  <th className="p-2 w-[30%]">Description</th>
                  <th className="p-2 w-[15%] rounded">Module</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <tr>
                    <td colSpan={6} className="p-2 text-center italic">Loading...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-2 text-center italic">No logs found</td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-2 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-2 text-xs">{log.actorName}</td>
                      <td className="p-2 text-sm capitalize">{log.actorRole}</td>
                      <td className="p-2 text-sm uppercase">{log.action}</td>
                      <td className="p-2 text-xs">{log.description}</td>
                      <td className="p-2 text-sm">{log.module}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ScrollArea>

          <div className="absolute top-[46px] left-0 right-0 border-b-2 border-[#d2bda7] pointer-events-none"></div>
        </div>
      </section>

      {/* Pagination */}
      <div className="absolute bottom-0 left-0 w-full bg-[#ffedce] py-3 flex justify-center items-center gap-2 z-10">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`h-8 w-15 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f]"
          }`}
        >
          Prev
        </button>

        <span className="text-[#5a4632] text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`h-8 w-15 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f]"
          }`}
        >
          Next
        </button>
      </div>
    </main>
  );
}
