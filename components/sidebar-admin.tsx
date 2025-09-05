"use client"
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";
import { ClerkLoaded, ClerkLoading, SignOutButton, } from "@clerk/nextjs";
import { ChevronDown, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { useState} from "react";


type Props = {
    className?: string;
};

export const SideBarAdmin = ({className}: Props) => {
    const [isServiceOpen, setIsServiceOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
   
    const closeAllDropdowns = () => {       // Close both dropdowns when clicking outside
        setIsServiceOpen(false);
        setIsInventoryOpen(false);
    };
    return (
        <div className={cn
        (" flex h-full w-[250px] fixed left-0 top-0 gap-y-2 px-4 border-r-2 flex-col",
            className,

        )}>
            <Link href="/admin/admin_dashboard">
                <div className="pt-10 pl-4 pb-1 flex items-center justify-center">
                        <Image src="/cticlogo.webp" height={70} width={70} alt="CTIC" />
                        
                </div>
            </Link>
            <div className="flex flex-col gap-y-1 flex-1">
                <SidebarItem 
                label="Dashboard" 
                href="/admin/admin_dashboard" 
                iconSrc="/tray.svg"
                onClick={closeAllDropdowns}
                />
                <SidebarItem 
                label="Reports" 
                href="/admin/reports" 
                iconSrc="/tray.svg"
                onClick={closeAllDropdowns}
                />
                <SidebarItem 
                label="Customer Profile" 
                href="/admin/customer_profile" 
                iconSrc="/tray.svg"
                onClick={closeAllDropdowns}
                />
                {/* Service Dropdown */}
                <Button 
                variant="ghost"
                onClick={() => {setIsServiceOpen(!isServiceOpen)
                    setIsInventoryOpen(false);
                }}
                >
                <Image src="/tray.svg" height={20} width={20} alt="Service" />
                    <span className="flex flex-col gap-y-1 flex-1">Service</span>
                    <ChevronDown size={16} className={`transition-transform ${isServiceOpen ? "rotate-180" : ""}`} />
                </Button>
                {isServiceOpen && (
                    <div className="pl-2 flex flex-col">
                        <SidebarItem 
                        label="Product Request" 
                        href="/admin/service/product_request" 
                        iconSrc="/tray.svg"
                        />
                        <SidebarItem 
                        label="Service Request" 
                        href="/admin/service/service_request" 
                        iconSrc="/tray.svg"
                />
                    </div>
                )}

                {/* Inventory Dropdown */}
                <Button 
                variant="ghost"
                onClick={() => {setIsInventoryOpen(!isInventoryOpen);
                    setIsServiceOpen(false);
                }}
                >
                <Image src="/tray.svg" height={20} width={20} alt="Inventory" />
                    <span className="flex flex-col gap-y-1 flex-1">Inventory</span>
                    <ChevronDown size={16} className={`transition-transform ${isInventoryOpen ? "rotate-180" : ""}`} />
                </Button>
                {isInventoryOpen && (
                    <div className="pl-2 flex flex-col">
                        <SidebarItem 
                        label="Category" 
                        href="/admin/inventory/category" 
                        iconSrc="/tray.svg"
                        />
                        <SidebarItem 
                        label="Item List" 
                        href="/admin/inventory/item_list" 
                        iconSrc="/tray.svg"
                        />
                </div>
                )}
            </div>
            <div className="pb-5 flex justify-center">
                <ClerkLoading>
                    <Loader className="text-muted-foreground animate-spin"/>
                </ClerkLoading>
                <ClerkLoaded>
                    <SignOutButton>
                    <Button variant="ghost" size="sm">Log Out</Button>
                    </SignOutButton>
                </ClerkLoaded>
            </div>
        </div>
    );
};
