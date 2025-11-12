"use client";

import { Header } from "@/components/header";
import Image from "next/image";
import { useEffect, useState } from "react";

type StaffList = {
    id: number;
    status: string;
}

const AdminPage = () => {
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const [, setPersonnelAccounts] = useState<StaffList[]>([]);

const fetchPersonnelAccountsStatus = async () => {
  try {
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    console.log("🔎 API response:", json);

    const data = json.staff || [];
    setPersonnelAccounts(data);

    // count only "Pending" requests
    const active = data.filter((req: StaffList) => req.status.toLowerCase() === "active");
    const inactive = data.filter((req: StaffList) => req.status.toLowerCase() === "inactive");

    setActiveCount(active.length);
    setInactiveCount(inactive.length);
  } catch (err) {
    console.error(err);
    setPersonnelAccounts([]);
    setActiveCount(0);
    setInactiveCount(0);
  }
};

  useEffect(() => {
    fetchPersonnelAccountsStatus();
  }, []);

  return (
      <main className="bg-[#ffedce] h-full w-full">
        <Header />

        {/* Dashboard Top Section */}
        <div className="h-auto mt-2 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
          <div className="mx-4 mt-2 mb-2 flex flex-row gap-4">

          {/* Active Card */}
          <div
            className="w-[230px] h-[80px] bg-white border border-green-500 rounded-lg p-4 cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
            //onClick={() => router.push("/sales/s_pending_customer_request")}
          >
            {/* Left Section: Label & Number */}
            <div>
              <div className="text-green-500 text-sm uppercase font-bold">
                Active
              </div>
              <div
                className="font-bold text-green-500 text-3xl mt-1"
                //style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.5)" }}
              >
                {activeCount}
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

          {/* Inactive Card */}
          <div
            className="w-[230px] h-[80px] bg-white border border-[#ffb7b7] rounded-lg p-4 cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
            //onClick={() => router.push("/sales/s_pending_customer_request")}
          >
            {/* Left Section: Label & Number */}
            <div>
              <div className="text-[#cf3a3a] text-sm uppercase font-bold">
                Inactive
              </div>
              <div
                className="font-bold text-[#cf3a3a] text-3xl mt-1"
                //style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.5)" }}
              >
                {inactiveCount}
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
  );
};

export default AdminPage;
