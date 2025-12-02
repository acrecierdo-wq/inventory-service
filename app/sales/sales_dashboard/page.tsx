"use client";

import { Header } from "@/components/header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar, YAxis, 
} from "recharts";

// Types
type QuotationRequestAPI = {
  id: number;
  status: string;
  created_at?: string;
  customer_name?: string;
  project_name?: string;
  mode?: string;
  customer?: {
    companyName?: string;
  };
};

type QuotationRequest = {
  id: number;
  status: string;
  createdAt?: string;
  customerName?: string;
  project_name?: string;
  mode?: string;
};

type CustomerAPI = {
  id: number;
  companyName: string;
  // Add other customer fields here if needed
};

const statusColors: Record<string, string> = {
  Pending: "text-red-600 bg-red-100",
  Accepted: "text-teal-600 bg-teal-100",
  Rejected: "text-gray-600 bg-gray-100",
  "In Progress": "text-yellow-600 bg-yellow-100",
  Completed: "text-green-600 bg-green-100",
};

const SalesPage = () => {
  const router = useRouter();

  const [counts, setCounts] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    inProgress: 0,
    completed: 0,
  });

  const [latestRequests, setLatestRequests] = useState<QuotationRequest[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [companyRequests, setCompanyRequests] = useState<{ company: string; count: number }[]>([]);

  // -------------------------
  // FETCH REQUESTS
  // -------------------------
  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/sales/customer_request");
      const json: QuotationRequestAPI[] | { data: QuotationRequestAPI[] } = await res.json();

      const data: QuotationRequestAPI[] = Array.isArray(json) ? json : json.data || [];

      const formatted: QuotationRequest[] = data.map((req) => ({
        id: req.id,
        status: req.status,
        createdAt: req.created_at || "",
        customerName: req.customer_name || req.customer?.companyName || "N/A",
        project_name: req.project_name || "",
        mode: req.mode || "",
      }));

      setCounts({
        pending: formatted.filter((r) => r.status === "Pending").length,
        accepted: formatted.filter((r) => r.status === "Accepted").length,
        rejected: formatted.filter((r) => r.status === "Rejected").length,
        inProgress: formatted.filter((r) => r.status === "In Progress").length,
        completed: formatted.filter((r) => r.status === "Completed").length,
      });

      const latest = formatted
        .sort(
          (a, b) =>
            (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
            (a.createdAt ? new Date(a.createdAt).getTime() : 0)
        )
        .slice(0, 3);

      setLatestRequests(latest);
    } catch (err) {
      console.error(err);
      setCounts({ pending: 0, accepted: 0, rejected: 0, inProgress: 0, completed: 0 });
      setLatestRequests([]);
    }
  };

  // -------------------------
  // FETCH CUSTOMERS
  // -------------------------
  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/sales/customer");
      const json: CustomerAPI[] | { data: CustomerAPI[] } = await res.json();

      const data: CustomerAPI[] = Array.isArray(json) ? json : json.data || [];
      setCustomerCount(data.length);
    } catch (err) {
      console.error(err);
      setCustomerCount(0);
    }
  };

  // -------------------------
  // POLLING EVERY 10 SEC
  // -------------------------
  useEffect(() => {
  const fetchAll = () => {
    fetchRequests();
    fetchCustomers();
    fetchCompanyRequests();
  };

  fetchAll(); // initial fetch

  const interval = setInterval(() => {
    fetchAll(); // repeat every 10 seconds
  }, 10000);

  return () => clearInterval(interval); // cleanup
}, []);

const fetchCompanyRequests = async () => {
  try {
    const res = await fetch("/api/sales/customer_request"); // fetch all requests
    const json: QuotationRequestAPI[] | { data: QuotationRequestAPI[] } = await res.json();
    const requests: QuotationRequestAPI[] = Array.isArray(json) ? json : json.data || [];

    // Count requests per company
    const companyMap: Record<string, number> = {};
    requests.forEach((req) => {
      const company = req.customer_name || req.customer?.companyName || "N/A";
      companyMap[company] = (companyMap[company] || 0) + 1;
    });

    // Convert to array and get top 5 companies
    const topCompanies = Object.entries(companyMap)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setCompanyRequests(topCompanies);
  } catch (err) {
    console.error(err);
    setCompanyRequests([]);
  }
};

  const totalRequests =
    counts.pending + counts.accepted + counts.rejected + counts.inProgress + counts.completed;

  const renderCard = (
    title: string,
    count: number,
    color: string,
    iconSrc: string,
    link: string
  ) => (
    <div
      className="flex-1 min-w-[180px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-5 relative overflow-hidden"
      onClick={() => router.push(link)}
    >
      <div className="flex flex-col relative z-10">
        <div className="flex items-center gap-3">
          <Image src={iconSrc} alt="Icon" width={40} height={40} />
          <div className={`font-bold text-3xl md:text-4xl ${color}`}>{count}</div>
        </div>
        <div className="text-black text-sm uppercase font-semibold mt-2">{title}</div>
      </div>
    </div>
  );

  const chartData = [
    { month: "Jan", desktop: counts.completed, mobile: counts.pending },
    { month: "Feb", desktop: counts.accepted, mobile: counts.rejected },
    { month: "Mar", desktop: counts.inProgress, mobile: counts.pending },
    { month: "Apr", desktop: counts.completed, mobile: counts.rejected },
    { month: "May", desktop: counts.accepted, mobile: counts.pending },
    { month: "Jun", desktop: counts.completed, mobile: counts.inProgress },
  ];

  return (
    <main className="bg-[#ffedce] min-h-screen w-full pb-10">
      <Header />

      {/* -------------------------
          TOP SUMMARY CARDS
      --------------------------- */}
      <div className="mt-6 px-6 flex flex-wrap gap-6">
        {renderCard("Pending", counts.pending, "text-red-600", "/square-list-svgrepo-com.svg", "/sales/s_pending_customer_request")}
        {renderCard("Accepted", counts.accepted, "text-teal-600", "/square-list-svgrepo-com.svg", "/sales/s_accepted_customer_request")}
        {renderCard("Rejected", counts.rejected, "text-gray-600", "/square-list-svgrepo-com.svg", "/sales/s_rejected_customer_request")}
        {renderCard("In Progress", counts.inProgress, "text-yellow-600", "/square-list-svgrepo-com.svg", "/sales/s_inprogress_customer_request")}
        {renderCard("Completed", counts.completed, "text-green-600", "/square-list-svgrepo-com.svg", "/sales/s_completed_customer_request")}

        {/* Total Requests Card */}
        <div className="flex-1 min-w-[180px] bg-yellow-400 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-5 flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black">{totalRequests}</h2>
          <p className="text-sm text-black mt-1 uppercase tracking-wide font-semibold">Total Requests</p>
        </div>
      </div>

      {/* -------------------------
          MIDDLE ROW: CHART + TOTAL CUSTOMERS
      --------------------------- */}
      <div className="mt-8 px-6 flex flex-col md:flex-row gap-6">
        
        {/* Requests Trend Chart */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-xl shadow-2xl p-6 h-[500px] flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Requests Trend</h3>
            <p className="text-sm text-gray-500 mb-4">
              Overview of requests by status in the last 6 months
            </p>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <Tooltip />

                <defs>
                  <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <Area dataKey="mobile" type="natural" fill="url(#fillMobile)" stroke="#facc15" />
                <Area dataKey="desktop" type="natural" fill="url(#fillDesktop)" stroke="#14b8a6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOTAL CUSTOMERS CARD */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-2xl shadow-xl p-6 h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 to-yellow-500/40 blur-3xl opacity-30 rounded-2xl"></div>

            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg mb-6">
                <Image src="/square-list-svgrepo-com.svg" width={45} height={45} alt="Icon" />
              </div>

              <h3 className="text-2xl font-semibold text-gray-800 mb-2 tracking-wide">
                Total Customers
              </h3>

              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md rounded-xl px-10 py-6 flex flex-col items-center justify-center">
                <span className="text-6xl font-extrabold text-white drop-shadow-lg">
                  {customerCount}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-4 tracking-wide">
                Overall customer count
              </p>
            </div>
          </div>
        </div>
      </div>

{/* Most Requested Companies */}
<div className="mt-8 px-6">
  <div className="bg-white rounded-2xl shadow-xl p-6 h-[400px] relative overflow-hidden">
    {/* Decorative background blur */}
    <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-300 opacity-20 blur-3xl rounded-2xl"></div>

    <div className="relative z-10 h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Most Requested Companies
      </h3>

      {companyRequests.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={companyRequests}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="company" width={150} tick={{ fontSize: 14, fill: "#4b5563" }} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            />
            <Bar 
              dataKey="count" 
              fill="#14b8a6" 
              radius={[8, 8, 8, 8]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 italic">
          Loading chart...
        </div>
      )}
    </div>
  </div>
</div>


      {/* -------------------------
          BOTTOM: LATEST REQUESTS
      --------------------------- */}
      <div className="mt-8 px-6">
        <div className="bg-white rounded-md shadow-lg overflow-x-auto">
          <div className="bg-white rounded shadow-md mb-2">
            <div className="bg-white grid grid-cols-[1fr_2fr_2fr_1fr_1fr_2fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-gray-300 text-center">
              <span>REQUEST #</span>
              <span>PROJECT NAME</span>
              <span>CUSTOMER</span>
              <span>MODE</span>
              <span>STATUS</span>
              <span>DATE & TIME REQUESTED</span>
            </div>

            {latestRequests.length > 0 ? (
              latestRequests.map((req) => (
                <div
                  key={req.id}
                  className="grid grid-cols-[1fr_2fr_2fr_1fr_1fr_2fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
                >
                  <span>{req.id}</span>
                  <span className="uppercase text-sm">{req.project_name || "N/A"}</span>
                  <span className="text-sm">{req.customerName || "N/A"}</span>
                  <span>{req.mode || "N/A"}</span>

                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${
                      statusColors[req.status] ?? "text-gray-600 bg-gray-100"
                    }`}
                  >
                    {req.status}
                  </span>

                  <span>{req.createdAt ? new Date(req.createdAt).toLocaleString() : "N/A"}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-5 italic">No requests found.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SalesPage;
