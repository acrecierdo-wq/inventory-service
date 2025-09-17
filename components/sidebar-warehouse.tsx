"use client"
import { cn } from "@/lib/utils"
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";
import { Button } from "./ui/button";
//import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
    className?: string
};

export const SideBarWarehouse = ({className}: Props) => {
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    //const [isPickListOpen, setIsPickListOpen] = useState(false);
    //const closeAllDropdowns = () => {
        //setIsPickListOpen(false);
    //}
    return (
        <div className={cn
        ("flex h-full w-[250px] fixed left-0 top-0 gap-y-2 px-4 flex-col bg-gradient-to-t  from-[#fff6f5] shadow-2xl", 
        className
        )}>
            <Link href="/warehouse/w_dashboard">
            <div className="pt-10 pl-4 pb-1 flex items-center justify-center">
                <Image src="/cticlogo.webp" height={70} width={70} alt="CTIC" />
            </div>
            </Link>
            {/* Warehouse Dashboard */}
            <div className="flex flex-col gap-y-1 flex-1">
                <SidebarItem
                label="Dashboard"
                href="/warehouse/w_dashboard"
                iconSrc="/board-chart-svgrepo-com.svg"
                
                />
                
                {/* Inventory Dropdown */}
                <Button 
                variant="ghost"
                onClick={() => {setIsInventoryOpen(!isInventoryOpen);
                    //setIsPickListOpen(false);
                }}
                >
                    
                <Image src="/supplier-alt.png" height={20} width={20} alt="Inventory" />
                <span className="flex- flex-col gap-y-1 flex-1">Inventory</span>
                {/*<ChevronDown size={16} className={`transition-transform ${isInventoryOpen ? "rotate-180" : ""}`} />*/}
                </Button>
                {isInventoryOpen && (
                <div className="pl-2 flex flex-col">
                    <SidebarItem
                    label="Inventory List"
                    href="/warehouse/w_inventory/w_inventory_list"
                    iconSrc="/report-data-svgrepo-com.svg"
                    />
                    <SidebarItem
                    label="Item Properties"
                    href="/warehouse/w_inventory/w_item_properties"
                    iconSrc="/report-data-svgrepo-com.svg"
                    />
                    {/*<SidebarItem
                    label="Categories"
                    href="/warehouse/w_inventory/w_categories"
                    iconSrc="/user-pen-svgrepo-com.svg"
                    />
                    <SidebarItem
                    label="Supplier P.O."
                    href="/warehouse/w_inventory/w_supplier_po"
                    iconSrc="/user-pen-svgrepo-com.svg"
                    />
                    <SidebarItem
                    label="Lacking Items"
                    href="/warehouse/w_inventory/w_lacking_items"
                    iconSrc="/user-pen-svgrepo-com.svg"
                    />*/}
                    </div>
                )}
                
                {/* Picklist Dropdown */}
                {/*<Button
                variant="ghost"
                onClick={() => {setIsPickListOpen(!isPickListOpen);
                    //setIsInventoryOpen(false);
                }}
                >
                <Image src="/document-1-svgrepo-com.svg" height={20} width={20} alt="PickList" />
                <span className="flex- flex-col gap-y-1 flex-1">Pick List</span>
                {/*<ChevronDown size={16} className={`transition-transform ${isPickListOpen ? "rotate-180" : ""}`} />*/}
                {/*</Button>
                {isPickListOpen && (
                <div className="pl-2 flex flex-col">
                    <SidebarItem
                    label="Pendings"
                    href="/warehouse/w_picklist/pending"
                    iconSrc="/user-pen-svgrepo-com.svg"
                    />
            </div>
            )} */}
            <SidebarItem
                    label="Issuance Log"
                    href="/warehouse/issuance_log"
                    iconSrc="/drawer-alt.png"
            />
            <SidebarItem
                    label="Replenishment Log"
                    href="/warehouse/replenishment_log"
                    iconSrc="/drawer-alt.png"
            />
            <SidebarItem
                    label="Internal Usage Log"
                    href="/warehouse/internal_usage_log"
                    iconSrc="/drawer-alt.png"
            />
            </div>
            </div>
    );
};