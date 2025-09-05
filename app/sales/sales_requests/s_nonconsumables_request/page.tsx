import SalesClientComponent from "@/app/validate/sales_validate";
import { Header } from "@/components/header";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";

const SalesNonConsumablesRequestPage = () => {
    return (
        <SalesClientComponent>
        <div className="bg-[#ffedce] h-full w-full">

            {/* Header */}
            <Header />
            <div className="flex flex-row gap mt-2">
            {/* Non-Consumbales */}
            <div className="mt-10 pl-2 flex flex-row">
            <div
    className="inline-block bg-[#173f63] p-5 w-80 rounded"
    style={{
      clipPath: "polygon(0 0, 0 1000%, 100% 100%, 75% 0%)"
    }}
  >
    <span className="text-2xl text-white font-bold pl-2">
      Non-consumables
    </span>
  </div>
        <div className="h-9 w-70 mt-3 ml-85 rounded-3xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
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
        <div className="h-15 w-30 ml-4 rounded-2xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
        <Image
            src="/sort-ascending-fill-svgrepo-com.svg"
            width={20}
            height={20}
            alt="Search"
            className="ml-5" 
        />
        <span className="ml-3 mt-4 text-[#482b0e] font-semibold">Sort</span>
        </div>
            </div>
            </div>

            {/* Consumbales Table */}
            
            <div className="mt-0 pl-2">
                <div className="h-100 w-310 bg-[#ededed] flex flex-col">
                    <div className="h-13 w-310 bg-[#ffffff] border-2">
                        <div className="flex flex-row mt-3">
                            <span className="text-[#5a4632] font-semibold ml-8 mr-20">REQUEST NO.</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-20">DATE | TIME CREATED</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-20">DATE | TIME RECEIVED</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-20">CUSTOMER NAME</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-20">STATUS</span>
                            <span className="text-[#5a4632] font-semibold ml-4">ACTIONS</span>
                        </div>
                    </div>
                    <div className="h-13 w-310 bg-[#fef4e4]">
                        <div className="flex flex-row ">
                            <span className="text-[#5a4632] ml-14 mr-30 mt-3">001</span>
                            <span className="text-[#5a4632] ml-8 mr-18 mt-3">04/10/2025 10:00 AM</span>
                            <span className="text-[#5a4632] ml-8 mr-25 mt-3">04/10/2025 10:00 AM</span>
                            <span className="text-[#1e1d1c] ml-8 mr-24 mt-3">Shopee</span>
                            <div className="mt-3">
                            <span className="text-[#ffffff] pl-4 pr-4 pt-1 pb-1 ml-8 mr-9 bg-[#173f63] rounded-3xl mt-1">Pending</span>
                            </div>
                            
                            <div className="mt-2 ml-5">
          <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
            <Link href="/sales/sales_requests/s_nonconsumables_request/rnc">
              <div className="text-sm font-semibold">View Details</div>
            </Link>
          </button>
        </div>
                            
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
            <div className="ml-250 mt-5">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious className="rounded-full border-[#d2bda7] border-b-4 bg-white hover:bg-yellow-500/30" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive className="text-[#482b0e] font-semibold border-[#d2bda7] border-b-4 bg-white hover:bg-yellow-500/30">
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext className="rounded-full border-[#d2bda7] border-b-4 bg-white hover:bg-yellow-500/30" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
            </div>
        </SalesClientComponent>
    );
};
export default SalesNonConsumablesRequestPage;