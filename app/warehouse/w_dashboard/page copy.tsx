//warehouse/w_dashboard/page.tsx
"use client";

import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid} from 'recharts';

const WarehouseInventoryReportsPage = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [categories, setCategories] = useState<any[]>([]);

    const fetchItems = async () => {
        setLoading(true);
        const res = await fetch("/api/items");
        const data = await res.json();
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

    // const statusCounts = filteredItems.reduce(
    //     (acc: Record<string, number>, item) => {
    //         const status = item.status ?? "Unknown";
    //         acc[status] = (acc[status] || 0) + 1;
    //         return acc;
    //     },
    //     {}
    // );

    const categoryStockData = Object.values(
        filteredItems.reduce((acc: any, item) => {
            const catName = item.category?.name || "Uncategorized";
            acc[catName] = acc[catName] || { name: catName, stock: 0 };
            acc[catName].stock += item.stock ?? 0;
            return acc;
        }, {})
    );

    const statusCountData = Object.values(
        filteredItems.reduce((acc: any, item) => {
            const status = item.status || "Unknown";
            acc[status] = acc[status] || { name: status, value: 0 };
            acc[status].value += 1;
            return acc;
        }, {})
    );
    
    const COLORS = ["#16A34A", "#62748e", "#0088FE", "#FFBB28", "#d12f2f"]

    {/*
        const exportToCSV = () => {
        const headers = ["Item Name", "Category", "Unit", "Variant", "Size", "Stock", "Status"];
        const rows = filteredItems.map((item) => [
            item.name,
            item.category?.name || "-",
            item.unit?.name || "-",
            item.variant?.name || "-",
            item.size?.name || "-",
            item.stock ?? 0,
            item.status,
        ]); 
        

        {/*const BOM = "\uFEFF";
        const csvContent =
        BOM +
        [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
    };
    */}

    return (
        <WarehousemanClientComponent>
        <div className="h-screen w-full bg-[#ffedce] flex flex-col">
            <Header />
            <div className="p-6">
                <h1 className="text-3xl font-bold text-[#173f63] mb-4">DASHBOARD</h1>

                <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                    {/* Category Filter */}
                    <select
                    className="px-4 py-2 border rounded bg-white cursor-pointer hover:bg-slate-100"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                    <option value="">All Categories</option>
                    {categories.map((cat: any) => (
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

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="bg-white shadow rounded text-center p-2 w-50">
                        <p className="text-lg font-sans">Total Items: <strong>{totalItems}</strong></p>
                        <p className="text-lg font-sans">Total Stocks: <strong>{totalStock}</strong></p>

                        {/*<div className="mt-4">
                            <h2 className="text-md font-semibold mb-1">Status Breakdown:</h2>
                            <ul className="list-disc list-inside">
                                {Object.entries(statusCounts).map(([status, count]) => (
                                    <li key={status} className="text-sm">
                                        {status}: <strong>{count}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>*/}
                    </div>
                )}
                </div>
                
                <div className="flex flex-row bg-[#598297] p-4 justify-center gap-5">
                <div className="bg-white p-2 rounded shadow w-140 ml-2">
                    <h3 className=" font-semibold mb-2">Stock by Category</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={categoryStockData} >
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
                    <h3 className="font-semibold mb-2">Item Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                            data={statusCountData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={50}
                            label
                            //style={{ fontSize: '10px' }}
                            >
                                {statusCountData.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} style={{ fontSize: '15px'}} />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>
        </div>
        </WarehousemanClientComponent>
    );
};

export default WarehouseInventoryReportsPage;