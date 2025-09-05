"use client";
import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "sonner";

// ✅ Define item type
type SelectedItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  color?: string;
  price: number;
};

const ViewDetailsQCPage = () => {
 // const [mode,] = useState("");
  //const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadLater, setUploadLater] = useState(false);
  

  const router = useRouter();

  // ✅ State for selected items
  const [selectedItems, ] = useState<SelectedItem[]>([]);

  //const isSendDisabled = mode === "";

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

  const handleAccept = () => {
    setShowAcceptModal(false);
    setShowUploadModal(true);
  };

  const handleUpload = () => {
    if (!uploadedFile && !uploadLater) {
      toast.error("Please select a file or confirm upload later.");
      return;
    }
  
    const message = uploadLater
      ? "Upload skipped. You can upload the PO later."
      : "Purchase order uploaded successfully.";
  
    toast.success(message, {
      duration: 2000, // Toast lasts 2s
    });
  
    setUploadedFile(null);
    setUploadLater(false);
    setShowUploadModal(false);
  
    // Redirect AFTER toast finishes
    setTimeout(() => {
      router.push("/customer/my_orders/track_my_order/view_details");
    }, 2000); // Match duration of the toast
  };

  return (
    <CustomerClientComponent>
      <div className="bg-[#fed795] h-full w-full min-h-screen">
        <CustomerHeader />
        <Toaster position="top-right" richColors />
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
                  Sub Total<br />
                  VAT (%)<br />
                  Discount (%)
                </div>
                <div className="bg-gradient-to-r from-[#0c2a42] to-[#476886] w-113 h-10 flex items-center">
                  <div className="text-white font-bold ml-3">TOTAL: PHP 12,000</div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 self-end flex gap-2 ml-225">
              <Button
                variant="superOutline"
                className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg bg-[#a72227] hover:bg-gray-300 border-gray-400 hover:text-[#482b0e] text-[#ffffff]"
                onClick={() => setShowRejectModal(true)}
              >
                REJECT
              </Button>

              <Button
                variant="superOutline"
                className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg bg-[#2b9630] hover:bg-gray-300 border-gray-400 hover:text-[#482b0e] text-[#ffffff]"
                onClick={() => setShowAcceptModal(true)}
              >
                ACCEPT
              </Button>
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

            {/* Reject Modal */}
            {showRejectModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
                  <h2 className="text-lg font-semibold text-[#a72227]">Reject Quotation</h2>
                  <p className="text-sm text-[#5a4632] mt-2">
                    Do you want to reject this quotation?
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      onClick={() => setShowRejectModal(false)}
                    >
                      Cancel
                    </button>
                    <button
  className="px-4 py-2 bg-[#a72227] text-white rounded hover:bg-red-500"
  onClick={() => {
    setShowRejectModal(false);
    toast.error("Quotation has been rejected.");
    setTimeout(() => {
      router.push("/customer/my_orders/track_my_order/view_details");
    }, 1000); // allow time for toast to show
  }}
>
  Reject
</button>

                  </div>
                </div>
              </div>
            )}

            {/* Accept Modal */}
            {showAcceptModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
                  <h2 className="text-lg font-semibold text-[#2b9630]">Accept Quotation</h2>
                  <p className="text-sm text-[#2b9630] mt-2">
                    Are you sure you want to accept this quotation?
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      onClick={() => setShowAcceptModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-[#2b9630] text-white rounded hover:bg-green-500"
                      onClick={handleAccept}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
      <h2 className="text-lg font-semibold text-gray-800">Upload Purchase Order</h2>
      
      <input
        type="file"
        onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
        className="w-full mt-4"
        disabled={uploadLater}
      />

      <div className="flex items-start gap-2 mt-3">
        <input
          type="checkbox"
          checked={uploadLater}
          onChange={() => {
            setUploadLater(!uploadLater);
            if (!uploadLater) setUploadedFile(null); // Clear file if choosing to upload later
          }}
        />
        <label className="text-sm text-gray-600 leading-snug cursor-pointer">
          I don’t have a file prepared. I will upload later.
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="superOutline"
          className="bg-[#777777] text-white"
          onClick={() => {
            setShowUploadModal(false);
            setUploadedFile(null);
            setUploadLater(false);
          }}
        >
          Cancel
        </Button>

        <Button
          variant="superOutline"
          className="bg-[#0c2a42] text-white"
          onClick={handleUpload}
          disabled={!uploadedFile && !uploadLater}
        >
          Upload
        </Button>
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

export default ViewDetailsQCPage;
