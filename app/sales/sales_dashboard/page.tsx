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
    const res = await fetch("/api/sales/customer_request");
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
      <main className="bg-[#ffedce] h-full w-full">
        <Header />

        {/* Dashboard Top Section */}
        <div className="h-auto mt-2 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
          <div className="mx-4 mt-2 mb-2 flex flex-row gap-4">

          {/* Pending Card */}
          <div
            className="w-[230px] h-[80px] bg-white border border-[#ffb7b7] rounded-lg p-4 cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
            onClick={() => router.push("/sales/s_pending_customer_request")}
          >
            {/* Left Section: Label & Number */}
            <div>
              <div className="text-[#cf3a3a] text-sm uppercase font-bold">
                Pending
              </div>
              <div
                className="font-bold text-[#cf3a3a] text-3xl mt-1"
                //style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.5)" }}
              >
                {pendingCount}
              </div>
            </div>

            <Image
              src="/square-list-svgrepo-com.svg"
              alt="icon"
              width={40}
              height={40}
              className=""
            />

          </div>
        </div>

        </div>
      </main>
    </SalesClientComponent>
  );
};

export default SalesPage;
