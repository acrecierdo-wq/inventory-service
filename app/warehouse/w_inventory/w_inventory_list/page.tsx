// app/warehouse/w_inventory/w_inventory_list/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import AddItemModal from "@/components/add/AddItemModal";
import {
  InventoryItem,
  InventoryCategory,
  InventoryUnit,
  InventoryVariant,
  InventorySize,
} from "./types/inventory";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

//const ITEMS_PER_PAGE = 10;

const WarehouseInventoryListPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [sizes, setSizes] = useState<InventorySize[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, ] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "stocks" | "reverseName" | "reverseStocks" | ""
  >("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const recordsPerPage = 10;

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
    } catch (error) {
      setError("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchItems();
  }, []);

  const exportToCSV = () => {
    return new Promise<void>((resolve) => {
      const headers = [
        "Item name",
        "Category",
        "Size",
        "Variant",
        "Unit",
        // "Stock",
        // "Status",
      ];
      const rows = filteredItems.map((item) => [
        item.name,
        item.category,
        item.size?.name || "None",
        item.variant?.name || "None",
        item.unit?.name || "None",
        // item.stock ?? 0,
        // item.status,
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
      link.setAttribute("download", "Inventory_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resolve(); // signal completion
    });
  };

const exportToPDF = () => {
  if (typeof window === "undefined") return;

  const now = new Date();

  // Display format inside PDF
  const formattedDisplay = now.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Safe filename format
  const formattedFileName = now
    .toISOString()
    .replace(/[:]/g, "-")
    .replace("T", "_")
    .slice(0, 16); // YYYY-MM-DD_HH-MM

  const doc = new jsPDF("p", "pt", "a4");

  // Company logo
  doc.addImage("/cticlogo.png", "PNG", 450, 15, 80, 80);

  // Company name
  doc.setFontSize(18);
  doc.setFont("garamond", "bold");
  doc.text("Canlubang Techno-Industrial Corporation", 40, 40);

  // Report name
  doc.setFontSize(12);
  doc.text("Inventory Report", 40, 60);

  // Exported date & time
  doc.setFontSize(10);
  doc.text(`Exported: ${formattedDisplay}`, 40, 75);

  // Header line
  doc.setDrawColor(150);
  doc.setLineWidth(0.5);
  doc.line(40, 85, 420, 85);

  // Table header
  const headers = [
    "Item name",
    "Category",
    "Size",
    "Variant",
    "Unit",
  ];

  // Table rows
  const rows = filteredItems.map((item) => [
    item.name,
    item.category?.name || "None",
    item.size?.name || "None",
    item.variant?.name || "None",
    item.unit?.name || "None",
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 100,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [166, 124, 82] },
  });

  // Footer page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(`Page ${i} of ${pageCount}`, 500, 820, { align: "right" });
  }

  // Save PDF with timestamp filename
  doc.save(`Inventory_Report_${formattedFileName}.pdf`);
};

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      if (format === "csv") {
        await exportToCSV();
      }
      if (format === "pdf") {
        exportToPDF();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const filteredItems = items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
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

  const totalPages = Math.ceil(filteredItems.length / recordsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  // const paginatedItems = filteredItems.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE
  // );

  const categoryRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setCategoryDropdownOpen(false);
      }

      if (statusRef.current && !statusRef.current.contains(target)) {
        setStatusDropdownOpen(false);
      }

      if (sortRef.current && !sortRef.current.contains(target)) {
        setSortDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#ffedce] flex flex-col">
      <Header />

      <div className="flex flex-col px-3 sm:px-4 mt-20 lg:px-0">
        <AddItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          categories={categories}
          units={units}
          variants={variants}
          sizes={sizes}
          existingItems={items.map((item) => ({
            name: item.name,
            categoryId: item.category.id,
            unitId: item.unit.id,
            variantId: item.variant ? item.variant.id : null,
            sizeId: item.size ? item.size.id : null,
          }))}
          onItemAdded={fetchItems}
        />

        {/* Filters Section - Responsive */}
        <section className="flex flex-col sm:flex-row sm:flex-wrap justify-end gap-2 sm:gap-3 sm:mt-2 sm:mr-4 lg:mr-10 mt-12">
          {/* Search */}
          <div className="h-10 w-full sm:w-auto sm:min-w-[200px] rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row items-center">
            <Image
              src="/search-alt-2-svgrepo-com.svg"
              width={15}
              height={15}
              alt="Search"
              className="ml-3 sm:ml-5"
            />
            <input
              className="ml-2 bg-transparent focus:outline-none flex-1 text-sm"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full sm:w-auto" ref={categoryRef}>
            <div
              className="h-10 w-full sm:w-auto sm:min-w-[100px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-between px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/select-category-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Category"
                />
                <span className="text-sm text-[#482b0e]">
                  {selectedCategory || "Categories"}
                </span>
              </div>
            </div>

            {categoryDropdownOpen && (
              <div className="absolute z-20 bg-white border border-gray-200 mt-1 w-full sm:min-w-[180px] rounded shadow-lg max-h-60 overflow-y-auto">
                <div
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                  onClick={() => {
                    setSelectedCategory("");
                    setCategoryDropdownOpen(false);
                  }}
                >
                  All Categories
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
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
          {/* <div className="relative w-full sm:w-auto" ref={statusRef}>
            <div
              className="h-10 w-full sm:w-auto sm:min-w-[100px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-between px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/filter-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Filter"
                />
                <span className="text-sm text-[#482b0e]">
                  {selectedStatus || "Filter"}
                </span>
              </div>
            </div>

            {statusDropdownOpen && (
              <div className="absolute z-20 bg-white border border-gray-200 mt-1 w-full sm:min-w-[180px] rounded shadow-lg">
                <div
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                  onClick={() => {
                    setSelectedStatus("");
                    setStatusDropdownOpen(false);
                  }}
                >
                  All Status
                </div>
                {[
                  "Overstock",
                  "In Stock",
                  "Critical Level",
                  "Reorder Level",
                  "No Stock",
                ].map((status) => (
                  <div
                    key={status}
                    className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
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
          </div> */}

          {/* Sort */}
          <div className="relative w-full sm:w-auto" ref={sortRef}>
            <div
              className="h-10 w-full sm:w-auto sm:min-w-[100px] rounded-md border-[#d2bda7] border-b-2 bg-white flex items-center justify-between px-3 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/sort-ascending-fill-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="Sort"
                />
                <span className="text-xs sm:text-sm text-[#482b0e] truncate">
                  {sortBy === "name"
                    ? "Name: A - Z"
                    : sortBy === "reverseName"
                    ? "Name: Z - A"
                    : sortBy === "stocks"
                    ? "Stocks: H - L"
                    : sortBy === "reverseStocks"
                    ? "Stocks: L - H"
                    : "Sort"}
                </span>
              </div>
            </div>

            {sortDropdownOpen && (
              <div className="absolute z-20 bg-white border border-gray-200 mt-1 w-full sm:min-w-[180px] rounded shadow-lg">
                <div
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                  onClick={() => {
                    setSortBy("");
                    setSortDropdownOpen(false);
                  }}
                >
                  No Sort
                </div>
                <div
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSortBy("name");
                    setSortDropdownOpen(false);
                  }}
                >
                  Name (A-Z)
                </div>
                <div
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSortBy("reverseName");
                    setSortDropdownOpen(false);
                  }}
                >
                  Name (Z-A)
                </div>
                <div
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSortBy("stocks");
                    setSortDropdownOpen(false);
                  }}
                >
                  Stocks (High - Low)
                </div>
                <div
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-sm"
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

          {/* Export Button */}
          <div className="w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`h-10 w-full sm:w-auto px-4 rounded text-white ${
                    isExporting
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  disabled={isExporting}
                >
                  {isExporting ? "Exporting..." : "Export"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow border rounded text-sm w-32">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>
      </div>

      {/* Table Section - Responsive */}
      <section className="flex-1 overflow-x-auto px-3 sm:px-4 lg:px-10 mt-4 pb-15">
        <div className="bg-[#fffcf6] rounded shadow-md min-w-[800px]">
          {loading && <div className="text-center py-8 animate-pulse italic">Loading...</div>}
          {error && (
            <div className="text-red-500 text-center py-8">{error}</div>
          )}

          {!loading && !error && (
            <>
              {/* Desktop/Tablet Table Header */}
              <div className="hidden md:grid md:grid-cols-[2fr_2fr_2fr_2fr_2fr] gap-2 lg:gap-4 px-3 lg:px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center text-xs lg:text-sm">
                <span className="text-left">ITEM NAME</span>
                <span>CATEGORY</span>
                <span>SIZE</span>
                <span>VARIANT</span>
                <span>UNIT</span>
                
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border-b border-gray-200 p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-[#1e1d1c] uppercase">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.category?.name}
                          </div>
                        </div>
                        {/* <InventoryActions
                          item={item}
                          onDelete={async (id: number) => {
                            try {
                              const res = await fetch(`/api/items/${id}`, {
                                method: "DELETE",
                              });
                              const json = await res.json();

                              if (res.ok && json.success) {
                                toast("Item deleted successfully");
                                fetchItems();
                              } else {
                                toast(
                                  json.message ||
                                    "Failed to delete item. Item already used in your logs."
                                );
                              }
                            } catch (error) {
                              console.error(error);
                              toast("Failed to delete item");
                            }
                          }}
                        /> */}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Size: </span>
                          <span>{item.size?.name || "(None)"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Variant: </span>
                          <span>{item.variant?.name || "(None)"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Unit: </span>
                          <span>{item.unit?.name}</span>
                        </div>
                        <div>
                          {/* <span className="text-gray-500">Stock: </span>
                          <span className="font-semibold">
                            {item.stock ?? 0}
                          </span> */}
                        </div>
                      </div>
{/* 
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span
                          className={`text-white text-xs px-3 py-1 rounded-full ${
                            item.status === "No Stock"
                              ? "bg-slate-500"
                              : item.status === "Critical Level"
                              ? "bg-[#d12f2f]"
                              : item.status === "Reorder Level"
                              ? "bg-yellow-500"
                              : item.status === "Overstock"
                              ? "bg-[#0088FE]"
                              : "bg-green-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div> */}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No records found.
                  </div>
                )}
              </div>

              {/* Desktop/Tablet Table View */}
              <div className="hidden md:block">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[2fr_2fr_2fr_2fr_2fr] gap-2 lg:gap-4 px-3 lg:px-5 py-3 bg-white border-b border-gray-200 text-[#1e1d1c] text-center items-center text-xs lg:text-sm"
                    >
                      <span className="text-left truncate uppercase">{item.name}</span>
                      <span className="truncate">{item.category?.name}</span>
                      <span className="truncate">
                        {item.size?.name || "(None)"}
                      </span>
                      <span className="truncate">
                        {item.variant?.name || "(None)"}
                      </span>
                      <span>{item.unit?.name}</span>
                      {/* <span className="font-semibold">{item.stock ?? 0}</span> */}
                      {/* <span
                        className={`text-white text-xs px-2 py-1 rounded-full ${
                          item.status === "No Stock"
                            ? "bg-slate-500"
                            : item.status === "Critical Level"
                            ? "bg-[#d12f2f]"
                            : item.status === "Reorder Level"
                            ? "bg-yellow-500"
                            : item.status === "Overstock"
                            ? "bg-[#0088FE]"
                            : "bg-green-600"
                        }`}
                      >
                        {item.status}
                      </span> */}
                      {/* <span className="flex items-center justify-center">
                        <InventoryActions
                          item={item}
                          onDelete={async (id: number) => {
                            try {
                              const res = await fetch(`/api/items/${id}`, {
                                method: "DELETE",
                              });
                              const json = await res.json();

                              if (res.ok && json.success) {
                                toast("Item deleted successfully");
                                fetchItems();
                              } else {
                                toast(
                                  json.message ||
                                    "Failed to delete item. Item already used in your logs."
                                );
                              }
                            } catch (error) {
                              console.error(error);
                              toast("Failed to delete item");
                            }
                          }}
                        />
                      </span> */}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No records found.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Pagination */}
      <div className="
      fixed bottom-0 left-0 
      lg:left-[250px] 
      w-full lg:w-[calc(100%-250px)] 
      bg-transparent py-3 
      flex justify-center items-center gap-2 
      z-10
    ">

        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`h-8 w-15 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f] cursor-pointer"
          }`}
        >
          Prev
        </button>

        <span className="text-[#5a4632] text-sm">
          <strong>Page {currentPage} of {totalPages}</strong>
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`h-8 w-15 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0c2a42] text-white hover:bg-[#163b5f] cursor-pointer"
          }`}
        >
          Next
        </button>
      </div>

      {/* Pagination - Responsive */}
      {/* <div className="fixed bottom-0 left-0 lg:left-[250px] w-full lg:w-[calc(100%-250px)] bg-[#ffedce] py-3 flex justify-center shadow-lg z-10">
        <Pagination>
          <PaginationContent className="flex-wrap gap-1">
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((prev) => Math.max(prev - 1, 1));
              }}
              className="text-xs sm:text-sm"
            />
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index} className="hidden sm:inline-block">
                <PaginationLink
                  href="#"
                  className={`text-xs sm:text-sm ${
                    currentPage === index + 1 ? "bg-[#d2bda7] text-white" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(index + 1);
                  }}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))} */}
            {/* Show current page on mobile */}
            {/* <div className="sm:hidden flex items-center px-2 text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              }}
              className="text-xs sm:text-sm"
            />
          </PaginationContent>
        </Pagination>
      </div> */}
    </main>
  );
};

export default WarehouseInventoryListPage;
