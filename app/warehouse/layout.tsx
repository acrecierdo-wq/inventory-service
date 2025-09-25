// app/warehouse/layout.tsx

import { SideBarWarehouse } from "@/components/sidebar-warehouse";
import RoleGuard from "../validate/role_guard";
import MustChangePasswordRedirect from "@/components/change-password/change-password-redirect";


type Props = {
    children: React.ReactNode;
};

const WarehouseLayout = ({children,}: Props) => {
    return (
        <RoleGuard allowedRoles={["warehouseman"]}>
            <MustChangePasswordRedirect>
                <div className="h-full flex flex-row bg-dash">
        <>
        <SideBarWarehouse />
          <main className="flex-grow pl-[250px]">
                <div className="h-full">
                {children}
                </div>
          </main>
        </>
        </div>
            </MustChangePasswordRedirect>
        </RoleGuard>
    );
}

export default WarehouseLayout;