// app/purchasing/p_supplier_list/page.tsx

"use client";
import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import Image from "next/image";
import AddSupplierModal from "@/components/add/purchasing/add_supplier";
import SupplierActions from "./actions/supplier_actions";
import { toast } from "sonner";

type Supplier = {
  id?: number;
  supplierName: string;
  email: string;
  contactNumber: string;
  role: string;
  tinNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  loggedBy: string;
};

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [, setLoading] = useState(true);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "supplierName" | "reverseSupplierName" | ""
  >("");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  //   const [formData, setFormData] = useState<Supplier>({
  //     supplierName: "",
  //     email: "",
  //     contactNumber: "",
  //     role: "",
  //     tinNumber: "",
  //     address: "",
  //     createdAt: "",
  //     updatedAt: "",
  //     status: "",
  //     loggedBy: "",
  //   });

  const fetchSuppliers = async () => {
    const res = await fetch("/api/purchasing/suppliers");
    const data = await res.json();
    setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsAddSupplierModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/purchasing/suppliers/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        //toast.success("Supplier deleted successfully.");
        fetchSuppliers(); // refresh list
      } else {
        //toast.error(json.error || "Failed to delete supplier.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting supplier.");
    }
  };

  const sortRef = useRef<HTMLDivElement | null>(null);

  const filteredSuppliers = suppliers
    .filter(
      (supplier) =>
        supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      //   (!selectedCategory || item.category?.name === selectedCategory) &&
      //   (!selectedStatus || item.status === selectedStatus)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "supplierName":
          return a.supplierName.localeCompare(b.supplierName);
        case "reverseSupplierName":
          return b.supplierName.localeCompare(a.supplierName);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredSuppliers.length / recordsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <main className="bg-[#ffedce] min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-4 sm:p-6 pb-20">
        <AddSupplierModal
          isOpen={isAddSupplierModalOpen}
          onClose={() => setIsAddSupplierModalOpen(false)}
          onSupplierAdded={fetchSuppliers}
          existingSuppliers={suppliers}
          supplier={editingSupplier}
        />

        <div className="flex flex-col sm:flex-row mt-30 sm:mt-24 justify-end gap-2 sm:gap-4">
          <div className="h-10 w-full sm:w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row items-center px-3">
            <Image
              src="/search-alt-2-svgrepo-com.svg"
              width={15}
              height={15}
              alt="Search"
              className="flex-shrink-0"
            />
            <input
              className="ml-2 bg-transparent focus:outline-none w-full"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none" ref={sortRef}>
              <div
                className="h-10 w-full sm:w-25 rounded-md border-[#d2bda7] border-b-2 bg-white flex items-center justify-center px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                <Image
                  src="/sort-ascending-fill-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Sort"
                  className="flex-shrink-0"
                />
                <span className="ml-2 text-sm text-[#482b0e] truncate">
                  {sortBy === "supplierName"
                    ? "Name: A - Z"
                    : sortBy === "reverseSupplierName"
                    ? "Name: Z - A"
                    : "Sort"}
                </span>
              </div>

              {sortDropdownOpen && (
                <div className="absolute z-20 bg-white border border-gray-200 mt-1 w-full sm:w-35 rounded shadow">
                  <div
                    className="py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
                    onClick={() => {
                      setSortBy("");
                      setSortDropdownOpen(false);
                    }}
                  >
                    No Sort
                  </div>
                  <div
                    className="text-center py-1 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSortBy("supplierName");
                      setSortDropdownOpen(false);
                    }}
                  >
                    Name (A-Z)
                  </div>
                  <div
                    className="text-center py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSortBy("reverseSupplierName");
                      setSortDropdownOpen(false);
                    }}
                  >
                    Name (Z-A)
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setEditingSupplier(null);
                setIsAddSupplierModalOpen(true);
              }}
              className="h-10 flex-1 sm:flex-none sm:w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
            >
              <Image
                src="/circle-plus-svgrepo-com.svg"
                width={20}
                height={20}
                alt="Add"
                className="flex-shrink-0"
              />
              <span className="ml-1 text-sm text-[#482b0e] whitespace-nowrap">
                Add New
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="bg-white rounded shadow-md min-w-[640px]">
            <div className="bg-[#fcd0d0] grid grid-cols-[2fr_2fr_1fr_1fr_0.5fr] gap-2 sm:gap-4 px-3 sm:px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
              <span className="text-xs sm:text-base">Name</span>
              <span className="text-xs sm:text-base">Email</span>
              <span className="text-xs sm:text-base">Contact</span>
              <span className="text-xs sm:text-base">Role</span>
              <span className="text-xs sm:text-base">Actions</span>
            </div>
            <div>
              {paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-[2fr_2fr_1fr_1fr_0.5fr] gap-2 sm:gap-4 px-3 sm:px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center items-center"
                  >
                    <span className="text-xs sm:text-sm truncate">
                      {s.supplierName}
                    </span>
                    <span className="text-xs sm:text-sm truncate">
                      {s.email}
                    </span>
                    <span className="text-xs sm:text-sm">
                      {s.contactNumber}
                    </span>
                    <span className="text-xs sm:text-sm truncate">
                      {s.role}
                    </span>
                    <div className="flex items-center justify-center">
                      <SupplierActions
                        item={s}
                        onDelete={() => s.id && handleDelete(s.id)}
                        onEdit={() => handleEdit(s)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-5 italic text-sm">
                  No suppliers found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 w-full bg-[#ffedce] py-3 flex justify-center items-center gap-2 z-50 border-t border-[#d2bda7]">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`h-8 w-15 sm:w-20 rounded-md text-sm ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f]"
          }`}
        >
          Prev
        </button>

        <span className="text-[#5a4632] text-xs sm:text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`h-8 w-15 sm:w-20 rounded-md text-sm ${
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
