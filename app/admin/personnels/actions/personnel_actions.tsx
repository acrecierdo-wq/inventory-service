// app/admin/personnels/actions/personnel_actions.tsx

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { toast } from "sonner";

interface Personnel {
  id?: number;
  username: string;
  personnelName: string;
  department: string;
  email: string;
  contactNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  createdBy: string;
}

type PersonnelActionsProps = {
  item: Personnel;
  onEdit: () => void;
  onDelete: () => void;
}


const PersonnelActions = ({ item, onEdit, onDelete }: PersonnelActionsProps) => {
  console.log("PersonnelActions props.item:", item);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

const handleDelete = async () => {
    try {
      await onDelete(); // delete from parent
      setConfirmDelete(false);
      toast.success(`Personnel "${item.username} - ${item.personnelName}" has been deleted.`);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Error deleting personnel. Please try again.");
    }
  };

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
          {item.status === "Active" && (
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
                  onEdit();
                  setOpenDropdown(false);
                }}
                className="px-4 py-2 hover:bg-green-100 text-green-600 cursor-pointer"
              >
                Edit
                </div>
                <div
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                  setOpenDropdown(false);
                }}
                className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
              >
                Delete
                </div>
                </>
          )}
        </div>
      )}

      {/* View Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-center font-bold text-2xl underline">Personnel Details</SheetTitle>
          </SheetHeader>
          <div className="ml-4 space-y-2">
          <div><strong>Username:</strong> {item.username}</div>
          <div><strong>Personnel Name:</strong> {item.personnelName}</div>
          <div><strong>Department:</strong> {item.department}</div>
          <div><strong>Email:</strong> {item.email}</div>
          <div><strong>Contact Number:</strong> {item.contactNumber}</div>
          <div><strong>Address:</strong> {item.address}</div>
          <div className="flex items-center gap-2"><span><strong>Status:</strong></span>
            <span
            className={`px-2 py-0.5 rounded text-sm font-medium ${
              item.status === 'Active' ? 'bg-green-200 text-green-800' :
              item.status === 'Inactive' ? 'bg-red-200 text-red-800' : ' '
            }`}
            >{item.status}
            </span>
          </div>
          <div><strong>Date | Time Created:</strong> {new Date(item.createdAt).toLocaleString()}</div>
          <div><strong>Created by:</strong> <span className="capitalize">{item.createdBy}</span></div>
          
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
  <AlertDialogContent className="text-center space-y-4">
    <AlertDialogTitle className="text-xl font-semibold">
      Confirm Deletion
    </AlertDialogTitle>
    <p>Are you sure you want to delete <strong>{item.username} - {item.personnelName}</strong>?</p>

    <div className="flex justify-center gap-4 mt-4">
      <button
        onClick={() => setConfirmDelete(false)}
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
      >
        Cancel
      </button>
      <button
        onClick={handleDelete}
        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
      >
        Yes, Delete
      </button>
    </div>
  </AlertDialogContent>
</AlertDialog>


    </div>
  );
};

export default PersonnelActions;

// Latest version - Sept.2