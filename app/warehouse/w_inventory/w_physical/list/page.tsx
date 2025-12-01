// app/warehouse/w_inventory/w_physical/list/page.tsx
"use client";

import { Header } from "@/components/header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
}

export default function SessionsListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen w-full bg-[#ffedce] flex flex-col">
      <Header />
      <div className="p-10 max-w-7xl mx-auto mt-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Physical Inventory Sessions</h1>
        <Button
          onClick={handleLogNew}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Log New Physical Count
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">No sessions found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3 border-b">Session ID</th>
                <th className="p-3 border-b">Created By</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Remarks</th>
                <th className="p-3 border-b">Date Created</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-medium text-gray-800">{session.id}</td>
                  <td className="p-3 text-gray-700">{session.createdBy}</td>
                  <td className="p-3 text-gray-700 capitalize">{session.status}</td>
                  <td className="p-3 text-gray-700">{session.remarks || "-"}</td>
                  <td className="p-3 text-gray-700">
                    {new Date(session.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/warehouse/w_inventory/w_physical/${session.id}`
                        )
                      }
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </main>
  );
}
