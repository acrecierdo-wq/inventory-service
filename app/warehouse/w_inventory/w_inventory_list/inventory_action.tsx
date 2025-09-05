// app/warehouse/w_inventory/w_inventory_list/inventory_action.tsx
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { InventoryItem } from "./types/inventory";

type InventoryActionsProps = {
  item: InventoryItem;
  onDelete: (id: number) => void;
}

const InventoryActions = ({ item, onDelete }: InventoryActionsProps) => {
  console.log("InventoryActions props.item:", item);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

   const dropdownRef = useRef<HTMLDivElement | null>(null);
  
    useEffect(() => {
      const handleMouseDown = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpenDropdown(false);
        }
      };
  
      window.addEventListener("mousedown", handleMouseDown);
      return () => window.removeEventListener("mousedown", handleMouseDown);
    }, []);
  
      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setOpenDropdown(false);
          }
        };
  
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
      }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dots Icon */}
      <div onClick={() => setOpenDropdown(!openDropdown)} className="cursor-pointer">
        <Image src="/dots-vertical-rounded-svgrepo-com.svg" width={24} height={24} alt="Actions" />
      </div>

      {/* Dropdown Options */}
      {openDropdown && (
        <div className="absolute right-0 z-50 bg-white shadow border rounded text-sm w-32">
          <div
            onClick={() => {
              setSheetOpen(true);
              setOpenDropdown(false);
            }}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center"
          >
            View Details
          </div>
          <div
            onClick={() => {
              setConfirmDelete(true);
              setOpenDropdown(false);
            }}
            className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer text-center"
          >
            Delete
          </div>
        </div>
      )}

      {/* View Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-center font-bold text-2xl">ITEM: {item.name}</SheetTitle>
          </SheetHeader>
          <div className="ml-4 space-y-2">
          <div className="text-lg font-bold mb-2">Item Details</div>
          <div><strong>Name:</strong> {item.name}</div>
          <div><strong>Category:</strong> {item.category?.name}</div>
          <div><strong>Size:</strong> {item.size?.name ?? "(None)"}</div>
          <div><strong>Variant:</strong> {item.variant?.name ?? "(None)"}</div>
          <div><strong>Unit:</strong> {item.unit?.name}</div>
          <div><strong>Quantity in Stock:</strong> {item.stock ?? 0}</div>
          <div className="flex items-center gap-2"><span><strong>Status:</strong></span>
            <span className={`px-2 py-0.5 rounded text-sm text-white font-medium ${
                      item.status === "No Stock" ? "bg-slate-500" : 
                      item.status === "Critical Level" ? "bg-[#d12f2f]" : 
                      item.status === "Reorder Level" ? "bg-yellow-500" :
                      item.status === "Overstock" ? "bg-[#0088FE]" :
                      "bg-green-600"
                      }`}>
                  {item.status}
                  </span>
          </div>
          <br></br><br></br>
          <div className="border-t pt-4 mt-4 w-[350px]">
          <div><strong>Reorder Level:</strong> {item.reorderLevel ?? 0}</div>
          <div><strong>Critical Level:</strong> {item.criticalLevel ?? 0}</div>
          <div><strong>Ceiling Level:</strong> {item.ceilingLevel ?? 0}</div>
          </div>
          {/* Add more item details here */}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogTitle>
        </AlertDialogTitle>
        <AlertDialogContent>
          <div className="text-lg font-semibold">Are you sure?</div>
          <p>This will delete the item permanently.</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryActions;
