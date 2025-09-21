import { SideBarWarehouse } from "@/components/sidebar-warehouse";
import RoleGuard from "../validate/role_guard";


type Props = {
    children: React.ReactNode;
};

const WarehouseLayout = ({children,}: Props) => {
    return (
        <RoleGuard allowedRoles={["warehouseman"]}>
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
        </RoleGuard>
    );
}

export default WarehouseLayout;