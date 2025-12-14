"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

type NavItem = {
  label: string;
  href: string;
  iconSrc: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/sales/sales_dashboard", iconSrc: "/board-chart-svgrepo-com.svg" },
  { label: "Request Management", href: "/sales/s_pending_customer_request", iconSrc: "/board-chart-svgrepo-com.svg" },
  { label: "Customer Profile", href: "/sales/s_customer_profile/s_customers", iconSrc: "/board-chart-svgrepo-com.svg" },
  { label: "Material List", href: "/sales/s_material_list", iconSrc: "/drawer-alt.png" },
];

const SidebarItem = ({ label, href, iconSrc }: NavItem) => {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 transition",
        active ? "text-[#4f2d12]" : "text-[#7c4722] hover:text-[#4f2d12]"
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

export const SideBarSales = ({ className }: Props) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full w-[250px] flex-col border-r border-[#f7d9b9] bg-gradient-to-b from-[#fff6f5] via-[#ffe9cd] to-[#fddfbd] text-[#4f2d12] shadow-2xl",
        className
      )}
    >
      {/* Logo */}
      <Link
        href="/sales/sales_dashboard"
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
          CTIC Sales
        </p>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <div
              key={item.href}
              className={cn(
                "rounded-2xl px-2 py-1 transition hover:bg-white/20 hover:shadow-md",
                active && "bg-white/40 shadow-inner shadow-[#f4d1a5]"
              )}
            >
              <SidebarItem {...item} />
            </div>
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