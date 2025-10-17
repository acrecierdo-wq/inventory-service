"use client";

import { useState } from "react";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import CustomerClientComponent from "@/app/validate/customer_validate";

// Variants data
const itemVariants: Record<string, Record<string, string[]>> = {
  "Duct Tape": { Default: ["12MM", "14MM", "16MM"] },
  "Packaging Tape": {
    Tan: ["3 x 80", "2 x 80", "2 x 45"],
    Clear: ["2 x 80"],
    Green: ["2 x 80"],
    Blue: ["2 x 80"],
    Yellow: ["2 x 80"],
    White: ["2 x 80"],
    Orange: ["2 x 80"],
  },
  "Masking Tape": { Default: ["12MM", "14MM"] },
  "Floor Marking Tape": {
    Blue: ["2 x 80", "2 x 45"],
    Yellow: ["2 x 45"],
    "Black & Yellow": ["2 x 45", "3 x 80"],
    Red: ["3 x 80"],
    White: ["2 x 80"],
  },
  "Scotch Tape": {
    Default: ["1 x 80MM", "3/4 x 50MM", "1 x 50MM"],
  },
};

const CustomerItemsPage = () => {
  const [selectedColor, setSelectedColor] = useState<Record<number, string | null>>({});
  const [selectedUnit, setSelectedUnit] = useState<Record<number, string | null>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [confirmedRows, setConfirmedRows] = useState<Record<number, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [showConfirmCancelDialog, setShowConfirmCancelDialog] = useState(false);

  const mockItems = [
    { materialNo: "001", name: "Packaging Tape" },
    { materialNo: "002", name: "Masking Tape" },
    { materialNo: "003", name: "Floor Marking Tape" },
    { materialNo: "004", name: "Scotch Tape" },
  ];

  const handleColorChange = (index: number, color: string) => {
    setSelectedColor((prev) => ({ ...prev, [index]: color }));
    setSelectedUnit((prev) => ({ ...prev, [index]: null }));
  };

  const handleUnitChange = (index: number, unit: string) => {
    setSelectedUnit((prev) => ({ ...prev, [index]: unit }));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [index]: quantity }));
  };

  const handleConfirm = (index: number) => {
    setConfirmedRows((prev) => ({ ...prev, [index]: true }));
  };

  const handleEdit = (index: number) => {
    setConfirmedRows((prev) => ({ ...prev, [index]: false }));
  };

  const handleDelete = (index: number) => {
    setSelectedColor((prev) => ({ ...prev, [index]: null }));
    setSelectedUnit((prev) => ({ ...prev, [index]: null }));
    setQuantities((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setConfirmedRows((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleCancelAllConfirmed = () => {
    setSelectedColor({});
    setSelectedUnit({});
    setQuantities({});
    setConfirmedRows({});
    setShowConfirmCancelDialog(false);
  };

  const isFilled = (i: number) =>
    selectedColor[i] && selectedUnit[i] && quantities[i] > 0;

  const confirmedItems = mockItems
    .map((item, i) => ({
      index: i,
      materialNo: item.materialNo,
      name: item.name,
      color: selectedColor[i],
      unit: selectedUnit[i],
      quantity: quantities[i],
    }))
    .filter((_, i) => confirmedRows[i]);

  return (
    <CustomerClientComponent>
      <div className="bg-[url('/customer_p&s.jpg')] bg-cover bg-center h-screen w-full overflow-y-auto flex flex-col">
        <CustomerHeader />
        <h1 className="text-[#173f63] font-bold text-2xl p-4">Tape</h1>
        <Link href="/customer/p&s/consumables">
          <Image
            src="/arrow-left-svgrepo-com.svg"
            width={40}
            height={40}
            alt="Back"
            className="ml-10"
          />
        </Link>

        <div className="flex ml-10 mt-4 gap-10">
          <div className="flex flex-col w-full">
            <div className="h-10 w-[1100px] bg-white border-2 flex items-center px-5">
              <span className="text-[#482b0e] w-1/6">MATERIAL NO.</span>
              <span className="text-[#482b0e] w-1/6">ITEM NAME</span>
              <span className="text-[#482b0e] w-1/6">COLOR</span>
              <span className="text-[#482b0e] w-1/6">UNIT</span>
              <span className="text-[#482b0e] w-1/6">QUANTITY</span>
              <span className="text-[#482b0e] w-1/6">ACTIONS</span>
            </div>

            {mockItems.map((item, i) => {
              const disabled = confirmedRows[i];
              const filled = isFilled(i);

              return (
                <div
                  key={i}
                  className={clsx(
                    "mt-1 h-14 w-[1100px] bg-white rounded flex items-center px-5 transition-all",
                    disabled ? "opacity-60" : "opacity-100",
                    "border border-gray-200"
                  )}
                >
                  <span className="text-[#173f63] w-1/6">{item.materialNo}</span>
                  <span className="text-[#173f63] w-1/6">{item.name}</span>
                  <span className="text-[#173f63] w-1/6">
                    <select
                      value={selectedColor[i] || ""}
                      onChange={(e) => handleColorChange(i, e.target.value)}
                      disabled={disabled}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    >
                      <option value="" disabled>Select Color</option>
                      {Object.keys(itemVariants[item.name] || {}).map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </span>
                  <span className="text-[#173f63] w-1/6">
                    {selectedColor[i] && (
                      <select
                        value={selectedUnit[i] || ""}
                        onChange={(e) => handleUnitChange(i, e.target.value)}
                        disabled={disabled}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                      >
                        <option value="" disabled>Select Unit</option>
                        {itemVariants[item.name][selectedColor[i]]?.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    )}
                  </span>
                  <span className="text-[#173f63] w-1/6">
                    <input
                      type="number"
                      min={1}
                      value={quantities[i] || ""}
                      onChange={(e) => handleQuantityChange(i, parseInt(e.target.value) || 0)}
                      disabled={disabled}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                  </span>
                  <span className="w-1/6 flex gap-1">
                    {disabled ? (
                      <button
                        onClick={() => handleEdit(i)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                    ) : (
                      filled && (
                        <>
                          <button
                            onClick={() => handleConfirm(i)}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDelete(i)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </>
                      )
                    )}
                  </span>
                </div>
              );
            })}

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowConfirmCancelDialog(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
              >
                Cancel All Review Items
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#173f63] hover:bg-[#2e5984] text-white px-6 py-2 rounded"
              >
                Review and Send Order
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[700px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-[#173f63]">Summary of Orders</h2>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Material No.</th>
                    <th className="p-2">Item Name</th>
                    <th className="p-2">Color</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedItems.map((item) => (
                    <tr key={item.index} className="border-b">
                      <td className="p-2">{item.materialNo}</td>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.color}</td>
                      <td className="p-2">{item.unit}</td>
                      <td className="p-2">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    alert("Request submitted!");
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[500px]">
              <h2 className="text-lg font-semibold mb-4 text-[#173f63]">Are you sure?</h2>
              <p className="mb-4">This will cancel all selected items in your request.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmCancelDialog(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  No, go back
                </button>
                <button
                  onClick={handleCancelAllConfirmed}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, cancel all
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerClientComponent>
  );
};

export default CustomerItemsPage;
