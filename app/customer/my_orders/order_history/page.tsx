"use client";

import { useState } from "react";
import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Link from "next/link";

const OrderHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("Requests");

  const requestData = [
    { id: "001", date: "04/10/2025", type: "Consumables", status: "Completed" },
    { id: "002", date: "04/15/2025", type: "Services", status: "Sent" },
    { id: "003", date: "04/20/2025", type: "Consumables", status: "In Progress" },
  ];

  const quotationData = [
    { id: "QT001", date: "04/12/2025", request: "001", type: "Consumables", status: "Approved" },
    { id: "QT002", date: "04/17/2025", request: "002", type: "Services", status: "Pending" },
  ];

  const poData = [
    { id: "PO001", date: "04/13/2025", supplier: "ABC Supplies", type: "Services", status: "Delivered" },
    { id: "PO002", date: "04/19/2025", supplier: "XYZ Traders", type: "Consumables", status: "Processing" },
  ];

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return "bg-[#777777]";
      case "pending":
        return "bg-[#173f63]";
      case "completed":
        return "bg-green-600";
      case "in progress":
        return "bg-[#ffc922]";
      case "approved":
        return "bg-green-600";
      case "delivered":
        return "bg-green-600";
      case "processing":
        return "bg-[#173f63]";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <CustomerClientComponent>
      <div className="h-full w-full bg-[#fed795] pb-10">
        <CustomerHeader />

        {/* Top bar */}
        <div className="flex flex-row mt-3 ml-170">
          <div className="h-9 w-70 rounded-3xl border-[#d2bda7] border-b-4 bg-white flex items-center px-5">
            <Image src="/search-alt-2-svgrepo-com.svg" width={20} height={20} alt="Search" />
          </div>

          <div className="h-11 w-30 ml-4 rounded-2xl border-[#d2bda7] border-b-4 bg-white flex items-center px-5">
            <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" />
            <span className="ml-3 text-[#482b0e] font-semibold">Filter</span>
          </div>

          <div className="h-11 w-30 ml-4 rounded-2xl border-[#d2bda7] border-b-4 bg-white flex items-center px-5">
            <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" />
            <span className="ml-3 text-[#482b0e] font-semibold">Sort</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 pl-5 flex flex-row gap-2">
          {["Requests", "Quotation", "P.O."].map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-block px-5 py-3 w-60 rounded cursor-pointer ${
                activeTab === tab ? "bg-[#ffc922]" : "bg-[#e6c98e]"
              }`}
              style={{
                clipPath: "polygon(0 0, 0 1000%, 100% 100%, 75% 0%)",
              }}
            >
              <span className="text-2xl text-white font-bold">{tab}</span>
            </div>
          ))}
        </div>

        {/* Table Wrapper */}
        <div className="mt-6 px-5">
          <div className="bg-white shadow-md rounded overflow-hidden w-full max-w-[90rem]">
            {/* Requests Table */}
            {activeTab === "Requests" && (
              <>
                <div className="bg-[#ffffff] flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
                  <div className="basis-1/6">Request ID</div>
                  <div className="basis-1/5">Date Created</div>
                  <div className="basis-1/4">Type of Request</div>
                  <div className="basis-1/5">Status</div>
                  <div className="basis-1/5">Actions</div>
                </div>

                {requestData.map((req, index) => (
                  <div
                    key={req.id}
                    className={`flex items-center text-[#5a4632] py-3 px-6 ${
                      index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
                    }`}
                  >
                    <div className="basis-1/6">{req.id}</div>
                    <div className="basis-1/5">{req.date}</div>
                    <div className="basis-1/4">{req.type}</div>
                    <div className="basis-1/5">
                      <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(req.status)}`}>
                        {req.status}
                        </span>
                    </div>
                    <div className="basis-1/5">
  <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
    <Link
      href={
        req.type === "Consumables"
          ? `/customer/my_orders/order_history/requests/consumables/`
          : `/customer/my_orders/order_history/requests/nonconsumables/`
      }
    >
      <div className="text-sm font-semibold">View Details</div>
    </Link>
  </button>
</div>
                  </div>
                ))}
              </>
            )}

            {/* Quotation Table */}
            {activeTab === "Quotation" && (
  <>
    <div className="bg-[#ffffff] flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
      <div className="basis-1/6">Quotation No.</div>
      <div className="basis-1/5">Date|Time Created</div>
      <div className="basis-1/5">Date|Time Received</div>
      <div className="basis-1/5">Type</div>
      <div className="basis-1/5">Linked Request</div>
      <div className="basis-1/6">Status</div>
      <div className="basis-1/6">Action</div>
    </div>

    {quotationData.map((q, index) => (
      <div
        key={q.id}
        className={`flex items-center text-[#5a4632] py-3 px-6 ${
          index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
        }`}
      >
        <div className="basis-1/6">{q.id}</div>
        <div className="basis-1/5">{q.date}</div>
        <div className="basis-1/5">04/13/2025 2:10 PM</div> {/* Placeholder */}
        <div className="basis-1/5">{q.type}</div>
        <div className="basis-1/5">{q.request}</div>
        <div className="basis-1/6">
          <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(q.status)}`}>
            {q.status}
          </span>
        </div>
        <div className="basis-1/6">
        <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
    <Link
      href={
        q.type === "Consumables"
          ? `/customer/my_orders/order_history/quotation/consumables`
          : `/customer/my_orders/order_history/quotation/nonconsumables/`
      }
    >
      <div className="text-sm font-semibold">View Details</div>
    </Link>
  </button>
        </div>
      </div>
    ))}
  </>
)}
            {/* PO Table */}
            {activeTab === "P.O." && (
  <>
    <div className="bg-[#ffffff] flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
      <div className="basis-1/6">P.O. No.</div>
      <div className="basis-1/5">Date|Time Created</div>
      <div className="basis-1/5">Date|Time Received</div>
      <div className="basis-1/5">Type</div>
      <div className="basis-1/5">Linked Quotation</div>
      <div className="basis-1/6">Status</div>
      <div className="basis-1/6">Action</div>
    </div>

    {poData.map((po, index) => (
      <div
        key={po.id}
        className={`flex items-center text-[#5a4632] py-3 px-6 ${
          index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
        }`}
      >
        <div className="basis-1/6">{po.id}</div>
        <div className="basis-1/5">{po.date}</div>
        <div className="basis-1/5">04/14/2025 3:45 PM</div> {/* Placeholder */}
        <div className="basis-1/5">{po.type}</div>
        <div className="basis-1/5">QT001</div> {/* Placeholder link to Quotation */}
        <div className="basis-1/6">
          <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(po.status)}`}>
            {po.status}
          </span>
        </div>
        <div className="basis-1/6">
  <a
    href={
      po.type === "Consumables"
        ? `/customer_c_po.pdf`
        : `/customer_po.pdf` // Use another file for services
    }
    target="_blank"
    rel="noopener noreferrer"
    className="hover:opacity-80"
  >
    <Image
      src="/file-pdf-svgrepo-com.svg"
      width={24}
      height={24}
      alt="View PO"
      className="cursor-pointer"
    />
  </a>
</div>

      </div>
    ))}
  </>
)}
          </div>
        </div>

        {/* Pagination (Optional: Replace with ShadCN Pagination Component if installed) */}
        {/* Pagination using ShadCN */}
        <div className="ml-250 mt-5">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious className="rounded-full border-[#d2bda7] border-b-4 bg-white hover:bg-yellow-500/30" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive className="text-[#482b0e] font-semibold border-[#d2bda7] border-b-4 bg-white hover:bg-yellow-500/30">
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext className="rounded-full border-[#d2bda7] border-b-4 bg-white hover:bg-yellow-500/30" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </CustomerClientComponent>
  );
};

export default OrderHistoryPage;
