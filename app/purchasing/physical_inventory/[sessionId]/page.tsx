// app/purchasing/physical_inventory/[sessionId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  //const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  //const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [unlockingItemId, setUnlockingItemId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordSubmit = async () => {
  if (!unlockingItemId) return;

  if (!password.trim()) {
    setPasswordError(true);
    return;
  }

  setIsSubmitting(true);

  try {
    const res = await fetch(`/api/admin/physical_inventory/${sessionId}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: unlockingItemId,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Password incorrect");
      setPasswordError(true);
      return;
    }

    // SUCCESS → Unlock the row
    setItems(prev =>
      prev.map(item =>
        item.id === unlockingItemId
          ? { ...item, status: "unlocked" } // or any marker you want
          : item
      )
    );

    toast.success("Row unlocked!");

    setShowPasswordModal(false);
    setPassword("");
  } catch (err) {
    console.error(err);
    toast.error("Server error.");
  } finally {
    setIsSubmitting(false);
  }
};


  // const toggleSelect = (id: number) => {
  // setSelectedItems(prev =>
  //   prev.includes(id)
  //     ? prev.filter(x => x !== id)
  //     : [...prev, id]
  //   );
  // };

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
      body: JSON.stringify({ 
        action,
        unlockedItems: items
          .filter(i => i.status === "unlocked")
          .map(i => i.id) // send IDs of unlocked items
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Action failed");

    toast.success(data.message);

    // Update UI session + items instantly
    setSession(prev => prev ? { ...prev, status: action } : prev);
    setItems(prev => prev.map(item => ({
      ...item,
      status: action === "rejected" 
        ? "rejected" 
        : (item.discrepancy > 10 && item.status !== "unlocked" ? "locked" : "approved")
    })));
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
    <main className="h-full bg-[#ffedce]">
      <Header />
      <div className="p-10 max-w-7xl mx-auto /mt-20 bg-[#ffedce]">
        <h1 className="text-3xl font-bold mb-6">Session Details</h1>

        <div className="mb-6">
          <p><strong>Session ID:</strong> {session.id}</p>
          <p><strong>Warehouseman:</strong> {session.createdBy}</p>
          <p><strong>Submitted At:</strong> {session.submittedAt ? new Date(session.submittedAt).toLocaleString() : "-"}</p>
          <p><strong>Status:</strong> {session.status}</p>
          <p><strong>Remarks:</strong> {session.remarks || "-"}</p>
        </div>

        <div className="overflow-x-auto border rounded shadow-sm">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-[#fffcf6] text-[#5a4632] text-left">
                <th className="p-3 border-b">Item</th>
                <th className="p-3 border-b">Category</th>
                <th className="p-3 border-b">Unit</th>
                <th className="p-3 border-b">Variant</th>
                <th className="p-3 border-b">Size</th>
                <th className="p-3 border-b text-xs">System Qty.</th>
                <th className="p-3 border-b text-xs">Physical Qty.</th>
                <th className="p-3 border-b">Discrepancy</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Action</th>
              </tr>
            </thead>

<tbody className="bg-white">
  {items.map((i) => {
    const isApproved = i.status === "approved";
    const isRejected = i.status === "rejected";
    const isUnlocked = i.status === "unlocked";

    // Determine if item should be locked based on discrepancy
    const isLocked = ((i.discrepancy > 10) || (i.discrepancy < -10)) && !isUnlocked;

    // Determine discrepancy type
    let discrepancyStatus = "Balanced";
    if (i.discrepancy > 0) discrepancyStatus = "Overage";
    else if (i.discrepancy < 0) discrepancyStatus = "Shortage";

    return (
      <tr
        key={i.id}
        className={`
          border-b
          ${isApproved ? "bg-green-100" : ""}
          ${isRejected ? "bg-red-100" : ""}
          ${!isLocked && !isApproved && !isRejected ? "hover:bg-gray-50" : "bg-gray-100"}
        `}
      >
        <td className="p-3">{i.name}</td>
        <td className="p-3">{i.category}</td>
        <td className="p-3">{i.unit}</td>
        <td className="p-3">{i.variant || "-"}</td>
        <td className="p-3">{i.size || "-"}</td>
        <td className="p-3">{i.systemQty}</td>
        <td className="p-3">{i.physicalQty}</td>

        {/* Discrepancy column with Locked text */}
        <td className="p-3 font-semibold">
          {i.discrepancy}
          {isLocked && (
            <span className="ml-2 text-xs text-red-600 font-bold">(Locked)</span>
          )}
        </td>

        {/* Status column shows discrepancy type */}
        <td className="p-3 capitalize font-medium">{discrepancyStatus}</td>

        {/* Action column */}
        <td className="p-3">
          {isLocked && !isUnlocked && !isApproved && !isRejected && (
            <button
              className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
              onClick={() => {
                setUnlockingItemId(i.id);
                setShowPasswordModal(true);
              }}
            >
              Unlock
            </button>
          )}
        </td>
      </tr>
    );
  })}
</tbody>


          </table>
        </div>

        {session.status === "submitted" && (
          <div className="mt-6 flex gap-4">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 cursor-pointer"
              disabled={actionLoading}
              onClick={() => handleAction("rejected")}
            >
              Reject
            </button>
            <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 cursor-pointer"
              disabled={actionLoading}
              onClick={() => handleAction("approved")}
            >
              Approve
            </button>
          </div>
        )}
      </div>
      {showPasswordModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-100 p-4">
    <div className="bg-white w-full max-w-[400px] p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-3">Enter Password</h2>

      <input
        type="password"
        placeholder="Enter your password..."
        className={`w-full border p-2 rounded mb-2 ${
          passwordError ? "border-red-500" : "border-gray-300"
        }`}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setPasswordError(false);
        }}
        autoFocus
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => {
            setShowPasswordModal(false);
            setPassword("");
            setPasswordError(false);
          }}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={isSubmitting}
          onClick={handlePasswordSubmit}
        >
          {isSubmitting ? "Verifying..." : "Submit"}
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
}
