import { SideBarSales } from "@/components/sidebar-sales";
import RoleGuard from "../validate/role_guard";
import MustChangePasswordRedirect from "@/components/change-password/change-password-redirect"; 

type Props = {
    children: React.ReactNode;
};

const SalesLayout = ({children,}: Props) => {
    return (
        <RoleGuard allowedRoles={["sales"]}>
            <MustChangePasswordRedirect>
        <div className="min-h-screen flex flex-row bg-dash">
        <>
        <SideBarSales/>
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
};

export default SalesLayout;