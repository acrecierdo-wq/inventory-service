// app/warehouse/w_inventory/w_inventory_list/page.tsx
"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";
import AddItemModal from "@/components/add/AddItemModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import InventoryActions from "./inventory_action";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const WarehouseInventoryListPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [variants, setVariants] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "stocks" | "reverseName" | "reverseStocks" | "" >("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const fetchDropdownData = async () => {
    const [cats, uns, vars, sizs] = await Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/units").then((res) => res.json()),
      fetch("/api/variants").then((res) => res.json()),
      fetch("/api/sizes").then((res) => res.json()),
    ]);

    setCategories(cats.data);
    setUnits(uns.data);
    setVariants(vars.data);
    setSizes(sizs.data);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/items");
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      } else {
        setError("Failed to fetch items");
      }
    }
    catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
useEffect(() => {
  fetchDropdownData();
  fetchItems();
}, []);

    const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())  &&
      (!selectedCategory || item.category?.name === selectedCategory) &&
      (!selectedStatus || item.status === selectedStatus)
    )
    .sort((a, b) => {
     // if (sortBy === "name") {
     //   return a.name.localeCompare(b.name);
     // }
     // else if (sortBy === "stocks") {
     //   return (b.stock ?? 0) - (a.stock ?? 0);
     // }
     // return 0;
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "reverseName":
          return b.name.localeCompare(a.name);
        case "stocks":
          return (b.stock ?? 0) - (a.stock ?? 0);
        case "reverseStocks":
          return (a.stock ?? 0) - (b.stock ?? 0);
        default:
          return 0;
      }
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <WarehousemanClientComponent>
      <div className="h-screen w-full bg-[#ffedce] flex flex-col">
        <Header />
        <div className="mx-auto mt-2 max-w [90px]">
            <AddItemModal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                categories={categories}
                units={units}
                variants={variants}
                sizes={sizes}
                onItemAdded={fetchItems}
      />
      
        <div className="relative">
          <div className="flex justify-end mr-10">
              <Link href="/warehouse/w_inventory/w_inventory_list/w_inventory_reports">
              <div 
              className="h-8 w-25 bg-white border-b-2 border-[#173f63] rounded flex items-center px-2 cursor-pointer hover:bg-[#598297] hover:text-white active:border-b-4">
                <Image src="/report-svgrepo-com.svg" width={15} height={15} alt="Report" />
                <span className="text-sm font-sans ml-2">Reports</span>
            </div>
            </Link>
            </div>
            
            </div>

        <div className="flex flex-row items-center gap-4 mt-4 px-10">
            <span className="text-3xl text-[#173f63] font-bold pl-10">INVENTORY LIST</span>

            {/* Search, Category, Filter, Sort*/}
            
            <div className="h-8 w-70 mt-2 ml-40 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
              <Image src="/search-alt-2-svgrepo-com.svg" width={15} height={15} alt="Search" className="ml-5" />
              <input
              className="ml-2 outline-none"
              type = "text"
              placeholder = "Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              />
            </div>

            {/*<div className="h-10 w-30 ml-4 rounded-md border-[#d2bda7] border-b-2 bg-white flex flex-row">
              <Image src="/select-category-svgrepo-com.svg" width={20} height={20} alt="Category" className="ml-2" />
              <select
              className="text-sm text-[#482b0e] "
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              >
              {/*<span className=" mt-2 text-sm text-[#482b0e] ">Categories</span>
                <option value=""> All Category</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div> */}
            <div className="relative">
  <div
    className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
  >
    <Image src="/select-category-svgrepo-com.svg" width={20} height={20} alt="Category" />
    <span className=" text-sm text-[#482b0e]">{selectedCategory || "Categories"}</span>
  </div>

  {categoryDropdownOpen && (
    <div className="absolute z-10 bg-white border border-gray-200 mt-1 w-full rounded shadow">
      <div
      className="py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
      onClick={() => {
        setSelectedCategory(""); // Clear filter
        setCategoryDropdownOpen(false);
      }}
      >
        All Categories
        </div>
      {categories.map((cat: any) => (
        <div
          key={cat.id}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-center"
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

            <div className="relative">
            <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  >
              <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" className="" />
              <span className="text-sm text-[#482b0e] ml-2">{selectedStatus || "Filter"}</span>
            </div>

            {statusDropdownOpen && (
              <div className="absolute z-10 bg-white border border-gray-200 mt-1 w-full rounded shadow">
      <div
      className="py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
      onClick={() => {
        setSelectedStatus(""); // Clear filter
        setStatusDropdownOpen(false);
      }}
      >
        All Status
        </div>
                {["Overstock", "In Stock", "Critical Level", "Reorder Level", "No Stock"].map((status) => (
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

            {/*<div className="h-10 w-25 ml-4 rounded-md border-[#d2bda7] border-b-2 bg-white flex flex-row">
              <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" className="ml-5" />
              <select
              className="text-sm text-[#482b0e]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "stocks" | "")}
              >
                <option value = "">Sort By</option>
                <option value ="name">Name</option>
                <option value ="stocks">Stocks</option>
              </select>
            </div> */}

            <div className="relative">
              <div 
              className="h-10 w-25 rounded-md border-[#d2bda7] border-b-2 bg-white flex items-center px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" className="" />
              <span className="ml-2 text-sm text-[#482b0e]">
                {sortBy === "name" ? "Name: A - Z" : sortBy === "reverseName" ? "Name: Z - A" : sortBy === "stocks" ? "Stocks: H - L" : sortBy === "reverseStocks" ? "Stocks: L - H" : "Sort"}
              </span>
              </div>

              {sortDropdownOpen && (
                <div className="absolute z-20 bg-white border-gray-200 mt-1 w-full rounded shadow">   
                  <div
                  className="text-center py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                  onClick={() => {
                    setSortBy("");
                    setSortDropdownOpen(false);
                  }}
                  > No Sort
                  </div>
                  <div 
                  className="text-center py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSortBy("name");
                    setSortDropdownOpen(false);
                  }}
                  >
                    Name (A-Z)
                  </div>
                  <div 
                  className="text-center py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSortBy("reverseName");
                    setSortDropdownOpen(false);
                  }}
                  >
                    Name (Z-A)
                  </div>
                  <div 
                  className="text-center py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSortBy("stocks");
                    setSortDropdownOpen(false);
                  }}
                  >
                  Stocks (High - Low)
                    </div>
                  <div 
                  className="text-center py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSortBy("reverseStocks");
                    setSortDropdownOpen(false);
                  }}
                  >
                  Stocks (Low - High)
                    </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div 
              className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setIsAddItemModalOpen(true)}>
            {/*<Button onClick={() => setIsAddItemModalOpen(true)} className="ml-4 h-10 w-25 bg-[#ffffff] border-0 border-[#d2bda7] rounded-md border-b-[2px] active:border-b-4 hover:bg-[#f0d2ad] text-[#482b0e] font-normal"> */}
                <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
                <span className="ml-1 text-sm text-[#482b0e]">Add New</span>
            {/*</Button> */}
            </div>
            </div>
            </div>

        </div>

        <div className="flex-1 overflow-y-auto px-10 mt-5">
        <div className="h-auto// w-full// bg-[#fffcf6] mt-5// rounded shadow-md">
          {loading && <div className="text-center mt-5">Loading...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          {/*<div className="mt-0 pl-5">*/}

          {!loading && !error && (
            <>
            <div className="grid grid-cols-8 gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7]">
              <span>ITEM NAME</span>
              <span>CATEGORY</span>
              <span>UNIT</span>
              <span>VARIANT</span>
              <span>SIZE</span>
              <span>STOCKS</span>
              <span>STATUS</span>
              <span>ACTION</span>
            </div>

            {paginatedItems.map((item) => (
              <div key={item.id} className="grid grid-cols-8 gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c]">
                  <span>{item.name}</span>
                  <span>{item.category?.name}</span>
                  <span>{item.unit?.name}</span>
                  <span>{item.variant?.name || "-"}</span>
                  <span>{item.size?.name || "-"}</span>
                  <span>{item.stock ?? 0}</span>
                  {/*<span className="text-[#1e1d1c] ml-25 mr-2 mt-3">{item.stocks < 10 ? "Critical Level" : "In Stock"}</span>*/}
                  <span className="mt-">
                    <span className={`text-white px-3 text-sm py-1 rounded-3xl ${
                      item.status === "No Stock" ? "bg-slate-500" : 
                      item.status === "Critical Level" ? "bg-[#a72227]" : 
                      item.status === "Reorder Level" ? "bg-yellow-500" :
                      item.status === "Overstock" ? "bg-blue-600" :
                      "bg-green-600"
                      }`}>
                  {item.status}
                  </span>
                  </span>
                  <span>
                  <InventoryActions item={item} onDelete={async (id:string) => {
                    await fetch(`/api/items/${id}`, { method: "DELETE" })
                    fetchItems() // re-fetch items

                    try {
                      const res = await fetch(`/api/items/${id}`, { method: "DELETE" })
                      if (!res.ok) throw new Error()
                        fetchItems()
                      toast( "Item deleted successfully" )
                    } catch {
                      toast("Failed to delete item" )
                    }
                  }} />
                </span>
              </div>
            ))}
          </>
        )}
          </div>
          </div>

          {/* Pagination */}
          <div className="fixed bottom-0 left-[285px] w-[calc(100%-285px)] bg-[#ffedce] py-2 flex justify-center //shadow-inner z-10">
              <Pagination>
      <PaginationContent>
        <PaginationPrevious 
        href="#" 
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        />
        {Array.from({ length: totalPages }, (_, index) => (
          <PaginationItem key={index}>
            <PaginationLink 
            href="#"
            isActive={currentPage ==index + 1}
            onClick={() => setCurrentPage(index + 1)}
            >
               {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationNext 
        href="#" 
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        />
      </PaginationContent>
    </Pagination>
          </div>
          </div>
      {/*</div>*/}
    </WarehousemanClientComponent>
  );
};

export default WarehouseInventoryListPage;
