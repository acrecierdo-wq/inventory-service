// // app/sales/s_customer_profile/s_customers/page.tsx

// import { Header } from "@/components/header";
// import Image from "next/image";
// import Link from "next/link";

// const SalesCustomerProfilePage = () => {
//     return (
//         <div className="bg-[#ffedce] h-full w-full">
//             <Header />

//         {/* Customer Profiles */}
//         <div className="flex flex-row justify-end mt-5 gap-4">
//         {/* <span className="uppercase text-4xl text-[#173f63] font-bold mt-5 ml-5">Customer Profiles</span> */}
        
        
//             {/* Search */}
//             <div className="flex flex-row gap-4">
//             <div className="h-8 w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row text-[#8a6f56] mt-1">
//               <Image
//                   src="/search-alt-2-svgrepo-com.svg"
//                   width={20}
//                   height={20}
//                   alt="Search"
//                   className="ml-5" 
//               />
//               <input
//               type="text"
//               placeholder="Search..."
//               className="ml-2 w-full bg-transparent outline-none"
//               //value={searchQuery}
//               //onChange={(e) => setSearchQuery(e.target.value)}
//             />
//               </div>
//             </div>

//             {/* Filter */}
//             <div className="flex flex-row gap-4">
//             <div>
//               <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                
//                 <Image
//                 src="/filter-svgrepo-com.svg"
//                 width={20}
//                 height={20}
//                 alt="filter"
//                 className="ml-0" 
//             />
//                 Filter
//             </div>
//             </div>
//             </div>

//             {/* Sort */}
//             <div className="flex flex-row gap-4 mr-10">
//             <div className="relative">
//               <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
                
//                 <Image
//                 src="/sort-ascending-fill-svgrepo-com.svg"
//                 width={20}
//                 height={20}
//                 alt="filter"
//                 className="ml-0" 
//             />
//                 Sort
//             </div>
//             </div>
//             </div>
//             </div>
                  
//             {/* Table */}
//             <div className="flex-1 overflow-y-auto px-10 mt-2">
//               <div className="bg-white rounded shadow-md mb-2">
//                 <div>
//                   <div className="bg-[#fcd0d0] grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
//                     <span>ID No.</span>
//                     <span>CUSTOMER NAME</span>
//                     <span>STATUS</span>
//                     <span>REQUEST</span>
//                     <span>ACTION</span>
//                   </div>
//                 </div>
//               <div>
//               <div className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center">
//                   <span>001</span>
//                   <span>Shopee</span>
//                   <span>Active</span>
//                   <span>001</span>
//           <span className="w-[100px] border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6]">
//             <Link href="/sales/s_customer_profile/s_customers/s_view_details">
//               <span className="text-sm font-semibold">View Details</span>
//             </Link>
//           </span>
              
//                         </div>
//                     </div>
//                     </div>
//             </div>
//         </div>
//     )
// }
// export default SalesCustomerProfilePage;

// app/sales/s_customer_profile/s_customers/page.tsx
"use client";

import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Customer {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  clientCode: string;
  address: string;
  status?: string; // optional if you have active/inactive
}

const SalesCustomerProfilePage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/sales/customer");
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="bg-[#ffedce] h-full w-full">
      <Header />

      {/* Search + Filter Bar */}
      <div className="flex flex-row justify-end mt-5 gap-4">
        {/* Search */}
        <div className="flex flex-row gap-4">
          <div className="h-8 w-70 rounded-3xl border-[#d2bda7] border-b-2 bg-white flex flex-row text-[#8a6f56] mt-1">
            <Image
              src="/search-alt-2-svgrepo-com.svg"
              width={20}
              height={20}
              alt="Search"
              className="ml-5"
            />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 w-full bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-row gap-4">
          <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
            <Image
              src="/filter-svgrepo-com.svg"
              width={20}
              height={20}
              alt="filter"
              className="ml-0"
            />
            Filter
          </div>
        </div>

        {/* Sort */}
        <div className="flex flex-row gap-4 mr-10">
          <div className="h-10 w-25 bg-white border-b-2 border-[#d2bda7] rounded-md flex items-center px-4 cursor-pointer hover:bg-[#f0d2ad] active:border-b-4">
            <Image
              src="/sort-ascending-fill-svgrepo-com.svg"
              width={20}
              height={20}
              alt="sort"
              className="ml-0"
            />
            Sort
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-10 mt-2">
        <div className="bg-white rounded shadow-md mb-2">
          {/* Table Header */}
          <div className="bg-[#fcd0d0] grid grid-cols-[0.5fr_2fr_2fr_2fr_0.5fr] gap-4 px-5 py-3 text-[#5a4632] font-semibold border-b border-[#d2bda7] text-center">
            <span>ID No.</span>
            <span>COMPANY NAME</span>
            <span>CONTACT PERSON</span>
            <span>POSITION</span>
            <span>ACTION</span>
          </div>

          {/* Table Rows */}
          {loading ? (
            <div className="text-center py-5 text-gray-500">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-5 text-gray-500">No customers found.</div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-[0.5fr_2fr_2fr_2fr_0.5fr] gap-4 px-5 py-2 bg-white border-b border-gray-200 text-[#1e1d1c] text-center"
              >
                <span>{customer.id}</span>
                <span>{customer.companyName}</span>
                <span>{customer.contactPerson}</span>
                <span>{customer.email}</span>
                <span className="w-[100px] border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6]">
                  <Link
                    href={`/sales/s_customer_profile/s_customers/s_view_details/${customer.id}`}
                  >
                    <span className="text-sm font-semibold">View Details</span>
                  </Link>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesCustomerProfilePage;
