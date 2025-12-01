// app/purchasing/physical_inventory/page.tsx
"use client";

import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

  return (
    <main>
        <Header />
        <div className="p-10 max-w-7xl mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6">Physical Inventory Review</h1>
      {loading ? (
        <p>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">Session ID</th>
                <th className="p-3 border-b">Warehouseman</th>
                <th className="p-3 border-b">Submitted At</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Total Items</th>
                <th className="p-3 border-b">Total Discrepancies</th>
                <th className="p-3 border-b">Remarks</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sessions.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.id}</td>
                  <td className="p-3">{s.createdBy}</td>
                  <td className="p-3">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "-"}</td>
                  <td className="p-3 capitalize">{s.status}</td>
                  <td className="p-3">{s.totalItems ?? "-"}</td>
                  <td className="p-3">{s.totalDiscrepancies ?? "-"}</td>
                  <td className="p-3">{s.remarks || "-"}</td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/purchasing/physical_inventory/${s.id}`)}
                    >
                      View / Review
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
