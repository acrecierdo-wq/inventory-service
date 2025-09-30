"use client";

import SalesClientComponent from "@/app/validate/sales_validate";
import { Header } from "@/components/header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type QuotationRequest = {
  id: number;
  status: string;
};

const SalesPage = () => {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  const [, setRequests] = useState<QuotationRequest[]>([]);

const fetchRequests = async () => {
  try {
    const res = await fetch("/api/sales/my_request");
    const json = await res.json();
    console.log("🔎 API response:", json);

    const data = Array.isArray(json) ? json : json.data || [];
    setRequests(data);

    // count only "Pending" requests
    const pending = data.filter((req: QuotationRequest) => req.status === "Pending");
    setPendingCount(pending.length);
  } catch (err) {
    console.error(err);
    setRequests([]);
    setPendingCount(0);
  }
};

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <SalesClientComponent>
      <div className="bg-[#ffedce] h-full w-full">
        <Header />

        {/* Dashboard Top Section */}
        <div className="h-40 flex flex-row border-slate-200 px-4 bg-[#fff6f5] items-center">
          {/* Pending Card */}
          <div
            className="w-[230px] h-[80px] bg-[#0c2a42] rounded-lg p-4 cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
            onClick={() => router.push("/sales/s_pending_customer_request")}
          >
            {/* Left Section: Label & Number */}
            <div>
              <div className="text-[#ffffff] text-sm uppercase font-bold">
                Pending
              </div>
              <div
                className="text-[#ffffff] text-3xl font-bold mt-1"
                style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.5)" }}
              >
                {pendingCount}
              </div>
            </div>

            {/* Right Section: Icon */}
            <Image
              src="/square-list-svgrepo-com.svg"
              alt="icon"
              width={40}
              height={40}
              className="invert"
            />
          </div>
        </div>
      </div>
    </SalesClientComponent>
  );
};

export default SalesPage;
