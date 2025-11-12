// app/components/sidebar-warehouse.tsx

"use client"
import { cn } from "@/lib/utils"
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";

type Props = {
    className?: string
};

export const SideBarPurchasing = ({className}: Props) => {
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
                
            <SidebarItem
                    label="Inventory List"
                    href="/purchasing/p_inventory_list"
                    iconSrc="/drawer-alt.png"
            />
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
            </div>
            </div>
    );
};