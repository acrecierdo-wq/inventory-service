// app/warehouse/w_inventory/w_item_properties/page.tsx

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
    setCurrentPage(1);
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
          className="h-7 w-16 sm:w-20 text-white bg-blue-300 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-blue-400 active:border-b-4 border-blue-800 text-xs sm:text-sm"
        >
          Edit
        </div>
        <div
          onClick={() => onDelete(item.id)}
          className="h-7 w-16 sm:w-20 bg-slate-200 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-slate-400 active:border-b-4 border-gray-800 text-xs sm:text-sm"
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
    <main className="min-h-screen w-full bg-[#ffedce] flex flex-col">
      <Header />

      {/* Tabs and Add Section - Responsive */}
      <section className="flex flex-col lg:flex-row lg:justify-between lg:mt-24  px-3 sm:px-4 lg:px-10 gap-4 mt-32">
        {/* Tabs */}
        <div className="flex flex-row gap-2 sm:gap-4 overflow-x-auto">
          {/* Category Tab */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setActiveTab("categories");
                setCurrentPage(1);
              }}
              className={`h-10 w-20 sm:w-24 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
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
              className={`h-10 w-20 sm:w-24 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
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
              className={`h-10 w-20 sm:w-24 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
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
              className={`h-10 w-20 sm:w-24 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
          {/* Add new input */}
          <div className="h-10 w-full sm:w-60 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row items-center">
            <Image
              src="/pencil.svg"
              width={15}
              height={15}
              alt="Search"
              className="ml-3 sm:ml-5"
            />
            <input
              type="text"
              title="Click +Add to confirm"
              placeholder={`Input new ${activeTab}`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="ml-2 bg-transparent focus:outline-none flex-1 text-sm"
            />
          </div>

          {/* Add button */}
          <div className="relative w-full sm:w-auto">
            <div
              onClick={handleAdd}
              className="h-10 w-full sm:w-24 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
            >
              <Image
                src="/circle-plus-svgrepo-com.svg"
                width={20}
                height={20}
                alt="Add"
              />
              <span className="text-[#482b0e] ml-1 text-sm">Add</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table Section - Responsive */}
      <section className="flex-1 overflow-x-auto px-3 sm:px-4 lg:px-10 mt-5 pb-20">
        <div className="bg-[#fffcf6] rounded shadow-md min-w-full">
          {loading && <div className="text-center py-8">Loading...</div>}
          {error && (
            <div className="text-red-500 text-center py-8">{error}</div>
          )}

          {/* Item Properties Table */}
          {!loading && !error && (
            <>
              {/* Desktop/Tablet Table Header */}
              <div className="hidden md:flex px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] justify-between text-sm">
                <span className="capitalize flex-1">{activeTab} name</span>
                <span className="w-40 text-right">ACTIONS</span>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 bg-white border-b border-gray-200"
                    >
                      {editId === item.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border-2 border-yellow-300 rounded-md shadow-md"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(item.id)}
                              className="flex-1 h-8 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="flex-1 h-8 bg-gray-200 rounded-md hover:bg-gray-500 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-[#1e1d1c] max-w-2xl truncate flex-1">
                            {item.name}
                          </span>
                          <ItemActions
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No records found.
                  </div>
                )}
              </div>

              {/* Desktop/Tablet Table View */}
              <div className="hidden md:block">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-5 py-3 bg-white border-b border-gray-200 text-[#1e1d1c] flex justify-between items-center"
                    >
                      {editId === item.id ? (
                        <>
                          <div className="flex-1 mr-4">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="border-2 border-yellow-300 rounded-md shadow-md"
                            />
                          </div>
                          <div className="flex gap-2 w-40 justify-end">
                            <button
                              onClick={() => handleUpdate(item.id)}
                              className="w-20 h-8 bg-green-500 text-white rounded-4xl hover:bg-green-600 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="w-20 h-8 bg-gray-200 rounded-4xl hover:bg-gray-500 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 mr-4">{item.name}</div>
                          <div className="w-40">
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
                  <div className="text-center text-gray-500 py-8">
                    No records found.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Addition
            </h2>
            <p className="mb-6 text-sm sm:text-base">
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
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-700 text-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-gray-700 text-sm sm:text-base">
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
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination - Responsive */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] w-full lg:w-[calc(100%-250px)] bg-[#ffedce] py-3 flex justify-center shadow-lg z-10">
        <Pagination>
          <PaginationContent className="flex-wrap gap-1">
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((prev) => Math.max(prev - 1, 1));
              }}
              className="text-xs sm:text-sm"
            />
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index} className="hidden sm:inline-block">
                <PaginationLink
                  href="#"
                  className={`text-xs sm:text-sm ${
                    currentPage === index + 1 ? "bg-[#d2bda7] text-white" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(index + 1);
                  }}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {/* Show current page on mobile */}
            <div className="sm:hidden flex items-center px-2 text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              }}
              className="text-xs sm:text-sm"
            />
          </PaginationContent>
        </Pagination>
      </div>
    </main>
  );
};

export default ItemPropertiesPage;
