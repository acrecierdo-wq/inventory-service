"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/header-customer";

import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type QuotationRequest = {
  id: number;
  status: "Pending" | "Cancelled" | "Processed" | "Accepted";
  project_name: string;
};

const statusStyles = {
  Pending: {
    border: "border-[#ffc400]",
    text: "text-[#b27900]",
    accentBg: "bg-gradient-to-b from-[#ffe07a] to-[#ffc400]",
    icon: "/list-menu-svgrepo-com (1).png",
    color: "#ffc400",
  },
  Accepted: {
    border: "border-[#7bb6f1]",
    text: "text-[#1f4a7a]",
    accentBg: "bg-gradient-to-b from-[#9ed2ff] to-[#7bb6f1]",
    icon: "/list-menu-svgrepo-com (3).png",
    color: "#7bb6f1",
  },
  Cancelled: {
    border: "border-[#f58071]",
    text: "text-[#7c2315]",
    accentBg: "bg-gradient-to-b from-[#fbb6a9] to-[#f58071]",
    icon: "/list-menu-svgrepo-com.png",
    color: "#f58071",
  },
};

const CustomerPage = () => {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await fetch("/api/customer/q_request");
      const result = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch requests", res.status);
        return;
      }

      const requests: QuotationRequest[] = result.data ?? [];

      setPendingCount(requests.filter((r) => r.status === "Pending").length);
      setAcceptedCount(requests.filter((r) => r.status === "Accepted").length);
      setCancelledCount(requests.filter((r) => r.status === "Cancelled").length);
    };

    fetchRequests();
  }, []);

  const handleRedirect = (status: string) => {
    router.push(`/customer/quotation_request?status=${status}`);
  };

  const statusData = useMemo(
    () => [
      { label: "Pending", count: pendingCount, ...statusStyles.Pending },
      { label: "Accepted", count: acceptedCount, ...statusStyles.Accepted },
      { label: "Cancelled", count: cancelledCount, ...statusStyles.Cancelled },
    ],
    [pendingCount, acceptedCount, cancelledCount]
  );

  const chartData = statusData.map((item) => ({
    name: item.label,
    count: item.count,
    color: item.color,
  }));

  const totalRequests = pendingCount + acceptedCount + cancelledCount || 1;

  return (
    <div className="min-h-screen w-full bg-[#ffedce] text-[#4f2d12]">
      <CustomerHeader />

      <main className="px-4 py-6 lg:px-8 space-y-6">
        {/* Top greeting */}
        <section className="rounded-3xl bg-gradient-to-r from-[#fff2d5] to-[#ffd5b5] border border-white/40 shadow-lg p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="text-sm uppercase tracking-[0.4em] text-[#c07a27]">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Track your quotation requests at a glance
            </h1>
            <p className="mt-3 text-[#6e4420]">
              View live status counts, spot bottlenecks, and jump straight to the
              actions you need—without losing your place in the process.
            </p>
          </div>
          <div className="flex items-center justify-center">
            {/* <Image
              src="/graph-up-svgrepo-com.svg"
              alt="Dashboard Illustration"
              width={200}
              height={160}
              className="object-contain drop-shadow-lg"
            /> */}
          </div>
        </section>

        {/* Stat cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statusData.map((item) => (
            <button
              key={item.label}
              onClick={() => handleRedirect(item.label)}
              className={`rounded-2xl bg-white border-2 ${item.border} px-5 py-4 text-left shadow-sm hover:shadow-lg transition-shadow`}
            >
              <div className={`text-xs font-semibold uppercase ${item.text}`}>
                {item.label}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${item.accentBg}`}>
                    <Image
                      src={item.icon}
                      alt={`${item.label} icon`}
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#3f2c1a]">
                      {item.count}
                    </p>
                    <p className="text-xs text-[#98704a]">requests</p>
                  </div>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-[#b68a56]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M8 5l8 7-8 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
        </section>

        {/* Visualizations */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Column chart using Recharts */}
          <div className="rounded-3xl bg-white/90 border border-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#3f2c1a]">
              Status distribution
            </h2>
            <p className="text-sm text-[#8a674a]">
              Live count comparison across your requests
            </p>
            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <XAxis dataKey="name" stroke="#8a674a" />
                  <YAxis stroke="#8a674a" />
                  <Tooltip />
                  <Bar dataKey="count">
  {chartData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.color} />
  ))}
</Bar>

                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress list */}
          <div className="rounded-3xl bg-white/90 border border-white shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#3f2c1a]">
              Workflow insights
            </h2>
            <p className="text-sm text-[#8a674a]">
              Quick ratios help you spot where attention is needed.
            </p>
            {statusData.map((item) => {
              const progress =
                totalRequests === 0 ? 0 : Math.round((item.count / totalRequests) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm font-medium text-[#5a3b1f]">
                    <span>{item.label}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#f4ddc1]">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${progress}%`,
                        background:
                          item.label === "Pending"
                            ? "#ffc400"
                            : item.label === "Accepted"
                            ? "#7bb6f1"
                            : "#f58071",
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-6 rounded-2xl bg-[#fff5e5] p-4 border border-[#ffe0b1]">
              <p className="text-sm font-semibold text-[#a05e2d]">
                Tip: Maintain clear notes inside each quotation request to keep
                communication flowing when a status changes.
              </p>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-3xl bg-white border border-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#3f2c1a]">Quick actions</h2>
          <p className="text-sm text-[#8a674a]">
            Move faster by jumping directly into the most common tasks.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {[ 
              { label: "New Request", href: "/customer/quotation_request/NewRequest" },
              { label: "My Requests", href: "/customer/cus_myrequest" },
              // { label: "Order History", href: "/customer/cus_orderhistory" },
              // { label: "Products & Services", href: "/customer/p&s/consumables" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="rounded-2xl border border-[#f1d2a9] bg-[#fff8ed] px-4 py-3 text-left text-sm font-semibold text-[#a05e2d] hover:border-[#ffc400] hover:bg-[#fff2d5]"
              >
                {action.label}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerPage;
