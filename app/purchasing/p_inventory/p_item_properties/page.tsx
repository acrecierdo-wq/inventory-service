// app/purchasing/p_inventory/p_item_properties/page.tsx

"use client";
import { Header } from "@/components/header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

type ItemType = {
  id: number;
  name: string;
};

const ITEMS_PER_PAGE = 10;

const ItemPropertiesPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ItemType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "categories" | "sizes" | "variants" | "units"
  >("categories");
  const [newItemName, setNewItemName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /** Fetch Items */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/${activeTab}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
    setCurrentPage(1); // reset to page 1 on property change
  }, [fetchItems]);

  /** Add Item */
  const handleAdd = () => {
    if (!newItemName.trim()) return;

    const exists = items.some(
      (item) => item.name.toLowerCase() === newItemName.trim().toLowerCase()
    );

    if (exists) {
      toast.error(`${activeTab} "${newItemName}" already exists.`);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmAdd = async () => {
    const res = await fetch(`/api/${activeTab}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItemName }),
    });

    if (res.ok) {
      toast.success("Added successfully");
      setNewItemName("");
      fetchItems();
    } else {
      toast.error("Failed to add");
    }
    setShowConfirmModal(false);
  };

  /** Delete Item */
  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    const res = await fetch(`/api/${activeTab}/${deleteId}`, {
      method: `DELETE`,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.message || "Failed to delete.");
    } else {
      toast.success("Deleted successfully.");
      fetchItems();
    }
    setDeleteId(null);
  };

  /** Edit / Update Item */
  const handleEdit = (id: number, currentName: string) => {
    setEditId(id);
    setEditName(currentName);
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;

    const exists = items.some(
      (item) =>
        item.id !== id &&
        item.name.toLowerCase() === editName.trim().toLowerCase()
    );

    if (exists) {
      toast.error(`${activeTab} "${editName}" already exists.`);
      return;
    }

    const res = await fetch(`/api/${activeTab}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      toast.success("Updated successfully!");
      setEditId(null);
      setEditName("");
      fetchItems();
    } else {
      toast.error("Update failed");
    }
  };

  /** Local Actions component */
  function ItemActions({
    item,
    onEdit,
    onDelete,
  }: {
    item: ItemType;
    onEdit: (id: number, name: string) => void;
    onDelete: (id: number) => void;
  }) {
    return (
      <div className="flex gap-2 justify-end">
        <div
          onClick={() => onEdit(item.id, item.name)}
          className="h-7 w-20 text-white bg-blue-300 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-blue-400 active:border-b-4 border-blue-800"
        >
          Edit
        </div>
        <div
          onClick={() => onDelete(item.id)}
          className="h-7 w-20 bg-slate-200 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-slate-400 active:border-b-4 border-gray-800"
        >
          Delete
        </div>
      </div>
    );
  }

  const filtereditems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtereditems.length / ITEMS_PER_PAGE);
  const paginatedItems = filtereditems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="h-screen w-full bg-[#ffedce] flex flex-col">
      <Header />

      {/* Top Section - Tabs and Add Input */}
      <section className="flex flex-col sm:flex-row justify-between mt-30 px-3 sm:px-10 gap-3 sm:gap-0">
        {/* Tabs */}
        <div className="flex flex-row gap-2 sm:gap-4 overflow-x-auto">
          {/* Category Tab */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("categories");
                setCurrentPage(1);
              }}
              className={`h-8 sm:h-10 w-16 sm:w-20 rounded-md flex items-center px-1 sm:px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
                            ${
                              activeTab === "categories"
                                ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md"
                                : "bg-white border-b-2 border-[#d2bda7]"
                            }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "categories"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Category
              </span>
            </div>
          </div>

          {/* Size Tab */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("sizes");
                setCurrentPage(1);
              }}
              className={`h-8 sm:h-10 w-16 sm:w-20 rounded-md flex items-center px-1 sm:px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
                            ${
                              activeTab === "sizes"
                                ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md"
                                : "bg-white border-b-2 border-[#d2bda7]"
                            }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "sizes"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Size
              </span>
            </div>
          </div>

          {/* Variant Tab */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("variants");
                setCurrentPage(1);
              }}
              className={`h-8 sm:h-10 w-16 sm:w-20 rounded-md flex items-center px-1 sm:px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
                            ${
                              activeTab === "variants"
                                ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md"
                                : "bg-white border-b-2 border-[#d2bda7]"
                            }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "variants"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Variant
              </span>
            </div>
          </div>

          {/* Unit Tab */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("units");
                setCurrentPage(1);
              }}
              className={`h-8 sm:h-10 w-16 sm:w-20 rounded-md flex items-center px-1 sm:px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
                            ${
                              activeTab === "units"
                                ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md"
                                : "bg-white border-b-2 border-[#d2bda7]"
                            }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  activeTab === "units"
                    ? "text-white font-semibold"
                    : "text-gray-500"
                }`}
              >
                Unit
              </span>
            </div>
          </div>
        </div>

        {/* Add Section */}
        <div className="flex flex-row gap-2 sm:gap-4">
          {/* Add new input */}
          <div className="h-8 sm:h-8 flex-1 sm:w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row items-center">
            <Image
              src="/pencil.svg"
              width={0}
              height={0}
              alt="Search"
              className="ml-3 sm:ml-5 w-[12px] sm:w-[15px] h-auto"
            />
            <input
              type="text"
              title="Click +Add to confirm"
              placeholder={`New ${activeTab}`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="ml-2 bg-transparent focus:outline-none text-xs sm:text-sm w-full"
            />
          </div>

          {/* Add button */}
          <div className="relative flex-shrink-0">
            <div
              onClick={handleAdd}
              className="h-8 sm:h-10 w-16 sm:w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
            >
              <Image
                src="/circle-plus-svgrepo-com.svg"
                width={16}
                height={16}
                alt="Add"
                className="sm:w-[20px] sm:h-[20px]"
              />
              <span className="text-[#482b0e] ml-1 text-xs sm:text-sm">
                Add
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="flex-1 overflow-y-auto px-3 sm:px-10 mt-3 sm:mt-5 pb-16 sm:pb-20">
        <div className="bg-[#fffcf6] rounded shadow-md mb-2">
          {loading && (
            <div className="text-center mt-5 text-sm">Loading...</div>
          )}
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}

          {/* Item Properties Table */}
          {!loading && !error && (
            <>
              {/* Header */}
              <div className="px-3 sm:px-5 py-2 sm:py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] flex justify-between text-xs sm:text-base">
                <span className="capitalize">{activeTab} name</span>
                <span className="hidden sm:inline">ACTIONS</span>
                <span className="sm:hidden">EDIT</span>
              </div>

              {/* Rows */}
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 sm:px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] flex justify-between items-center text-xs sm:text-base"
                  >
                    {editId === item.id ? (
                      <>
                        <div className="flex-1 mr-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border-2 border-yellow-300 rounded-md shadow-md text-xs sm:text-sm"
                          />
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => handleUpdate(item.id)}
                            className="w-14 sm:w-20 h-7 sm:h-8 bg-green-500 text-white rounded-4xl hover:bg-green-600 text-xs sm:text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="w-14 sm:w-20 h-7 sm:h-8 bg-gray-200 rounded-4xl hover:bg-gray-500 text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 mr-2 truncate">{item.name}</div>
                        <div className="flex gap-1 sm:gap-2">
                          <ItemActions
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-5 text-xs sm:text-base">
                  No records found.
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Confirm Add Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Confirm Addition
            </h2>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base">
              Are you sure you want to add
              <span className="font-semibold">
                <strong> {newItemName} </strong>
              </span>
              in
              <span className="capitalize">
                <strong> {activeTab}</strong>
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                className="px-3 sm:px-4 py-1 sm:py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 sm:px-4 py-1 sm:py-2 rounded bg-green-500 text-white hover:bg-green-700 text-sm"
                onClick={confirmAdd}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Confirm Deletion
            </h2>
            <p className="mb-4 sm:mb-6 text-gray-700 text-sm sm:text-base">
              Are you sure you want to delete
              <span className="font-semibold">
                <strong>
                  {" "}
                  {items.find((item) => item.id === deleteId)?.name}{" "}
                </strong>
              </span>
              in
              <span className="capitalize">
                <strong> {activeTab}</strong>
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                className="px-3 sm:px-4 py-1 sm:py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 sm:px-4 py-1 sm:py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 sm:left-[285px] w-full sm:w-[calc(100%-285px)] bg-[#ffedce] py-2 flex justify-center z-10">
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="text-xs sm:text-sm"
            />
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  className={`text-xs sm:text-sm ${
                    currentPage === index + 1 ? "bg-[#d2bda7] text-white" : ""
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              href="#"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="text-xs sm:text-sm"
            />
          </PaginationContent>
        </Pagination>
      </div>
    </main>
  );
};

export default ItemPropertiesPage;
