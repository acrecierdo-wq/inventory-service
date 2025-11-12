"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import Link from "next/link";
import Image from "next/image";

type PurchaseOrder = {
  id: number;
  poNumber: string;
  date: string;
  supplierName: string;
  terms: string;
  deliveryMode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  accountName: string;
  preparedBy: string;
  projectName: string;
  remarks: string;
};

export default function PurchaseOrdersPage() {
  const [, setShowModal] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

  const fetchPOs = async () => {
    try {
      const res = await fetch("/api/purchasing/purchase_orders");
      const data = await res.json();

      // ✅ Ensure it's always an array
      const poArray = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      setPurchaseOrders(poArray);
    } catch (err) {
      console.error("Error loading POs:", err);
      setPurchaseOrders([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const totalPages = Math.ceil(purchaseOrders.length / recordsPerPage);
  const paginatedPurchaseOrders = purchaseOrders.slice(
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
    <main className="h-full bg-[#ffedce] relative">
      <Header />

      <div className="p-6">
      <div className="flex justify-end mb-4">
      <Link href="/purchasing/new">
      <button 
        onClick={() => setShowModal(true)}
        className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
        >
        <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
        <span className="ml-1 text-sm text-[#482b0e]">Add New</span>
          </button></Link>
      </div>

      <section className="flex-1 overflow-y-visible mt-2 rounded relative">
        <div className="bg-white rounded shadow-md mb-2">
          <div className="bg-[#fcd0d0] grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
              <span>PO Number</span>
              <span>Date</span>
              <span>Supplier</span>
              <span>Terms</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
          <div>
            {loading ? (
        <div>
            <div className="text-center text-gray-500 py-5 italic">Loading purchase orders...</div>
        </div>
            ) : purchaseOrders.length === 0 ? (
          <div>
            <div className="text-center text-gray-500 py-5 italic">No purchase orders found.</div>
          </div>
            ) : (
            paginatedPurchaseOrders.map((po) => (
              <div 
                key={po.id} 
                className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center">
                <span>{po.poNumber}</span>
                <span>
                  {new Date(po.date).toLocaleDateString()}
                </span>
                <span>{po.supplierName}</span>
                <span>{po.terms}</span>
                <span>{po.status}</span>
                <span>{}</span>
              </div>
            ))
            )}
          </div>
        </div>
      </section>
    {/* Pagination */}
      <div className="absolute bottom-0 left-0 w-full bg-[#ffedce] py-3 flex justify-center items-center gap-2 z-10">
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
    </div>
    </main>
  );
}
