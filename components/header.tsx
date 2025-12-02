// app/components/header.tsx

"use client";
import { cn } from "@/lib/utils";
import { ClerkLoaded, SignedIn, useUser, useClerk } from "@clerk/nextjs";
import Time from "./ui/time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
};

export const Header = ({ className }: Props) => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const router = useRouter();

  return (
    <div
      className={cn(
        "z-50 fixed top-0 left-0 lg:left-[250px] w-full lg:w-[calc(100%-250px)] h-18 lg:h-20",
        "flex flex-row items-center justify-between",
        "px-2 sm:px-4 bg-[#ffc922]",
        className
      )}
    >
      {/* System Title and Greetings */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="text-[#642248] font-bold text-sm sm:text-lg lg:text-xl truncate">
          <span className="">Inventory and Service Management System</span>
          {isSignedIn ? (
            <div className="text-xs lg:text-sm font-bold capitalize truncate">
              - Welcome,{" "}
              {user.username ||
                user.firstName ||
                user.emailAddresses[0].emailAddress}
              !
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-semibold">
              - Welcome, Guest!
            </div>
          )}
        </div>
        <div className="text-[#ffffff] font-bold text-[10px] sm:text-xs truncate">
          <span className="hidden sm:inline">{currentDate} | </span>
          <Time />
        </div>
      </div>

      {/* Right side - User dropdown */}
      <div className="flex flex-row items-center ml-2">
        <ClerkLoaded>
          <SignedIn>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center cursor-pointer">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarImage
                      src={user?.imageUrl || ""}
                      alt={user?.firstName || user?.username || "User"}
                    />
                    <AvatarFallback>
                      {user?.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-1 text-[10px] sm:text-xs font-medium text-[#642248] capitalize truncate max-w-[80px] sm:max-w-none">
                    {user?.username ||
                      user?.fullName ||
                      user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="absolute right-0 z-100 bg-white shadow border rounded text-sm w-32">
                <DropdownMenuItem
                  onClick={() => {
                    if (!user) return;

                    const role = user.publicMetadata?.role;
                    let myAccountRoute = "/my-account";

                    if (role === "warehouseman")
                      myAccountRoute = "/warehouse/my-account";
                    if (role === "sales") myAccountRoute = "/sales/my-account";
                    if (role === "admin") myAccountRoute = "/admin/my-account";
                    if (role === "purchasing")
                      myAccountRoute = "/purchasing/my-account";

                    router.push(myAccountRoute);
                  }}
                >
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
        </ClerkLoaded>
      </div>
    </div>
  );
};

// "use client";

// import { cn } from "@/lib/utils";
// import { ClerkLoaded, SignedIn, UserButton, useUser, useClerk } from "@clerk/nextjs";
// import Time from "./ui/time";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";

// type Props = {
//   className?: string;
// };

// export const Header = ({ className }: Props) => {
//   const { isSignedIn, user } = useUser();
//   const { signOut } = useClerk();
//   const router = useRouter();

//   const [currentDate, setCurrentDate] = useState(
//     new Date().toLocaleDateString("en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     })
//   );

//   // Optional: update date every minute
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentDate(
//         new Date().toLocaleDateString("en-US", {
//           weekday: "long",
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         })
//       );
//     }, 60000);

//     return () => clearInterval(timer);
//   }, []);

//   // Ensure role is always a string
//   const roleString =
//     typeof user?.publicMetadata?.role === "string"
//       ? user?.publicMetadata.role
//       : "User Portal";

//   return (
//     <header
//       className={cn(
//         "sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#f3dac1] bg-gradient-to-r from-[#fff7ec]/95 via-[#ffe9cf]/95 to-[#ffdcb9]/95 backdrop-blur shadow-[0_12px_30px_rgba(255,225,190,0.6)]",
//         className
//       )}
//     >
//       {/* LEFT SIDE — SYSTEM TITLE + GREETING */}
//       <div className="flex flex-col">
//         <span className="text-xs uppercase tracking-[0.5em] text-[#b26c27]">
//           Inventory & Service Management System
//         </span>

//         <div className="mt-1 text-2xl font-semibold text-[#4f2d12] capitalize">
//           Welcome, {isSignedIn ? user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress : "Guest"}!
//         </div>

//         <div className="mt-1 flex items-center gap-3 text-sm font-medium text-[#7c4722]">
//           <span>{currentDate}</span>
//           <span className="text-[#c07e34]">•</span>
//           <Time />
//         </div>
//       </div>

//       {/* RIGHT SIDE — USER BUTTON */}
//       <div className="flex items-center gap-3">
//         {isSignedIn && (
//           <div className="text-xs uppercase tracking-[0.4em] rounded-full bg-[#fff1d7] px-4 py-1 text-[#b26c27] shadow-inner shadow-[#f8d8ae]">
//             {roleString}
//           </div>
//         )}

//         <ClerkLoaded>
//           <SignedIn>
//             <div className="flex flex-col items-center gap-1 text-center">
//               <UserButton
//                 appearance={{
//                   elements: {
//                     userButtonAvatarBox: "h-14 w-14",
//                     userButtonTrigger: "p-0",
//                   },
//                 }}
//                 afterSignOutUrl="/"
//                 showName={false}
//               />
//               <span className="text-xs text-[#7c4722]">
//                 {user?.fullName || user?.primaryEmailAddress?.emailAddress}
//               </span>
//             </div>
//           </SignedIn>
//         </ClerkLoaded>
//       </div>
//     </header>
//   );
// };