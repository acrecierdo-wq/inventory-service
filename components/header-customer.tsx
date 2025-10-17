"use client"

import { cn } from "@/lib/utils";
import { ClerkLoaded, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation";
import Time from "./ui/time";


type Props = {
    className?: string;
};

export const CustomerHeader = ({className}: Props) => {
    const {isSignedIn, user} = useUser();
    const [showProfileModal, setShowProfileModal] = useState(false);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/customer");
      const result = await res.json();
      console.log("Profile fetch result:", result);

      if (!res.ok) {
        console.warn("Profile fetch failed", res.status);
        return;
      }

      if (result.status === "no-profile" || result.status === "incomplete-profile") {
        // Show modal only if not already on profile page
        setShowProfileModal(pathname !== "/customer/cus_profile");
      } else {
        // status === "ok"
        setShowProfileModal(false);
      }
    } catch (err) {
      console.warn("Error fetching profile:", err);
    }
  };
 
  fetchProfile();
}, [pathname]);


    // useEffect(() => {
    //     async function checkProfile() {
    //         const res = await fetch("/api/customer/check-profile");
    //         const data = await res.json();
    //         if (!data.complete) {
    //             setShowProfileModal(true);
    //         }
    //     }
    //     checkProfile();
    // }, []);
 
    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', // Day of the week (e.g., Monday, Tuesday, etc.)
        year: 'numeric', // Full year (e.g., 2023)
        month: 'long', // Full month name (e.g., January, February, etc.)
        day: 'numeric' // Day of the month (e.g., 1, 2, etc.)
    });


    return (
        <div className={cn
        ("z-50 sticky top-0 h-20 pl-[250px] flex flex-row items-center justify-between border-slate-200 px-4 bg-[#ffc922] ",
            className,

        )}>
            <div className="flex flex-col">
                <div className="text-[#642248] font-bold text-lg sm:text-xl">
                Canlubang Techno-Industrial Corporation 
                {isSignedIn ? (
                    <div className="text-sm font-bold">- Welcome, {user.firstName || user.emailAddresses[0].emailAddress}!</div>
                ) : (
                    <div className="text-sm font-semibold">- Welcome, Guest!</div>
                )}
                </div>
                <div className="text-[#642248] font-bold text-[10px] sm:text-xs">
                {currentDate} | <Time />
                </div>
            </div>
            <div className="flex flex-row">
                {/* <Image
                src="/bell-alt-svgrepo-com.svg"
                alt="logo"
                height={30}
                width={30}
                className="hidden sm:block"
                /> */}
                <ClerkLoaded>
                        <SignedIn>
                        <div className="flex flex-col items-center space-y-2">
                            {/* Avatar only */}
                            <UserButton
                            appearance={{
                                elements: {
                                userButtonAvatarBox: "w-16 h-16", // make avatar bigger if needed
                                userButtonTrigger: "p-0", // remove padding
                                userButtonBox: "flex justify-center",
                                },
                            }}
                            showName={false} // prevent showing name beside avatar
                            afterSignOutUrl="/"
                            />

                            {/* Name below avatar */}
                            {user && (
                            <p className="text-sm font-medium text-[#880c0c]">
                                {user.fullName || user.emailAddresses[0].emailAddress}
                            </p>
                            )}
                        </div>
                        </SignedIn>
                    </ClerkLoaded>
            </div>
            {showProfileModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg w-[400px] text-center">
                        <h2 className="text-2xl font-bold mb-4 text-[#173f63]">Hi! Complete your Profile</h2>
                        <p className="mb-6 text-gray-600">
                            You must set your name, phone, address, and client code before making any request. Thank you!
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => router.push("/customer/cus_profile")}
                                className="px-5 py-2 rounded-lg bg-[#173f63] text-white hover:bg-[#0f2b45]"
                            >
                                Go to Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
    );
};