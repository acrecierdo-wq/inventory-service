// // app/warehouse/w_inventory/w_item_properties/page.tsx
// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
// import { Header } from "@/components/header";
// import Image from "next/image";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";

// type ItemType = {
//   id: number;
//   name: string;
// };

// const properties = ["categories", "units", "variants", "sizes"];
// const ITEMS_PER_PAGE = 10;

// const ItemPropertiesPage = () => {
//   const [selectedProperty, setSelectedProperty] = useState("categories");
//   const [items, setItems] = useState<ItemType[]>([]);
//   const [newItemName, setNewItemName] = useState("");
//   const [editId, setEditId] = useState<number | null>(null);
//   const [editName, setEditName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [deleteId, setDeleteId] = useState<number | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);

//   /** Fetch Items */
//   const fetchItems = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch(`/api/${selectedProperty}`);
//       const json = await res.json();
//       if (json.success && Array.isArray(json.data)) {
//         setItems(json.data);
//       } else {
//         setItems([]);
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedProperty]);

//   useEffect(() => {
//     fetchItems();
//     setCurrentPage(1); // reset to page 1 on property change
//   }, [fetchItems]);

//   /** Add Item */
//   const handleAdd = () => {
//     if (!newItemName.trim()) return;
//     setShowConfirmModal(true);
//   };

//   const confirmAdd = async () => {
//     const res = await fetch(`/api/${selectedProperty}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name: newItemName }),
//     });

//     if (res.ok) {
//       toast.success("Added successfully");
//       setNewItemName("");
//       fetchItems();
//     } else {
//       toast.error("Failed to add");
//     }
//     setShowConfirmModal(false);
//   };

//   /** Delete Item */
//   const handleDelete = (id: number) => {
//     setDeleteId(id);
//   };

//   const confirmDelete = async () => {
//     if (deleteId === null) return;
//     const res = await fetch(`/api/${selectedProperty}/${deleteId}`, {
//       method: `DELETE`,
//     });
//     const data = await res.json();
//     if (!res.ok || !data.success) {
//       toast.error(data.message || "Failed to delete.");
//     } else {
//       toast.success("Deleted successfully.");
//       fetchItems();
//     }
//     setDeleteId(null);
//   };

//   /** Edit / Update Item */
//   const handleEdit = (id: number, currentName: string) => {
//     setEditId(id);
//     setEditName(currentName);
//   };

//   const handleUpdate = async (id: number) => {
//     if (!editName.trim()) return;
//     const res = await fetch(`/api/${selectedProperty}/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name: editName }),
//     });
//     if (res.ok) {
//       toast.success("Updated successfully!");
//       setEditId(null);
//       setEditName("");
//       fetchItems();
//     } else {
//       toast.error("Update failed");
//     }
//   };

//   /** Local Actions component */
//   function ItemActions({
//     item,
//     onEdit,
//     onDelete,
//   }: {
//     item: ItemType;
//     onEdit: (id: number, name: string) => void;
//     onDelete: (id: number) => void;
//   }) {
//     return (
//       <div className="flex gap-2 justify-end">
//         <div
//           onClick={() => onEdit(item.id, item.name)}
//           className="h-7 w-20 text-white bg-blue-300 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-blue-400 active:border-b-4"
//         >
//           Edit
//         </div>
//         <div
//           onClick={() => onDelete(item.id)}
//           className="h-7 w-20 bg-slate-200 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-slate-400 active:border-b-4"
//         >
//           Delete
//         </div>
//       </div>
//     );
//   }

//   /** Pagination */
//   const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1;
//   const paginatedItems = items.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );

//   return (
//     <WarehousemanClientComponent>
//       <Header />
//       <main className=" w-full bg-[#ffedce] flex flex-col">
//         {/* Tabs */}
//         <div className="flex justify-between mt-5 px-10">
//           <div className="flex gap-2 mt-2">
//             {properties.map((prop) => (
//               <div
//                 key={prop}
//                 onClick={() => setSelectedProperty(prop)}
//                 className={`h-10 w-20 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] text-sm justify-center
//                 ${
//                   prop === selectedProperty
//                     ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md"
//                     : "bg-white border-b-2 border-[#d2bda7]"
//                 }`}
//               >
//                 {prop.charAt(0).toUpperCase() + prop.slice(1)}
//               </div>
//             ))}
//           </div>
//           <div className="flex flex-row gap-2 mt-2">
//             <div className="h-8 w-70 mt-1 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
//               <Image
//                 src="/pencil.svg"
//                 width={0}
//                 height={0}
//                 alt="Search"
//                 className="ml-5 w-[15px] h-auto"
//               />
//               <input
//                 type="text"
//                 title="Click +Add to confirm"
//                 placeholder={`Input new ${selectedProperty}`}
//                 value={newItemName}
//                 onChange={(e) => setNewItemName(e.target.value)}
//                 className="ml-2 bg-transparent focus:outline-none"
//               />
//             </div>
//             <div
//               onClick={handleAdd}
//               className="h-10 w-20 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4"
//             >
//               <Image
//                 src="/circle-plus-svgrepo-com.svg"
//                 width={20}
//                 height={20}
//                 alt="Add"
//               />
//               <span className="text-[#482b0e] ml-1 text-sm">Add</span>
//             </div>
//           </div>
//         </div>

//         {/* Table Container */}
//         <section className="flex-1 //overflow-y-auto px-10 mt-5">
//           <div className="bg-[#fffcf6] rounded shadow-md mb-2">
//             {loading && <div className="text-center mt-5">Loading...</div>}
//             {error && <div className="text-red-500 text-center">{error}</div>}

//             {!loading && !error && (
//               <table className="w-full text-sm border-collapse">
//                 <thead className="bg-[#fffcf6] text-[#482b0e] border-b border-[#d2bda7]">
//                   <tr>
//                     <th className="w-4/6 text-left px-20 py-3">Name</th>
//                     <th className="w-2/6 text-right px-20 py-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedItems.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={2}
//                         className="text-gray-500 px-5 py-3 text-center"
//                       >
//                         No records found for {selectedProperty}.
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedItems.map((item) => (
//                       <tr
//                         key={item.id}
//                         className="bg-white border-b border-gray-200"
//                       >
//                         {editId === item.id ? (
//                           <>
//                             <td className="px-5 py-2">
//                               <Input
//                                 value={editName}
//                                 onChange={(e) => setEditName(e.target.value)}
//                               />
//                             </td>
//                             <td className="px-5 py-2 text-right">
//                               <Button
//                                 size="sm"
//                                 onClick={() => handleUpdate(item.id)}
//                               >
//                                 Save
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="ghost"
//                                 onClick={() => setEditId(null)}
//                                 className="ml-2"
//                               >
//                                 Cancel
//                               </Button>
//                             </td>
//                           </>
//                         ) : (
//                           <>
//                             <td className="px-20 py-2">{item.name}</td>
//                             <td className="px-5 py-2 text-right">
//                               <ItemActions
//                                 item={item}
//                                 onEdit={handleEdit}
//                                 onDelete={handleDelete}
//                               />
//                             </td>
//                           </>
//                         )}
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </section>

//         {/* Pagination inside normal flow */}
//         <div className="mt-4 flex justify-center">
//           <Pagination>
//             <PaginationContent>
//               <PaginationPrevious
//                 href="#"
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.max(prev - 1, 1))
//                 }
//               />
//               {Array.from({ length: totalPages }, (_, index) => (
//                 <PaginationItem key={index}>
//                   <PaginationLink
//                     href="#"
//                     className={
//                       currentPage === index + 1
//                         ? "bg-[#d2bda7] text-white"
//                         : ""
//                     }
//                     onClick={() => setCurrentPage(index + 1)}
//                   >
//                     {index + 1}
//                   </PaginationLink>
//                 </PaginationItem>
//               ))}
//               <PaginationNext
//                 href="#"
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//               />
//             </PaginationContent>
//           </Pagination>
//         </div>

//         {/* Confirm Modal */}
//         {showConfirmModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//             <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                 Confirm Addition
//               </h2>
//               <p className="mb-6">
//                 Are you sure you want to add
//                 <span className="font-semibold">
//                   <strong> {newItemName} </strong>
//                 </span>
//                 in
//                 <span className="capitalize">
//                   <strong> {selectedProperty}</strong>
//                 </span>
//                 ?
//               </p>
//               <div className="flex justify-end gap-3">
//                 <button
//                   className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
//                   onClick={() => setShowConfirmModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-1 rounded bg-green-500 text-white hover:bg-green-700"
//                   onClick={confirmAdd}
//                 >
//                   Confirm
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Delete Modal */}
//         {deleteId !== null && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//             <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                 Confirm Deletion
//               </h2>
//               <p className="mb-6 text-gray-700">
//                 Are you sure you want to delete
//                 <span className="font-semibold">
//                   <strong>
//                     {" "}
//                     {items.find((item) => item.id === deleteId)?.name}{" "}
//                   </strong>
//                 </span>
//                 in
//                 <span className="capitalize">
//                   <strong> {selectedProperty}</strong>
//                 </span>
//                 ?
//               </p>
//               <div className="flex justify-end gap-3">
//                 <button
//                   className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
//                   onClick={() => setDeleteId(null)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
//                   onClick={confirmDelete}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </WarehousemanClientComponent>
//   );
// };

// export default ItemPropertiesPage;

// app/warehouse/w_inventory/w_item_properties/page.tsx

"use client";
import { Header } from "@/components/header";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

type ItemType = {
  id: number;
  name: string;
};

const ITEMS_PER_PAGE = 10;

const ItemPropertiesPage = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<ItemType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<"categories" | "sizes" | "variants" | "units">("categories");
    const [newItemName, setNewItemName] = useState("");
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    /** Fetch Items */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/${activeTab}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
    setCurrentPage(1); // reset to page 1 on property change
  }, [fetchItems]);

  /** Add Item */
  const handleAdd = () => {
    if (!newItemName.trim()) return;
    setShowConfirmModal(true);
  };

  const confirmAdd = async () => {
    const res = await fetch(`/api/${activeTab}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItemName }),
    });

    if (res.ok) {
      toast.success("Added successfully");
      setNewItemName("");
      fetchItems();
    } else {
      toast.error("Failed to add");
    }
    setShowConfirmModal(false);
  };

    /** Delete Item */
    const handleDelete = (id: number) => {
        setDeleteId(id);
      };

    const confirmDelete = async () => {
        if (deleteId === null) return;
        const res = await fetch(`/api/${activeTab}/${deleteId}`, {
          method: `DELETE`,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Failed to delete.");
        } else {
          toast.success("Deleted successfully.");
          fetchItems();
        }
        setDeleteId(null);
      };

  /** Edit / Update Item */
  const handleEdit = (id: number, currentName: string) => {
    setEditId(id);
    setEditName(currentName);
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/${activeTab}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      toast.success("Updated successfully!");
      setEditId(null);
      setEditName("");
      fetchItems();
    } else {
      toast.error("Update failed");
    }
  };

    /** Local Actions component */
    function ItemActions({
        item,
        onEdit,
        onDelete,
      }: {
        item: ItemType;
        onEdit: (id: number, name: string) => void;
        onDelete: (id: number) => void;
      }) {
        return (
          <div className="flex gap-2 justify-end">
            <div
              onClick={() => onEdit(item.id, item.name)}
              className="h-7 w-20 text-white bg-blue-300 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-blue-400 active:border-b-4 border-blue-800"
            >
              Edit
            </div>
            <div
              onClick={() => onDelete(item.id)}
              className="h-7 w-20 bg-slate-200 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-slate-400 active:border-b-4 border-gray-800"
            >
              Delete
            </div>
          </div>
        );
      }
     

    const filtereditems = items.filter((item) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
    
    const totalPages = Math.ceil(filtereditems.length / ITEMS_PER_PAGE);
    const paginatedItems = filtereditems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <main className="h-screen w-full bg-[#ffedce] flex flex-col">
            <Header />
            <section className="flex flex-row justify-between mt-5">

                {/* <span className="text-3xl text-[#173f63] font-bold">Internal Usage</span> */}

            <div className="flex flex-row gap-4 ml-10">
                {/* Category Tab */}
                <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("categories");
                        setCurrentPage(1);
                    }}
                    className={`h-10 w-20 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
                        ${activeTab === "categories" ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md" : "bg-white border-b-2 border-[#d2bda7]"}`}
                    >
                        <span className={`text-sm ${activeTab === "categories" ? "text-white font-semibold" : "text-gray-500"}`}>
                            Category
                        </span>
                    </div>
                </div>

                {/* Size Tab */}
                <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("sizes");
                        setCurrentPage(1);
                    }}
                    className={`h-10 w-20 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
                        ${activeTab === "sizes" ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md" : "bg-white border-b-2 border-[#d2bda7]"}`}
                    >
                        <span className={`text-sm ${activeTab === "sizes" ? "text-white font-semibold" : "text-gray-500"}`}>
                            Size
                        </span>
                        </div>
                </div>

                {/* Variant Tab */}
                <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("variants");
                        setCurrentPage(1);
                    }}
                    className={`h-10 w-20 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
                        ${activeTab === "variants" ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md" : "bg-white border-b-2 border-[#d2bda7]"}`}
                    >
                        <span className={`text-sm ${activeTab === "variants" ? "text-white font-semibold" : "text-gray-500"}`}>
                            Variant
                        </span>
                        </div>
                </div>

                {/* Unit Tab */}
                <div className="relative">
                    <div
                    onClick={() => {
                        setActiveTab("units");
                        setCurrentPage(1);
                    }}
                    className={`h-10 w-20 rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] justify-center active:border-b-4
                        ${activeTab === "units" ? "bg-[#f0d2ad] border-1 border-[#a67c52] shadow-md" : "bg-white border-b-2 border-[#d2bda7]"}`}
                    >
                        <span className={`text-sm ${activeTab === "units" ? "text-white font-semibold" : "text-gray-500"}`}>
                            Unit
                        </span>
                        </div>
                </div>
            </div>

            <div className="flex flex-row gap-4 mr-10">
                {/* Add new */}
                <div className="h-8 w-70 mt-1 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row">
                    <Image
                src="/pencil.svg"
                width={0}
                height={0}
                alt="Search"
                className="ml-5 w-[15px] h-auto"
              />
              <input
                type="text"
                title="Click +Add to confirm"
                placeholder={`Input new ${activeTab}`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="ml-2 bg-transparent focus:outline-none"
              />
                </div>

                {/* Add button */}
                <div className="relative">
                    <div 
                      onClick={handleAdd}
                      className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center justify-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                        <Image
                          src="/circle-plus-svgrepo-com.svg"
                          width={20}
                          height={20}
                          alt="Add"
                        />
                        <span className="text-[#482b0e] ml-1 text-sm">Add</span>
                    </div>
                </div>
            </div>

            </section>

            <section className="flex-1 overflow-y-auto px-10 mt-5 min-h-[400px]">
                <div className="bg-[#fffcf6] rounded shadow-md mb-2">
                {loading && <div className="text-center mt-5">Loading...</div>}
                {error && <div className="text-red-500 text-center">{error}</div>}

                {/* Item Properties Table */}
                {!loading && !error && (
                  <>
                  {/* Header */}
                  <div className="px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] flex justify-between">
                    <span className="capitalize">{activeTab} name</span>
                    <span className="mr-13">ACTIONS</span>
                  </div>

                  {/* Rows */}
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                      <div
                        key={item.id}
                        className="px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] flex justify-between items-center"
                      >
                        {editId === item.id ? (
                          <>
                          <div className="flex-1 mr-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="border-2 border-yellow-300 rounded-md shadow-md"
                            />
                          </div>
                          <div className=" flex gap-2">
                            <button
                              onClick={() => handleUpdate(item.id)}
                              className="w-20 h-8 bg-green-500 text-white rounded-4xl hover:bg-green-600"
                              >
                                Save
                              </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="w-20 h-8 bg-gray-200 rounded-4xl hover:bg-gray-500 "
                              >
                                Cancel
                              </button>
                          </div>
                          </>
                        ) : (
                          <>
                          <div className="flex-1 mr-2">{item.name}</div>
                          <div className=" flex gap-2">
                          <ItemActions 
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                          </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-5">
                      No records found.
                    </div>
                  )}
                  </>
                )}
                </div>
            </section>

          {/* Confirm Modal */}
         {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Addition
              </h2>
              <p className="mb-6">
                Are you sure you want to add
                <span className="font-semibold">
                  <strong> {newItemName} </strong>
                </span>
                in
                <span className="capitalize">
                  <strong> {activeTab}</strong>
                </span>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 rounded bg-green-500 text-white hover:bg-green-700"
                  onClick={confirmAdd}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete
                <span className="font-semibold">
                  <strong>
                    {" "}
                    {items.find((item) => item.id === deleteId)?.name}{" "}
                  </strong>
                </span>
                in
                <span className="capitalize">
                  <strong> {activeTab}</strong>
                </span>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

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
    );
};

export default ItemPropertiesPage;

