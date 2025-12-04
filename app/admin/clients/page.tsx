// app/admin/clients/page.tsx

"use client";
import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import Image from "next/image";
import AddClientModal from "@/components/add/admin/add_client";
//import ClientActions from "./actions/supplier_actions";

type Client = {
  id?: number;
  clientName: string;
  email: string;
  contact: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export default function ClientList() {
  const [client, setClient] = useState<Client[]>([]);
  const [, setLoading] = useState(true);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"clientName" | "reverseClientName" | "" >("");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchClients = async () => {
    const res = await fetch("/api/admin/clients");
    const data = await res.json();
    setClient(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

//   const handleEdit = (client: Client) => {
//     setEditingClient(client);
//     setIsAddClientModalOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//   try {
//       const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
//     const json = await res.json();

//     if (res.ok && json.success) {
//       toast.success("Client deleted successfully.");
//       fetchClients(); // refresh list
//     } else {
//       toast.error(json.error || "Failed to delete client.");
//     }
//   } catch (error) {
//     console.error("Delete error:", error);
//     toast.error("Error deleting client.");
//   }
// };

const sortRef = useRef<HTMLDivElement | null>(null);

      const filteredClients = client
    .filter((client) =>
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) 
    //   (!selectedCategory || item.category?.name === selectedCategory) &&
    //   (!selectedStatus || item.status === selectedStatus)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "clientName":
          return a.clientName.localeCompare(b.clientName);
        case "reverseClientName":
          return b.clientName.localeCompare(a.clientName);
        default:
          return 0;
      }
    });

    const totalPages = Math.ceil(filteredClients.length / recordsPerPage);
  const paginatedClients = filteredClients.slice(
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
        <AddClientModal 
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientAdded={fetchClients}
        existingClient={client}
        client={editingClient}
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
        {sortBy === "clientName" ? "Name: A - Z" : sortBy === "reverseClientName" ? "Name: Z - A" : "Sort"}
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
            setSortBy("clientName");
            setSortDropdownOpen(false);
            }}
            >
            Name (A-Z)
            </div>
            <div 
            className="text-center py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
            setSortBy("reverseClientName");
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
            setEditingClient(null);
            setIsAddClientModalOpen(true)
        }}
        className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
      >
        <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
        <span className="ml-1 text-sm text-[#482b0e]">Add New</span>
      </button>
      </div>

      <div className="flex-1 overflow-y-visible mt-2 rounded relative">
        <div className="bg-white rounded shadow-md mb-2">

        <div className="bg-[#fcd0d0] grid grid-cols-[2fr_1fr_2fr_2fr_0.5fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
          <>
            <span>Name</span>
            <span>Email</span>
            <span>Contact</span>
            <span>Address</span>
            <span>Actions</span>
          </>
        </div>
        <div>
          
          {paginatedClients.length > 0 ? (
          paginatedClients.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[2fr_1fr_2fr_2fr_0.5fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
            >
              <span className="text-xs">{c.clientName}</span>
              <span className="text-xs">{c.email}</span>
              <span className="text-sm">{c.contact}</span>
              <span className="text-xs">{c.address}</span>
              <div className="flex items-center justify-center">
                {/* <ClientActions
                item={c}
                onDelete={() => c.id && handleDelete(c.id)}
                onEdit={() => handleEdit(c)}
                 /> */}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-5 italic">No clients found.</div>
        )}
        </div>
      </div>
      </div>
    </div>

      {/* Pagination */}
      <div className="absolute bottom-0 left-0 w-full bg-transparent py-3 flex justify-center items-center gap-2 z-50">
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
