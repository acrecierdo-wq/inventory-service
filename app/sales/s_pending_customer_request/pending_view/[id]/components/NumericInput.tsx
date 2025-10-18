// // app/sales/s_pending_customer_request/pending_view/[id]/components/NumericInput.tsx

// import { toast } from "sonner";

// type NumericInputProps = {
//   label: string;
//   value: number | "";
//   setValue: (val: string) => void;
//   max: number;
//   required?: boolean;
//   allowDecimal?: boolean;
//   disabled?: boolean;
// };

// const sanitizeToDigits = (input: string, allowDecimal: boolean) => {
//   const pattern = allowDecimal ? /[^0-9.]/g : /\D+/g;
//   let cleaned = input.replace(pattern, "");

//   // prevent multiple decimals
//   const parts = cleaned.split(".");
//   if (parts.length > 2) cleaned = parts[0] + "." + parts[1];

//   // prevent leading zeros like "0123" (but allow "0.x")
//   if (!allowDecimal && cleaned.length > 1 && cleaned.startsWith("0")) {
//     cleaned = cleaned.replace(/^0+/, "");
//   } else if (allowDecimal && cleaned.startsWith("0") && !cleaned.startsWith("0.")) {
//     cleaned = cleaned.replace(/^0+/, "");
//   }

//   // avoid starting with just "."
//   if (cleaned === ".") cleaned = "0.";

//   return cleaned;
// };

// export function NumericInput({
//   label,
//   value,
//   setValue,
//   max,
//   required = false,
//   allowDecimal = false,
//   disabled = false,
// }: NumericInputProps) {
//   // ✅ value = "" means blank field, no 0 shown
//   const stringValue =
//     value === null || value === undefined || value === 0
//       ? ""
//       : String(value);

//   const handleChange = (val: string) => {
//     let sanitized = sanitizeToDigits(val, allowDecimal);

//     if (sanitized === "") {
//       setValue("");
//       return;
//     }

//     const numericValue = parseFloat(sanitized);

//     if (!Number.isNaN(numericValue) && numericValue > max) {
//       sanitized = String(max);
//       toast.error(`${label} cannot exceed ${max}`, { duration: 2000 });
//     }

//     setValue(sanitized);
//   };

//   return (
//     <div className="flex flex-col">
//       <label className="text-sm font-medium mb-1 text-[#880c0c]">{label}</label>
//       <input
//         type="text"
//         inputMode={allowDecimal ? "decimal" : "numeric"}
//         pattern={allowDecimal ? "[0-9]*[.]?[0-9]*" : "[0-9]*"}
//         value={stringValue}
//         disabled={disabled}
//         onKeyDown={(e) => {
//           if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
//           if (!allowDecimal && e.key === ".") e.preventDefault();
//         }}
//         onPaste={(e) => {
//           e.preventDefault();
//           handleChange(e.clipboardData.getData("text"));
//         }}
//         onChange={(e) => handleChange(e.target.value)}
//         className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100 ${
//           required && stringValue === ""
//             ? "border-red-500"
//             : stringValue
//             ? "border-green-500"
//             : "border-[#d2bda7]"
//         }`}
//       />
//       {required && stringValue === "" && (
//         <p className="text-red-600 text-sm mt-1">Required</p>
//       )}
//     </div>
//   );
// }

// app/sales/s_pending_customer_request/pending_view/[id]/components/NumericInput.tsx

import { toast } from "sonner";

type NumericInputProps = {
  label: string;
  value: number | "";
  setValue: (val: string) => void;
  max: number;
  required?: boolean;
  allowDecimal?: boolean;
  disabled?: boolean;
  showError?: boolean;
};

const sanitizeToDigits = (input: string, allowDecimal: boolean) => {
  const pattern = allowDecimal ? /[^0-9.]/g : /\D+/g;
  let cleaned = input.replace(pattern, "");

  // prevent multiple decimals
  const parts = cleaned.split(".");
  if (parts.length > 2) cleaned = parts[0] + "." + parts[1];

  // prevent leading zeros like "0123" (but allow "0.x")
  if (!allowDecimal && cleaned.length > 1 && cleaned.startsWith("0")) {
    cleaned = cleaned.replace(/^0+/, "");
  } else if (allowDecimal && cleaned.startsWith("0") && !cleaned.startsWith("0.")) {
    cleaned = cleaned.replace(/^0+/, "");
  }

  // avoid starting with just "."
  if (cleaned === ".") cleaned = "0.";

  return cleaned;
};

export function NumericInput({
  label,
  value,
  setValue,
  max,
  required = false,
  allowDecimal = false,
  disabled = false,
  showError = false,
}: NumericInputProps) {
  // ✅ value = "" means blank field, no 0 shown
  const stringValue =
    value === null || value === undefined || String(value) === "0"
      ? ""
      : String(value);

  const handleChange = (val: string) => {
    let sanitized = sanitizeToDigits(val, allowDecimal);

    if (sanitized === "") {
      setValue("");
      return;
    }

    const numericValue = parseFloat(sanitized);

    if (!Number.isNaN(numericValue) && numericValue > max) {
      sanitized = String(max);
      toast.error(`${label} cannot exceed ${max}`, { duration: 2000 });
    }

    setValue(sanitized);
  };
  
  const hasError = required && showError && stringValue === "";

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1 text-[#880c0c]">{label}<span className="text-red-400"> *</span></label>
      <input
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        pattern={allowDecimal ? "[0-9]*[.]?[0-9]*" : "[0-9]*"}
        value={stringValue}
        disabled={disabled}
        onKeyDown={(e) => {
          if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
          if (!allowDecimal && e.key === ".") e.preventDefault();
        }}
        onPaste={(e) => {
          e.preventDefault();
          handleChange(e.clipboardData.getData("text"));
        }}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100 ${
          hasError
            ? "border-red-500"
            : stringValue
            ? "border-green-500"
            : "border-[#d2bda7]"
        }`}
      />
      {hasError && (
        <p className="text-red-600 text-xs mt-1 italic">Required</p>
      )}
    </div>
  );
}

// // app/sales/s_customer_profile/s_customers/s_view_details/page.tsx

// "use client";

// import { useState } from "react";
// import { Header } from "@/components/header";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import SalesClientComponent from "@/app/validate/sales_validate";

// const SalesViewDetailsCPage = () => {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedPO, setSelectedPO] = useState<any>(null);
//   const [newStatus, setNewStatus] = useState("");
//   const [poData, setPoData] = useState([
//     { id: "PO001", date: "04/19/2025", supplier: "XYZ Traders", type: "Consumables", status: "Processing" },
//   ]);

//   const [requestData] = useState([
//     { id: "REQ001", date: "04/15/2025", type: "Consumables", status: "Pending" },
//   ]);

//   const [quotationData] = useState([
//     { id: "QT001", date: "04/16/2025", type: "Consumables", request: "REQ001", status: "Sent" },
//   ]);

//   const router = useRouter();

//   const getStatusClass = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "sent":
//         return "bg-[#777777]";
//       case "pending":
//         return "bg-[#173f63]";
//       case "completed":
//         return "bg-green-600";
//       case "in progress":
//         return "bg-[#ffc922]";
//       case "accepted":
//         return "bg-green-600";
//       case "delivered":
//         return "bg-green-600";
//       case "processing":
//         return "bg-[#173f63]";
//       default:
//         return "bg-gray-400";
//     }
//   };

//   const handleDotClick = (po: any) => {
//     setSelectedPO(po);
//     setNewStatus(po.status);
//     setModalOpen(true);
//   };

//   const handleStatusChange = () => {
//     setPoData((prev) =>
//       prev.map((po) => (po.id === selectedPO.id ? { ...po, status: newStatus } : po))
//     );
//     setModalOpen(false);
//   };

//   return (
//     <SalesClientComponent>
//       <div className="h-full w-full bg-[#fed795] pb-10">
//         <Header />

//         <div className="mt-6 px-5 space-y-12">
//           {/* Requests Section */}
//           <div className="w-full max-w-[90rem]">
//             <div className="bg-[#173f63] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md">
//               Request
//             </div>
//             <div className="bg-white shadow-md rounded-b overflow-hidden">
//               <div className="bg-white flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
//                 <div className="basis-1/6">Request ID</div>
//                 <div className="basis-1/5">Date Created</div>
//                 <div className="basis-1/4">Type of Request</div>
//                 <div className="basis-1/5">Status</div>
//                 <div className="basis-1/5">Actions</div>
//               </div>
//               {requestData.map((req, index) => (
//                 <div
//                   key={req.id}
//                   className={`flex items-center text-[#5a4632] py-3 px-6 ${
//                     index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
//                   }`}
//                 >
//                   <div className="basis-1/6">{req.id}</div>
//                   <div className="basis-1/5">{req.date}</div>
//                   <div className="basis-1/4">{req.type}</div>
//                   <div className="basis-1/5">
//                     <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(req.status)}`}>
//                       {req.status}
//                     </span>
//                   </div>
//                   <div className="basis-1/5">
//                     <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
//                       <Link
//                         href={
//                           req.type === "Consumables"
//                             ? "/sales/s_customer_profile/s_customers/s_view_details_c/r/"
//                             : "/customer/my_orders/order_history/requests/nonconsumables/"
//                         }
//                       >
//                         <div className="text-sm font-semibold">View Details</div>
//                       </Link>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Quotation Section */}
//           <div className="w-full max-w-[90rem]">
//             <div className="bg-[#173f63] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md">
//               Quotation
//             </div>
//             <div className="bg-white shadow-md rounded-b overflow-hidden">
//               <div className="bg-white flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
//                 <div className="basis-1/6">Quotation No.</div>
//                 <div className="basis-1/5">Date|Time Created</div>
//                 <div className="basis-1/5">Date|Time Received</div>
//                 <div className="basis-1/5">Type</div>
//                 <div className="basis-1/5">Linked Request</div>
//                 <div className="basis-1/6">Status</div>
//                 <div className="basis-1/6">Action</div>
//               </div>
//               {quotationData.map((q, index) => (
//                 <div
//                   key={q.id}
//                   className={`flex items-center text-[#5a4632] py-3 px-6 ${
//                     index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
//                   }`}
//                 >
//                   <div className="basis-1/6">{q.id}</div>
//                   <div className="basis-1/5">{q.date}</div>
//                   <div className="basis-1/5">04/13/2025 2:10 PM</div>
//                   <div className="basis-1/5">{q.type}</div>
//                   <div className="basis-1/5">{q.request}</div>
//                   <div className="basis-1/6">
//                     <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(q.status)}`}>
//                       {q.status}
//                     </span>
//                   </div>
//                   <div className="basis-1/6">
//                     <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
//                       <Link
//                         href={
//                           q.type === "Consumables"
//                             ? "/sales/s_customer_profile/s_customers/s_view_details_c/q/"
//                             : "/customer/my_orders/order_history/quotation/nonconsumables/"
//                         }
//                       >
//                         <div className="text-sm font-semibold">View Details</div>
//                       </Link>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Purchase Order Section */}
//           <div className="w-full max-w-[90rem] mx-auto">
//             <div className="bg-[#173f63] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md">
//               Purchase Order
//             </div>
//             <div className="bg-white shadow-md rounded-b overflow-hidden">
//               <div className="bg-white flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
//                 <div className="basis-[10%]">P.O. No.</div>
//                 <div className="basis-[15%]">Date | Time Created</div>
//                 <div className="basis-[15%]">Date | Time Received</div>
//                 <div className="basis-[15%]">Type</div>
//                 <div className="basis-[15%]">Linked Quotation</div>
//                 <div className="basis-[10%]">Status</div>
//                 <div className="basis-[10%]">File</div>
//                 <div className="basis-[10%]">Action</div>
//               </div>

//               {poData.map((po, index) => (
//                 <div
//                   key={po.id}
//                   className={`flex items-center text-[#5a4632] text-sm py-3 px-6 ${
//                     index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
//                   }`}
//                 >
//                   <div className="basis-[10%]">{po.id}</div>
//                   <div className="basis-[15%]">{po.date}</div>
//                   <div className="basis-[15%]">04/14/2025 3:45 PM</div>
//                   <div className="basis-[15%]">{po.type}</div>
//                   <div className="basis-[15%]">QT001</div>
//                   <div className="basis-[10%]">
//                     <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(po.status)}`}>
//                       {po.status}
//                     </span>
//                   </div>
//                   <div className="basis-[10%]">
//                     <a
//                       href="/customer_c_po.pdf"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       <Image
//                         src="/file-pdf-svgrepo-com.svg"
//                         width={24}
//                         height={24}
//                         alt="View PO"
//                         className="cursor-pointer"
//                       />
//                     </a>
//                   </div>
//                   <div className="basis-[10%] flex justify-center">
//                     <Image
//                       src="/dots-vertical-rounded-svgrepo-com.svg"
//                       width={24}
//                       height={24}
//                       alt="Actions"
//                       className="cursor-pointer"
//                       onClick={() => handleDotClick(po)}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Modal */}
//         {modalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//             <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
//               <h2 className="text-lg font-semibold mb-4">Update PO Status</h2>
//               <div className="mb-4">
//                 <label className="block mb-2 text-sm font-medium">Select New Status:</label>
//                 <select
//                   className="w-full border border-gray-300 rounded px-3 py-2"
//                   value={newStatus}
//                   onChange={(e) => setNewStatus(e.target.value)}
//                 >
//                   <option value="Pending">Pending</option>
//                   <option value="Processing">Processing</option>
//                   <option value="Delivered">Delivered</option>
//                   <option value="Completed">Completed</option>
//                 </select>
//               </div>
//               <div className="flex justify-end gap-3">
//                 <button
//                   className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400"
//                   onClick={() => setModalOpen(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 text-sm bg-[#173f63] text-white rounded hover:bg-[#1b4b7f]"
//                   onClick={handleStatusChange}
//                 >
//                   Confirm
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Back Button */}
//         <div className="px-5 pt-4">
//           <button
//             onClick={() => router.push("/sales/s_customer_profile/s_customers")}
//             className="text-sm px-4 py-2 bg-white border border-[#d2bda7] text-[#5a4632] rounded-3xl shadow hover:bg-[#ffe9b6] transition-all"
//           >
//             Back to Customers
//           </button>
//         </div>
//       </div>
//     </SalesClientComponent>
//   );
// };

// export default SalesViewDetailsCPage;