"use client";

import { SideBarPurchasing } from "@/components/sidebar-purchasing";
import RoleGuard from "../validate/role_guard";
import MustChangePasswordRedirect from "@/components/change-password/change-password-redirect";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

const PurchasingLayout = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={["purchasing"]}>
      <MustChangePasswordRedirect>
        <div className="h-screen flex bg-dash overflow-hidden">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-5 left-4 z-[60] bg-[#ffc922] p-2 rounded-md shadow-lg hover:bg-[#e6b41f]"
            //aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
              fixed lg:static inset-y-0 left-0 z-50 /w-[250px]
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0
            `}
          >
            <SideBarPurchasing onNavigate={() => setSidebarOpen(false)} />
          </div>

          {/* Main content */}
          <main className="flex-1 ml-0 lg:ml-[250px] h-screen overflow-y-auto /p-4">
            {children}
          </main>
        </div>
      </MustChangePasswordRedirect>
    </RoleGuard>
  );
};

export default PurchasingLayout;
