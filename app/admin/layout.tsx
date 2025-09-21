import { SideBarAdmin } from "@/components/sidebar-admin";
import RoleGuard from "../validate/role_guard";

type Props = {
    children: React.ReactNode;
};

const AdminLayout = ({children,}: Props) => {
    return (
        <RoleGuard allowedRoles={["admin"]}>
        <div className="min-h-screen flex flex-row bg-dash">
        <>
        <SideBarAdmin/>
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

export default AdminLayout;