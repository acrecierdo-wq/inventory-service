// app/purchasing/physical_inventory/[sessionId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/header";

interface Session {
  id: string;
  createdBy: string;
  submittedAt?: string | null;
  status: string;
  remarks?: string;
}

interface Item {
  id: number;
  name: string;
  category: string;
  unit: string;
  variant: string;
  size: string;
  stock: number;
  physicalQty: number;
  systemQty: number;
  discrepancy: number;
  status: string;
  comments: string;
}

export default function PurchasingSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/admin/physical_inventory/${sessionId}/review`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch session");
        setSession(data.session);
        setItems(data.items);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load session details");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleAction = async (action: "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to ${action} this session?`)) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/physical_inventory/${sessionId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update session");

      toast.success(data.message);
      router.push("/purchasing/physical_inventory"); // go back to list
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="p-10">Loading session...</p>;
  if (!session) return <p className="p-10 text-red-500">Session not found</p>;

  return (
    <main>
      <Header />
      <div className="p-10 max-w-7xl mx-auto mt-20">
        <h1 className="text-3xl font-bold mb-6">Session Details</h1>

        <div className="mb-6">
          <p><strong>Session ID:</strong> {session.id}</p>
          <p><strong>Warehouseman:</strong> {session.createdBy}</p>
          <p><strong>Submitted At:</strong> {session.submittedAt ? new Date(session.submittedAt).toLocaleString() : "-"}</p>
          <p><strong>Status:</strong> {session.status}</p>
          <p><strong>Remarks:</strong> {session.remarks || "-"}</p>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">Item</th>
                <th className="p-3 border-b">Category</th>
                <th className="p-3 border-b">Unit</th>
                <th className="p-3 border-b">Variant</th>
                <th className="p-3 border-b">Size</th>
                <th className="p-3 border-b">System Qty</th>
                <th className="p-3 border-b">Physical Qty</th>
                <th className="p-3 border-b">Discrepancy</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Comments</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {items.map((i) => (
                <tr key={i.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{i.name}</td>
                  <td className="p-3">{i.category}</td>
                  <td className="p-3">{i.unit}</td>
                  <td className="p-3">{i.variant || "-"}</td>
                  <td className="p-3">{i.size || "-"}</td>
                  <td className="p-3">{i.systemQty}</td>
                  <td className="p-3">{i.physicalQty}</td>
                  <td className="p-3">{i.discrepancy}</td>
                  <td className="p-3">{i.status}</td>
                  <td className="p-3">{i.comments || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {session.status === "submitted" && (
          <div className="mt-6 flex gap-4">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              disabled={actionLoading}
              onClick={() => handleAction("rejected")}
            >
              Reject
            </button>
            <button
            className="px-4 py-2 bg-green-500 text-white rounded"
              disabled={actionLoading}
              onClick={() => handleAction("approved")}
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
