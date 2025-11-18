// app/components/add/admin/personnel.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useUser } from "@clerk/nextjs";

interface Personnel {
    id?: number;
    personnelName: string;
  department: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AddPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonnelAdded: () => void;
  existingPersonnel: Personnel[];
  personnel?: Personnel | null;
}

export default function AddPersonnelModal({
  isOpen,
  onClose,
  onPersonnelAdded,
  existingPersonnel,
  personnel
}: AddPersonnelModalProps) {

const { user, isLoaded } = useUser();

const [formData, setFormData] = useState<Personnel>({
    personnelName: "",
    department: "",
    createdAt: "",
    updatedAt: "",
    createdBy: "",
  });

  const [tempItem, setTempItem] = useState<typeof formData | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();

  useEffect(() => {
  if (isOpen) {
    if (personnel) {
      setFormData(personnel);
    } else {
      setFormData({
        personnelName: "",
        department: "",
        createdAt: "",
        updatedAt: "",
        createdBy: "",
      });
    }
  } else {
    setTempItem(null);
    setShowSummary(false);
    setIsSubmitting(false);
  }
}, [isOpen, personnel]);

  // ✅ Automatically set loggedBy when user is available
  useEffect(() => {
    if (isLoaded && user) {
      const username =
        user.username ||
        user.fullName ||
        user.firstName ||
        user.primaryEmailAddress?.emailAddress ||
        "";
        setFormData((prev) => ({ ...prev, loggedBy: username }));
        console.log("Logged by set to:", username);
    }
  }, [isLoaded, user]);


  const handleDone = async () => {
    if (!formData.personnelName.trim()) {
      toast.error("Please enter personnel name.", { duration: 2000 });
      return;
    }

    if (!formData.department.trim()) {
      toast.error("Please enter personnel department.", { duration: 2000 });
      return;
    }

    const isDuplicate = existingPersonnel.some((personnel) => {
  const itemName = personnel.personnelName.trim().toLowerCase();
  const formName = formData.personnelName.trim().toLowerCase();

  const nameMatch = itemName === formName;
  const departmentMatch = personnel.department === formData.department;

  if (nameMatch && departmentMatch ) {
    console.log("Duplicate found because all fields matched:", {
      personnel,
      formData
    });
  } else {
    console.log("Checked personnel but not a full duplicate:", {
      personnel,
      comparisons: { nameMatch, departmentMatch },
    });
  }

  return nameMatch && departmentMatch;
});

if (isDuplicate) {
  toast.error("This personnel already exists in the list.", { duration: 2000 });
  return;
}

const payload = {
    ...formData,
    createdBy: 
        formData.createdBy ||
        user?.username ||
        user?.fullName ||
        user?.firstName ||
        user?.firstName ||
        user?.primaryEmailAddress?.emailAddress ||
         "Admin",
    createdAt: personnel?.createdAt || now,
    updatedAt: now,
};

try {
    setIsSubmitting(true);
    const res = await fetch(
        personnel ? `/api/admin/personnels/${personnel.id}` : `/api/admin/personnels`,
        {
            method: personnel ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

if (!res.ok) throw new Error("Failed to save personnel.");

toast.success(`Personnel ${personnel ? "updated" : "added"} successfully.`);
onPersonnelAdded();
onClose();
} catch (err) {
    console.error(err);
    toast.error("Error saving personnel.");
} finally {
    setIsSubmitting(false);
}
  };

  const handleSave = async () => {
    if (!tempItem) return;
      toast.success("Personnel added successfully.");
      onPersonnelAdded();
      setShowSummary(false);
      onClose();
  };

  return (
    <>
    {/* Add Item Modal */}
    <Dialog open={isOpen && !showSummary} onOpenChange={onClose}>
      <DialogContent className="w-[800px]">
        <DialogHeader >
          <DialogTitle className=" text-center text-white text-xl pt-3 bg-gradient-to-r from-[#e3ae01] via-[#fed795] to-[#fcf4d2] w-[513px] h-[50px] -mt-[25px] -ml-[26px] rounded-t-lg">
            <div className="text-[#173f63] font-bold">
            ADD NEW PERSONNEL
            </div>
            </DialogTitle>
            
        {/* <DialogDescription className="text-center text-xl py-5"> */}
          <main className="w-full flex flex-col gap-0 mt-2 text-center text-xl py-5">
        
            <section className="flex flex-row gap-9">
              <p className="w-[120px] text-black text-start text-sm">
                Personnel Name:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input personnel name here..."
                value={formData.personnelName}
                onChange={(e) => setFormData({ ...formData, personnelName: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />
              </div>
            </section>

        <section className="flex flex-row gap-9">
          <p className="w-[120px] text-black text-start text-sm">
                Department:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input personnel department here..."
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />
              </div>
        </section>

        <div className="mt-4 flex justify-center gap-4 ">
          <button
                type="button"
                onClick={onClose}
                className="h-7 w-15 bg-gray-300 text-sm text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>

          <button 
          onClick={handleDone}
          disabled={isSubmitting}
          className={`h-7 w-15 text-white text-sm rounded ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 cursor-pointer"
          }`}>
            {isSubmitting ? "Submitting..." : "Done"}
          </button>
        </div>
      </main>
      
        {/* </DialogDescription> */}
        </DialogHeader>
      </DialogContent>
    </Dialog>

    {/* Summary Modal */}
    {showSummary && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-40">
        <div className="bg-white w-[600px] p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Personnel</h2>

          <p className="mb-2 text-sm text-gray-700">Personnel Name: {formData.personnelName}</p>
          <p className="mb-2 text-sm text-gray-700">Department: {formData.department}</p>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowSummary(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave} // your existing submit function
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
            >
              Save
            </button>
          </div>
          </div>

        </div>
    )}
  </>
  );
}

