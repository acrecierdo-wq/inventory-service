// app/components/add/AddItemModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: number; name: string }[];
  units: { id: number; name: string }[];
  variants: { id: number; name: string }[];
  sizes: { id: number; name: string }[];
  //refreshItems?: () => void;
  onItemAdded: () => void;
}

export default function AddItemModal({
  isOpen,
  onClose,
  categories,
  units,
  variants,
  sizes,
  onItemAdded,
}: AddItemModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: number;
    unitId: number;
    variantId: number | null;
    sizeId: number | null;
    stock: number | string;
    reorderLevel: number | string;
    criticalLevel: number | string;
    ceilingLevel: number | string;
    status: string;
  }>({
    name: "",
    categoryId: 0,
    unitId: 0,
    variantId: null,
    sizeId: null,
    stock: "",
    reorderLevel: 30,
    criticalLevel: 20,
    ceilingLevel: 100,
    status: "",
  });

  useEffect(() => {
    const numericStock = Number(formData.stock) || 0;
    const numericReorder = Number(formData.reorderLevel) || 0;
    const numericCritical = Number(formData.criticalLevel) || 0;
    const numericCeiling = Number(formData.ceilingLevel) || 0;
    
    let status = "In Stock";
    
    if (numericStock === 0) {
      status = "No Stock";
    } else if (numericStock <= numericCritical) {
      status = "Critical Level";
    } else if (numericStock  <= numericReorder) {
      status = "Reorder Level";
   } else if (numericStock > numericCeiling) {
      status = "Overstock";
   }

    setFormData((prev) => ({...prev, status}));
  }, [formData.stock, formData.criticalLevel, formData.reorderLevel, formData.ceilingLevel]);

  const handleSubmit = async () => {
    // validation
if (!formData.name.trim())  {
  toast.error("Please enter an item name.", { duration: 2000 });
  return;
}

if (!formData.categoryId) {
  toast.error("Please select a category.", { duration: 2000 });
  return;
}

if (!formData.unitId) {
  toast.error("Please select a unit.", { duration: 2000 });
  return;
}

if (formData.reorderLevel === "") {
  toast.error("Please enter a reorder level.", { duration: 2000});
  return;
}

if (formData.criticalLevel === "") {
  toast.error("Please enter a critical level.", { duration: 2000 });
  return;
}

if (formData.ceilingLevel === "") {
  toast.error("Please enter a ceiling level.", { duration: 2000 });
  return;
}

const payload = {
  ...formData,
  stock: Number(formData.stock) || 0,
  reorderLevel: Number(formData.reorderLevel),
  criticalLevel: Number(formData.criticalLevel),
  ceilingLevel: Number(formData.ceilingLevel),
};

    try {
    console.log("Submitting:", formData);
    console.log("Sending item with status:", formData.status);

    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

      const result = await response.json();
    if (response.ok && result.success) {
      
      console.log("Response status:", response.status);
      console.log("Response result:", result);

      toast.success("Added successfully");
      onItemAdded();
      onClose();
    } else {
      toast.error(result.message ||"Failed to add item.");
    }
    } catch (err) {
      console.error(err);
      toast.error("Network error while adding item.", { duration: 2000 });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        categoryId: 0,
        unitId: 0,
        variantId: 0 || null,
        sizeId: 0 || null,
        stock: "",
        reorderLevel: 30,
        criticalLevel: 20,
        ceilingLevel: 100,
        status:"",
      });
    }
  }, [isOpen]);

  const MAX_STOCK = 9999;

  const sanitizeToDigits = (input: string) => {
    const digits = input.replace(/\D+/g, "");
    if (digits === "") return "";
    const parsed = parseInt(digits, 10);
    return Number.isNaN(parsed) ? "" : parsed;
  };

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[800px]">
        <DialogHeader >
          <DialogTitle className=" text-center text-white text-xl pt-3 bg-gradient-to-r from-[#e3ae01] via-[#fed795] to-[#fcf4d2] w-[513px] h-[50px] -mt-[25px] -ml-[26px] rounded-t-lg">
            <div className="text-[#173f63]">
            ADD NEW ITEM
            </div>
            </DialogTitle>
            
        {/* <DialogDescription className="text-center text-xl py-5"> */}
          <main className="w-full flex flex-col gap-0 mt-2 text-center text-xl py-5">
        
            <section className="flex flex-row gap-9">
              <p className="w-[120px] text-black text-start text-sm">
                Item Name:
                </p>
              <div className="w-[320px]">
              <Input
                placeholder="input name here..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />
              </div>
            </section>

        <section className="flex flex-row gap-9">
          <div className="w-[120px] text-black text-start text-sm">
          Category:
          </div>
          <div className="w-[320px] text-black">
            <Select onValueChange={(value: string | number) => setFormData({ ...formData, categoryId: Number(value) })}
              value={formData.categoryId ? formData.categoryId.toString() : ""}
              >
              <SelectTrigger className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100 cursor-pointer">
                <SelectValue 
                placeholder="Select Category"
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()} className="hover:bg-gray-100 cursor-pointer">{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="flex flex-row gap-9">
          <div className="w-[120px] text-black text-start text-sm">
            Unit:
          </div>
          <div className="w-[320px] text-black">
          <Select onValueChange={(value: string | number) => setFormData({ ...formData, unitId: Number(value) })}
            value={formData.unitId ? formData.unitId.toString() : ""}
            >
            <SelectTrigger className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100 cursor-pointer">
              <SelectValue placeholder="Select Unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()} className="hover:bg-gray-100 cursor-pointer">{unit.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </section>

        <section className="flex flex-row gap-9">
          <div className="w-[120px] text-black text-start text-sm">
            Variant:
          </div>
          <div className="w-[320px] text-black">
          <Select onValueChange={(value) => setFormData({ ...formData, variantId: value !== "" ? Number(value) : null})}
            value={formData.variantId ? formData.variantId.toString() : ""}
            >
            <SelectTrigger className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100 cursor-pointer">
              <SelectValue placeholder="Select Variant" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => (
                <SelectItem key={v.id} value={v.id.toString()} className="hover:bg-gray-100 cursor-pointer">{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </section>

        <section className="flex flex-row gap-9">
          <div className="w-[120px] text-black text-start text-sm">
            Size:
          </div>
          <div className="w-[320px] text-black">
          <Select onValueChange={(value) => setFormData({ ...formData, sizeId: value !== "" ? Number(value) : null})}
            value={formData.sizeId ? formData.sizeId.toString() : ""}
            >
            <SelectTrigger className="w-full px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100 cursor-pointer">
              <SelectValue placeholder="Select Size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()} className="hover:bg-gray-100 cursor-pointer">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </section>

        <section className="flex flex-row gap-9">
          <div className="w-[120px] text-black text-start text-sm">
            Quantity in Stock:
          </div>
          <div className="w-[320px] text-black">
            <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                max={MAX_STOCK}
                step={1}
                value={formData.stock === "" ? "" : formData.stock}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault(); // block invalid characters
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text");
                  const sanitized = sanitizeToDigits(pasted);
                  if (sanitized === "") {
                    setFormData({ ...formData, stock: ""});
                    return;
                  }
                  let parsed = Number(sanitized);
                  if (parsed < 0) {
                    parsed = 0;
                    toast.error("Stock quantity cannot be negative.", { duration: 2000 });
                  } else if (parsed > MAX_STOCK) {
                    parsed = MAX_STOCK;
                    toast.error(`Stock cannot sxceed ${MAX_STOCK}.`, { duration: 2000 });
                  }
                  setFormData({ ...formData, stock: parsed });
                }}
                onChange={(e) => {
                  const value = e.target.value;

                  // Let it be empty while typing
                  if (value === "") {
                    setFormData({ ...formData, stock: "" });
                    return;
                  }

                  const digitsOnly = value.replace(/\D+/g, "");
                  if (digitsOnly === "") {
                    setFormData({ ...formData, stock: ""});
                    return;
                  }

                  let parsed = parseInt(digitsOnly, 10);

                  if (isNaN(parsed)) {
                    setFormData({ ...formData, stock: "" });
                    return;
                  }

                  if (parsed < 0) {
                    parsed = 0;
                    toast.error("Stock quantity cannot be negative.", { duration: 2000 });
                  } else if (parsed > MAX_STOCK) {
                    parsed = MAX_STOCK;
                    toast.error(`Stock quantity cannot exceed ${MAX_STOCK}`, { duration: 2000 });
                  }

                  setFormData({ ...formData, stock: parsed });
                }}
                className="w-full text-sm px-2 py-1 border border-gray-200 rounded outline-none mb-2 hover:bg-gray-100"
              />

            <div className="text-xs font-extralight text-left text-red-600">
            *Note: Input accurate quantity once*
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-4 mt-4 mr-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
            <input
              type="number"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value === "" ? "" :Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-200 rounded outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Critical Level</label>
            <input
              type="number"
              value={formData.criticalLevel}
              onChange={(e) => setFormData({ ...formData, criticalLevel: e.target.value === "" ? "" :Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-200 rounded outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ceiling Level</label>
            <input
              type="number"
              value={formData.ceilingLevel}
              onChange={(e) => setFormData({ ...formData, ceilingLevel: e.target.value === "" ? ""  :Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-200 rounded outline-none text-sm"
            />
          </div>
        </section>

        <div className="mt-4 flex justify-center ">
          <Button 
          onClick={handleSubmit}
          className="bg-[#fed795] border-0 border-b-2 border-[#e3ae01] rounded h-10 w-20 hover:bg-yellow-500/30 text-[#482b0e]">
            Save
          </Button>
        </div>
      </main>
        {/* </DialogDescription> */}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
// Copy: Sept.2 - 8:30PM