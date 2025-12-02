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