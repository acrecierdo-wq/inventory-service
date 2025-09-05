import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";

const WarehouseInventoryAuditPage = () => {
    return (
        <WarehousemanClientComponent>
        <div className="h-full w-full bg-[#ffedce]">
            {/* Header */}
                        <Header />
                        {/* Add Item */}
                        <div className="pl-267 mt-2 flex flex-row">
                        <Button variant="primaryOutline" className="bg-[#173f63] text-white">
                            Print Report
                            <Image
                            src="/report-data-svgrepo-com.svg"
                            width={20}
                            height={20}
                            alt="Add"
                            className="ml-0 invert" 
                        />
                        </Button>
                        </div>
                        <div className="flex flex-row">
                        {/* Consumbales */}
                        <div className="mt-3 pl-5 flex flex-row">
                        
                        <span className="text-3xl text-[#173f63] font-bold">
                        INVENTORY AUDIT REPORT
                         </span>
                        
                        
                    <div className="h-9 w-70 mt-2 ml-30 rounded-3xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
                    <Image
                        src="/search-alt-2-svgrepo-com.svg"
                        width={20}
                        height={20}
                        alt="Search"
                        className="ml-5" 
                    />
                    </div>
                    <div className="h-13 w-37 ml-2 rounded-2xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
                    <Image
                        src="/select-category-svgrepo-com.svg"
                        width={20}
                        height={20}
                        alt="Search"
                        className="ml-5" 
                    />
                    <span className="ml-3 mt-3 text-[#482b0e] font-semibold">Categories</span>
                    </div>
                    <div className="h-13 w-30 ml-2 rounded-2xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
                    <Image
                        src="/filter-svgrepo-com.svg"
                        width={20}
                        height={20}
                        alt="Search"
                        className="ml-5" 
                    />
                    <span className="ml-3 mt-3 text-[#482b0e] font-semibold">Filter</span>
                    </div>
                    <div className="h-13 w-30 ml-2 rounded-2xl border-[#d2bda7] border-b-4 bg-white flex flex-row">
                    <Image
                        src="/sort-ascending-fill-svgrepo-com.svg"
                        width={20}
                        height={20}
                        alt="Search"
                        className="ml-5" 
                    />
                    <span className="ml-3 mt-3 text-[#482b0e] font-semibold">Sort</span>
                    </div>
                        </div>
                        </div>
            
                        {/* Inventory Table */}
                        <div className="h-115 w-300 bg-[#fffcf6] ml-10 mt-2">
                        {/* Inventory Table */}
                        <div className="mt-0 pl-5">
                
                        <div className="flex flex-row">
                            <span className="text-[#5a4632] font-semibold ml-26 mr-15 mt-4">ID NO.</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-15 mt-4">ITEM NAME</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-15 mt-4">CATEGORY</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-15 mt-4">COLOR</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-15 mt-4">UNIT PRICE</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mr-15 mt-4">STOCKS</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mt-4 mr-15">STATUS</span>
                            <span className="text-[#5a4632] font-semibold ml-4 mt-4">ACTION</span>
                        </div>
                    
                    <div className="h-13 w-290 bg-[#ffffff] mt-3 rounded border-[2px]">
                        <div className="flex flex-row ">
                            <div className="mt-0 ml-3 rounded h-12 w-12 bg-[#173f63]">
                                <Image src="/duct_tape.jpg" height={30} width={40} className="mt-1 ml-1" alt="pic"/>
                            </div>
                            <span className="text-[#1e1d1c] ml-10 mr-2 mt-3">100-0A</span>
                            <span className="text-[#1e1d1c] ml-19 mr-2 mt-3">Duct Tape</span>
                            <span className="text-[#1e1d1c] ml-25 mr-2 mt-3">Tape</span>
                            <span className="text-[#1e1d1c] ml-25 mr-2 mt-3">Black</span>
                            <span className="text-[#1e1d1c] ml-25 mr-2 mt-3">60.00</span>
                            <span className="text-[#1e1d1c] ml-27 mr-2 mt-3">10</span>
                            <div className="mt-3">
                            <span className="text-[#ffffff] pl-4 pr-4 pt-1 pb-1 ml-18 mr-2 bg-[#a72227] rounded-3xl mt-1">Low Stock</span>
                            </div>
                            <Link href="/">
                            <div className="mt-3 ml-13">
                            <Image src="/dots-vertical-rounded-svgrepo-com.svg" height={30} width={30} alt="action"/>
                            </div>
                            </Link>
                        </div>
                    </div>
                    <div className="h-13 w-290  mt-1 rounded border-[2px] bg-[#ffffff]"></div>
                    <div className="h-13 w-290  mt-1 rounded border-[2px] bg-[#ffffff]"></div>
                    <div className="h-13 w-290  mt-1 rounded border-[2px] bg-[#ffffff]"></div>
                    <div className="h-13 w-290  mt-1 rounded border-[2px] bg-[#ffffff]"></div>
                    <div className="h-13 w-290  mt-1 rounded border-[2px] bg-[#ffffff]"></div>
                    <div className="h-13 w-290  mt-1 rounded border-[2px] bg-[#ffffff]"></div>
                    
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
        </WarehousemanClientComponent>
    );
};

export default WarehouseInventoryAuditPage;