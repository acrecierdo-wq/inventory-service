import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const WarehousePendingPage = () => {
    return (
        <WarehousemanClientComponent>
        <div className="bg-[#ffedce] h-full w-full">

            {/* Header */}
            <Header />

            <div className="flex flex-row gap mt-2">
            {/* Supplier P.O. */}
            <div className="mt-10 pl-5 flex flex-row">
            <div className="inline-block bg-[#173f63] p-5 w-60 rounded"
                style={{ clipPath: "polygon(0 0, 0 1000%, 100% 100%, 75% 0%)"
                         }}
            >
            <span className="text-2xl text-white font-bold pl-5">
            Pick List
             </span>
            </div>
        <div className="h-9 w-70 mt-3 ml-140 rounded-3xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
        <Image
            src="/search-alt-2-svgrepo-com.svg"
            width={20}
            height={20}
            alt="Search"
            className="ml-5" 
        />
        </div>
        <div className="h-15 w-30 ml-4 rounded-2xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
        <Image
            src="/filter-svgrepo-com.svg"
            width={20}
            height={20}
            alt="Search"
            className="ml-5" 
        />
        <span className="ml-3 mt-4 text-[#482b0e] font-semibold">Filter</span>
        </div>
            </div>
            </div>

            {/* Consumbales Table */}
            <div className="mt-0 pl-5">
                <div className="h-100 w-310 bg-[#ededed] flex flex-col">
                    <div className="h-13 w-310 bg-[#ffffff] border-2">
                        <div className="flex flex-row mt-3">
                            <span className="text-[#777777] font-semibold ml-25 mr-2">P.O. NO.</span>
                            <span className="text-[#777777] font-semibold ml-30 mr-2">DATE RECEIVED</span>
                            <span className="text-[#777777] font-semibold ml-30 mr-">LINKED QUOTATION</span>
                            <span className="text-[#777777] font-semibold ml-30 mr-2">PURCHASE ORDER</span>
                            <span className="text-[#777777] font-semibold ml-30 mr-2">ACTION</span>
                        </div>
                    </div>
                    <div className="h-13 w-310 bg-[#fef4e4]">
                        <div className="flex flex-row ">
                            <span className="text-[#5a4632] ml-30 mr-2 mt-2">001</span>
                            <span className="text-[#5a4632] ml-35 mr-2 mt-2">04/10/2025</span>
                            <span className="text-[#5a4632] ml-50 mr-2 mt-2">001</span>
                            <div className="flex flex-row mt-2 ml-60">
                                <Image src="/file-pdf-svgrepo-com.svg" height={30} width={30} alt="edit"/>
                            </div>
                            <Link href="/warehouse/w_picklist/pending/progress">
                            <div className="mt-3">
                            <span className="text-[#5a4632] ml-43 pl-4 pr-4 pt-0 pb-0 border-[#d2bda7] border-b-4 bg-white rounded-3xl shadow-2xl cursor-pointer">
                             View
                            </span>
                            </div>
                            </Link>
                        </div>

                    </div>
                    <div className="h-13 w-310 bg-[#ffffff]"></div>
                    <div className="h-13 w-310 bg-[#fef4e4]"></div>
                    <div className="h-13 w-310 bg-[#ffffff]"></div>
                    <div className="h-13 w-310 bg-[#fef4e4]"></div>
                    <div className="h-13 w-310 bg-[#ffffff]"></div>
                    <div className="h-13 w-310 bg-[#fef4e4]"></div>
                    </div>
            </div>
            <div className="ml-250 mt-5 flex flex-row">
            <Button variant="primary" className="w-15 h-15 rounded-full bg-[#ffffff] hover:bg-yellow-500/30 border-[#d2bda7] border-b-4 active:border-b-8">
                
                <Image
                src="/arrow-prev-svgrepo-com.svg"
                width={50}
                height={50}
                alt="left"
                className="ml-0" 
            />
                
            </Button>
            <Button variant="primary" className="w-15 h-15 rounded-full bg-[#ffffff] hover:bg-yellow-500/30 border-[#d2bda7] border-b-4 active:border-b-8 ml-2">
                
                <Image
                src="/arrow-next-svgrepo-com.svg"
                width={50}
                height={50}
                alt="left"
                className="ml-0" 
            />
            </Button>
            <span className="text-[#482b0e] font-semibold text-2xl ml-5 mt-3">1 of 1</span>
            </div>
        </div>
        </WarehousemanClientComponent>
    );
};

export default WarehousePendingPage;