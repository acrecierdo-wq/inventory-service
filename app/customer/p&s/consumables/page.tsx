"use client";

import { useEffect, useState } from "react";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const CustomerConsumablesPage = () => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("selectedConsumables");
    if (stored) {
      setSelectedItems(JSON.parse(stored));
    }
  }, []);

  type SelectedItem = {
    name: string;
    quantity: number;
  };
  

  return (
    <div className="bg-[url('/customer_p&s.jpg')] bg-cover bg-center h-screen w-full overflow-y-auto flex flex-col">
      <CustomerHeader />
      <h1 className="text-[#173f63] font-bold text-2xl p-4">Consumables</h1>
      <h1 className="text-[#173f63] font-bold text-lg p-4">Category</h1>

      <div className="mx-20 mt-5 flex flex-row gap-9 relative z-10">
        <Link href="/customer/p&s/consumables/items">
          <div className="w-[250px] h-[280px] rounded-4xl overflow-hidden flex flex-col border-[#d0a521] border-b-4 active:border-b-8">
            <div className="h-[60%] bg-[#173f63] py-2 pl-13">
              <Image src="/duct_tape.jpg" width={150} height={100} alt="duct_tape" className="object-cover rounded-xl" />
            </div>
            <div className="h-[40%] bg-white flex flex-col gap-2 px-5 py-3">
              <span className="text-black font-bold">Tape</span>
            </div>
          </div>
        </Link>

        {/* Placeholder cards */}
        <div className="w-[250px] h-[280px] rounded-4xl overflow-hidden flex flex-col border-[#d0a521] border-b-4 active:border-b-8">
          <div className="h-[60%] bg-[#ffc922] flex items-center justify-center">
            <span className="text-black font-bold">2</span>
          </div>
          <div className="h-[40%] bg-white flex flex-col gap-2 px-5 py-3">
            <span className="text-black font-bold">Plastic Strap</span>
          </div>
        </div>

        <div className="w-[250px] h-[280px] rounded-4xl overflow-hidden flex flex-col border-[#d0a521] border-b-4 active:border-b-8">
          <div className="h-[60%] bg-[#173f63] flex items-center justify-center">
            <span className="text-black font-bold">3</span>
          </div>
          <div className="h-[40%] bg-white flex flex-col gap-2 px-5 py-3">
            <span className="text-black font-bold">Plastic Buckles</span>
          </div>
        </div>

        <div className="w-[250px] h-[280px] rounded-4xl overflow-hidden flex flex-col border-[#d0a521] border-b-4 active:border-b-8">
          <div className="h-[60%] bg-[#ffc922] flex items-center justify-center">
            <span className="text-black font-bold">4</span>
          </div>
          <div className="h-[40%] bg-white flex flex-col gap-2 px-5 py-3">
            <span className="text-black font-bold">Foams</span>
          </div>
        </div>
      </div>

      <div className="flex-grow"></div>

      {/* Sticky Bottom Bar with Dialog */}
      <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="flex justify-end gap-4">
          <button className="w-40 bg-white hover:bg-yellow-500 border-[#d2bda7] border-b-4 text-black font-bold py-2 rounded-3xl transition">
            Cancel
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <button className="w-40 bg-yellow-400 hover:bg-yellow-500 border-[#d2bda7] border-b-4 text-black font-bold py-2 rounded-3xl transition">
                Review and Send
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Order Summary</DialogTitle>
                <DialogDescription>
                  Review your selected items before sending the request.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 mt-4">
                {selectedItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No items selected.</p>
                ) : (
                  selectedItems.map((item, index) => (
                    <div key={index} className="flex justify-between border-b py-1">
                      <span>{item.name}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  ))
                )}
              </div>

              <DialogFooter>
                <button className="bg-gray-300 px-4 py-2 rounded-xl">Cancel</button>
                <button className="bg-yellow-500 text-white px-4 py-2 rounded-xl">
                  Send Request
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CustomerConsumablesPage;

