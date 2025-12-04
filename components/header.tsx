// app/components/header.tsx
"use client";

import { cn } from "@/lib/utils";
import { ClerkLoaded, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Time from "./ui/time";
import { useState, useEffect } from "react";

type Props = {
  className?: string;
};

export const Header = ({ className }: Props) => {
  const { isSignedIn, user } = useUser();


  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  // Optional: update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Ensure role is always a string
  const roleString =
    typeof user?.publicMetadata?.role === "string"
      ? user?.publicMetadata.role
      : "User Portal";

  return (
    <header
      className={cn(
        "sticky top-0 h-[80px] z-50 flex items-center justify-between px-6 py-3 border-b border-[#f3dac1] bg-gradient-to-r from-[#fff7ec]/95 via-[#ffe9cf]/95 to-[#ffdcb9]/95 backdrop-blur shadow-[0_12px_30px_rgba(255,225,190,0.6)]",
        className
      )}
    >
      {/* LEFT SIDE — SYSTEM TITLE + GREETING */}
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-[0.5em] text-[#b26c27]">
          Inventory & Service Management System
        </span>

        <div className="mt-1 text-2xl font-semibold text-[#4f2d12] capitalize">
          Welcome, {isSignedIn ? user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress : "Guest"}!
        </div>

        <div className="mt-1 flex items-center gap-3 text-sm font-medium text-[#7c4722]">
          <span>{currentDate}</span>
          <span className="text-[#c07e34]">•</span>
          <Time />
        </div>
      </div>

      {/* RIGHT SIDE — USER BUTTON */}
      <div className="flex items-center gap-3">
        {isSignedIn && (
          <div className="text-xs uppercase tracking-[0.4em] rounded-full bg-[#fff1d7] px-4 py-1 text-[#b26c27] shadow-inner shadow-[#f8d8ae]">
            {roleString}
          </div>
        )}

        <ClerkLoaded>
          <SignedIn>
            <div className="flex flex-col items-center gap-1 text-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-14 w-14",
                    userButtonTrigger: "p-0",
                  },
                }}
                afterSignOutUrl="/"
                showName={false}
              />
              <span className="text-xs text-[#7c4722]">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </SignedIn>
        </ClerkLoaded>
      </div>
    </header>
  );
};