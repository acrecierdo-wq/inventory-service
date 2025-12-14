"use client";

import { cn } from "@/lib/utils";
import { ClerkLoaded, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Time from "./ui/time";

type Props = {
  className?: string;
};

export const CustomerHeader = ({ className }: Props) => {
  const { isSignedIn, user } = useUser();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/customer");
        const result = await res.json();

        if (!res.ok) return;
        if (result.status === "no-profile" || result.status === "incomplete-profile") {
          setShowProfileModal(pathname !== "/customer/cus_profile");
        } else {
          setShowProfileModal(false);
        }
      } catch (err) {
        console.warn("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [pathname]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-[80px] flex items-center justify-between px-6 py-3 border-b border-[#f3dac1] bg-gradient-to-r from-[#fff7ec]/95 via-[#ffe9cf]/95 to-[#ffdcb9]/95 backdrop-blur shadow-[0_12px_30px_rgba(255,225,190,0.6)]",
        className
      )}
    >
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-[0.4em] text-[#b26c27]">
          Canlubang Techno-Industrial Corp.
        </span>
        <div className="mt-1 text-2xl font-semibold text-[#4f2d12]">
          Welcome, {isSignedIn ? user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress : "Guest"}!
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm font-medium text-[#7c4722]">
          <span>{currentDate}</span>
          <span className="text-[#c07e34]">•</span>
          <Time />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isSignedIn && (
          <div className="text-xs uppercase tracking-[0.4em] rounded-full bg-[#fff1d7] px-4 py-1 text-[#b26c27] shadow-inner shadow-[#f8d8ae]">
            Customer Portal
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
                showName={false}
                afterSignOutUrl="/"
              />
              <span className="text-xs text-[#7c4722]">
                {user?.fullName || user?.emailAddresses?.[0]?.emailAddress}
              </span>
            </div>
          </SignedIn>
        </ClerkLoaded>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-xl font-semibold text-[#4f2d12]">Complete Your Profile</h2>
            <p className="mt-3 text-sm text-[#7c4722]">
              Provide your name, phone, address, and client code before submitting any quotation requests.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-2xl border border-[#f4d7b8] px-4 py-2 text-sm font-semibold text-[#6e4420] hover:bg-[#fff5e4]"
              >
                Later
              </button>
              <button
                onClick={() => router.push("/customer/cus_profile")}
                className="rounded-2xl bg-[#173f63] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#0f2b45]"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};