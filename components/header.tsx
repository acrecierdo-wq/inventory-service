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
        "z-50 sticky top-0 h-18 sm:h-20",

        "flex flex-row items-center justify-between",
        "border-b-2 border-slate-200 px-2 sm:px-4 bg-[#ffc922]",
        className
      )}
    >
      {/* System Title and Greetings */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="text-[#642248] font-bold text-sm sm:text-lg lg:text-xl truncate">
          <span className="">Inventory and Service Management System</span>
          {/* <span className="md:hidden">ISMS</span> */}
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
