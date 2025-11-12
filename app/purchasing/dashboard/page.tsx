// app/customer/dashboard.tsx

"use client";

import { Header } from "@/components/header";
import { useEffect, useState, useRef } from "react";
import { InventoryCategory, InventoryItemsReport, ChartData } from "@/app/warehouse/w_inventory/w_inventory_list/types/inventory";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid} from 'recharts';
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { TooltipProps } from "recharts";

type CustomTooltipData = {
  name: string;
  value: number;
  items: string[];
};

const PurchasingPage = () => {
const [items, setItems] = useState<InventoryItemsReport[]>([]);
const [loading, setLoading] = useState(false);
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedStatus, setSelectedStatus] = useState("");
const [categories, setCategories] = useState<InventoryCategory[]>([]);
const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
const [suppliers, setSuppliers] = useState([]);

const status = ["In Stock", "No Stock", "Critical Level", "Reorder Level", "Overstock"];

const fetchSuppliers = async () => {
  try {
    const res = await fetch("/api/purchasing/suppliers");
    if (!res.ok) throw new Error("Failed to fetch suppliers");
    const data = await res.json();
    setSuppliers(data || []);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    setSuppliers([]);
  }
};
    
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
    fetchSuppliers();
}, []);

    
const filteredItems = items.filter((item) => {
    const matchCategory = !selectedCategory || item.category?.name === selectedCategory;
    const matchStatus = !selectedStatus || item.status === selectedStatus;
    return matchCategory && matchStatus;
});
    
// Compute Summary Stats
const totalItems = filteredItems.length;
const totalStock = filteredItems.reduce((acc, item) => acc + (item.stock ?? 0), 0);
    
const chartData: ChartData[] = selectedCategory
    ? items
    .filter((item) => !selectedCategory || item.category?.name === selectedCategory)
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

// ✅ Compute Pie Chart Data Dynamically Based on Current Filters
const pieChartData = Object.values(
filteredItems.reduce<Record<string, { name: string; value: number; items: string[] }>>(
    (acc, item) => {
    const status = item.status || "Unknown";
    if (!acc[status]) acc[status] = { name: status, value: 0, items: [] };
    acc[status].value += 1;
    acc[status].items.push(item.name);
    return acc;
    },
    {}
)
);

const totalStatusCount = pieChartData.reduce((sum, entry) => sum + entry.value, 0);

const STATUS_COLORS: Record<string, string> = {
"In Stock": "#16A34A",
"Reorder Level": "#FFBB28",
"Critical Level": "#d12f2f",
"No Stock": "#62748e",
"Overstock": "#0088FE",
Unknown: "#9ca3af",
};

// ✅ Custom Tooltip Component
const CustomTooltip = (
  props: TooltipProps<number, string> & {
    payload?: { payload: CustomTooltipData }[];
  }
) => {
  const { active, payload } = props;

  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;

    return (
      <div className="bg-white p-2 shadow-md border rounded text-sm">
        <p className="font-semibold text-[#173f63]">{data.name}</p>
        <p className="text-gray-700 mb-1">
          {data.value} item{data.value > 1 ? "s" : ""}
        </p>
        <ul className="list-disc list-inside text-xs text-gray-600 max-h-32 overflow-y-auto">
          {data.items.map((itemName, idx) => (
            <li key={idx}>{itemName}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

const categoryRef = useRef<HTMLDivElement | null>(null);
const statusRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Node;

          if (
            categoryRef.current &&
            !categoryRef.current.contains(target)
          ) { 
            setCategoryDropdownOpen(false);
          }

          if (
            statusRef.current &&
            !statusRef.current.contains(target)
          ) {
            setStatusDropdownOpen(false);
          }
        }

        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
      }, []);

return (
    <main className="bg-[#ffedce] h-full w-full">
    <Header />
<div className="p-6">
    {/* <h1 className="text-3xl font-bold text-[#173f63] mb-4">DASHBOARD</h1> */}
    
<div className="flex justify-between mb-5">
    <div className="flex flex-row h-auto border-slate-200 px-4 bg-[#f59f0b1b] rounded">
          <div className="mx-4 mt-2 mb-2 flex flex-row gap-4">

          {/* Sent PO */}
          <div
            className="w-[230px] h-[80px] bg-white border border-[#ffb7b7] rounded-lg p-4 cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
          >
            <div>
              <div className="text-[#cf3a3a] text-sm uppercase font-bold">
                SENT PURCHASE ORDERS
              </div>
              <div
                className="font-bold text-[#cf3a3a] text-3xl mt-1"
              >
                
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

          {/* Supplier */}
          <div
            className="w-[230px] h-[80px] bg-white border border-[#ffb7b7] rounded-lg p-4 cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
          >
            <div>
              <div className="text-[#cf3a3a] text-sm uppercase font-bold">
                SUPPLIERS
              </div>
              <div
                className="font-bold text-[#cf3a3a] text-3xl mt-1"
              >
                {suppliers.length}
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
    
    <div className="relative">
        {loading ? (
            <p>Loading...</p>
                ) : (
                <div className="bg-white shadow rounded p-2 h-20 space-y-2">
                    <p className="text-lg font-sans">Total Items: <strong>{totalItems}</strong></p>
                    <p className="text-lg font-sans">Total Stocks: <strong>{totalStock}</strong></p>
                </div>
        )}
</div>
</div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                    {/* Category Filter */}
                    <div className="relative" ref={categoryRef}>
                    <div
                    className="h-10 w-35 bg-white border-b-2 border-[#d2bda7] rounded flex items-center justify-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    >
                    <span className="text-sm text-[#482b0e]">{selectedCategory || "All Categories"}</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                    </div>
                    {categoryDropdownOpen && (
                <div className="absolute z-20 bg-white border-gray-200 mt-1 w-35 rounded shadow">
                  <div
                  className=" py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
                  onClick={() => {
                    setSelectedCategory(""); // Clear filter
                    setCategoryDropdownOpen(false);
                  }}
                  >
                    All Categories
                    </div>
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="py-1 hover:bg-gray-100 cursor-pointer text-sm text-center"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
                    </div>

                    {/* Status Filter */}
                    <div className="relative" ref={statusRef}>
                    <div
                    className="h-10 w-35 bg-white border-b-2 border-[#d2bda7] rounded flex items-center justify-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    >
                    <span className="text-sm text-[#482b0e]">{selectedStatus || "All Statuses"}</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                    </div>
                    {statusDropdownOpen && (
                <div className="absolute z-20 bg-white border-gray-200 mt-1 w-35 rounded shadow">
                  <div
                  className=" py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
                  onClick={() => {
                    setSelectedStatus(""); // Clear filter
                    setStatusDropdownOpen(false);
                  }}
                  >
                    All Statuses
                    </div>
                  {status.map((status) => (
                    <div
                      key={status}
                      className="py-1 hover:bg-gray-100 cursor-pointer text-sm text-center"
                      onClick={() => {
                        setSelectedStatus(status);
                        setStatusDropdownOpen(false);
                      }}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              )}
                    </div>
                </div>
                </div>

                <div className="flex flex-row bg-[#f59f0b1b] p-4 justify-center gap-5 shadow-xl">
                <div className="bg-white p-2 rounded shadow-md w-140 ml-2">
                    <h3 className=" font-semibold mb-2">Stock by Category {selectedCategory && `– ${selectedCategory}`}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                            dataKey="name"
                            //label={{ value: "Category", position: "insideBottom", offset: -1 }} 
                            style={{ fontSize: '10px' }}/>
                            <YAxis 
                            //label={{ value: "Stock", angle: -90, position: "insideLeft", textanchor: "center", dy:35, dx:10}} 
                            style={{ fontSize: '10px' }} 
                            //ticks={[0,25,50,75,100,125,150,175,200,225,250,275,300,325,350,375,400,425,450,475,500,525,550,575,600]}
                            />
                            <Tooltip />
                            <Bar dataKey="stock" fill="#ee6b6e"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-2 rounded shadow w-140">
                <h3 className="font-semibold mb-2">
                    Item Status Distribution
                    {selectedCategory && ` – ${selectedCategory}`}
                </h3>

                {pieChartData.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center mt-10">No data available</p>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) =>
                            `${name}: ${(((value ?? 0) / totalStatusCount) * 100).toFixed(1)}%`
                        }
                        >
                        {pieChartData.map((entry, index) => (
                            <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.name] || "#ccc"}
                            />
                        ))}
                        </Pie>
                        {/* ✅ Use the Custom Tooltip */}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                )}
                </div>

                </div>
            </div>
        </main>
    )
}
export default PurchasingPage;
