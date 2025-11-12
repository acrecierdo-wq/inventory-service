//warehouse/w_dashboard/page.tsx
"use client";

import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import { InventoryCategory, InventoryItemsReport, ChartData } from "@/app/warehouse/w_inventory/w_inventory_list/types/inventory";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid} from 'recharts';
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

    // const pieChartData: PieChartData[] = Object.values(
    //     items.reduce<Record<string, { name: string; value: number }>>(
    //         (acc, item) => {
    //             const status = item.status || "Unknown";
    //             if (!acc[status]) acc[status] = { name: status, value: 0 };
    //             acc[status].value += 1;
    //             return acc; 
    //         },
    //         {}
    //     )
    // );
    
    // const COLORS = ["#16A34A", "#62748e", "#0088FE", "#FFBB28", "#d12f2f"]

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

    return (
        <div className="h-screen w-full bg-[#ffedce] flex flex-col">
            <Header />
            <div className="p-6">
                {/* <h1 className="text-3xl font-bold text-[#173f63] mb-4">DASHBOARD</h1> */}
                <div className="flex justify-end">
                    {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="bg-white shadow rounded p-4 w-80 h-25 space-y-2">
                        <p className="text-2xl font-sans">Total Items: <strong>{totalItems}</strong></p>
                        <p className="text-2xl font-sans">Total Stocks: <strong>{totalStock}</strong></p>
                    </div>
                )}
</div>

                <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                    {/* Category Filter */}
                    <select
                    className="px-4 py-2 border rounded bg-white cursor-pointer hover:bg-slate-100"
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

                    {/* Status Filter */}
                    <select
                    className="px-4 py-2 border rounded bg-white cursor-pointer hover:bg-slate-100"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                    <option value="">All Statuses</option>
                    {["In Stock", "No Stock", "Critical Level", "Reorder Level", "Overstock"].map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                    </select>
                </div>
                
                {/*<button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Export to CSV
                </button>*/}
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
        </div>
    );
};

export default WarehouseInventoryReportsPage;