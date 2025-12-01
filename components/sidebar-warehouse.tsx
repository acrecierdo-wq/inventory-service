"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";
import { Button } from "./ui/button";
import { useState } from "react";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

export const SideBarWarehouse = ({ className, onNavigate }: Props) => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  return (
    <aside
      className={cn(
        "h-full w-full bg-gradient-to-t from-[#fff6f5] to-[#ffffff]",
        "flex flex-col overflow-y-auto shadow-2xl",
        className
      )}
    >
      {/* Logo */}
      <Link href="/warehouse/w_dashboard">
        <div className="pt-20 lg:pt-10 pl-4 pb-1 flex items-center justify-center">
          <Image src="/cticlogo.webp" height={70} width={70} alt="CTIC" />
        </div>
      </Link>

      {/* Navigation Items */}
      <div className="flex flex-col gap-y-2 flex-1 px-2 mt-4">
        <SidebarItem
          label="Dashboard"
          href="/warehouse/w_dashboard"
          iconSrc="/board-chart-svgrepo-com.svg"
          onClick={onNavigate}
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
              href="/warehouse/w_inventory/w_inventory_list"
              iconSrc="/report-data-svgrepo-com.svg"
              onClick={onNavigate}
            />
            <SidebarItem
              label="Item Properties"
              href="/warehouse/w_inventory/w_item_properties"
              iconSrc="/report-data-svgrepo-com.svg"
              onClick={onNavigate}
            />
          </div>
        )}

        <SidebarItem
          label="Issuance Log"
          href="/warehouse/issuance_log"
          iconSrc="/drawer-alt.png"
          onClick={onNavigate}
        />
        <SidebarItem
          label="Replenishment Log"
          href="/warehouse/replenishment_log"
          iconSrc="/drawer-alt.png"
          onClick={onNavigate}
        />
        <SidebarItem
          label="Internal Usage Log"
          href="/warehouse/internal_usage_log"
          iconSrc="/drawer-alt.png"
          onClick={onNavigate}
        />
        <SidebarItem
          label="Physical Inventory"
          href="/warehouse/w_inventory/w_physical/list"
          iconSrc="/drawer-alt.png"
          onClick={onNavigate}
        />
      </div>
    </aside>
  );
};
