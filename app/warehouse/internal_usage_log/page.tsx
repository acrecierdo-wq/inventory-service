import WarehousemanClientComponent from "@/app/validate/warehouseman_validate";
import { Header } from "@/components/header";

const InternalUsageLogPage = () => {
    return ( 
    <WarehousemanClientComponent>
    <div className="bg-[#ffedce] h-full w-full">
    <Header />
        InternalUsageLogPage
    </div>
    </WarehousemanClientComponent>
    );
};

export default InternalUsageLogPage;