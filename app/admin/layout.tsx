import { SideBarAdmin } from "@/components/sidebar-admin";
import RoleGuard from "../validate/role_guard";
import MustChangePasswordRedirect from "@/components/change-password/change-password-redirect"; 

type Props = {
    children: React.ReactNode;
};

const AdminLayout = ({children,}: Props) => {
    return (
        <RoleGuard allowedRoles={["admin"]}>
        <MustChangePasswordRedirect>
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
        </MustChangePasswordRedirect>
        </RoleGuard>
    );
}

export default AdminLayout;