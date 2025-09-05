import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";

const WarehousePickListPage = () => {
    return (
        <WarehousemanClientComponent>
        <div>
            <Header />
            Warehouse Pick List
        </div>
        </WarehousemanClientComponent>
    );
};

export default WarehousePickListPage;