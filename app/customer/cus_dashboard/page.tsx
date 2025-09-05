"use client"

import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";

const CustomerPage = () => {
    return (
        <CustomerClientComponent>
        <div className="bg-[#fed795] h-full w-full">
            <CustomerHeader />
            <div className="h-30 mt-2 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
            <div className="mx-4 mt-2 flex flex-row gap-2">

                {/* Pending Section */}
                <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#feefc7] ml-6 rounded-lg mt-3 p-1">
                {/* Top-left label */}
                    <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">Pending</div>
                {/* Icon and Number */}
                     <div className="flex items-center ml-1">
                {/* Icon */}
                    <Image
                        src="/square-list-svgrepo-com.svg"
                        alt="icon"
                        className="w-[50px] h-[50px] mr-2 invert"
                    />
                {/* Number */}
                    <div className="ml-30 text-[#ffffff] text-5xl font-bold"
                        style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)' }}>1</div>
                    </div>
                </div>
                {/* Received Section */}
                <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#fde68a] ml-6 rounded-lg mt-3 p-1">
                {/* Top-left label */}
                    <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">Received</div>

                {/* Icon and Number */}
                     <div className="flex items-center ml-1">
                {/* Icon */}
                    <Image
                        src="/square-list-svgrepo-com.svg"
                        alt="icon"
                        className="w-[50px] h-[50px] mr-2 invert"
                    />
                {/* Number */}
                    <div className="ml-30 text-[#ffffff] text-5xl font-bold"
                        style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)' }}>4</div>
                    </div>
                </div>

                {/* Acknowledged Section */}
                    <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#fcd34d] ml-6 rounded-lg mt-3 p-1">
                {/* Top-left label */}
                    <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">Acknowledged</div>
                {/* Icon and Number */}
                     <div className="flex items-center ml-1">
                {/* Icon */}
                    <Image
                        src="/square-list-svgrepo-com.svg"
                        alt="icon"
                        className="w-[50px] h-[50px] mr-2 invert"
                    />
                {/* Number */}
                    <div className="ml-30 text-[#ffffff] text-5xl font-bold"
                        style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)' }}>2</div>
                    </div>
                </div>

                {/* Processed Section */}
                <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#ffc922] ml-6 rounded-lg mt-3 p-1">
                {/* Top-left label */}
                    <div className="text-[#5a4632] text-sm uppercase font-bold ml-2">Processed</div>

                {/* Icon and Number */}
                     <div className="flex items-center ml-1">
                {/* Icon */}
                    <Image
                        src="/square-list-svgrepo-com.svg"
                        alt="icon"
                        className="w-[50px] h-[50px] mr-2 invert"
                    />

                {/* Number */}
                    <div className="ml-30 text-[#ffffff] text-5xl font-bold"
                        style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)' }}>3</div>
                    </div>
                </div>
            </div>
        </div>
        </div>
        </CustomerClientComponent>
    )
}
export default CustomerPage;