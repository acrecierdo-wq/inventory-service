"use client"
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
    price: number
  };

const OHQuotationCPage = () => {
    //const [mode] = useState("");
      //const [message, setMessage] = useState("");
      const [showConfirmModal, setShowConfirmModal] = useState(false);
      const router = useRouter();
    
      // ✅ State for selected items
      const [selectedItems] = useState<SelectedItem[]>([]);
    
      //const isSendDisabled = mode === '';
    
      // const handleSend = () => {
      //   setShowConfirmModal(true);
      // };
    
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
            <div className="flex justify-center flex-col items-center mt-3">
          <div className="bg-white w-[1200px] rounded-xl p-6">
            <div className="bg-gradient-to-r from-[#0c2a42] to-[#476886] w-full h-15 rounded-xl px-5 py-2">
            <div className="flex justify-between">
              <div className="text-white font-semibold text-lg">
                Quotation #0001
              <div className="text-white text-sm font-normal">Type: Consumables</div>  
                </div>
              <div className="text-white text-sm font-normal text-right">
                Quotation Date: 04/30-2025
              <div className="text-white text-sm font-normal">Quote Expiration: 10/30-2025</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[#44164e] text-xs mt-3">
              <div className="ml-2">
                <span className="font-bold">Quote from:</span><br />
                Canlubang Techno-Preneurship Industrial Corporation<br />
                Siranglupa, Canlubang, Calamba City, 4027<br />
                000-0000-000
              </div>
              <div className="mr-2 text-right">
                <span className="font-bold">Quote to:</span><br />
                Canlubang Techno-Preneurship Industrial Corporation<br />
                Siranglupa, Canlubang, Calamba City, 4027<br />
                000-0000-000
              </div>
            </div>

            <hr className="mt-2 border-1 border-[#0c2a42] w-full" />
            
            {/* Table */}
            <div className="w-full mt-3">
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left border border-[#173f63] b-2 rounded-lg">
      <thead className="bg-[#476886] text-[#ffffff]">
        <tr>
          <th className="border border-[#173f63] px-3 py-2">Item</th>
          <th className="border border-[#173f63] px-3 py-2">Color</th>
          <th className="border border-[#173f63] px-3 py-2">Unit</th>
          <th className="border border-[#173f63] px-3 py-2">Quantity</th>
          <th className="border border-[#173f63] px-3 py-2">Total Price</th>
        </tr>
      </thead>
      <tbody>
        {(selectedItems.length > 0 ? selectedItems : [
          { id: '1', name: 'Masking Tape', color: 'Default', unit: '12MM', quantity: 50, price: '1,400' },
          { id: '2', name: 'Stretch Film', color: 'Default', unit: '250MMx500MM', quantity: 45, price: '4,100'},
          { id: '3', name: 'Plastic Bin Box', color: 'Yellow', unit: 'Large', quantity: 10, price: '5,000' },
        ]).map((item, index) => (
          <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
            <td className="border border-[#173f63] px-3 py-2">{item.name}</td>
            <td className="border border-[#173f63] px-3 py-2">{item.color || '—'}</td>
            <td className="border border-[#173f63] px-3 py-2">{item.unit}</td>
            <td className="border border-[#173f63] px-3 py-2">{item.quantity}</td>
            <td className="border border-[#173f63] px-3 py-2">{item.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
<hr className="mt-2 border-1 border-[#0c2a42] w-full" />
<div className="flex flex-row">
<div className="flex flex-col">
   
                  <div className="text-sm text-[#482b0e] font-semibold mt-4 font-sans">
  Terms and Conditions
</div>
<div className="bg-[#fef4e4] p-3 rounded mt-1 text-xs text-[#482b0e] w-[700px] leading-relaxed">
  <ul className="list-disc pl-5">
    <li>Quotation is valid for 30 days from the date of issue.</li>
    <li>Payment terms: Full payment upon delivery.</li>
    <li>Lead time: 3–5 working days after PO confirmation.</li>
    <li>Prices include VAT unless otherwise stated.</li>
    <li>Returns allowed only for damaged or defective items reported within 7 days.</li>
    <li>Changes to quantities must be confirmed before submitting a PO.</li>
  </ul>
</div>

                  </div>
                  <div className="flex flex-col pl-5">
                   <div className="text-[#482b0e] font-semibold mt-4 font-sans">
                    Sub Total<br></br>
                    VAT (%)<br></br>
                    Discount (%)
                    </div>
                    <div className="bg-gradient-to-r from-[#0c2a42] to-[#476886] w-113 h-10 flex items-center">
                    <div className="text-white font-bold ml-3">TOTAL: PHP 12,000</div>
                    </div>
                  </div>
                  </div>


                {/* Buttons */}
                <div className="mt-8 self-end flex gap-2 ml-255">
                  <Button
                    variant="superOutline"
                    className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg bg-white hover:bg-gray-100 border-gray-400 hover:text-[#482b0e] text-[#482b0e]"
                  >
                    <Link href="/customer/my_orders/order_history">Back</Link>
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
        </CustomerClientComponent>
    );
};

export default OHQuotationCPage;