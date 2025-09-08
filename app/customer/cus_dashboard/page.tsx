"use client";

import { useState, useEffect } from "react";
import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";

type QuotationRequest = {
  id: number;
  status: "Pending" | "Received" | "Acknowledged" | "Processed";
  project_name: string;
};

const CustomerPage = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Correct API path
        const res = await fetch("/api/q_request");
        if (!res.ok) {
          console.error("Failed to fetch requests", await res.text());
          return;
        }
        const data: QuotationRequest[] = await res.json();

        // Count only pending requests
        const pending = data.filter((r) => r.status === "Pending").length;
        setPendingCount(pending);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
  }, []);

  return (
    <CustomerClientComponent>
      <div className="bg-[#fed795] min-h-screen w-full">
        <CustomerHeader />

        <div className="h-30 mt-2 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
          <div className="mx-4 mt-2 flex flex-row gap-2">
            {/* Pending Section */}
            <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#feefc7] ml-6 rounded-lg mt-3 p-1">
              <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">Pending</div>
              <div className="flex items-center ml-1">
                <Image
                  src="/square-list-svgrepo-com.svg"
                  alt="icon"
                  width={50}
                  height={50}
                  className="w-[50px] h-[50px] mr-2 invert"
                />
                <div
                  className="ml-30 text-[#ffffff] text-5xl font-bold"
                  style={{ textShadow: "2px 2px 6px rgba(0, 0, 0, 0.6)" }}
                >
                  {pendingCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerClientComponent>
  );
};

export default CustomerPage;
