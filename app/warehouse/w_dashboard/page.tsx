//warehouse/w_dashboard/page.tsx
"use client";

import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import {
  InventoryCategory,
  InventoryItemsReport,
  ChartData,
} from "@/app/warehouse/w_inventory/w_inventory_list/types/inventory";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { TooltipProps } from "recharts";

type CustomTooltipData = {
  name: string;
  value: number;
  items: string[];
};

const WarehouseInventoryReportsPage = () => {
  const [items, setItems] = useState<InventoryItemsReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [categories, setCategories] = useState<InventoryCategory[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch("/api/items");
    const data: { data: InventoryItemsReport[] } = await res.json();
    setItems(data.data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const json = await res.json();
    setCategories(json.data || []);
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchCategory =
      !selectedCategory || item.category?.name === selectedCategory;
    const matchStatus = !selectedStatus || item.status === selectedStatus;
    return matchCategory && matchStatus;
  });

  const totalItems = filteredItems.length;
  const totalStock = filteredItems.reduce(
    (acc, item) => acc + (item.stock ?? 0),
    0
  );

  const chartData: ChartData[] = selectedCategory
    ? items
        .filter(
          (item) =>
            !selectedCategory || item.category?.name === selectedCategory
        )
        .map((item) => ({
          name: item.name,
          stock: item.stock ?? 0,
        }))
    : Object.values(
        items.reduce<Record<string, { name: string; stock: number }>>(
          (acc, item) => {
            const cat = item.category?.name || "Uncategorized";
            if (!acc[cat]) acc[cat] = { name: cat, stock: 0 };
            acc[cat].stock += item.stock ?? 0;
            return acc;
          },
          {}
        )
      );

  const pieChartData = Object.values(
    filteredItems.reduce<
      Record<string, { name: string; value: number; items: string[] }>
    >((acc, item) => {
      const status = item.status || "Unknown";
      if (!acc[status]) acc[status] = { name: status, value: 0, items: [] };
      acc[status].value += 1;
      acc[status].items.push(item.name);
      return acc;
    }, {})
  );

  const totalStatusCount = pieChartData.reduce(
    (sum, entry) => sum + entry.value,
    0
  );

  const STATUS_COLORS: Record<string, string> = {
    "In Stock": "#16A34A",
    "Reorder Level": "#FFBB28",
    "Critical Level": "#d12f2f",
    "No Stock": "#62748e",
    Overstock: "#0088FE",
    Unknown: "#9ca3af",
  };

  const CustomTooltip = (
    props: TooltipProps<number, string> & {
      payload?: { payload: CustomTooltipData }[];
    }
  ) => {
    const { active, payload } = props;

    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-2 shadow-md border rounded text-sm max-w-[200px]">
          <p className="font-semibold text-[#173f63] truncate">{data.name}</p>
          <p className="text-gray-700 mb-1">
            {data.value} item{data.value > 1 ? "s" : ""}
          </p>
          <ul className="list-disc list-inside text-xs text-gray-600 max-h-32 overflow-y-auto">
            {data.items.map((itemName, idx) => (
              <li key={idx} className="truncate">
                {itemName}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen w-full bg-[#ffedce] flex flex-col">
      <Header />

      {/* ✅ FIXED: Added proper padding for mobile */}
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 w-full">
        {/* Stats Cards */}
        <div className="flex justify-end w-full">
          {loading ? (
            <p className="text-sm">Loading...</p>
          ) : (
            <div className="bg-white shadow mt-12 lg:mt-0 rounded p-3 sm:p-4 w-full sm:w-80 space-y-2">
              <p className="text-md lg:text-xl font-sans">
                Total Items: <strong>{totalItems}</strong>
              </p>
              <p className="text-md lg:text-xl font-sans">
                Total Stocks: <strong>{totalStock}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
          <select
            className="px-3 sm:px-4 py-2 border rounded bg-white cursor-pointer hover:bg-slate-100 text-sm w-full sm:w-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="px-3 sm:px-4 py-2 border rounded bg-white cursor-pointer hover:bg-slate-100 text-sm w-full sm:w-auto"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {[
              "In Stock",
              "No Stock",
              "Critical Level",
              "Reorder Level",
              "Overstock",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 bg-[#f59f0b1b] p-3 sm:p-4 shadow-xl rounded w-full">
          {/* Bar Chart */}
          <div className="bg-white p-3 sm:p-4 rounded shadow-md w-full">
            <h3 className="font-semibold mb-2 text-sm sm:text-base truncate">
              Stock by Category {selectedCategory && `– ${selectedCategory}`}
            </h3>
            <ResponsiveContainer width="100%" height={250} minWidth={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  style={{ fontSize: "10px" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis style={{ fontSize: "10px" }} />
                <Tooltip />
                <Bar dataKey="stock" fill="#ee6b6e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-3 sm:p-4 rounded shadow-md w-full">
            <h3 className="font-semibold mb-2 text-sm sm:text-base truncate">
              Item Status Distribution
              {selectedCategory && ` – ${selectedCategory}`}
            </h3>

            {pieChartData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-10">
                No data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250} minWidth={200}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({
                      name,
                      value,
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                    }) => {
                      const isMobile =
                        typeof window !== "undefined" &&
                        window.innerWidth < 480;

                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 1.2;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#333"
                          fontSize={isMobile ? "8px" : "12px"} // 👈 Mobile = smaller
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                        >
                          {`${name}: ${(
                            (value / totalStatusCount) *
                            100
                          ).toFixed(1)}%`}
                        </text>
                      );
                    }}
                    labelLine={{ stroke: "#666", strokeWidth: 1 }}
                  >
                    {pieChartData.map((entry, idx) => (
                      <Cell key={idx} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>

                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseInventoryReportsPage;
