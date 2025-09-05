"use client"
import { cn } from "@/lib/utils";
import { ClerkLoaded, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Time from "./ui/time";

type Props = {
    className?: string;
};

export const Header = ({className}: Props) => {
    const {isSignedIn, user} = useUser();

    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', // Day of the week (e.g., Monday, Tuesday, etc.)
        year: 'numeric', // Full year (e.g., 2023)
        month: 'long', // Full month name (e.g., January, February, etc.)
        day: 'numeric' // Day of the month (e.g., 1, 2, etc.)
    });

    return (
        <div className={cn
        ("z-50 sticky top-0 h-20 pl-[250px] flex flex-row items-center justify-between border-b-2 border-slate-200 px-4 bg-[#ffc922]",
            className,

        )}>
            <div className="flex flex-col">
                <div className="text-[#642248] font-bold text-lg sm:text-xl">
                Inventory and Service Management System
                {isSignedIn ? (
                    <div className="text-sm font-bold">- Welcome, {user.firstName}!</div>
                ) : (
                    <div className="text-sm font-semibold">- Welcome, Guest!</div>
                )}
                </div>
                <div className="text-[#ffffff] font-bold text=[10px] sm:text-xs">
                {currentDate} | <Time />
                </div>
            </div>
            <div className="flex flex-row">
                <Image
                src="/bell-alt-svgrepo-com.svg"
                alt="logo"
                height={30}
                width={30}
                className="hidden sm:block"
                />
                <ClerkLoaded>
                <SignedIn>
                    <UserButton showName afterSignOutUrl="/" />
                </SignedIn>
            </ClerkLoaded>
            </div>
            </div>
    );
};