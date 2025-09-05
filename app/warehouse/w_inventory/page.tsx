import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";

const WarehouseInventoryPage = () => {
    return (
        <WarehousemanClientComponent>
        <div>
            <Header />
            <div className="bg-[#f6f6f6]"></div>
            Warehouse Inventory
        </div>
        </WarehousemanClientComponent>
    );
};

export default WarehouseInventoryPage;