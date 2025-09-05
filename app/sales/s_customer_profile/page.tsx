import SalesClientComponent from "@/app/validate/sales_validate";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const SalesCustomerProfilePage = () => {
    return (
        <SalesClientComponent>
        <div className="bg-[#ffedce] h-full w-full">
            <Header />

        {/* Customer Profiles */}
        <div className="flex flex-row gap mt-5">
        <span className="uppercase text-4xl text-[#173f63] font-bold mt-5 ml-5">Customer Profiles</span>
        </div>
        
            {/* Search */}
            <div className="flex flex-row gap mt-0">
            <div className="h-9 w-70 ml-170 mt-3 rounded-3xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
                    <Image
                        src="/search-alt-2-svgrepo-com.svg"
                        width={20}
                        height={20}
                        alt="Search"
                        className="ml-5" 
                    />
                    </div>
            {/* Filter */}
            <div className="ml-2 mt-1">
            <Button variant="primary" className="h-15 w-30 rounded-2xl bg-[#ffffff] hover:bg-yellow-500/30 border-[#d2bda7] border-b-4 active:border-b-8 text-[#482b0e] text-semibold">
                
                <Image
                src="/filter-svgrepo-com.svg"
                width={20}
                height={20}
                alt="filter"
                className="ml-0" 
            />
                Filter
            </Button>
            </div>
            {/* Sort */}
            <div className="ml-2 mt-1">
            <Button variant="primary" className="h-15 w-30 rounded-2xl bg-[#ffffff] hover:bg-yellow-500/30 border-[#d2bda7] border-b-4 active:border-b-8 text-[#482b0e] text-semibold">
                
                <Image
                src="/sort-ascending-fill-svgrepo-com.svg"
                width={20}
                height={20}
                alt="filter"
                className="ml-0" 
            />
                Sort
            </Button>
            </div>
                    
                    </div>
                    {/* Consumbales Table */}
            <div className="mt-4 pl-5">
                <div className="h-100 w-310 bg-[#ededed] flex flex-col">
                    <div className="h-13 w-310 bg-[#ffffff] border-2">
                        <div className="flex flex-row mt-3">
                            <span className="text-[#5a4632] font-semibold ml-10 mr-37">ID No.</span>
                            <span className="text-[#5a4632] font-semibold ml-10 mr-37">CUSTOMER NAME</span>
                            <span className="text-[#5a4632] font-semibold ml-10 mr-37">STATUS</span>
                            <span className="text-[#5a4632] font-semibold ml-10 mr-37">REQUEST</span>
                            <span className="text-[#5a4632] font-semibold ml-10">ACTION</span>
                        </div>
                    </div>
                    <div className="h-13 w-310 bg-[#fef4e4]">
                        <div className="flex flex-row ">
                            <span className="text-[#5a4632] ml-10 mr-35 mt-3">001</span>
                            <span className="text-[#5a4632] ml-25 mr-36 mt-3">Shopee</span>
                            <div className="mt-3">
                            <span className="text-[#ffffff] ml-19 mr-37 pl-6 pr-6 pt-1 pb-1 bg-[#2b9630] rounded-3xl mt-1">Active</span>
                            </div>
                            <span className="text-[#5a4632] ml-10 mr-37 mt-3">001</span>
                            <div className="mt-2 ml-10">
          <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
            <Link href="/sales/s_customer_profile/s_customers">
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
            <div className="ml-250 mt-5 flex flex-row">
            <Button variant="primary" className="w-15 h-15 rounded-full bg-[#ffffff] hover:bg-yellow-500/30 border-[#d2bda7] border-b-4 active:border-b-8">
                
                <Image
                src="/send-alt-3-svgrepo-com.svg"
                width={50}
                height={50}
                alt="left"
                className="ml-0" 
            />
                
            </Button>
            <Button variant="primary" className="w-15 h-15 rounded-full bg-[#ffffff] hover:bg-yellow-500/30 border-[#d2bda7] border-b-4 active:border-b-8 ml-2">
                
                <Image
                src="/send-alt-2-svgrepo-com.svg"
                width={50}
                height={50}
                alt="left"
                className="ml-0" 
            />
            </Button>
            <span className="text-[#482b0e] font-semibold text-2xl ml-5 mt-3">1 of 1</span>
            </div>
        </div>
        </SalesClientComponent>
    )
}
export default SalesCustomerProfilePage;