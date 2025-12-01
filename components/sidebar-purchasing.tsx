// app/components/sidebar-warehouse.tsx

"use client"
import { cn } from "@/lib/utils"
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";
import { Button } from "./ui/button";
import { useState } from "react";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

export const SideBarPurchasing = ({className, onNavigate}: Props) => {
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);

    //}
    return (
        <div className={cn
        ("flex h-full w-[250px] fixed left-0 top-0 gap-y-2 px-4 flex-col bg-gradient-to-t  from-[#fff6f5] shadow-2xl", 
        className
        )}>
            <Link href="/purchasing/p_dashboard">
            <div className="pt-10 pl-4 pb-1 flex items-center justify-center">
                <Image src="/cticlogo.webp" height={70} width={70} alt="CTIC" />
            </div>
            </Link>
            {/* Purchasing  Dashboard */}
            <div className="flex flex-col gap-y-1 flex-1">
                <SidebarItem
                label="Dashboard"
                href="/purchasing/dashboard"
                iconSrc="/board-chart-svgrepo-com.svg"
                />
                
            {/* Inventory Dropdown */}
            <Button
            variant="ghost"
            onClick={() => {
                setIsInventoryOpen(!isInventoryOpen);
            }}
            className="justify-start h-[40px] "
            >
            <Image
                src="/supplier-alt.png"
                height={20}
                width={20}
                alt="Inventory"
                className="mr-2"
            />
            <span className="flex-1 gap-y-1 flex-col">Inventory</span>
            </Button>

            {isInventoryOpen && (
            <div className="pl-2 flex flex-col gap-y-1">
                <SidebarItem
                label="Inventory List"
                href="/purchasing/p_inventory/p_inventory_list"
                iconSrc="/report-data-svgrepo-com.svg"
                onClick={onNavigate}
                />
                <SidebarItem
                label="Item Properties"
                href="/purchasing/p_inventory/p_item_properties"
                iconSrc="/report-data-svgrepo-com.svg"
                onClick={onNavigate}
                />
            </div>
            )}
            <SidebarItem
                    label="Purchase Order"
                    href="/purchasing/p_purchase_order"
                    iconSrc="/drawer-alt.png"
            />
            <SidebarItem
                    label="Supplier List"
                    href="/purchasing/p_supplier_list"
                    iconSrc="/drawer-alt.png"
            />
            <SidebarItem
                    label="Physical Inventory"
                    href="/purchasing/physical_inventory"
                    iconSrc="/drawer-alt.png"
            />
            </div>
            </div>
    );
};