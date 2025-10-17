'use client';

import { useEffect, useState } from 'react';
import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import { Button } from '@/components/ui/button';

const properties = [
  { name: "Categories" },
  { name: "Units" },
  { name: "Variants" },
  { name: "Sizes"},
];

const itemVariants: Record<string, Record<string, string[]>> = {
  "Masking Tape": { Default: ["12MM", "14MM"] },
  "Packaging Tape": {
    Tan: ["3 x 80", "2 x 80", "2 x 45"],
    Clear: ["2 x 80"], Green: ["2 x 80"], Blue: ["2 x 80"],
    Yellow: ["2 x 80"], White: ["2 x 80"], Orange: ["2 x 80"]
  },
  "Floor Marking Tape": {
    Blue: ["2 x 80", "2 x 45"], Yellow: ["2 x 45"],
    "Black & Yellow": ["2 x 45", "3 x 80"], Red: ["3 x 80"], White: ["2 x 80"]
  },
  "Scotch Tape": { Default: ["1 x 80MM", "3/4 x 50MM", "1 x 50MM"] },
  "P.E Bag": { Default: ["90 x 70cm", "110 x 70cm"] },
  "Plastic Bin Box": {
    Blue: ["Mini", "Small", "Medium", "Large"],
    Yellow: ["Mini", "Small", "Medium"],
    Red: ["Mini", "Medium", "Large"]
  },
  "P.E Foam Pads": { Default: ["10MM", "20MM"] },
  "P.E Foam Trays": { Default: ["30MM"] },
  "Plastic Strap": { Black: [], White: [] },
  "Strap": { Black: ["15 x 2500mm", "20 X 2500mm"], Blue: ["15 x 2500mm"] },
  "Stretch Film": {
    Default: [
      "500MM x 500MM x 20 x 3",
      "500MM x 450MM x 20 x 3",
      "500MM x 500MM x 20 x 2",
      "250MM x 500MM"
    ]
  },
};

const mockItems: Record<string, { idNo: string; name: string }[]> = {
  Categories: [
    { idNo: "01", name: "Masking Tape" },
    { idNo: "02", name: "Packaging Tape" },
    { idNo: "03", name: "Floor Marking Tape" },
    { idNo: "04", name: "Scotch Tape" },
  ],
  Units: [
    { idNo: "01", name: "pcs" },
    { idNo: "02", name: "Rolls" },
    { idNo: "03", name: "cm" },
    { idNo: "04", name: "mm" },
  ],
  Variants: [
    { idNo: "01", name: "Yellow" },
    { idNo: "02", name: "Red" },
    { idNo: "03", name: "Green" },
    { idNo: "04", name: "Tan" },
    { idNo: "05", name: "Blue" },
  ],
  Sizes: [
    { idNo: "01", name: "Mini" },
    { idNo: "02", name: "Medium" },
    { idNo: "03", name: "Large" },
  ],
};

const Consumables2Page = () => {
  //const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<Record<number, string | null>>({});
  const [selectedUnit, setSelectedUnit] = useState<Record<number, string | null>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [orderSummary, setOrderSummary] = useState<
    { name: string; color: string | null; unit: string | null; quantity: number }[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);

  // const handleColorChange = (index: number, color: string) => {
  //   setSelectedColor((prev) => ({ ...prev, [index]: color }));
  //   setSelectedUnit((prev) => ({ ...prev, [index]: null }));
  // };

  // const handleUnitChange = (index: number, unit: string) => {
  //   setSelectedUnit((prev) => ({ ...prev, [index]: unit }));
  // };

  // const handleQuantityChange = (index: number, quantity: number) => {
  //   setQuantities((prev) => ({ ...prev, [index]: quantity }));
  // };

  const handleConfirm = (index: number, itemName: string) => {
    const color = selectedColor[index] || null;
    const unit = selectedUnit[index] || null;
    const quantity = quantities[index] || 0;

    if (quantity > 0) {
      setOrderSummary((prev) => [...prev, { name: itemName, color, unit, quantity }]);
      setSelectedColor((prev) => ({ ...prev, [index]: null }));
      setSelectedUnit((prev) => ({ ...prev, [index]: null }));
      setQuantities((prev) => ({ ...prev, [index]: 0 }));
    }
  };

  // const handleRemoveItem = (index: number) => {
  //   setOrderSummary((prev) => prev.filter((_, i) => i !== index));
  // };

  // const handleReviewAndSubmit = () => {
  //   if (orderSummary.length > 0 && !isEditing) {
  //     localStorage.setItem("orderSummary", JSON.stringify(orderSummary));
  //     router.push("/customer/p&s/consumables_2/c_request");
  //   }
  // };

  useEffect(() => {
      if (orderSummary.length === 0 && isEditing) {
        setIsEditing(false);
      }
    }, [orderSummary, isEditing]);

  const unitIsValid = (color: string | null, units: string[], quantity: number | undefined) =>
    (color === null || color === "" || units.length === 0 || !!color) && quantity && quantity > 0;

  return (
    <CustomerClientComponent>
      <div className="bg-[url('/customer_p&s.jpg')] bg-cover bg-center h-screen w-full overflow-y-auto flex flex-col">
        <CustomerHeader />

        <div className="mt-2 ml-5 w-[765px] h-[30px] rounded bg-gradient-to-r from-[#0c2a42] to-[#476886]">
          <div className="ml-5 text-white font-bold">ITEM PROPERTIES</div>
        </div>
        
        <div className="flex flex-row justify-between px-5 gap-5 mt-4">
          {/* LEFT SIDE */}
          <div className="flex flex-col w-2/3">
            <div className="flex flex-row gap-4 flex-wrap">
              {properties.map((pro) => (
                <div
                  key={pro.name}
                  className="w-[140px] h-[50px] rounded-2xl overflow-hidden flex flex-col border-[#8b8a8a] border-b-4 cursor-pointer"
                  onClick={() => setSelectedProperty(pro.name)}
                >
                  {/*<div className="h-[60%] py-1 pl-7" style={{ backgroundColor: cat.bg }}>
                    <Image src={cat.image} width={80} height={80} alt={cat.name} className="object-cover rounded" />
                  </div>*/}
                  <div className=" bg-white flex flex-col gap-2 px-5 py-3">
                    <span className="text-[#482b0e] font-bold text-center">{pro.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedProperty && mockItems[selectedProperty] && (
              <div className="mt-6">
                <h2 className="text-[#173f63] text-2xl font-bold mb-2">{selectedProperty}</h2>
                <div className="h-10 w-full bg-white rounded border-2 border-slate-400 flex items-center px-5">
                  <div className="grid grid-cols-5 w-full text-[#482b0e] font-medium text-sm">
                    <span>ID No.</span>
                    <span>Name</span>
                    <span>ACTIONS</span>
                  </div>
                </div>

                {mockItems[selectedProperty].map((item, i) => {
                  //const colors = Object.keys(itemVariants[item.idNo] || { Default: [] });
                  const units = itemVariants[item.name]?.[selectedColor[i] || "Default"] || [];

                  return (
                    <div key={i} className="mt-2 bg-[#fef5e4] rounded h-12 flex items-center px-5">
                      <div className="grid grid-cols-5 w-full items-center text-sm text-[#173f63]">
                        <span>{item.idNo}</span>
                        <span>{item.name}</span>

                        <button
                          className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
                          onClick={() => handleConfirm(i, item.name)}
                          disabled={!unitIsValid(selectedColor[i], units, quantities[i])}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
                          onClick={() => handleConfirm(i, item.name)}
                          disabled={!unitIsValid(selectedColor[i], units, quantities[i])}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button variant="primaryOutline" className="bg-[#173f63] text-white">
                Add New
                <Image
                src="/circle-plus-svgrepo-com.svg"
                width={20}
                height={20}
                alt="Add"
                className="ml-0 invert" 
            />
            </Button>
          {/* RIGHT SIDE - ORDER SUMMARY 
          
          <div className="w-1/3">
            <div className="bg-white rounded-xl border border-slate-300 shadow-lg p-4">
              <h3 className="text-xl font-bold text-[#173f63] mb-3">Order Summary</h3>
              <div className="flex flex-col gap-3 text-sm text-[#173f63]">
                <div className="flex justify-between items-center">
                  <button
                    className="text-blue-500 text-xs"
                    onClick={() => setIsEditing((prev) => !prev)}
                  >
                    {isEditing ? "Done Editing" : "Edit"}
                  </button>
                </div>

                {orderSummary.length > 0 ? (
                  orderSummary.map((item, idx) => (
                    <div key={idx} className="bg-[#fef5e4] border border-[#d6d3d1] rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-[#482b0e]">{item.name}</div>
                        {isEditing && (
                          <button onClick={() => handleRemoveItem(idx)}>
                            <img src="/delete-remove-uncheck-svgrepo-com.svg" alt="Remove" className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div><span className="font-medium">Color:</span> {item.color}</div>
                        <div><span className="font-medium">Unit:</span> {item.unit}</div>
                        <div><span className="font-medium">Quantity:</span> {item.quantity}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No items confirmed.</p>
                )}
              </div>

              <button
                className={`py-2 w-full rounded-md hover:bg-slate-600 mt-4 text-white text-sm ${
                  orderSummary.length === 0 || isEditing ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#173f63]'
                }`}
                onClick={handleReviewAndSubmit}
                disabled={orderSummary.length === 0 || isEditing}
              >
                Review and Submit
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
    </CustomerClientComponent>
  );
};

export default Consumables2Page;
