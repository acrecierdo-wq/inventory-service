"use client"

import { Button } from "@/components/ui/button";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const Header = () => {
    const { user, isSignedIn, isLoaded } = useUser(); 
    const router = useRouter();
    
    useEffect(() => {
        // Check if the user is signed in and user data is loaded
        if (isSignedIn && isLoaded) {
            // Assuming you have 'role' stored in publicMetadata of the user
                if (user?.publicMetadata?.role === 'admin') {
                    router.push("/admin/admin_dashboard");
                } else if (user?.publicMetadata?.role === 'sales') {
                        router.push("/sales/sales_dashboard");    
                } else if (user?.publicMetadata?.role === 'purchasing') {
                    router.push("/purchasing/purchasing_dashboard");
                } else if (user?.publicMetadata?.role === 'warehouseman') {
                    router.push("/warehouse/w_dashboard");
                }  else if (user?.publicMetadata?.role === 'manager') {
                    router.push("/manager/m_dashboard");
                } else {
                    router.push("/");
                }
        }
    }, [isSignedIn, isLoaded, user, router]);
    return (
        <header className=" sticky z-1000 top-0 h-15 w-full border-b-2 bg-white px-4">
        <div className="lg:max-w-full-lg mx-auto flex items-center justify-between h-full">
            <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
            <a href="/landing_page/home">
            <Image src="/cticlogo.webp" height={40} width={40} alt="CTIC" />
            </a>
            <h1 className="text-2xl font-extrabold text-yellow-600 tracking-wide">
            CTIC
            </h1>
            <div>
            <Button variant="link" size="sm" onClick={() => router.push("/landing_page/home")}> 
                Home
                </Button>
                <Button variant="link" size="sm" onClick={() => router.push("/landing_page/product")}> 
                Products
                </Button>
                <Button variant="link" size="sm" onClick={() => router.push("/landing_page/services")}>
                Services
                </Button>
                <Button variant="link" size="sm" onClick={() => router.push("/landing_page/contact")}>
                Contact
                </Button>
                </div>
        </div>
            <ClerkLoading>
                <Loader className="h-5 w-5 text-muted-foreground animate-spin"/>
            </ClerkLoading>
            <ClerkLoaded>
            <SignedIn>
                <UserButton 
                showName afterSignOutUrl="/"
                /> 
            </SignedIn>
            <SignedOut>
                <SignInButton
                    mode="modal"
                >
                    <div className="">
                    <Button variant="sidebar" size="sm">Sign In</Button></div>
                </SignInButton>
            </SignedOut>
            </ClerkLoaded>
        </div>
        </header>
    );
};