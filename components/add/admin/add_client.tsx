// app/components/add/admin/add_client.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useUser } from "@clerk/nextjs";

interface Client {
    id?: number;
    clientName: string;
  email: string;
  contact: string;
  address: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: () => void;
  existingClient: Client[];
  client?: Client | null;
}

export default function AddClientModal({
  isOpen,
  onClose,
  onClientAdded,
  existingClient,
  client
}: AddClientModalProps) {

const { user, isLoaded } = useUser();

const [formData, setFormData] = useState<Client>({
    clientName: "",
    email: "",
    contact: "",
    address: "",
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
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        clientName: "",
        email: "",
        contact: "",
        address: "",
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
}, [isOpen, client]);

  // ✅ Automatically set loggedBy when user is available
  useEffect(() => {
    if (isLoaded && user) {
      const username =
        user.username ||
        user.fullName ||
        user.firstName ||
        user.primaryEmailAddress?.emailAddress ||
        "";
        setFormData((prev) => ({ ...prev, createdBy: username }));
        console.log("Breated by set to:", username);
    }
  }, [isLoaded, user]);


  const handleDone = async () => {
    if (!formData.clientName.trim()) {
      toast.error("Please enter client name.", { duration: 2000 });
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter client email.", { duration: 2000 });
      return;
    }

    if (!formData.contact.trim()) {
      toast.error("Please enter client contact.", { duration: 2000 });
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Please enter client address.", { duration: 2000 });
      return;
    }

    const isDuplicate = existingClient.some((client) => {
  const itemName = client.clientName.trim().toLowerCase();
  const formName = formData.clientName.trim().toLowerCase();

  const nameMatch = itemName === formName;
  const emailMatch = client.email === formData.email;
    const contactMatch = client.contact === formData.contact;
     const addressMatch = client.address === formData.address;

  if (nameMatch && emailMatch && contactMatch && addressMatch) {
    console.log("Duplicate found because all fields matched:", {
      client,
      formData
    });
  } else {
    console.log("Checked personnel but not a full duplicate:", {
      client,
      comparisons: { nameMatch, emailMatch, contactMatch, addressMatch },
    });
  }

  return nameMatch && emailMatch && contactMatch && addressMatch;
});

if (isDuplicate) {
  toast.error("This client already exists in the list.", { duration: 2000 });
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
    createdAt: client?.createdAt || now,
    updatedAt: now,
};

try {
    setIsSubmitting(true);
    const res = await fetch(
        client ? `/api/admin/clients/${client.id}` : `/api/admin/clients`,
        {
            method: client ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

if (!res.ok) throw new Error("Failed to save client.");

toast.success(`client ${client ? "updated" : "added"} successfully.`);
onClientAdded();
onClose();
} catch (err) {
    console.error(err);
    toast.error("Error saving client.");
} finally {
    setIsSubmitting(false);
}
  };

  const handleSave = async () => {
    if (!tempItem) return;
      toast.success("Client added successfully.");
      onClientAdded();
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
            ADD NEW CLIENT
            </div>
            </DialogTitle>
            
        {/* <DialogDescription className="text-center text-xl py-5"> */}
          <main className="w-full flex flex-col gap-0 mt-2 text-center text-xl py-5">
        
            <section className="flex flex-row gap-9">
              <p className="w-[120px] text-black text-start text-sm">
                Client Name:<span className="text-red-500"> *</span>
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input client name here..."
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
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
                placeholder="input personnel email here..."
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
                placeholder="input personnel contact here..."
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
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
                placeholder="input personnel address here..."
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
          <h2 className="text-xl font-bold mb-4 text-[#173f63]">Confirm Client</h2>

          <p className="mb-2 text-sm text-gray-700">Client Name: {formData.clientName}</p>
          <p className="mb-2 text-sm text-gray-700">Email: {formData.email}</p>
          <p className="mb-2 text-sm text-gray-700">Contact: {formData.contact}</p>
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

