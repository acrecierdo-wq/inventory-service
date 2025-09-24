"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";

type QuotationRequest = {
  id: number;
  status: "Pending" | "Approved" | "Cancelled" | "Processed" | "Accepted";
  project_name: string;
};

const CustomerPage = () => {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/q_request");
        if (!res.ok) return;
        const data: QuotationRequest[] = await res.json();

        setPendingCount(data.filter((r) => r.status === "Pending").length);
        setAcceptedCount(data.filter((r) => r.status === "Accepted").length);
        setCancelledCount(data.filter((r) => r.status === "Cancelled").length);
        setApprovedCount(data.filter((r) => r.status === "Approved").length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
  }, []);

  const handleRedirect = (status: string) => {
    router.push(`/customer/quotation_request?status=${status}`);
  };

  return (
    <CustomerClientComponent>
      <div className="bg-[#ffffff] min-h-screen w-full">
        <CustomerHeader />

        <div className="h-30 mt-2 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
          <div className="mx-4 mt-2 flex flex-row gap-2">
            
            {/* Pending */}
            <div
              onClick={() => handleRedirect("Pending")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#edf346] ml-6 rounded-lg mt-3 p-1"
            >
              <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">
                Pending
              </div>
              <div className="flex items-center ml-1">
                <Image
                  src="/square-list-svgrepo-com.svg"
                  alt="icon"
                  width={50}
                  height={50}
                  className="invert"
                />
                <div
                  className="ml-30 text-white text-5xl font-bold"
                  style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}
                >
                  {pendingCount}
                </div>
              </div>
            </div>

            {/* Accepted */}
            <div
              onClick={() => handleRedirect("Accepted")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#4350fe] ml-6 rounded-lg mt-3 p-1"
            >
              <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">
                Accepted
              </div>
              <div className="flex items-center ml-1">
                <Image
                  src="/square-list-svgrepo-com.svg"
                  alt="icon"
                  width={50}
                  height={50}
                  className="invert"
                />
                <div className="ml-30 text-white text-5xl font-bold">
                  {acceptedCount}
                </div>
              </div>
            </div>

            {/* Cancelled */}
            <div
              onClick={() => handleRedirect("Cancelled")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#f55d49] ml-6 rounded-lg mt-3 p-1"
            >
              <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">
                Cancelled
              </div>
              <div className="flex items-center ml-1">
                <Image
                  src="/square-list-svgrepo-com.svg"
                  alt="icon"
                  width={50}
                  height={50}
                  className="invert"
                />
                <div className="ml-30 text-white text-5xl font-bold">
                  {cancelledCount}
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
