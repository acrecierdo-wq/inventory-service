// app/warehouse/w_inventory/w_inventory_list/page.tsx
"use client"
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
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

    const exportToCSV = () => {
        const headers = ["Item Name", "Category", "Unit", "Variant", "Size", "Stock", "Status"];
        const rows = filteredItems.map((item) => [
            item.name,
            item.category?.name || "(None)",
            item.unit?.name || "(None)",
            item.variant?.name || "(None)",
            item.size?.name || "(None)",
            item.stock ?? 0,
            item.status,
        ]);

        const BOM = "\uFEFF";
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

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const categoryRef = useRef<HTMLDivElement | null>(null);
    const statusRef = useRef<HTMLDivElement | null>(null);
    const sortRef = useRef<HTMLDivElement | null>(null);

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

          if (
            sortRef.current &&
            !sortRef.current.contains(target)
          ) {
            setSortDropdownOpen(false);
          }
        }

        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
      }, []);

  return (
    <WarehousemanClientComponent>
      <main className="h-screen w-full bg-[#ffedce] flex flex-col">
        <Header />
        <div className="mx-auto mt-2">
            <AddItemModal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                categories={categories}
                units={units}
                variants={variants}
                sizes={sizes}
                existingItems={items}
                onItemAdded={fetchItems}
      />
      
      <section className="flex flex-row justify-end mr-10">

            <div className="relative">
            <button
                onClick={exportToCSV}
                className="bg-green-600 h-8 text-white px-2 rounded hover:bg-green-700 cursor-pointer"
                >
                    Export to CSV
                </button>
                </div>
                </section>

        <section className="flex flex-row items-center gap-4 mt-2 px-10">
            <span className="text-3xl text-[#173f63] font-bold pl-10">INVENTORY LIST</span>

            {/* Search, Category, Filter, Sort*/}
            
            <div className="h-8 w-70 mt-2 ml-40 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
              <Image src="/search-alt-2-svgrepo-com.svg" width={15} height={15} alt="Search" className="ml-5" />
              <input
              className="ml-2 bg-transparent focus:outline-none"
              type = "text"
              placeholder = "Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              />
            </div>

            <div className="relative" ref={categoryRef}>
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

            <div className="relative" ref={statusRef}>
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

            <div className="relative" ref={sortRef}>
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
            </section>

        </div>

        <section className="flex-1 overflow-y-auto px-10 mt-2">
        <div className="bg-[#fffcf6] rounded shadow-md">
          {loading && <div className="text-center mt-5">Loading...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          {/*<div className="mt-0 pl-5">*/}

          {!loading && !error && (
            <>
            <div className="grid grid-cols-8 gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
              <span>ITEM NAME</span>
              <span>CATEGORY</span>
              <span>UNIT</span>
              <span>VARIANT</span>
              <span>SIZE</span>
              <span>STOCKS</span>
              <span>STATUS</span>
              <span>ACTION</span>
            </div>

            {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => (
              <div key={item.id} className="grid grid-cols-8 gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c]">
                  <span>{item.name}</span>
                  <span>{item.category?.name}</span>
                  <span>{item.unit?.name}</span>
                  <span>{item.variant?.name || "(None)"}</span>
                  <span>{item.size?.name || "(None)"}</span>
                  <span className="text-center">{item.stock ?? 0}</span>
                    <span className={`text-white text-center px-5 text-sm py-1 rounded-4xl ${
                      item.status === "No Stock" ? "bg-slate-500" : 
                      item.status === "Critical Level" ? "bg-[#d12f2f]" : 
                      item.status === "Reorder Level" ? "bg-yellow-500" :
                      item.status === "Overstock" ? "bg-[#0088FE]" :
                      "bg-green-600"
                      }`}>
                  {item.status}
                  </span>
                  <span className="flex items-center justify-center">
                  <InventoryActions
                    item={item}
                    onDelete={async (id: string) => {
                      try {
                        const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
                        const json = await res.json();

                        if (res.ok && json.success) {
                          toast("Item deleted successfully");
                          fetchItems(); // refresh items
                        } else {
                          toast(json.message || "Failed to delete item");
                        }
                      } catch (error) {
                        console.error(error);
                        toast("Failed to delete item");
                      }
                    }}
                  />
                </span>
                    </div>
                )) 
                ) : (
                    <div className="text-center text-gray-500 py-5">No records found.</div>
                )}
                </>
                )}
          </div>
          </section>

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
            className={currentPage === index + 1 ? "bg-[#d2bda7] text-white" : ""}
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
          </main>
      {/*</div>*/}
    </WarehousemanClientComponent>
  );
};

export default WarehouseInventoryListPage;
