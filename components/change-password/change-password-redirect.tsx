// components/change-password/page.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MustChangePasswordRedirect({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!user) return;

        const mustChange = user.publicMetadata?.mustChangePassword;
        if (!mustChange) return;

        // determine the correct user-level my-account route
        let myAccountRoute = "/my-account";
        const role = user.publicMetadata?.role;

        if (role === "warehouseman") myAccountRoute = "/warehouse/my-account";
        if (role === "sales") myAccountRoute = "/sales/my-account";
        if (role === "admin") myAccountRoute = "/admin/my-account";
        if (role === "purchasing") myAccountRoute = "/purchasing/my-account";

        // only redirect if not already on my-account page
        if (pathname !== myAccountRoute) {
            router.replace(myAccountRoute);
        }
    }, [user, pathname, router]);

    return <>{children}</>
}