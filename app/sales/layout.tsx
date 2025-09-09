import { SideBarSales } from "@/components/sidebar-sales";
import SalesClientComponent from "../validate/sales_validate";

type Props = {
    children: React.ReactNode;
};

const SalesLayout = ({children,}: Props) => {
    return (
<SalesClientComponent>
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
        </SalesClientComponent>
    );
};

export default SalesLayout;