// // app/components/header.tsx

// "use client"
// import { cn } from "@/lib/utils";
// import { ClerkLoaded, SignedIn, useUser, useClerk } from "@clerk/nextjs";
// import Image from "next/image";
// import Time from "./ui/time";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useRouter } from "next/navigation";

// type Props = {
//     className?: string;
// };

// export const Header = ({className}: Props) => {
//     const {isSignedIn, user} = useUser();
//     const { signOut } = useClerk();

//     const currentDate = new Date().toLocaleDateString('en-US', { 
//         weekday: 'long', // Day of the week (e.g., Monday, Tuesday, etc.)
//         year: 'numeric', // Full year (e.g., 2023)
//         month: 'long', // Full month name (e.g., January, February, etc.)
//         day: 'numeric' // Day of the month (e.g., 1, 2, etc.)
//     });
    
//     const router = useRouter();

//     return (
//         <div className={cn
//         ("z-50 sticky top-0 h-20 pl-[250px] flex flex-row items-center justify-between border-b-2 border-slate-200 px-4 bg-[#ffc922]",
//             className,

//         )}>
//             {/* System Titel and Greetings */}
//             <div className="flex flex-col">
//                 <div className="text-[#642248] font-bold text-lg sm:text-xl">
//                 Inventory and Service Management System
//                 {isSignedIn ? (
//                     <div className="text-sm font-bold">- Welcome, {user?.firstName}!</div>
//                 ) : (
//                     <div className="text-sm font-semibold">- Welcome, Guest!</div>
//                 )}
//                 </div>
//                 <div className="text-[#ffffff] font-bold text=[10px] sm:text-xs">
//                 {currentDate} | <Time />
//                 </div>
//             </div>
//             {/* Right side icon */}
//             <div className="flex flex-row">
//                 <Image
//                 src="/bell-alt-svgrepo-com.svg"
//                 alt="logo"
//                 height={30}
//                 width={30}
//                 className="hidden sm:block"
//                 />

//             {/* User dropdown */}
//             <ClerkLoaded>
//                 <SignedIn>
//                     <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                             <Avatar className="cursor-pointer">
//                                 <AvatarImage src={user?.imageUrl || ""} alt={user?.firstName || "User"} />
//                                 <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
//                             </Avatar>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent className="absolute right-0 z-100 bg-white shadow border rounded text-sm w-32 ">
//                             <DropdownMenuItem
//                                 onClick={() => {
//                                     if (!user) return;

//                                     const role = user.publicMetadata?.role;
//                                     let myAccountRoute = "/my-account";

//                                     if (role === "warehouseman") myAccountRoute = "/warehouse/my-account";
//                                     if (role === "sales") myAccountRoute = "/sales/my-account";
//                                     if (role === "admin") myAccountRoute = "/admin/my-account";

//                                     router.push(myAccountRoute);
//                                 }}
//                             >
//                                 My Account
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/"})}>
//                                 Logout
//                             </DropdownMenuItem>
//                         </DropdownMenuContent>
//                     </DropdownMenu>
//                 </SignedIn>
//             </ClerkLoaded>
//             </div>
//             </div>
//     );
// };

// app/components/header.tsx

"use client"
import { cn } from "@/lib/utils";
import { ClerkLoaded, SignedIn, useUser, useClerk } from "@clerk/nextjs";
import Time from "./ui/time";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

type Props = {
    className?: string;
};

export const Header = ({className}: Props) => {
    const {isSignedIn, user} = useUser();
    const { signOut } = useClerk();

    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', // Day of the week (e.g., Monday, Tuesday, etc.)
        year: 'numeric', // Full year (e.g., 2023)
        month: 'long', // Full month name (e.g., January, February, etc.)
        day: 'numeric' // Day of the month (e.g., 1, 2, etc.)
    });
    
    const router = useRouter();

    return (
        <div className={cn
        ("z-50 sticky top-0 h-20 pl-[250px] flex flex-row items-center justify-between border-b-2 border-slate-200 px-4 bg-[#ffc922]",
            className,

        )}>
            {/* System Titel and Greetings */}
            <div className="flex flex-col">
                <div className="text-[#642248] font-bold text-lg sm:text-xl">
                Inventory and Service Management System
                {isSignedIn ? (
                    <div className="text-sm font-bold capitalize">- Welcome, {user.username ||user.firstName || user.emailAddresses[0].emailAddress}!</div>
                ) : (
                    <div className="text-sm font-semibold">- Welcome, Guest!</div>
                )}
                </div>
                <div className="text-[#ffffff] font-bold text=[10px] sm:text-xs">
                {currentDate} | <Time />
                </div>
            </div>
            {/* Right side icon */}
            <div className="flex flex-row">
                {/* <Image
                src="/bell-alt-svgrepo-com.svg"
                alt="logo"
                height={30}
                width={30}
                className="hidden sm:block"
                /> */}

            {/* User dropdown */}
            <ClerkLoaded>
                <SignedIn>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex flex-col items-center cursor-pointer">
                                <Avatar>
                                <AvatarImage src={user?.imageUrl || ""} alt={user?.firstName || user?.username ||"User"} />
                                <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <p
                                 className="mt-1 text-xs font-medium text-[#642248] capitalize">
                                    {user?.username||user?.fullName || user?.primaryEmailAddress?.emailAddress}
                                 </p>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="absolute right-0 z-100 bg-white shadow border rounded text-sm w-32 ">
                            <DropdownMenuItem
                                onClick={() => {
                                    if (!user) return;

                                    const role = user.publicMetadata?.role;
                                    let myAccountRoute = "/my-account";

                                    if (role === "warehouseman") myAccountRoute = "/warehouse/my-account";
                                    if (role === "sales") myAccountRoute = "/sales/my-account";
                                    if (role === "admin") myAccountRoute = "/admin/my-account";
                                    if (role === "purchasing") myAccountRoute = "/purchasing/my-account";

                                    router.push(myAccountRoute);
                                }}
                            >
                                My Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/"})}>
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