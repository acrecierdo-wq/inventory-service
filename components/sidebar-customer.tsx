"use client"
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useState} from "react";


type Props = {
    className?: string;
};

export const SideBarCustomer = ({className}: Props) => {
    const [isPandSOpen, setIsPandSOpen] = useState(false);
    const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
   
    const closeAllDropdowns = () => { 
        setIsPandSOpen(false);      // Close both dropdowns when clicking outside
        setIsMyOrdersOpen(false);   // Close both dropdowns when clicking outside
        
    };
    return (
        <div className={cn
        (" flex h-full w-[250px] fixed left-0 top-0 gap-y-2 px-4 flex-col shadow-2xl",
            className,

        )}>
            <Link href="/customer/cus_dashboard">
                <div className="pt-10 pl-5 pb-1 flex items-center justify-center">
                        <Image src="/cticlogo.webp" height={70} width={70} alt="CTIC" />
                        
                </div>
            </Link>
            <div className="flex flex-col gap-y-1 flex-1">
                <SidebarItem 
                label="Dashboard" 
                href="/customer/cus_dashboard" 
                iconSrc="/board-chart-svgrepo-com.svg"
                onClick={closeAllDropdowns}
                />
                <SidebarItem
                label="Quotation Request"
                href="/customer/quotation_request"
                iconSrc="/document-add-svgrepo-com.svg"
                onClick={closeAllDropdowns}
                />  
                <SidebarItem
                label="Request Management"
                href="/customer/request_management"
                iconSrc="/document-add-svgrepo-com.svg"
                onClick={closeAllDropdowns}
                />  
                 <SidebarItem
                label="My Profile"
                href="/customer/cus_profile"
                iconSrc="/document-add-svgrepo-com.svg"
                onClick={closeAllDropdowns}
                />  
                <SidebarItem
                label="Order History"
                href="/customer/order_history"
                iconSrc="/document-add-svgrepo-com.svg"
                onClick={closeAllDropdowns}
                />  
    
                {/* Products and Services Dropdown */}
                <Button 
                variant="ghost"
                onClick={() => {setIsPandSOpen(!isPandSOpen)
                    setIsMyOrdersOpen(false);
                }}
                >
                <Image src="/document-1-svgrepo-com.svg" 
                height={20} 
                width={20} 
                alt="Service"
                />
                    <span className="flex flex-col gap-y-1 flex-1">Products & Services</span>
                    <ChevronDown size={16} className={`transition-transform ${isPandSOpen ? "rotate-180" : ""}`} />
                </Button>
                {isPandSOpen && (
                    <div className="pl-2 flex flex-col">
                        <SidebarItem 
                        label="Consumables" 
                        href="/customer/p&s/consumables_2" 
                        iconSrc="/document-add-svgrepo-com.svg"
                        />
                        <SidebarItem 
                        label="Non-Consumables" 
                        href="/customer/p&s/non-consumables" 
                        iconSrc="/document-add-svgrepo-com.svg"
                        />
                    </div>
                )}

                {/* My Orders Dropdown */}
                <Button 
                variant="ghost"
                onClick={() => {setIsMyOrdersOpen(!isMyOrdersOpen)
                    setIsPandSOpen(false);
                }}
                >
                <Image src="/cart-shopping-svgrepo-com.svg" height={20} width={20} alt="Service" />
                    <span className="flex flex-col gap-y-1 flex-1">My Orders</span>
                    <ChevronDown size={16} className={`transition-transform ${isMyOrdersOpen ? "rotate-180" : ""}`} />
                </Button>
                {isMyOrdersOpen && (
                    <div className="pl-2 flex flex-col">
                        <SidebarItem 
                        label="Order History" 
                        href="/customer/my_orders/order_history" 
                        iconSrc="/document-add-svgrepo-com.svg"
                        />
                        <SidebarItem 
                    label="Customer Profile" 
                    href="/sales/s_customer_profile" 
                    iconSrc="/user-pen-svgrepo-com.svg"
                    onClick={closeAllDropdowns}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};