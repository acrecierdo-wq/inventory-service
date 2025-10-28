// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { CustomerHeader } from "@/components/header-customer";
// import Image from "next/image";

// type QuotationRequest = {
//   id: number;
//   status: "Pending" | "Approved" | "Cancelled" | "Processed" | "Accepted";
//   project_name: string;
// };

// const CustomerPage = () => {
//   const router = useRouter();
//   const [pendingCount, setPendingCount] = useState(0);
//   const [acceptedCount, setAcceptedCount] = useState(0);
//   const [cancelledCount, setCancelledCount] = useState(0);
//   const [approvedCount, setApprovedCount] = useState(0);

//   useEffect(() => {
//     const fetchRequests = async () => {
//       const res = await fetch("/api/customer/q_request");
//       const result = await res.json();

//       if (!res.ok) {
//         console.log("Failed to fetch requests", res.status);
//         return;
//       }

//       // Use the nested array
//       const requests: QuotationRequest[] = result.data ?? [];

//       setPendingCount(requests.filter((r) => r.status === "Pending").length);
//       setAcceptedCount(requests.filter((r) => r.status === "Accepted").length);
//       setCancelledCount(requests.filter((r) => r.status === "Cancelled").length);
//       setApprovedCount(requests.filter((r) => r.status === "Approved").length);

//     };

//     fetchRequests();
//   }, []);

//   const handleRedirect = (status: string) => {
//     router.push(`/customer/quotation_request?status=${status}`);
//   };

//   return (
    
//       <div className="bg-[#ffedce] min-h-screen w-full">
//         <CustomerHeader /> 

//         <div className="h-auto mt-2 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
//           <div className="mx-4 mt-2 mb-2 flex flex-row gap-4">

//             {/* Pending */}
//             <div
//               onClick={() => handleRedirect("Pending")}
//               className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#edf346] rounded-lg p-2 flex flex-col justify-center"
//             >
//               <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">
//                 Pending
//               </div>
//               <div className="flex items-center ml-1">
//                 <Image
//                   src="/square-list-svgrepo-com.svg"
//                   alt="icon"
//                   width={50}
//                   height={50}
//                   className="invert"
//                 />
//                 <div
//                   className="ml-[30px] text-white text-3xl font-bold"
//                   style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}
//                 >
//                   {pendingCount}
//                 </div>
//               </div>
//             </div>

//             {/* Accepted */}
//             <div
//               onClick={() => handleRedirect("Accepted")}
//               className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#7bb6f1] rounded-lg p-2 flex flex-col justify-center"
//             >
//               <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">
//                 Accepted
//               </div>
//               <div className="flex items-center ml-1">
//                 <Image
//                   src="/square-list-svgrepo-com.svg"
//                   alt="icon"
//                   width={50}
//                   height={50}
//                   className="invert"
//                 />
//                 <div className="ml-[30px] text-white text-3xl font-bold">
//                   {acceptedCount}
//                 </div>
//               </div>
//             </div>

//             {/* Cancelled */}
//             <div
//               onClick={() => handleRedirect("Cancelled")}
//               className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#f58071] rounded-lg p-2 flex flex-col justify-center"
//             >
//               <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">
//                 Cancelled
//               </div>
//               <div className="flex items-center ml-1">
//                 <Image
//                   src="/square-list-svgrepo-com.svg"
//                   alt="icon"
//                   width={50}
//                   height={50}
//                   className="invert"
//                 />
//                 <div className="ml-[30px] text-white text-3xl font-bold">
//                   {cancelledCount}
//                 </div>
//               </div>
//             </div>

//             {/* Approved */}
//             <div
//               onClick={() => handleRedirect("Approved")}
//               className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#83d5b7] rounded-lg p-2 flex flex-col justify-center"
//             >
//               <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">
//                 Approved
//               </div>
//               <div className="flex items-center ml-1">
//                 <Image
//                   src="/square-list-svgrepo-com.svg"
//                   alt="icon"
//                   width={50}
//                   height={50} 
//                   className="invert"
//                 />
//                 <div className="ml-[30px] text-white text-3xl font-bold">
//                   {approvedCount}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//   );
// };

// export default CustomerPage;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";

type QuotationRequest = {
  id: number;
  status: "Pending" | "Cancelled" | "Processed" | "Accepted";
  project_name: string;
};

const CustomerPage = () => {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  //const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await fetch("/api/customer/q_request");
      const result = await res.json();

      if (!res.ok) {
        console.log("Failed to fetch requests", res.status);
        return;
      }

      // Use the nested array
      const requests: QuotationRequest[] = result.data ?? [];

      setPendingCount(requests.filter((r) => r.status === "Pending").length);
      setAcceptedCount(requests.filter((r) => r.status === "Accepted").length);
      setCancelledCount(requests.filter((r) => r.status === "Cancelled").length);
      //setApprovedCount(requests.filter((r) => r.status === "Approved").length);

    };

    fetchRequests();
  }, []);

  const handleRedirect = (status: string) => {
    router.push(`/customer/quotation_request?status=${status}`);
  };

  return (
    
      <div className="bg-[#ffedce] min-h-screen w-full">
        <CustomerHeader /> 

        <div className="h-auto mt-2 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
          <div className="mx-4 mt-2 mb-2 flex flex-row gap-4">

            {/* Pending */}
            <div
              onClick={() => handleRedirect("Pending")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-white border-2 border-[#ffc400] rounded-lg p-4 flex flex-col justify-center"
            >
              <div className="text-[#ffc400] text-sm uppercase font-bold">
                Pending
              </div>
              <div className="flex items-center ml-1">
                <Image
                  src="/list-menu-svgrepo-com (1).png"
                  alt="icon"
                  width={40}
                  height={40}
                  className="mt-1"
                />
                <div
                  className="ml-[60px] text-[#ffc400] text-4xl font-bold"
                  //style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}
                >
                  {pendingCount}
                </div>
              </div>
            </div>

            {/* Accepted */}
            <div
              onClick={() => handleRedirect("Accepted")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-white border-2 border-[#7bb6f1] rounded-lg p-4 flex flex-col justify-center"
            >
              <div className="text-[#7bb6f1] text-sm uppercase font-bold ml-2">
                Accepted
              </div>
              <div className="flex items-center ml-1">
                <Image
                  src="/list-menu-svgrepo-com (3).png"
                  alt="icon"
                  width={40}
                  height={40}
                  className="mt-1"
                />
                <div className="ml-[60px] text-[#7bb6f1] text-3xl font-bold">
                  {acceptedCount}
                </div>
              </div>
            </div>

            {/* Cancelled */}
            <div
              onClick={() => handleRedirect("Cancelled")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-white border-2 border-[#f58071] rounded-lg p-4 flex flex-col justify-center"
            >
              <div className="text-[#f58071] text-sm uppercase font-bold ml-2">
                Cancelled
              </div>
              <div className="flex items-center ml-1">
                <Image
                  src="/list-menu-svgrepo-com.png"
                  alt="icon"
                  width={40}
                  height={40}
                  className="mt-1"
                />
                <div className="ml-[60px] text-[#f58071] text-3xl font-bold">
                  {cancelledCount}
                </div>
              </div>
            </div>

            {/* Approved */}
            {/* <div
              onClick={() => handleRedirect("Approved")}
              className="cursor-pointer w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-white border-2 border-[#83d5b7] rounded-lg p-4 flex flex-col justify-center"
            >
              <div className="text-[#83d5b7] text-sm uppercase font-bold ml-2">
                Approved
              </div>
              <div className="flex items-center ml-1">
                <Image
                  src="/list-menu-svgrepo-com (2).png"
                  alt="icon"
                  width={40}
                  height={40} 
                  className="mt-1"
                />
                <div className="ml-[60px] text-[#83d5b7] text-3xl font-bold">
                  {approvedCount}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
  );
};

export default CustomerPage;

