// app/purchasing/layout.tsx

import { SideBarPurchasing} from "@/components/sidebar-purchasing";
import RoleGuard from "../validate/role_guard";
import MustChangePasswordRedirect from "@/components/change-password/change-password-redirect"; 

type Props = {
    children: React.ReactNode;
};

const PurchasingLayout = ({children,}: Props) => {
    return (
        <RoleGuard allowedRoles={["purchasing"]}>
            <MustChangePasswordRedirect>
                <div className="h-full flex flex-row bg-dash">
        <>
        <SideBarPurchasing />
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

export default PurchasingLayout;