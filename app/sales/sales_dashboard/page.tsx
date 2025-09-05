import SalesClientComponent from "@/app/validate/sales_validate";
import { Header } from "@/components/header";
import Image from "next/image";

const SalesPage = () => {
    return (
        <SalesClientComponent>
        <div className="bg-[#ffedce] h-full w-full">
            <Header />
            <div className="h-40 flex flex-row border-slate-200 px-4 bg-[#fff6f5]">
            <div className="mt-6 flex flex-row gap-1">

                {/* Pending Section */}
                <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#0c2a42] ml-6 rounded-lg mt-3 p-1">
                {/* Top-left label */}
                    <div className="text-[#ffffff] text-sm uppercase font-bold ml-2">Pending</div>
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
                <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#173f63] ml-6 rounded-lg mt-3 p-1">
                {/* Top-left label */}
                    <div className="text-[#ffffff] text-sm uppercase font-bold ml-2">Received</div>

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
                    <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#f7d46c] ml-6 rounded-lg mt-3 p-1">
                {/* Top-left label */}
                    <div className="text-[#ffffff] text-sm uppercase font-bold ml-2">Acknowledged</div>
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
                <div className="w-[230px] h-[80px] shadow-2xl hover:shadow-xl transition-shadow duration-300 bg-[#f4bc43] ml-6 rounded-lg mt-3 p-1">
                {/* Top-left label */}
                    <div className="text-[#ffffff] text-sm uppercase font-bold ml-2">Processed</div>

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
        </SalesClientComponent>
    )
}
export default SalesPage;