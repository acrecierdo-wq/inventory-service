import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TrackMyOrderPage = () => {
  const currentStatus = 3;
  const steps = ["Accepted", "Quotation", "Purchase Order", "Packed", "In Transit", "Delivered"];

  return (
    <CustomerClientComponent>
    <div className="bg-[#fed795] min-h-screen w-full">
      {/* Header */}
      <div className="border-2 shadow-md">
        <CustomerHeader />
      </div>

      {/* Gradient Card */}
      <div className="mt-10 ml-15">
        <div className="relative w-[1100px] h-[330px] rounded-lg bg-gradient-to-r from-[#f5cf8f] to-[#fff6f5] shadow-lg border-[8px] border-white px-10 py-6 overflow-hidden">

          {/* Background Icon */}
          <div className="absolute right-5 bottom-0 opacity-10 z-0">
            <Image
              src="/package-box-svgrepo-com.svg"
              alt="icon"
              className="w-[250px] h-[250px]"
            />
          </div>

          {/* Order ID Label */}
          <div className="mb-10 relative z-10">
            <span className="text-[#482b0e] text-xl font-bold uppercase">Request #001</span><br></br>
            <span className="text-[#482b0e] font-semibold">TYPE: Consumables</span>
          </div>

          {/* Progress Tracker */}
          <div className="flex items-center justify-between relative z-10 px-4">
            {steps.map((label, index) => {
              const isCompleted = index < currentStatus;
              const isLast = index === steps.length - 1;

              return (
                <div key={index} className="flex flex-col items-center relative w-full">
                  {/* Circle */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-[5px] border-white text-white font-bold ${
                        isCompleted ? "bg-[#2b9630]" : "bg-[#fef5e4]"
                      }`}
                    >
                      <Check size={40} />
                  </div>
                      {/* Connecting Line */}
                    {!isLast && (
                        <div className="pl-2">
                            <div className="absolute left-full top-1/2 w-full h-[15px] bg-white z-0 -translate-y-1/2 rounded-2xl" />
                        </div>
                    )}
                  </div>

                  {/* Label */}
                  <span className="mt-2 w-[100px] text-center text-sm text-[#482b0e] font-medium">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-13 relative z-10 ml-200">
            <Button variant="superOutline"
                    className="w-40 px-2 py-1 h-10 rounded-3xl shadow-lg">
                    <Link href="/customer/my_orders/track_my_order/view_details">
                    View Details</Link>
                   
                    </Button>
            </div>
        </div>
      </div>

      {/* Gradient Card */}
      <div className="mt-10 ml-15">
        <div className="relative w-[1100px] h-[330px] rounded-lg bg-gradient-to-r from-[#f5cf8f] to-[#fff6f5] shadow-lg border-[8px] border-white px-10 py-6 overflow-hidden">

          {/* Background Icon */}
          <div className="absolute right-5 bottom-0 opacity-10 z-0">
            <Image
              src="/package-box-svgrepo-com.svg"
              alt="icon"
              className="w-[250px] h-[250px]"
            />
          </div>

          {/* Order ID Label */}
          <div className="mb-10 relative z-10">
            <span className="text-[#482b0e] text-xl font-bold uppercase">Request #015</span><br></br>
            <span className="text-[#482b0e] font-semibold">TYPE: Services (METAL FABRICATION)</span>
          </div>

          {/* Progress Tracker */}
          <div className="flex items-center justify-between relative z-10 px-4">
            {steps.map((label, index) => {
              const isCompleted = index < currentStatus;
              const isLast = index === steps.length - 1;

              return (
                <div key={index} className="flex flex-col items-center relative w-full">
                  {/* Circle */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-[5px] border-white text-white font-bold ${
                        isCompleted ? "bg-[#2b9630]" : "bg-[#fef5e4]"
                      }`}
                    >
                      <Check size={40} />
                  </div>
                      {/* Connecting Line */}
                    {!isLast && (
                        <div className="pl-2">
                            <div className="absolute left-full top-1/2 w-full h-[15px] bg-white z-0 -translate-y-1/2 rounded-2xl" />
                        </div>
                    )}
                  </div>

                  {/* Label */}
                  <span className="mt-2 w-[100px] text-center text-sm text-[#482b0e] font-medium">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-13 relative z-10 ml-200">
            <Button variant="superOutline"
                    className="w-40 px-2 py-1 h-10 rounded-3xl shadow-lg">
                    <Link href="/customer/my_orders/track_my_order/view_details_nc">
                    View Details</Link>
                   
                    </Button>
            </div>
        </div>
      </div>
    </div>
    </CustomerClientComponent>
  );
};

export default TrackMyOrderPage;
