// app/customer/p&s/non-consumables/page.tsx

"use client";

import { CustomerHeader } from "@/components/header-customer"
import { Button } from "@/components/ui/button";
import Image from "next/image"
import Link from "next/link";

const CustomerNonConsumablesPage = () => {
    return (
        <div className="relative h-screen w-full">
              {/* Background Image */}
              <Image
                src="/customer_p&s(1).jpg"
                fill
                alt="background"
                className="object-cover z-0"
              />
        
              <div className="shadow-md">
                <CustomerHeader />
              </div>
        
              {/* Overlay Text */}
              <div className="absolute top-32 left-10 z-10 text-[#173f63] text-4xl font-bold">
                Non-Consumables
              </div>
        
              
              <div className="mx-10 mt-30 flex flex-row gap-9 relative z-10">
              
              <div className="w-[1190px] h-[300px] rounded-4xl overflow-hidden border-[#d0a521] border-b-4 flex">
            {/* Left Side - 60% Yellow */}
                <div className="w-[30%] bg-[#ffc922] flex flex-col gap-2 pl-5 py-10">
                    
            {/* Add more stuff here if you want */}
                </div>

            {/* Right Side - 40% White */}
                <div className="w-[70%] bg-white flex flex-col gap-2 pl-5 py-10">
                    <span className="text-[#482b0e] text-2xl font-bold">Metal Fabrication</span>
                    <span className="text-[#482b0e] text-lg font-medium">Stalker</span>
                    <div className="pl-140 py-30">
                        <Button variant="superOutline"
                    className="w-40 px-2 py-1">
                    <Link href="/customer/p&s/non-consumables/mf">
                    View Details</Link>
                   
                    </Button></div>
                </div>
            </div>

                </div>
        </div>
    );
};
export default CustomerNonConsumablesPage;