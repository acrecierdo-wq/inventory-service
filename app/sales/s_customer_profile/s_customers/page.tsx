"use client";

import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Customer {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
}

const SalesCustomerProfilePage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Column widths (must total 100%)
  const [colWidths, setColWidths] = useState<number[]>([8, 32, 25, 25, 10]);

  const resizingCol = useRef<number | null>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/sales/customer");
        const data = await res.json();
        setCustomers(data);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Handle movement while resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (resizingCol.current !== null) {
      const table = document.getElementById("customer-table");
      if (!table) return;

      const totalWidth = table.offsetWidth;
      const pxDelta = e.clientX - startX.current;
      const percentDelta = (pxDelta / totalWidth) * 100;

      const newWidths = [...colWidths];
      const newWidth = startWidth.current + percentDelta;

      // Set minimum width (6%)
      if (newWidth >= 6) newWidths[resizingCol.current] = newWidth;

      // Renormalize back to EXACT 100%
      const total = newWidths.reduce((a, b) => a + b, 0);
      const factor = 100 / total;

      const normalized = newWidths.map((w) => w * factor);
      setColWidths(normalized);
    }
  };

  const stopResize = () => {
    resizingCol.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResize);
  };

  const startResize = (e: React.MouseEvent, index: number) => {
    resizingCol.current = index;
    startX.current = e.clientX;
    startWidth.current = colWidths[index];

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResize);
  };

  const headers = ["ID No.", "COMPANY NAME", "CONTACT PERSON", "EMAIL", "ACTION"];

  return (
    <div className="bg-[#ffedce] min-h-screen w-full">
      <Header />

      {/* Page Title */}
      <div className="px-10 mt-6">
        <h1 className="text-3xl font-bold text-[#5a4632]">Customer Profile</h1>
      </div>

      {/* 🔍 Search + Filter + Sort Bar */}
      <div className="flex justify-end mt-5 gap-4 px-10">

        {/* Search */}
        <div className="flex items-center h-10 w-64 rounded-3xl border-[#d2bda7] border-b-2 bg-white text-[#8a6f56] px-4 shadow-sm">
          <Image
            src="/search-alt-2-svgrepo-com.svg"
            width={18}
            height={18}
            alt="Search"
          />
          <input
            type="text"
            placeholder="Search..."
            className="ml-3 w-full bg-transparent outline-none"
          />
        </div>

        {/* Filter */}
        <div className="h-10 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 transition-all">
          <Image
            src="/filter-svgrepo-com.svg"
            width={18}
            height={18}
            alt="filter"
            className="mr-2"
          />
          Filter
        </div>

        {/* Sort */}
        <div className="h-10 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 transition-all mr-4">
          <Image
            src="/sort-ascending-fill-svgrepo-com.svg"
            width={18}
            height={18}
            alt="sort"
            className="mr-2"
          />
          Sort
        </div>

      </div>

      {/* TABLE */}
      <div className="px-10 mt-6 pb-12">
        <div
          id="customer-table"
          className="bg-white rounded-2xl shadow-xl w-full overflow-x-auto border border-[#debca3]"
        >
          {/* Header */}
          <div className="flex bg-[#fcd0d0] text-[#5a4632] font-bold border-b border-[#d2bda7] rounded-t-2xl">
            {headers.map((header, i) => (
              <div
                key={i}
                className="relative flex items-center justify-center py-4 px-3 border-r border-[#d2bda7] text-sm tracking-wide"
                style={{ width: `${colWidths[i]}%` }}
              >
                {header}

                {/* Resize Handle */}
                <div
                  onMouseDown={(e) => startResize(e, i)}
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#b79d87] transition"
                />
              </div>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div className="text-center py-6 text-gray-500">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No customers found.</div>
          ) : (
            customers.map((c) => (
              <div
                key={c.id}
                className="flex border-b border-[#e5d5c4] hover:bg-[#fff8ea] transition"
              >
                <div
                  className="py-3 px-3 text-center border-r border-[#e5d5c4]"
                  style={{ width: `${colWidths[0]}%` }}
                >
                  {c.id}
                </div>

                <div
                  className="py-3 px-3 border-r border-[#e5d5c4]"
                  style={{ width: `${colWidths[1]}%` }}
                >
                  {c.companyName}
                </div>

                <div
                  className="py-3 px-3 border-r border-[#e5d5c4]"
                  style={{ width: `${colWidths[2]}%` }}
                >
                  {c.contactPerson}
                </div>

                <div
                  className="py-3 px-3 border-r border-[#e5d5c4]"
                  style={{ width: `${colWidths[3]}%` }}
                >
                  {c.email}
                </div>

                <div
                  className="py-3 px-3 flex justify-center items-center"
                  style={{ width: `${colWidths[4]}%` }}
                >
                  <Link href={`/sales/s_customer_profile/s_customers/s_view_details/${c.id}`}>
                    <span className="px-4 py-1 text-sm font-semibold border border-[#d2bda7] bg-white rounded-full shadow-sm hover:bg-[#ffe7b6] transition">
                      View Details
                    </span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesCustomerProfilePage;
