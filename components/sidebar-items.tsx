"use client";

import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";


type Props = {
    label: string;
    iconSrc: string;
    href: string;
    onClick?: () => void;
};

export const SidebarItem = ({
    label,
    iconSrc,
    href,
    onClick
}: Props) => {
    const pathname = usePathname ();
    const active = pathname === href;
    return (
    <Button
    variant={"ghost"}
    className="justify-start h-[40px]"
    asChild
    onClick={onClick}
    >
        <Link  href={href}
        className={`px-4 py-2 rounded-lg transition-none ${
                active
                  ? "bg-yellow-400 text-white"
                  :""}`}>
        <Image 
            src={iconSrc}
            alt={label}
            className="mr-0"
            height={20}
            width={20}
        />
        {label}
        </Link>
    </Button>
    );
};
