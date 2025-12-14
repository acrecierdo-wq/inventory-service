// app/warehouse/w_inventory/w_physical/[sessionId]/page.tsx

"use client";

import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Item {
  id: number;
  name: string;
  category: string;
  unit: string;
  variant: string | null;
  size: string | null;
  physicalQty: number | string;
  checked: boolean;
}

interface SessionResponse {
  session: {
    id: string;
    status: "pending" | "submitted";
  };
  items: {
    id: number;
    name: string;
    category: string;
    unit: string;
    variant: string | null;
    size: string | null;
    physicalQty: number | null;
  }[];
}

export default function PhysicalInventoryPage() {
  const router = useRouter();
  const { sessionId } = useParams() as { sessionId: string};

  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<"pending" | "submitted" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/admin/physical_inventory/${sessionId}/review`);
        const data: SessionResponse = await res.json();

        if (!res.ok) throw new Error("Failed to load session");

        setStatus(data.session.status); // "pending" or "submitted"

        const itemsWithCheck: Item[] = data.items.map((i) => ({
          ...i,
          checked: i.physicalQty !== null && i.physicalQty !== undefined,
          physicalQty: i.physicalQty || "",
        }));

        setItems(itemsWithCheck);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

// useEffect(() => {
//   const fetchItems = async () => {
//     try {
//       const res = await fetch(`/api/admin/physical_inventory/${sessionId}/review`);
//       const data: { items: Item[] } = await res.json(); // properly typed
//       const itemsWithCheck: Item[] = (data.items || []).map((i) => ({
//       ...i,
//       checked: i.physicalQty !== null && i.physicalQty !== undefined, // auto-check if qty exists
//       physicalQty: i.physicalQty || "",
//     }));



//       setItems(itemsWithCheck);
//     } catch (err) {
//       toast.error("Failed to fetch items");
//     } finally {
//       setLoading(false);
//     }
//   };
//   fetchItems();
// }, [sessionId]);

const handleChangeQty = (id: number, value: string) => {
    if (status === "submitted") return; // LOCKED

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, physicalQty: parseInt(value) || 0 } : item
      )
    );
  };

  const handleToggleCheck = (id: number) => {
    if (status === "submitted") return; // LOCKED

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSubmit = async () => {
    const countedItems = items.filter((i) => i.checked);

    if (countedItems.length === 0) {
      toast.error("No items selected.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        action: "submit",
        items: countedItems.map((i) => ({
          itemId: i.id,
          physicalQty: i.physicalQty,
        })),
      };

      const res = await fetch(
        `/api/admin/physical_inventory/${sessionId}/submit`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");

      toast.success("Inventory submitted!");

      setStatus("submitted"); // LOCK UI
      router.push("/warehouse/w_inventory/w_physical/list");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit inventory");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
  return (
    <div className="bg-[#ffedce] min-h-screen">
      <Header />
      <div className="p-10 text-gray-500 italic flex justify-center animate-pulse">
        Loading items...
      </div>
    </div>
  );

  return (
    <main className="bg-[#ffedce] h-full">
      <Header />
      <div className="p-8 /max-w-6xl mx-auto mt-2">
           <div className="flex justify-end">
             <button
          onClick={() => router.back()}
          className="px-4 py-1 text-sm bg-white border border-[#d2bda7] text-[#5a4632] rounded-full shadow hover:bg-[#f59f0b1b] transition cursor-pointer"
        >
          ←
        </button>
           </div>

      <p className="mb-5 text-lg">
          Status:{" "}
          <span
            className={`font-bold ${
              status === "submitted" ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {status.toUpperCase()}
          </span>
        </p>

      <div className="overflow-x-auto">
        <table className="table-auto bg-white w-full border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Select</th>
              <th className="px-4 py-2 border">Item Name</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Variant</th>
              <th className="px-4 py-2 border">Size</th>
              <th className="px-4 py-2 border">Unit</th>
              <th className="px-4 py-2 border">Physical Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleCheck(item.id)}
                    disabled={status === "submitted" || status === "approved" || status === "rejected"}
                  />
                </td>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.category}</td>
                <td className="border px-4 py-2">{item.variant || "-"}</td>
                <td className="border px-4 py-2">{item.size || "-"}</td>
                <td className="border px-4 py-2">{item.unit}</td>
                <td className="border px-4 py-2">
                  <Input
                    type="number"
                    value={item.physicalQty}
                    onChange={(e) => handleChangeQty(item.id, e.target.value)}
                    min={0}
                    disabled={!item.checked || status === "submitted" || status === "approved" || status === "rejected"} // disabled if unchecked
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button 
      className="mt-5" 
      onClick={handleSubmit} 
      disabled={submitting || status === "submitted" || status === "approved" || status === "rejected"}>
        {submitting ? "Submitting..." : "Submit Inventory"}
      </Button>
    </div>
    </main>
  );
}
