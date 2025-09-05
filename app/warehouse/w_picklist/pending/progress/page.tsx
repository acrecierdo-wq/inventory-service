import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";
import { Check } from "lucide-react";
import Image from "next/image";

const WarehousePendingPage = () => {
  const currentStatus = 1;
  const steps = ["Pending", "Out for Delivery", "Order Delivered", "Processed"];

  return (
    <WarehousemanClientComponent>
    <div className="bg-[#fdf3e3] min-h-screen w-full">
      {/* Header */}
      <div className="border-2 shadow-md">
        <Header />
      </div>

      {/* Gradient Card */}
      <div className="mt-10 ml-22">
        <div className="relative w-[1100px] h-[300px] rounded-lg bg-gradient-to-r from-[#0c2a42] to-[#476886] shadow-lg border-[8px] border-white px-10 py-6 overflow-hidden">

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
            <span className="text-[#ffffff] text-2xl font-semibold">Pick List: #001</span>
          </div>

          {/* Progress Tracker */}
          <div className="flex items-center justify-between relative z-10 px-10">
            {steps.map((label, index) => {
              const isCompleted = index < currentStatus;
              const isLast = index === steps.length - 5;

              return (
                <div key={index} className="flex flex-row items-center relative w-full">
                  {/* Circle */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-[5px] border-white text-white font-bold ${
                        isCompleted ? "bg-[#2b9630]" : "bg-[#839bb1]"
                      }`}
                    >
                      <Check size={40} />
                  </div>
                      {/* Connecting Line */}
                    {!isLast && (
                        <div className="pl-10">
                            <div className="absolute left-full top-1/2 w-full h-[15px] bg-white z-0 -translate-y-1/2 rounded-2xl" />
                        </div>
                    )}
                  </div>

                  {/* Label */}
                  <span className="mt-20 w-[100px] text-center text-sm text-[#ffffff] font-medium">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </WarehousemanClientComponent>
  );
};

export default WarehousePendingPage;
