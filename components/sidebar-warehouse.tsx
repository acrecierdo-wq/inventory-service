"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

export const SideBarWarehouse = ({ className, onNavigate }: Props) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full w-[250px] flex-col",
        "border-r border-[#f7d9b9]",
        "bg-gradient-to-b from-[#fff7ec] via-[#ffe9cd] to-[#fddfbd]",
        "text-[#4f2d12] shadow-2xl",
        className
      )}
    >
      {/* Logo */}
      <Link
        href="/warehouse/w_dashboard"
        className="flex flex-col items-center gap-2 px-6 pt-10 pb-6"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#f6c66d]/40 blur-3xl" />
          <Image
            src="/cticlogo.webp"
            height={74}
            width={74}
            alt="CTIC"
            className="relative drop-shadow"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.45em] text-[#9b5a1f]">
          CTIC Warehouse
        </p>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {/* Dashboard */}
        <div className="rounded-2xl px-2 py-1 hover:bg-white/20 hover:shadow-md transition">
          <SidebarItem
            label="Dashboard"
            href="/warehouse/w_dashboard"
            iconSrc="/board-chart-svgrepo-com.svg"
            onClick={onNavigate}
          />
        </div>

        {/* Inventory List */}
        <div className="rounded-2xl px-2 py-1 hover:bg-white/20 hover:shadow-md transition">
          <SidebarItem
            label="Inventory List"
            href="/warehouse/w_inventory/w_inventory_list"
            iconSrc="/report-data-svgrepo-com.svg"
            onClick={onNavigate}
          />
        </div>

        {/* Logs */}
        <div className="rounded-2xl px-2 py-1 hover:bg:white/20 hover:shadow-md transition">
          <SidebarItem
            label="Issuance Log"
            href="/warehouse/issuance_log"
            iconSrc="/drawer-alt.png"
            onClick={onNavigate}
          />
        </div>

        <div className="rounded-2xl px-2 py-1 hover:bg:white/20 hover:shadow-md transition">
          <SidebarItem
            label="Replenishment Log"
            href="/warehouse/replenishment_log"
            iconSrc="/drawer-alt.png"
            onClick={onNavigate}
          />
        </div>

        <div className="rounded-2xl px-2 py-1 hover:bg:white/20 hover:shadow-md transition">
          <SidebarItem
            label="Internal Usage Log"
            href="/warehouse/internal_usage_log"
            iconSrc="/drawer-alt.png"
            onClick={onNavigate}
          />
        </div>

        {/* Physical Inventory */}
        <div className="rounded-2xl px-2 py-1 hover:bg-white/20 hover:shadow-md transition">
          <SidebarItem
            label="Physical Inventory"
            href="/warehouse/w_inventory/w_physical/list"
            iconSrc="/drawer-alt.png"
            onClick={onNavigate}
          />
        </div>
      </nav>

      {/* Help Box */}
      <div className="m-4 rounded-2xl border border-[#f7d9b9] bg-white/20 p-4 text-xs text-[#6f3e1b] shadow-inner">
        <p className="text-sm font-semibold text-[#4f2d12]">Need help?</p>
        <p className="mt-1">https://inventory-service-omega.vercel.app/</p>
        <p className="text-sm font-semibold text-[#4f2d12]">(049) 252-8988</p>
      </div>
    </aside>
  );
};