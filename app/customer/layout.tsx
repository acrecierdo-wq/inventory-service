
import { SideBarCustomer } from "@/components/sidebar-customer";

type Props = {
    children: React.ReactNode;
};

const CustomerLayout = ({children,}: Props) => {
    return (
        <div className="min-h-screen flex flex-row bg-dash">
        <>
        <SideBarCustomer/>
          <main className="flex-grow pl-[250px]">
                <div className="h-full">
                {children}
                </div>
          </main>
        </>
        </div>
    );
};

export default CustomerLayout;