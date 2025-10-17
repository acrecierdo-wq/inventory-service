"use client"
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
    className?: string;
};
export const SideBarSales = ({className}: Props) => {
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const closeAllDropdowns = () => {       // Close both dropdowns when clicking outside
        setIsRequestOpen(false);
    };
    return (
        <div className={cn
            (" flex h-full w-[250px] fixed left-0 top-0 gap-y-2 px-4 flex-col bg-gradient-to-t  from-[#fff6f5] to-[#ffffff] shadow-2xl",
                className,
    
            )}>
                <Link href="/sales/sales_dashboard">
                    <div className="pt-10 pl-4 pb-1 flex items-center justify-center">
                            <Image src="/cticlogo.webp" height={70} width={70} alt="CTIC" />
                            
                    </div>
                </Link>
                <div className="flex flex-col gap-y-1 flex-">
                    <SidebarItem
                    label="Dashboard" 
                    href="/sales/sales_dashboard" 
                    iconSrc="/board-chart-svgrepo-com.svg"
                    onClick={closeAllDropdowns}
                    />
                     <SidebarItem
                    label="Request Management" 
                    href="/sales/s_pending_customer_request" 
                    iconSrc="/board-chart-svgrepo-com.svg"
                    onClick={closeAllDropdowns}
                    />
                    <SidebarItem
                    label="Customer Profile" 
                    href="/sales/s_customer_profile/s_customers" 
                    iconSrc="/board-chart-svgrepo-com.svg"
                    onClick={closeAllDropdowns}
                    />
                    
                    {/*Request Dropdown*/}
                    <Button
                    variant="ghost"
                    onClick={() => {setIsRequestOpen(!isRequestOpen);
                    }}
                    >
                    <Image src="/document-1-svgrepo-com.svg" height={20} width={20} alt="Request" />
                         <span className="font- flex flex-col gap-y-1 flex-1">Request</span>
                         <ChevronDown size={16} className={'transition-tranform ${isRequestOpen ? "rotate-180" : ""}'}/>
                    </Button>
                    {isRequestOpen && (
                    <div className="pl-2 flex flex-col">
                        <SidebarItem
                        label="Consumables" 
                        href="/sales/sales_requests/s_consumables_request" 
                        iconSrc="/document-text-svgrepo-com.svg"
                        />
                        <SidebarItem
                        label="Non-Consumables" 
                        href="/sales/sales_requests/s_nonconsumables_request" 
                        iconSrc="/document-text-svgrepo-com.svg"
                        />
                        </div>
                    )}
                </div>
        </div>
    );
};