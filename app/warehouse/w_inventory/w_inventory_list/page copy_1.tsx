// app/warehouse/w_inventory/w_inventory_list/page.tsx
"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import AddItemModal from "@/components/add/AddItemModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 4;

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

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const paginatedItems = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  return (
    <WarehousemanClientComponent>
      <div className="h-full w-full bg-[#ffedce]">
        <Header />
        <div className="mx-auto mt-5 max-w [90px]">
            <AddItemModal
  isOpen={isAddItemModalOpen}
  onClose={() => setIsAddItemModalOpen(false)}
  categories={categories}
  units={units}
  variants={variants}
  sizes={sizes}
  onItemAdded={fetchItems}
/>

        <div className="flex flex-row items-center mt-3 pl-5">
            <span className="text-3xl text-[#173f63] font-bold pl-10">INVENTORY LIST</span>

            {/* Search, Category, FIlter, Sort*/}
            <div className="h-8 w-70 mt-2 ml-40 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
              <Image src="/search-alt-2-svgrepo-com.svg" width={15} height={15} alt="Search" className="ml-5" />
            </div>
            <div className="h-10 w-25 ml-4 rounded-md border-[#d2bda7] border-b-2 bg-white flex flex-row">
              <Image src="/select-category-svgrepo-com.svg" width={20} height={20} alt="Category" className="ml-2" />
              <span className=" mt-2 text-sm text-[#482b0e] ">Categories</span>
            </div>
            <div className="h-10 w-25 ml-4 rounded-md border-[#d2bda7] border-b-2 bg-white flex flex-row">
              <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" className="ml-4" />
              <span className="mt-2 ml-2 text-sm text-[#482b0e]">Filter</span>
            </div>
            <div className="h-10 w-25 ml-4 rounded-md border-[#d2bda7] border-b-2 bg-white flex flex-row">
              <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" className="ml-5" />
              <span className="ml-3 mt-2 text-sm text-[#482b0e]">Sort</span>
            </div>

            <Button onClick={() => setIsAddItemModalOpen(true)} className="ml-4 h-10 w-25 bg-[#ffffff] border-0 border-[#d2bda7] rounded-md border-b-[2px] active:border-b-4 hover:bg-[#f0d2ad] text-[#482b0e] font-normal">
                <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add" />
                Add New
            </Button>

        </div>

        <div className="h-auto w-[90%] bg-[#fffcf6] ml-15 mt-5 rounded">
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
              <div key={item.id} className="grid grid-cols-8 gap-4 px-5 py-3 bg-white border-b border-gray-200 text-[#1e1d1c]">
                  <span>{item.name}</span>
                  <span>{item.category?.name}</span>
                  <span>{item.unit?.name}</span>
                  <span>{item.variant?.name}</span>
                  <span>{item.size?.name}</span>
                  <span>{item.stocks ?? 0}</span>
                  {/*<span className="text-[#1e1d1c] ml-25 mr-2 mt-3">{item.stocks < 10 ? "Critical Level" : "In Stock"}</span>*/}
                  <span className="mt-3">
                    <span className={`text-white px-3 py-1 rounded-3xl ${item.stocks < 10 ? "bg-[#a72227]" : "bg-green-600"}`}>
                  {item.stocks < 10 ? "Critical Level" : "In Stock"}
                  </span>
                  </span>
                  <span>
                  <Link href="/">
                      <Image src="/dots-vertical-rounded-svgrepo-com.svg" height={24} width={24} alt="action" />
                  </Link>
                </span>
              </div>
            ))}
          </>
        )}
          </div>

          {/* Pagination */}
          <div className="fixed bottom-0 left-[285px] w-[calc(100%-285px)] bg-[#ffedce] py-3 flex justify-center //shadow-inner z-10">
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
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 1))}
        />
      </PaginationContent>
    </Pagination>
          </div>
          </div>
          </div>
      {/*</div>*/}
    </WarehousemanClientComponent>
  );
};

export default WarehouseInventoryListPage;
