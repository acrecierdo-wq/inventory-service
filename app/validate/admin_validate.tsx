"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { redirect } from "next/navigation";

const AdminClientComponent = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== 'admin') {
      redirect("/");
    }
  }, [isLoaded, user]);

  return <>{user?.publicMetadata?.role === 'admin' && children}</>;
};

export default AdminClientComponent;
