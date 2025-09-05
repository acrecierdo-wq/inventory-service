import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";

const ReplenishmentLogPage = () => {
    return (
        <WarehousemanClientComponent>
        <div className="bg-[#ffedce] h-full w-full">
        <Header />
            Replenishment Log
            </div>
        </WarehousemanClientComponent>
    );
};

export default ReplenishmentLogPage;