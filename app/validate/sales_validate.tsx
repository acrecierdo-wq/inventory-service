"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { redirect } from "next/navigation";

const SalesClientComponent = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'sales') {
      redirect("/");
    }
  }, [isLoaded, user]);

  return <>{user?.publicMetadata?.role === 'sales' && children}</>;
};

export default SalesClientComponent;