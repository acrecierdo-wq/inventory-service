import { SideBarWarehouse } from "@/components/sidebar-warehouse";
import WarehousemanClientComponent from "../validate/warehouseman_validate";


type Props = {
    children: React.ReactNode;
};

const WarehouseLayout = ({children,}: Props) => {
    return (
        <WarehousemanClientComponent>
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
        </WarehousemanClientComponent>
    );
}

export default WarehouseLayout;