// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   ClerkLoaded,
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   UserButton,
//   useUser,
// } from "@clerk/nextjs";
// import { Loader2, Menu, X } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// export const Header = () => {
//   const { user, isSignedIn, isLoaded } = useUser();
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     setMounted(true);

//     if (isSignedIn && isLoaded) {
//       const role = user?.publicMetadata?.role;
//       switch (role) {
//         case "admin":
//           router.push("/admin/admin_dashboard");
//           break;
//         case "sales":
//           router.push("/sales/sales_dashboard");
//           break;
//         case "warehouseman":
//           router.push("/warehouse/w_dashboard");
//           break;
//         case "purchasing":
//           router.push("/purchasing/dashboard");
//           break;
//         default:
//           router.push("/customer/cus_dashboard");
//       }
//     }
//   }, [isSignedIn, isLoaded, user, router]);

//   return (
//     <header className="sticky z-1000 top-0 h-15 w-full border-b-2 bg-white">
//       <div className="lg:max-w-full-lg mx-auto flex items-center justify-between h-full px-4">
//         {/* Logo and Navigation */}
//         <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
//           <a href="/landing_page/home">
//             <Image src="/cticlogo.webp" height={40} width={40} alt="CTIC" />
//           </a>
//           <h1 className="text-2xl font-extrabold text-yellow-600 tracking-wide">
//             CTIC
//           </h1>

//           {/* Desktop Navigation */}
//           <div className="hidden lg:flex">
//             <Button
//               variant="link"
//               size="sm"
//               onClick={() => router.push("/landing_page/home")}
//             >
//               Home
//             </Button>
//             <Button
//               variant="link"
//               size="sm"
//               onClick={() => router.push("/landing_page/product")}
//             >
//               Products
//             </Button>
//             <Button
//               variant="link"
//               size="sm"
//               onClick={() => router.push("/landing_page/services")}
//             >
//               Services
//             </Button>
//             <Button
//               variant="link"
//               size="sm"
//               onClick={() => router.push("/landing_page/contact")}
//             >
//               Contact
//             </Button>
//           </div>
//         </div>

//         {/* Mobile Menu Button and Auth */}
//         <div className="flex items-center gap-x-4 pr-4">
//           {/* Auth Buttons */}
//           {mounted ? (
//             <ClerkLoaded>
//               <SignedIn>
//                 <UserButton showName afterSignOutUrl="/" />
//               </SignedIn>
//               <SignedOut>
//                 <SignInButton mode="modal">
//                   <Button variant="sidebar" size="sm">
//                     Sign In
//                   </Button>
//                 </SignInButton>
//               </SignedOut>
//             </ClerkLoaded>
//           ) : (
//             <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
//           )}

//           {/* Mobile Menu Button */}
//           <button
//             className="lg:hidden"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? (
//               <X className="h-6 w-6" />
//             ) : (
//               <Menu className="h-6 w-6" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="lg:hidden border-t-2 bg-white px-4 py-4">
//           <Button
//             variant="link"
//             size="sm"
//             onClick={() => {
//               router.push("/landing_page/home");
//               setMobileMenuOpen(false);
//             }}
//             className="w-full text-left"
//           >
//             Home
//           </Button>
//           <Button
//             variant="link"
//             size="sm"
//             onClick={() => {
//               router.push("/landing_page/product");
//               setMobileMenuOpen(false);
//             }}
//             className="w-full text-left"
//           >
//             Products
//           </Button>
//           <Button
//             variant="link"
//             size="sm"
//             onClick={() => {
//               router.push("/landing_page/services");
//               setMobileMenuOpen(false);
//             }}
//             className="w-full text-left"
//           >
//             Services
//           </Button>
//           <Button
//             variant="link"
//             size="sm"
//             onClick={() => {
//               router.push("/landing_page/contact");
//               setMobileMenuOpen(false);
//             }}
//             className="w-full text-left"
//           >
//             Contact
//           </Button>
//         </div>
//       )}
//     </header>
//   );
// };


"use client";

import { Button } from "@/components/ui/button";
import {
  ClerkLoaded,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const Header = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (isSignedIn && isLoaded) {
      const role = user?.publicMetadata?.role;
      switch (role) {
        case "admin":
          router.push("/admin/admin_dashboard");
          break;
        case "sales":
          router.push("/sales/sales_dashboard");
          break;
        case "warehouseman":
          router.push("/warehouse/w_dashboard");
          break;
        case "purchasing":
          router.push("/purchasing/dashboard");
          break;
        default:
          router.push("/customer/cus_dashboard");
      }
    }
  }, [isSignedIn, isLoaded, user, router]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/landing_page/product" },
    { label: "Services", href: "/landing_page/services" },
    { label: "Contact", href: "/landing_page/contact" },
  ];

  return (
    <header className="sticky top-0 z-[1000] w-full">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-xl shadow-lg shadow-black/20">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 text-left"
          >
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full bg-white/30 blur-xl" />
              <Image
                src="/cticlogo.webp"
                alt="CTIC"
                fill
                sizes="40px"
                className="relative object-contain drop-shadow"
              />
            </div>
            <span className="text-lg font-semibold tracking-[0.3em] text-red-600">
              CTIC
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                size="sm"
                className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#173f63] shadow hover:bg-white"
                onClick={() => router.push(link.href)}
              >
                {link.label}
              </Button>
            ))}
          </nav>

          {/* Auth */}
          {mounted ? (
            <ClerkLoaded>
              <SignedIn>
                <UserButton showName afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="bg-gradient-to-r from-[#f5b747] to-[#f28e1d] text-white shadow-lg hover:shadow-xl">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
            </ClerkLoaded>
          ) : (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          )}
        </div>
      </div>
    </header>
  );
};