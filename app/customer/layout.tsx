
import { SideBarCustomer } from "@/components/sidebar-customer";
import CustomerClientComponent from "../validate/customer_validate";

type Props = {
    children: React.ReactNode;
};

const CustomerLayout = ({children,}: Props) => {
    return (
        <CustomerClientComponent>
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
        </CustomerClientComponent>
    );
};

export default CustomerLayout;