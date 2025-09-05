'use client';

import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ✅ Define item type
type SelectedItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  color?: string;
};

const ConsumablesRequestPage = () => {
  const [mode, setMode] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  // ✅ State for selected items
  const [selectedItems,] = useState<SelectedItem[]>([]);

  const isSendDisabled = mode === '';

  const handleSend = () => {
    setShowConfirmModal(true);
  };

  const confirmSend = () => {
    setShowConfirmModal(false);
    // You can also log or send selectedItems + message + mode here
    router.push("/customer/p&s/consumables_2");
  };

  const cancelSend = () => {
    setShowConfirmModal(false);
  };

  return (
    <CustomerClientComponent>
      <div className="bg-[#fed795] h-full w-full min-h-screen">
        <CustomerHeader />
        <div className="flex justify-center flex-col items-center mt-5">
          <div className="bg-white w-[1200px] rounded-xl p-6">
            <div className="bg-gradient-to-r from-[#0c2a42] to-[#476886] w-full h-15 rounded-xl px-5 py-2">
              <div className="text-white font-semibold text-lg">Request #001</div>
              <div className="text-white text-sm">Type of Request: Consumables</div>
            </div>

            <div className="flex justify-between text-[#777777] text-xs mt-3">
              <div className="ml-2">
                <span className="font-bold">Request from:</span><br />
                Canlubang Techno-Preneurship Industrial Corporation<br />
                Siranglupa, Canlubang, Calamba City, 4027<br />
                000-0000-000
              </div>
              <div className="mr-2 text-right">
                <span className="font-bold">Request to:</span><br />
                Canlubang Techno-Preneurship Industrial Corporation<br />
                Siranglupa, Canlubang, Calamba City, 4027<br />
                000-0000-000
              </div>
            </div>

            <hr className="mt-2 border-1 border-gray-500 w-full" />

            <div className="text-[#44164e] font-semibold ml-2 mt-2">Request Details</div>

            <div className="flex flex-row mt-2 gap-4">
              {/* Left: Selected Items Summary as a table */}
<div className="w-1/2">
  
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left border border-[#173f63] b-2 rounded-lg">
      <thead className="bg-[#476886] text-[#ffffff]">
        <tr>
          <th className="border border-[#173f63] px-3 py-2">Item</th>
          <th className="border border-[#173f63] px-3 py-2">Color</th>
          <th className="border border-[#173f63] px-3 py-2">Unit</th>
          <th className="border border-[#173f63] px-3 py-2">Quantity</th>
        </tr>
      </thead>
      <tbody>
        {(selectedItems.length > 0 ? selectedItems : [
          { id: '1', name: 'Masking Tape', color: 'Default', unit: '12MM', quantity: 5 },
          { id: '2', name: 'Packaging Tape', color: 'Yellow', unit: '2x50MM', quantity: 3 },
          { id: '3', name: 'Scotch Tape', color: 'None', unit: '3/4x50MM', quantity: 10 },
        ]).map((item, index) => (
          <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
            <td className="border border-[#173f63] px-3 py-2">{item.name}</td>
            <td className="border border-[#173f63] px-3 py-2">{item.color || '—'}</td>
            <td className="border border-[#173f63] px-3 py-2">{item.unit}</td>
            <td className="border border-[#173f63] px-3 py-2">{item.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

              {/* Right: Mode & Message */}
              <div className="w-1/2 flex flex-col">
                <div className="text-[#44164e] font-semibold">Mode:</div>
                <select
                  className="h-8 w-full mt-1 rounded border border-gray-300 bg-white px-2 text-sm text-gray-700"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="" disabled>Select Mode</option>
                  <option value="Pick-up">Pick-up</option>
                  <option value="Delivery">Delivery</option>
                </select>

                <div className="text-[#44164e] font-semibold mt-4">Message:</div>
                <textarea
                  className="mt-1 h-40 w-full border border-gray-300 rounded p-2 text-sm resize-none"
                  placeholder="Type your message or notes here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>

                {/* Buttons */}
                <div className="mt-8 self-end flex gap-2">
                  <Button
                    variant="superOutline"
                    className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg bg-white hover:bg-gray-100 border-gray-400 hover:text-[#482b0e] text-[#482b0e]"
                  >
                    <Link href="/customer/p&s/consumables_2">Cancel</Link>
                  </Button>
                  <Button
                    variant="superOutline"
                    className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg hover:bg-yellow-500/90 bg-[#ffc922] border-gray-400 hover:text-white text-[#ffffff]"
                    onClick={handleSend}
                    disabled={isSendDisabled}
                  >
                    Send
                  </Button>
                </div>

                {/* Confirm Modal */}
                {showConfirmModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
                      <h2 className="text-lg font-semibold text-gray-800">Confirm Send</h2>
                      <p className="text-sm text-gray-600 mt-2">
                        Are you sure you want to send this request?
                      </p>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                          onClick={cancelSend}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-[#ffc922] text-white rounded hover:bg-yellow-500"
                          onClick={confirmSend}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerClientComponent>
  );
};

export default ConsumablesRequestPage;
