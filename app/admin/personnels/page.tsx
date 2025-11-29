// app/admin/personnels/page.tsx

"use client";
import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import Image from "next/image";
import AddPersonnelModal from "@/components/add/admin/add_personnel";
import PersonnelActions from "./actions/personnel_actions";
import { toast } from "sonner";

type Personnel = {
  id: number;
  username: string;
  personnelName: string;
  department: string;
  email: string;
  contactNumber: string;
  address: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export default function SupplierList() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [, setLoading] = useState(true);

  const [isAddPersonnelModalOpen, setIsAddPersonnelModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"personnelName" | "reversePersonnelName" | "" >("");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const sortRef = useRef<HTMLDivElement | null>(null);

  const fetchPersonnel = async () => {
    const res = await fetch("/api/admin/personnels");
    const data = await res.json();
    setPersonnel(data.personnels ?? data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleEdit = (personnel: Personnel) => {
    setEditingPersonnel(personnel);
    setIsAddPersonnelModalOpen(true);
  };

  const handleDelete = async (id: number) => {
  try {
    const res = await fetch(`/api/admin/personnels/${id}`, { method: "DELETE" });
    const json = await res.json();

    if (res.ok && json.success) {
      toast.success("Personnel deleted successfully.");
      fetchPersonnel(); // refresh list
    } else {
      toast.error(json.error || "Failed to delete personnel.");
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Error deleting personnel.");
  }
};

      const filteredPersonnels = personnel
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.personnelName.toLowerCase().includes(term)
    ||    p.department.toLowerCase().includes(term)
    ||    p.username.toLowerCase().includes(term)
    ||    p.email.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === "personnelName") return a.personnelName.localeCompare(b.personnelName);
      if (sortBy === "reversePersonnelName") return b.personnelName.localeCompare(a.personnelName);
      return 0;
    });

  const totalPages = Math.ceil(filteredPersonnels.length / recordsPerPage);
  const paginatedPersonnels = filteredPersonnels.slice(
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
    <main className="bg-[#ffedce] h-full relative">
      <Header />
        <div className="p-6">
        <AddPersonnelModal 
        isOpen={isAddPersonnelModalOpen}
        onClose={() => setIsAddPersonnelModalOpen(false)}
        onPersonnelAdded={fetchPersonnel}
        existingPersonnel={personnel}
        personnel={editingPersonnel}
        />
      
      <div className="flex justify-end gap-4">

        <div className="h-8 w-70 mt-2 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
        <Image src="/search-alt-2-svgrepo-com.svg" width={15} height={15} alt="Search" className="ml-5" />
        <input
        className="ml-2 bg-transparent focus:outline-none"
        type = "text"
        placeholder = "Search..."
        value={searchTerm}
        onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
        }}
        />
    </div>
        <div className="relative" ref={sortRef}>
        <div 
        className="h-10 w-25 rounded-md border-[#d2bda7] border-b-2 bg-white flex items-center px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
        >
        <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" className="" />
        <span className="ml-2 text-sm text-[#482b0e]">
        {sortBy === "personnelName" ? "Name: A - Z" : sortBy === "reversePersonnelName" ? "Name: Z - A" : "Sort"}
        </span>
        </div>
        
        {sortDropdownOpen && (
        <div className="absolute z-20 bg-white border-gray-200 mt-1 w-35 rounded shadow">   
            <div
            className="py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
            onClick={() => {
            setSortBy("");
            setSortDropdownOpen(false);
            }}
            > No Sort
            </div>
            <div 
            className="text-center py-1 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
            setSortBy("personnelName");
            setSortDropdownOpen(false);
            }}
            >
            Name (A-Z)
            </div>
            <div 
            className="text-center py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
            setSortBy("reversePersonnelName");
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
            setEditingPersonnel(null);
            setIsAddPersonnelModalOpen(true)
        }}
        className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
      >
        <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
        <span className="ml-1 text-sm text-[#482b0e]">Add New</span>
      </button>
      </div>

      <div className="flex-1 overflow-y-visible mt-2 rounded relative">
        <div className="bg-white rounded shadow-md mb-2">

        <div className="bg-[#fcd0d0] grid grid-cols-[1fr_2fr_2fr_2fr_2fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
          <>
            <span>Username</span>
            <span>Name</span>
            <span>Department</span>
            <span>Email</span>
            <span>Status</span>
            <span>Actions</span>
          </>
        </div>
        <div>
          
          {paginatedPersonnels.length > 0 ? (
          paginatedPersonnels.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
            >
              <span>{p.username}</span>
              <span className="uppercase text-sm">{p.personnelName}</span>
              <span>{p.department}</span>
              <span>{p.email}</span>
              <span><span
                    className={`px-5 py-1 rounded-full text-xs font-medium text-center
                    ${
                      p.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status === "Active" ? "Active" : "Inactive"}
                  </span>
                  </span>
              <div className="flex items-center justify-center">
                <PersonnelActions
                item={p}
                onDelete={() => p.id && handleDelete(p.id)}
                onEdit={() => handleEdit(p)}
                 />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-5 italic">No personnels found.</div>
        )}
        </div>
      </div>
      </div>
    </div>

      {/* Pagination */}
      <div className="absolute bottom-0 left-0 w-full bg-[#ffedce] py-3 flex justify-center items-center gap-2 z-50">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`h-8 w-15 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f]"
          }`}
        >
          Prev
        </button>

        <span className="text-[#5a4632] text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`h-8 w-15 rounded-md ${
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
