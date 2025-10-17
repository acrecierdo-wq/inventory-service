// app/sales/s_customer_profile/s_customers/page.tsx


import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";

const SalesCustomersPage = () => {
    return (
            <div className="bg-[#ffedce] min-h-screen w-full">
                <Header />
                <div className="p-4">
                    {/* Back Button */}
                    {/* <Button variant="primary" className="rounded-full bg-white hover:bg-yellow-500/30 border-[#642248] border-b-4 active:border-b-8">
                        <Link href="/sales/s_customer_profile">
                            <Image
                                src="/arrow-left-svgrepo-com.svg"
                                width={20}
                                height={20}
                                alt="left"
                            />
                        </Link>
                    </Button> */}

                    {/* Main Container */}
                    <div className="flex flex-row gap-4 mt-4">
                        {/* Gradient Card */}
                        <div className="relative w-[200px] h-[530px] rounded-3xl bg-[#173f63] p-4 flex flex-col items-center">
                            <Image src="/profile-circle-svgrepo-com.svg" height={100} width={100} alt="profile" className="invert mb-4" />
                            <span className="text-white font-bold text-xl">SHOPEE</span><br></br><br></br>
                            <span className="text-white font-bold text-sm ">📩shoppee@gmail.com</span>
                            <span className="text-white font-bold text-sm ">📞123-4567-890</span>
                            <span className="text-white font-bold text-sm ">📍Manila, Philippines</span>
                        </div>

                        {/* Right Section */}
                        <div className="flex-1">
                            <h2 className="text-[#5a4632] text-2xl font-bold mb-4">Request History</h2>

                            {/* Header Bar */}
                            <div className="flex items-center gap-4">
                                <div className="inline-block bg-[#173f63] p-3 rounded w-50" style={{ clipPath: "polygon(0 0, 0 1000%, 100% 100%, 75% 0%)" }}>
                                    <span className="text-2xl text-white font-bold">Services</span>
                                </div>
                                {/* <div className="inline-block bg-[#173f63] p-3 rounded w-70" style={{ clipPath: "polygon(0 0, 0 1000%, 100% 100%, 75% 0%)" }}>
                                    <span className="text-2xl text-white font-bold">Non-Consumables</span>
                                </div> */}

                                <div className="flex ml-15 h-9 w-64 border-[#d2bda7] border-b-4 bg-white rounded-3xl px-4">
                                    <Image src="/search-alt-2-svgrepo-com.svg" width={20} height={20} alt="Search" />
                                </div>

                                <div className="flex items-center h-10 px-4 bg-white border-[#d2bda7] border-b-4 rounded-2xl">
                                    <Image src="/filter-svgrepo-com.svg" width={20} height={20} alt="Filter" />
                                    <span className="ml-2 text-[#482b0e] font-semibold">Filter</span>
                                </div>

                                <div className="flex items-center h-10 px-4 bg-white border-[#d2bda7] border-b-4 rounded-2xl">
                                    <Image src="/sort-ascending-fill-svgrepo-com.svg" width={20} height={20} alt="Sort" />
                                    <span className="ml-2 text-[#482b0e] font-semibold">Sort</span>
                                </div>
                            </div>

                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-2 bg-white mt-6 py-3 px-2 border-2 text-[#5a4632] font-semibold text-sm">
                                <span>REQ NO.</span>
                                <span>DATE | TIME</span>
                                <span>TYPE</span>
                                <span>STATUS</span>
                                <span>ACTIONS</span>
                            </div>

                            {/* Sample Row */}
                            <div className="grid grid-cols-6 gap-2 bg-[#fef4e4] py-3 px-2 text-sm">
                                <span>001</span>
                                <span>04/10/2025 10:00 AM</span>
                                <span>Consumables</span>
                                <span>
                                    <span className="bg-[#173f63] text-white px-3 py-1 rounded-3xl">Pending</span>
                                </span>
                                <div className="">
          <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
            <Link href="/sales/s_customer_profile/s_customers/s_view_details_c">
              <div className="text-sm font-semibold">View Details</div>
            </Link>
          </button>
        </div>
                            </div>

    {/* Pagination */}
    {/* <div className="ml-190 mt-5">
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
        </div> */}
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default SalesCustomersPage;
