"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    
      <div className="bg-[#fed795] min-h-screen w-full">
        <CustomerHeader />

        <div className="h-auto mt-2 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
          <div className="mx-4 mt-2 flex flex-row gap-4">

            {/* Pending */}
            <div
              onClick={() => handleRedirect("Pending")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#edf346] rounded-lg p-2 flex flex-col justify-center"
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
                  className="ml-[30px] text-white text-3xl font-bold"
                  style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}
                >
                  {pendingCount}
                </div>
              </div>
            </div>

            {/* Accepted */}
            <div
              onClick={() => handleRedirect("Accepted")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#4350fe] rounded-lg p-2 flex flex-col justify-center"
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
                <div className="ml-[30px] text-white text-3xl font-bold">
                  {acceptedCount}
                </div>
              </div>
            </div>

            {/* Cancelled */}
            <div
              onClick={() => handleRedirect("Cancelled")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#f55d49] rounded-lg p-2 flex flex-col justify-center"
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
                <div className="ml-[30px] text-white text-3xl font-bold">
                  {cancelledCount}
                </div>
              </div>
            </div>

            {/* Approved */}
            <div
              onClick={() => handleRedirect("Approved")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#34d399] rounded-lg p-2 flex flex-col justify-center"
            >
              <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">
                Approved
              </div>
              <div className="flex items-center ml-1">
                <Image
                  src="/square-list-svgrepo-com.svg"
                  alt="icon"
                  width={50}
                  height={50} 
                  className="invert"
                />
                <div className="ml-[30px] text-white text-3xl font-bold">
                  {approvedCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CustomerPage;
