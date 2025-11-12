// app/components/add/purchasing/add_supplier.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useUser } from "@clerk/nextjs";

interface Supplier {
    id?: number;
    supplierName: string;
  email: string;
  contactNumber: string;
  role: string;
  tinNumber: string;
  address: string;
  status: string;
  loggedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierAdded: () => void;
  existingSuppliers: Supplier[];
  supplier?: Supplier | null;
}

export default function AddSupplierModal({
  isOpen,
  onClose,
  onSupplierAdded,
  existingSuppliers,
  supplier
}: AddSupplierModalProps) {

const { user, isLoaded } = useUser();

const [formData, setFormData] = useState<Supplier>({
    supplierName: "",
    email: "",
    contactNumber: "",
    role: "",
    tinNumber: "",
    address: "",
    createdAt: "",
    updatedAt: "",
    status: "",
    loggedBy: "",
  });

  const [tempItem, setTempItem] = useState<typeof formData | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();

  useEffect(() => {
  if (isOpen) {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({
        supplierName: "",
        email: "",
        contactNumber: "",
        role: "",
        tinNumber: "",
        address: "",
        createdAt: "",
        updatedAt: "",
        loggedBy: "",
        status: "",
      });
    }
  } else {
    setTempItem(null);
    setShowSummary(false);
    setIsSubmitting(false);
  }
}, [isOpen, supplier]);

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
    if (!formData.supplierName.trim()) {
      toast.error("Please enter supplier name.", { duration: 2000 });
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter supplier email.", { duration: 2000 });
      return;
    }

    if (!formData.contactNumber.trim()) {
      toast.error("Please enter supplier contact number.", { duration: 2000 });
      return;
    }

    if (formData.role === "") {
      toast.error("Please enter supplier role.", { duration: 2000 });
      return;
    }

    if (formData.tinNumber === "") {
      toast.error("Please enter supplier TIN number.", { duration: 2000 });
      return;
    }

    if (formData.address === "") {
      toast.error("Please enter supplier address.", { duration: 2000 });
      return;
    }

    const isDuplicate = existingSuppliers.some((supplier) => {
  const itemName = supplier.supplierName.trim().toLowerCase();
  const formName = formData.supplierName.trim().toLowerCase();

  const nameMatch = itemName === formName;
  const emailMatch = supplier.email === formData.email;
  const contactNumberMatch = supplier.contactNumber === formData.contactNumber;
  const roleMatch = supplier.role === formData.role;
  const tinNumberMatch = supplier.tinNumber === formData.tinNumber;
  const addressMatch = supplier.address === formData.address;

  if (nameMatch && emailMatch && contactNumberMatch && roleMatch && tinNumberMatch && addressMatch) {
    console.log("Duplicate found because all fields matched:", {
      supplier,
      formData
    });
  } else {
    console.log("Checked supplier but not a full duplicate:", {
      supplier,
      comparisons: { nameMatch, emailMatch, contactNumberMatch, roleMatch, tinNumberMatch, addressMatch },
    });
  }

  return nameMatch && emailMatch && contactNumberMatch && roleMatch && tinNumberMatch && addressMatch;
});

if (isDuplicate) {
  toast.error("This supplier already exists in the list.", { duration: 2000 });
  return;
}

const payload = {
    ...formData,
    status: formData.status || "Active",
    loggedBy: 
        formData.loggedBy ||
        user?.username ||
        user?.fullName ||
        user?.firstName ||
        user?.firstName ||
        user?.primaryEmailAddress?.emailAddress ||
         "System",
    createdAt: supplier?.createdAt || now,
    updatedAt: now,
};

try {
    setIsSubmitting(true);
    const res = await fetch(
        supplier ? `/api/purchasing/suppliers/${supplier.id}` : `/api/purchasing/suppliers`,
        {
            method: supplier ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

if (!res.ok) throw new Error("Failed to save supplier.");

toast.success(`Supplier ${supplier ? "updated" : "added"} successfully.`);
onSupplierAdded();
onClose();
} catch (err) {
    console.error(err);
    toast.error("Error saving supplier.");
} finally {
    setIsSubmitting(false);
}
  };

  const handleSave = async () => {
    if (!tempItem) return;
      toast.success("Supplier added successfully.");
      onSupplierAdded();
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
            ADD NEW SUPPLIER
            </div>
            </DialogTitle>
            
        {/* <DialogDescription className="text-center text-xl py-5"> */}
          <main className="w-full flex flex-col gap-0 mt-2 text-center text-xl py-5">
        
            <section className="flex flex-row gap-9">
              <p className="w-[120px] text-black text-start text-sm">
                Supplier Name:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input supplier name here..."
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />
              </div>
            </section>

        <section className="flex flex-row gap-9">
          <p className="w-[120px] text-black text-start text-sm">
                Email:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input supplier email here..."
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />
              </div>
        </section>

        <section className="flex flex-row gap-9">
          <p className="w-[120px] text-black text-start text-sm">
                Contact:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input supplier contact here..."
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />
              </div>
        </section>

        <section className="flex flex-row gap-9">
          <p className="w-[120px] text-black text-start text-sm">
                Role:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input supplier role here..."
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />
              </div>
        </section>

        <section className="flex flex-row gap-9">
          <p className="w-[120px] text-black text-start text-sm">
                TIN:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input supplier TIN number here..."
                value={formData.tinNumber}
                onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />
              </div>
        </section>

        <section className="flex flex-row gap-9">
          <p className="w-[120px] text-black text-start text-sm">
                Address:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input supplier address here..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
          <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Supplier</h2>

          <p className="mb-2 text-sm text-gray-700">Supplier Name: {formData.supplierName}</p>
          <p className="mb-2 text-sm text-gray-700">Email: {formData.email}</p>
          <p className="mb-2 text-sm text-gray-700">Contact: {formData.contactNumber}</p>
          <p className="mb-2 text-sm text-gray-700">Role: {formData.role}</p>
          <p className="mb-2 text-sm text-gray-700">TIN: {formData.tinNumber}</p>
          <p className="mb-2 text-sm text-gray-700">Address: {formData.address}</p>

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

