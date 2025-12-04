// app/purchasing/p_inventory_list/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import AddItemModal from "@/components/add/AddItemModal";
import InventoryActions from "@/app/purchasing/p_inventory/p_inventory_list/inventory_action";
import { toast } from "sonner";
import {
  InventoryItem,
  InventoryCategory,
  InventoryUnit,
  InventoryVariant,
  InventorySize,
} from "@/app/purchasing/p_inventory/p_inventory_list/types/inventory";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ItemImport from "@/components/add/purchasing/ItemImport";

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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "stocks" | "reverseName" | "reverseStocks" | ""
  >("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
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

  const exportToCSV = () => {
    return new Promise<void>((resolve) => {
      const headers = [
        "Item name",
        "Category",
        "Size",
        "Variant",
        "Unit",
        "Stock",
        "Status",
      ];
      const rows = filteredItems.map((item) => [
        item.name,
        item.category,
        item.size?.name || "None",
        item.variant?.name || "None",
        item.unit?.name || "None",
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
      link.setAttribute("download", "Inventory_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resolve(); // signal completion
    });
  };

  const exportToPDF = () => {
    if (typeof window === "undefined") return;

    const doc = new jsPDF("p", "pt", "a4"); // portrait, points, A4 size

    // Add a logo (use your own image or base64)
    // e.g. import logo from "@/assets/logo.png"; then use it:
    // doc.addImage(logo, "PNG", x, y, width, height);
    // Or load from URL/base64 string:
    // doc.addImage("data:image/png;base64,...", "PNG", 40, 20, 80, 40);

    // Company logo
    doc.addImage("/cticlogo.png", "PNG", 450, 15, 80, 80); // x=400, y=15, w=120 h=60

    // Company name at top
    doc.setFontSize(18);
    doc.setFont("garamond", "bold");
    doc.text("Canlubang Techno-Industrial Corporation", 40, 40);

    // Subtitle or report name
    doc.setFontSize(12);
    doc.text("Inventory Report", 40, 60);

    // A line under header
    doc.setDrawColor(150);
    doc.setLineWidth(0.5);
    doc.line(40, 80, 420, 80);

    // Table data
    const headers = [
      "Item name",
      "Category",
      "Size",
      "Variant",
      "Unit",
      "Stock",
      "Status",
    ];

    const rows = filteredItems.map((item) => [
      item.name,
      item.category?.name || "None",
      item.unit?.name || "None",
      item.variant?.name || "None",
      item.size?.name || "None",
      item.stock,
      item.status,
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 100,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [166, 124, 82] }, // brown header
    });

    // Footer: page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount}`, 500, 820, { align: "right" });
    }

    doc.save("Inventory_Report.pdf");
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

  // const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  // const paginatedItems = filteredItems.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE
  // );
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
    <main className="h-full w-full bg-[#ffedce] flex flex-col">
      <Header />
      <div className="flex flex-col">
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

        <section className="flex flex-wrap justify-end gap-2 sm:gap-4 mt-2 mx-2 sm:mr-10 px-1">
          {/* Search */}
          <div className="h-8 w-full sm:w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
            <Image
              src="/search-alt-2-svgrepo-com.svg"
              width={15}
              height={15}
              alt="Search"
              className="ml-5"
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

          {/* Category Dropdown */}
          <div className="relative" ref={categoryRef}>
            <div
              className="h-10 w-auto min-w-[120px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            >
              <Image
                src="/select-category-svgrepo-com.svg"
                width={20}
                height={20}
                alt="Category"
              />
              <span className="text-xs sm:text-sm text-[#482b0e] ml-1 truncate">
                {selectedCategory || "Categories"}
              </span>
            </div>

            {categoryDropdownOpen && (
              <div className="absolute z-20 bg-white border-gray-200 mt-1 w-35 rounded shadow">
                <div
                  className="py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
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
              className="h-10 w-auto min-w-[100px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            >
              <Image
                src="/filter-svgrepo-com.svg"
                width={20}
                height={20}
                alt="Filter"
              />
              <span className="text-xs sm:text-sm text-[#482b0e] ml-2 truncate">
                {selectedStatus || "Filter"}
              </span>
            </div>

            {statusDropdownOpen && (
              <div className="absolute z-20 bg-white border-gray-200 mt-1 w-35 rounded shadow">
                <div
                  className="py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
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

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <div
              className="h-10 w-auto min-w-[100px] rounded-md border-[#d2bda7] border-b-2 bg-white flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            >
              <Image
                src="/sort-ascending-fill-svgrepo-com.svg"
                width={20}
                height={20}
                alt="Sort"
              />
              <span className="ml-2 text-xs sm:text-sm text-[#482b0e] truncate">
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

            {sortDropdownOpen && (
              <div className="absolute z-20 bg-white border-gray-200 mt-1 w-40 rounded shadow">
                <div
                  className="py-1 hover:bg-gray-100 cursor-pointer text-sm font-medium text-center"
                  onClick={() => {
                    setSortBy("");
                    setSortDropdownOpen(false);
                  }}
                >
                  No Sort
                </div>
                <div
                  className="text-center py-1 hover:bg-gray-100 cursor-pointer text-sm"
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

          {/* Add New Button */}
          <div className="relative">
            <div
              className="h-10 w-auto min-w-[100px] bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
              onClick={() => setIsAddItemModalOpen(true)}
            >
              <Image
                src="/circle-plus-svgrepo-com.svg"
                width={20}
                height={20}
                alt="Add"
              />
              <span className="ml-1 text-xs sm:text-sm text-[#482b0e]">
                Add New
              </span>
            </div>
          </div>

<button
  className="h-10 px-3 rounded text-white text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 cursor-pointer"
  onClick={() => setIsImportModalOpen(true)}
>
  Import
</button>
{isImportModalOpen && (
  <ItemImport onClose={() => setIsImportModalOpen(false)} />
)}


          {/* Export Dropdown */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`h-10 px-3 rounded text-white text-xs sm:text-sm ${
                    isExporting
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700 cursor-pointer"
                  }`}
                >
                  {isExporting ? "Exporting..." : "Export"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="absolute right-0 z-100 bg-white shadow border rounded text-sm w-32">
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

      {/* Table Section */}
      <section className="flex-1 overflow-y-auto px-2 sm:px-10 mt-2">
        <div className="bg-[#fffcf6] rounded shadow-md overflow-x-auto">
          {loading && <div className="text-center mt-5">Loading...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}

          {!loading && !error && (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-[2fr_1.5fr_2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center text-sm">
                  <span>ITEM NAME</span>
                  <span>CATEGORY</span>
                  <span>SIZE</span>
                  <span>VARIANT</span>
                  <span>UNIT</span>
                  <span>STOCKS</span>
                  <span>STATUS</span>
                  <span>ACTION</span>
                </div>

                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[2fr_1.5fr_2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center text-sm"
                    >
                      <span className="text-start uppercase truncate">
                        {item.name}
                      </span>
                      <span className="truncate">{item.category?.name}</span>
                      <span className="truncate">
                        {item.size?.name || "(None)"}
                      </span>
                      <span className="truncate">
                        {item.variant?.name || "(None)"}
                      </span>
                      <span>{item.unit?.name}</span>
                      <span className="text-center">{item.stock ?? 0}</span>
                      <span
                        className={`text-white text-center px-2 text-xs py-1 rounded-4xl ${
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
                      <span className="flex items-center justify-center">
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
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-5">
                    No records found.
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="block lg:hidden">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border-b border-gray-200 p-4 mb-2"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1e1d1c] uppercase text-sm">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {item.category?.name}
                          </p>
                        </div>
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
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Size:</span>
                          <span className="ml-2">
                            {item.size?.name || "(None)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Variant:</span>
                          <span className="ml-2">
                            {item.variant?.name || "(None)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Unit:</span>
                          <span className="ml-2">{item.unit?.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Stock:</span>
                          <span className="ml-2 font-semibold">
                            {item.stock ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span
                          className={`text-white text-center px-3 py-1 rounded-full text-xs inline-block ${
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
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-5">
                    No records found.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
{/* Pagination */}
      <div
        className="
      fixed bottom-0 left-0 
      lg:left-[250px] 
      w-full lg:w-[calc(100%-250px)] 
      bg-transparent py-3 
      flex justify-center items-center gap-2 
      z-10
    "
      >
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
          <strong>
            Page {currentPage} of {totalPages}
          </strong>
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
    </main>
  );
};

export default WarehouseInventoryListPage;
