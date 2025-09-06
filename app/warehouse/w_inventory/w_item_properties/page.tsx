// app/warehouse/w_inventory/w_item_properties/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import WarehousemanClientComponent from '@/app/validate/warehouseman_validate';
import { Header } from '@/components/header';
import Image from 'next/image';

const properties = ["categories", "units", "variants", "sizes"];

type ItemType = {
  id: number;
  name: string;
};

const ItemPropertiesPage = () => {
  const [selectedProperty, setSelectedProperty] = useState("categories");
  const [items, setItems] = useState<ItemType[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  const fetchItems = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    if (!selectedProperty) {
      setError("Failed to fetch properties.");
      return;
    }
  
  const res = await fetch(`/api/${selectedProperty}`);
  const json = await res.json();
  
  // Check response structure
  console.log("API Response:", json);

  if (json.success && Array.isArray(json.data)) {
    setItems(json.data);
  } else {
    setItems([]); // fallback
    console.error("Invalid data structure from API");
  }
}
catch (error) {
  console.log(error);
  setError("Something went wrong");
}
finally {
  setLoading(false);
}
  }, [selectedProperty]);
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);


  const handleAdd = async () => {
    if (!newItemName.trim()) return;
    setShowConfirmModal(true);
  };

  const confirmAdd = async () => {
    const res = await fetch(`/api/${selectedProperty}`, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ name: newItemName})
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

const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this item?")) return;

  const res = await fetch(`/api/${selectedProperty}/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    toast.error(data.message || "Failed to delete");
  }

  else {
  toast.success("Deleted successfully");
  await fetchItems();
  }
};


  const handleEdit = (id: number, currentName: string) => {
    setEditId(id);
    setEditName(currentName);
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/${selectedProperty}/${id}`, {
      method: "PUT",
      headers: { "Content-Type" : "application/json",},
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      toast.success("Item updated");
      setEditId(null);
      setEditName("");
      fetchItems();
    } else {
      toast.error("Update failed");
    }
  };

  return (
    <WarehousemanClientComponent>
        <Header />
     <div className="h-full w-full bg-[#ffedce]">
      
      <div className="flex flex-row justify-between items-center w-full pl-15 pr-15">
        <div className="flex flex-row mt-5">
          <h1 className="text-3xl text-[#173f63] font-bold mb-4 uppercase">Item Properties</h1>
        </div>
      
        <div className="flex items-center gap-2 mt-5">
        <Input
          placeholder={`Add ${selectedProperty}`}
          value={newItemName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
          className="w-[200px] bg-white border-slate-400 hover:bg-slate-100"
        />
        <div onClick={handleAdd} className="h-10 w-20 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
        <Image src="/circle-plus-svgrepo-com.svg" width={20} height={20} alt="Add"/>
        <span className="text-[#482b0e] ml-1 text-sm">Add</span></div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center //bg-black">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Addition</h2>
            <p className="mb-6 text-gray-700">
                Are you sure you want to add &quot;<span className="font-semibold">{newItemName}</span>&quot; in Item Properties: <span className="capitalize">{selectedProperty}</span>?
            </p>
            <div className="flex justify-send gap-3">
              <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button onClick={confirmAdd}>Confirm</Button>
              </div>
            </div>
        </div>

      )}
      </div>
      <div className="flex gap-2 mt-2 pl-15">
        {properties.map((prop) => (
          <div
            key={prop}
            //variant={prop === selectedProperty ? "outline" : "ghost"}
            onClick={() => setSelectedProperty(prop)}
            className={`h-5 w-15 border-b-2 border-[#d2bda7] rounded-md flex items-center px-2 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4 text-xs justify-center ${ prop === selectedProperty ? "bg-[#f0d2ad]" : "bg-white"}`}
            
          >
            {prop.charAt(0).toUpperCase() + prop.slice(1)}
          </div>
        ))}
      </div>
      
      <div className="h-auto w-[90%] bg-[#fffcf6] ml-15 mt-5 rounded shadow">
        
          {loading && <div className="text-center mt-5">Loading...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          
    {!loading && !error && ( 
      <>
      {items.length > 0 &&(
  <div className="w-full bg-[#fffcf6] px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7]">
    <div className="grid grid-cols-12 text-[#482b0e] font-medium text-sm">
      <span className="col-span-2">ID No.</span>
      <span className="col-span-7">Name</span>
      <span className="col-span-3 text-right">Actions</span>
    </div>
  </div>
)}

<div>
  {items.length === 0 ? (
    <p className="text-gray-500">No items found for {selectedProperty}.</p>
  ) : (
    items.map((item) => (
      <div
        key={item.id}
        className="px-5 py-2 bg-white border-b border-gray-200 grid grid-cols-12 items-center"
      >
        {editId === item.id ? (
          <>
            <span className="col-span-2 text-sm text-gray-700">{item.id}</span>
            <Input
              className="col-span-7"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <div className="col-span-3 flex gap-2 justify-end">
              <Button size="sm" onClick={() => handleUpdate(item.id)}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="col-span-2 text-sm text-gray-700">{item.id}</span>
            <span className="col-span-7">{item.name}</span>
            <div className="col-span-3 flex gap-2 justify-end">
              <div
              onClick={() => handleEdit(item.id, item.name)}
              className="h-7 w-20 text-white bg-blue-300 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-blue-400 active:border-b-4"
              >
                Edit
              </div>
              <div
              onClick={() => handleDelete(item.id)}
              className="h-7 w-20 bg-slate-200 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-slate-400 active:border-b-4"

              >
                Delete
              </div>
            </div>
          </>
        )}
      </div>
    ))
  )}
</div>
</>
)}
</div>
</div>
    </WarehousemanClientComponent>
  );
};

export default ItemPropertiesPage;
