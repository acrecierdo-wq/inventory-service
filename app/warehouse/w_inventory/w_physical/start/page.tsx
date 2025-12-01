// app/warehouse/w_inventory/w_physical/start/page.tsx

"use client";

import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define the API structure for items
interface ItemFromAPI {
  id: number;
  name: string;
  category?: { id: number; name: string } | string;
  unit?: { id: number; name: string } | string;
  variant?: { id: number; name: string } | string;
  size?: { id: number; name: string } | string;
}

// Extend for UI state
interface Item extends ItemFromAPI {
  physicalQty: number | string;
  checked: boolean;
}

export default function NewPhysicalInventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/items");
        const data: { success: boolean; data?: ItemFromAPI[]; error?: string } =
          await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to load items");

        const apiItems: ItemFromAPI[] = data.data ?? [];

        const formatted: Item[] = apiItems.map((i) => ({
          ...i,
          physicalQty: "",
          checked: false,
        }));

        setItems(formatted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleChangeQty = (id: number, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, physicalQty: parseInt(value) || 0 } : item
      )
    );
  };

  const handleToggleCheck = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSubmit = async () => {
    const countedItems = items.filter((i) => i.checked);
    if (countedItems.length === 0) {
      toast.error("No items selected for counting");
      return;
    }

    setSubmitting(true);
    try {
    const payload = {
      items: countedItems.map((i) => ({
        itemId: Number(i.id),
        physicalQty: Number(i.physicalQty),
      })),
      remarks: null,
    };

      const res = await fetch("/api/admin/physical_inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: { sessionId?: string; error?: string } = await res.json();

      if (!res.ok || !data.sessionId) {
        throw new Error(data.error || "Failed to create session");
      }

      toast.success("Physical inventory session created!");
      router.push(`/warehouse/w_inventory/w_physical/${data.sessionId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-10 text-gray-500">Loading items...</div>;

  return (
    <main>
      <Header />
      <div className="p-10 max-w-6xl mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6">New Physical Inventory</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">No items found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3 border-b">Count</th>
                <th className="p-3 border-b">Category</th>
                <th className="p-3 border-b">Item Name</th>
                <th className="p-3 border-b">Size</th>
                <th className="p-3 border-b">Variant</th>
                <th className="p-3 border-b">Unit</th>
                <th className="p-3 border-b">Physical Qty</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleCheck(item.id)}
                    />
                  </td>
                  <td className="p-3">
                    {typeof item.category === "string"
                      ? item.category
                      : item.category?.name || "-"}
                  </td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">
                    {typeof item.size === "string" ? item.size : item.size?.name || "-"}
                  </td>
                  <td className="p-3">
                    {typeof item.variant === "string" ? item.variant : item.variant?.name || "-"}
                  </td>
                  <td className="p-3">
                    {typeof item.unit === "string" ? item.unit : item.unit?.name || "-"}
                  </td>
                  <td className="p-3">
                    {item.checked && (
                      <Input
                        type="number"
                        min={0}
                        value={item.physicalQty}
                        onChange={(e) =>
                          handleChangeQty(item.id, e.target.value)
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button
        className="mt-5 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Physical Inventory"}
      </Button>
    </div>
    </main>
  );
}
