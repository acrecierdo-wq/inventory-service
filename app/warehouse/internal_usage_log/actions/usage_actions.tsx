// app/warehouse/internal_usage_log/actions/usage_action.tsx

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { toast } from "sonner";
import { InternalUsage, InternalUsageItemDetail } from "@/app/warehouse/internal_usage_log/types/internal";

type InternalUsageActionsProps = {
  item: InternalUsage;
  onDelete: (id: number) => void;
};

const InternalUsageActions = ({ item, onDelete }: InternalUsageActionsProps) => {
  console.log("InternalUsageActions props.item:", item);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [items, setItems] = useState<InternalUsageItemDetail[]>([]);

  const handleDelete = async (id: number) => {

    try {
      setIsConfirming(true);
      await onDelete(id);
      setConfirmDelete(false);
      toast.success("Internal usage record archived.");
    } catch (err) {
      console.error(err);
      toast.error("Error archiving internal usage record.");
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    if (item.items) {
      setItems(item.items);
    }
  }, [item.items]);

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
        <Image src="/dots-vertical-rounded-svgrepo-com.svg" width={24} height={24} alt="Actions"/>
      </div>

      {/* Dropdown Options */}
       {openDropdown && (
        <div className="absolute right-0 z-100 bg-white shadow border rounded text-sm w-32">
          {item.status === "Utilized" && (
            <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSheetOpen(true);
                setOpenDropdown(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              View Details
              </div>
              <div
                onClick={() => {
                  setConfirmDelete(true);
                  setOpenDropdown(false);
                }}
                className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
              >
                Archive
                </div></>
          )}

          {item.status === "Archived" && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSheetOpen(true);
                setOpenDropdown(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              View Details
            </div>
          )}
        </div>
      )}

      {/* View Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-center font-bold text-2xl underline">Internal Usage Details</SheetTitle>
          </SheetHeader>
          <div className="ml-4 space-y-2">
          <div><strong>Personnel Name:</strong> {item.personnelName}</div>
          <div><strong>Department:</strong> {item.department}</div>
          <div><strong>Purpose</strong> {item.purpose}</div>
          <div><strong>Authorized By:</strong> {item.authorizedBy}</div>
          <div><strong>Note:</strong> {item.note}</div>
          <div className="flex items-center gap-2"><span><strong>Status:</strong></span>
            <span
            className={`px-2 py-0.5 rounded text-sm font-medium ${
              item.status === 'Utilized' ? 'bg-green-200 text-green-800' :
              item.status === 'Archived' ? 'bg-red-200 text-red-800' :''
            }`}
            >{item.status}
            </span>
          </div>
          <div><strong>Date | Time:</strong> {item.loggedAt}</div>
          <div><strong>Logged By:</strong> {item.loggedBy}</div>
          
          <div className="border-t pt-4 mt-4 w-[350px]">
            <div className="text-center"><strong>ITEMS</strong></div>
          <table className=" w-[350px] mt-4 text-sm border">
                                    <thead className="bg-[#f5e6d3] text-[#482b0e]">
                                        <tr>
                                            <th className=" border px-2 py-1">Item</th>
                                            <th className=" border px-2 py-1">Size</th>
                                            <th className=" border px-2 py-1">Variant</th>
                                            <th className=" border px-2 py-1">Unit</th>
                                            <th className=" border px-2 py-1">Qty</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={ idx }>
                                                <td className="border px-2 py-1">{item.itemName}</td>
                                                <td className="border px-2 py-1">{item.sizeName || "(None)"}</td>
                                                <td className="border px-2 py-1">{item.variantName || "(None)"}</td>
                                                <td className="border px-2 py-1">{item.unitName || "(None)"}</td>
                                                <td className="border px-2 py-1">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
          <p>This will archive the selected internal usage record.</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={() => handleDelete(item.id)}
              disabled={isConfirming}
            >
              {isConfirming ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InternalUsageActions;
