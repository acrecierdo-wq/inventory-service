"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

type NavItem = {
  label: string;
  href: string;
  iconSrc: string;
};

type SidebarItemProps = NavItem & {
  onClick?: () => void;
  className?: string;
};

export const SidebarItem = ({ label, href, iconSrc, onClick, className }: SidebarItemProps) => {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3",
        className
      )}
    >
      <Image
        src={iconSrc}
        alt={label}
        width={20}
        height={20}
        className={cn(
          "transition",
          active ? "brightness-0 invert opacity-90" : "opacity-80 hover:opacity-100"
        )}
      />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export const SideBarPurchasing = ({ className, onNavigate }: Props) => {
  const pathname = usePathname();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const inventoryItems: NavItem[] = [
    { label: "Inventory List", href: "/purchasing/p_inventory/p_inventory_list", iconSrc: "/report-data-svgrepo-com.svg" },
    { label: "Item Properties", href: "/purchasing/p_inventory/p_item_properties", iconSrc: "/report-data-svgrepo-com.svg" },
  ];

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/purchasing/dashboard", iconSrc: "/board-chart-svgrepo-com.svg" },
    { label: "Purchase Order", href: "/purchasing/p_purchase_order", iconSrc: "/drawer-alt.png" },
    { label: "Supplier List", href: "/purchasing/p_supplier_list", iconSrc: "/drawer-alt.png" },
    { label: "Physical Inventory", href: "/purchasing/physical_inventory", iconSrc: "/drawer-alt.png" },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full w-[250px] flex-col border-r border-[#f7d9b9] bg-gradient-to-b from-[#fff7ec] via-[#ffe9cd] to-[#fddfbd] text-[#4f2d12] shadow-2xl",
        className
      )}
    >
      {/* Logo */}
      <Link href="/purchasing/dashboard" className="flex flex-col items-center gap-2 px-6 pt-10 pb-6">
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
          CTIC Purchasing
        </p>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {/* Main nav items */}
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <SidebarItem
              key={item.href}
              {...item}
              onClick={onNavigate}
              className={cn(
                "rounded-2xl px-3 py-2 transition hover:bg-white/20 hover:shadow-md",
                active && "bg-white/40 shadow-inner shadow-[#f4d1a5]"
              )}
            />
          );
        })}

        {/* Inventory Dropdown */}
        <div
          onClick={() => setIsInventoryOpen(!isInventoryOpen)}
          className="flex items-center gap-3 rounded-2xl px-3 py-2 cursor-pointer transition hover:bg-white/20 hover:shadow-md mt-1"
        >
          <Image src="/supplier-alt.png" height={20} width={20} alt="Inventory" className="opacity-80" />
          <span className="text-sm font-medium">Inventory</span>
        </div>

        {isInventoryOpen &&
          inventoryItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <SidebarItem
                key={item.href}
                {...item}
                onClick={onNavigate}
                className={cn(
                  "ml-6 rounded-2xl px-2 py-1 transition hover:bg-white/20 hover:shadow-md",
                  active && "bg-white/40 shadow-inner shadow-[#f4d1a5]"
                )}
              />
            );
          })}
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