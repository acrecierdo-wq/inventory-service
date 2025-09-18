// app/validate/role_guard.tsx

"use client";
 import { useUser } from "@clerk/nextjs";
 import { useEffect } from "react";
 import { redirect } from "next/navigation";

 export default function RoleGuard({
    allowedRoles,
    children
 } : {
    allowedRoles: string[]; // [admin], [warehouseman], [sales]
    children: React.ReactNode;
 }) {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (
            isLoaded &&
            !allowedRoles.includes(user?.publicMetadata?.role as string)
        ) {
            redirect("/");
        }
    }, [isLoaded, user, allowedRoles]);

    return (
        <>
        {allowedRoles.includes(user?.publicMetadata?.role as string) && children}
        </>
    );
 }