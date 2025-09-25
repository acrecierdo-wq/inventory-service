"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-items";

type Props = {
  className?: string;
};

export const SideBarCustomer = ({ className }: Props) => {
  // Removed isPandSOpen and isMyOrdersOpen since they were unused

  const closeAllDropdowns = () => {
    // Currently nothing to close — left here in case you add dropdowns later
  };

  return (
    <div
      className={cn(
        "flex h-full w-[250px] fixed left-0 top-0 gap-y-2 px-4 flex-col shadow-2xl",
        className
      )}
    >
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
          label="My Request"
          href="/customer/cus_myrequest"
          iconSrc="/document-add-svgrepo-com.svg"
          onClick={closeAllDropdowns}
        />
        <SidebarItem
          label="My Profile"
          href="/customer/cus_profile"
          iconSrc="/profile-round-1342-svgrepo-com.svg"
          onClick={closeAllDropdowns}
        />
        <SidebarItem
          label="Order History"
          href="/customer/cus_orderhistory"
          iconSrc="/document-add-svgrepo-com.svg"
          onClick={closeAllDropdowns}
        />
      </div>
    </div>
  );
};
