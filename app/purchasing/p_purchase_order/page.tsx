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

      const poArray = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      setPurchaseOrders(poArray);
    } catch (err) {
      console.error("Error loading POs:", err);
      setPurchaseOrders([]);
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
    <main className="min-h-screen bg-[#ffedce] flex flex-col">
      <Header />

      <div className="p-3 sm:p-4 lg:p-6 mt-20 lg:mt-24">
        {/* Add New Button */}
        <div className="flex justify-end mb-4">
          <Link href="/purchasing/new">
            <button
              onClick={() => setShowModal(true)}
              className="h-10 w-auto px-3 sm:px-4 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
            >
              <Image
                src="/circle-plus-svgrepo-com.svg"
                width={20}
                height={20}
                alt="Add"
                className="flex-shrink-0"
              />
              <span className="ml-2 text-xs sm:text-sm text-[#482b0e] whitespace-nowrap">
                Add New
              </span>
            </button>
          </Link>
        </div>

        {/* Table Section */}
        <section className="flex-1 overflow-x-auto rounded">
          <div className="bg-white rounded shadow-md min-w-full">
            {/* Desktop Table Header */}
            <div className="hidden md:grid bg-[#fcd0d0] grid-cols-[1fr_2fr_1.5fr_1fr_2fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center text-sm">
              <span>PO Number</span>
              <span>Date</span>
              <span>Supplier</span>
              <span>Terms</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {/* Table Content */}
            <div>
              {loading ? (
                <div className="text-center text-gray-500 py-8 text-sm sm:text-base">
                  Loading purchase orders...
                </div>
              ) : purchaseOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm sm:text-base">
                  No purchase orders found.
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    {paginatedPurchaseOrders.map((po) => (
                      <div
                        key={po.id}
                        className="grid grid-cols-[1fr_2fr_1.5fr_1fr_2fr_1fr] gap-4 px-5 py-3 bg-white border-b border-gray-200 text-[#1e1d1c] text-center items-center text-sm"
                      >
                        <span className="truncate">{po.poNumber}</span>
                        <span className="truncate">
                          {new Date(po.date).toLocaleDateString()}
                        </span>
                        <span className="truncate">{po.supplierName}</span>
                        <span className="truncate">{po.terms}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                            po.status === "Complete"
                              ? "bg-green-200 text-green-800"
                              : po.status === "Partial"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {po.status}
                        </span>
                        <span>{/* Action buttons can go here */}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mobile/Tablet Card View */}
                  <div className="md:hidden">
                    {paginatedPurchaseOrders.map((po) => (
                      <div
                        key={po.id}
                        className="bg-white border-b border-gray-200 p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#1e1d1c] text-sm truncate">
                              {po.poNumber}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(po.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              po.status === "Complete"
                                ? "bg-green-200 text-green-800"
                                : po.status === "Partial"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {po.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Supplier:</span>
                            <p className="text-[#1e1d1c] mt-1 truncate">
                              {po.supplierName}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Terms:</span>
                            <p className="text-[#1e1d1c] mt-1 truncate">
                              {po.terms}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                          {/* Action buttons can go here */}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Pagination - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] w-full lg:w-[calc(100%-250px)] bg-[#ffedce] py-3 flex justify-center items-center gap-2 z-10 shadow-lg">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`h-8 px-3 sm:px-4 rounded-md text-xs sm:text-sm ${
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
          className={`h-8 px-3 sm:px-4 rounded-md text-xs sm:text-sm ${
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
