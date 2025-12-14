// app/warehouse/w_inventory/w_physical/start/page.tsx

"use client";

import { Header } from "@/components/header";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import { InventoryCategory } from "../../w_inventory_list/types/inventory";

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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<Record<number, string>>({});


  const categoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("physicalSelections");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedItems(parsed.selectedItems || []);
      setQuantities(parsed.quantities || {});
    }
  }, []);

    const fetchDropdownData = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load caegories");
    }
  };

const fetchItems = async () => {
  try {
    const res = await fetch("/api/items");
    const data: { success: boolean; data?: ItemFromAPI[]; error?: string } =
      await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to load items");

    const apiItems: ItemFromAPI[] = data.data ?? [];

    // GET SAVED LOCALSTORAGE DATA
    const saved = localStorage.getItem("physicalSelections");
    let savedSelected: number[] = [];
    let savedQuantities: Record<number, string> = {};

    if (saved) {
      const parsed = JSON.parse(saved);
      savedSelected = parsed.selectedItems || [];
      savedQuantities = parsed.quantities || {};
    }

    // APPLY SAVED STATE TO ITEMS
    const formatted: Item[] = apiItems.map((i) => ({
      ...i,
      checked: savedSelected.includes(i.id),
      physicalQty: savedQuantities[i.id] ?? "",
    }));

    setItems(formatted);

  } catch (err) {
    console.error(err);
    toast.error("Failed to load items");
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
      fetchDropdownData();
      fetchItems();
    }, []);

  const handleChangeQty = (id: number, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, physicalQty: value } : item
      )
    );
    
    setQuantities((prev) => {
      const newQuantities = { ...prev, [id]: value };
      localStorage.setItem(
        "physicalSelections",
        JSON.stringify({
          selectedItems,
          quantities: newQuantities,
        })
      );
      return newQuantities;
    });
  };

  const handleToggleCheck = (id: number) => {
  setItems((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
  );

  setSelectedItems((prev) => {
    const newSelected = prev.includes(id)
      ? prev.filter((i) => i !== id)
      : [...prev, id];

    localStorage.setItem(
      "physicalSelections",
      JSON.stringify({
        selectedItems: newSelected,
        quantities,
      })
    );

    return newSelected;
  });
};

  const handleSubmit = async () => {
    const countedItems = items.filter((i) => i.checked);
    if (countedItems.length === 0) {
      toast.error("No items selected for counting");
      return;
    }

    if (countedItems.some((i) => i.physicalQty === "")) {
      toast.error("Please enter physical quantity for selected item");
      return;
    }

    if (items.length === 0) {
      toast.error("No items found");
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

  const filteredItems = items.filter((item) => {
    const categoryName =
      typeof item.category === "string"
        ? item.category
        : item.category?.name;

    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || categoryName === selectedCategory)
    );
  });

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
  
        if (categoryRef.current && !categoryRef.current.contains(target)) {
          setCategoryDropdownOpen(false);
        }
      };
  
      window.addEventListener("mousedown", handleClickOutside);
      return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);


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
    <main className="min-h-screen bg-[#ffedce]">
      <Header />
      <div className="p-10 /max-w-6xl /mx-auto">

      <div className="flex justify-between mb-1">
        <button
        className={`h-10 w-full sm:w-auto sm:min-w-[100px] text-white  rounded-md flex items-center justify-between px-3 active:border-b-4 transition ${
          submitting ? "bg-green-500 border-b-2 border-green-700 opacity-50 cursor-not-allowed" : "bg-green-500 border-b-2 border-green-700 hover:bg-green-600 cursor-pointer"
        }`}
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Physical Count"}
      </button>

      <button
          onClick={() => router.back()}
          className="px-4 py-1 text-sm bg-white border border-[#d2bda7] text-[#5a4632] rounded-full shadow hover:bg-[#f59f0b1b] transition cursor-pointer"
        >
          ←
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <div className="h-10 w-full sm:w-auto sm:min-w-[200px] rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row items-center hover:bg-[#f0d2ad]">
          <Image
            src="/search-alt-2-svgrepo-com.svg"
            width={15}
            height={15}
            alt="Search"
            className="ml-3 sm:ml-5"
          />
          <input
            className="ml-2 bg-transparent focus:outline-none flex-1 text-sm"
            type="text"
            placeholder="Search item..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

      {/* Category Filter */}
      <div className="relative w-full sm:w-auto" ref={categoryRef}>
        <div
          className="h-10 w-full sm:w-auto sm:min-w-[100px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-between px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
          onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
        >
          <div className="flex items-center gap-2">
            <Image
              src="/select-category-svgrepo-com.svg"
              width={20}
              height={20}
              alt="Category"
            />
            <span className="text-sm text-[#482b0e]">
              {selectedCategory || "Categories"}
            </span>
          </div>
        </div>
        
        {categoryDropdownOpen && (
          <div className="absolute z-20 bg-white border border-gray-200 mt-1 w-full sm:min-w-[130px] rounded shadow-lg max-h-60 overflow-y-auto">
            <div
              className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm font-medium"
              onClick={() => {
                setSelectedCategory("");
                setCategoryDropdownOpen(false);
              }}
            >
              All Categories
            </div>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setCategoryDropdownOpen(false);
                }}
              >
                {cat.name}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-500">No items found.</p>
      ) : (
        <div className="mt-2 overflow-x-auto border-2 border-[#ffdcb9]/95 rounded shadow-sm">
          <table className="w-full table-auto border-collapse border-b border-[#d2bda7]">
            <thead>
              <tr className="bg-[#fffcf6] text-left text-[#5a4632]">
                <th className="p-3 border-b">Count</th>
                <th className="p-3 border-b">Category</th>
                <th className="p-3 border-b">Item Name</th>
                <th className="p-3 border-b">Size</th>
                <th className="p-3 border-b">Variant</th>
                <th className="p-3 border-b">Unit</th>
                <th className="p-3 border-b">Physical Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleCheck(item.id)}
                      className="cursor-pointer"
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
                        placeholder="Enter physical quantity..."
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
    
    </div>
    </main>
  );
}
