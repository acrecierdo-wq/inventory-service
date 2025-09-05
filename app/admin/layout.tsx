import { SideBarAdmin } from "@/components/sidebar-admin";

type Props = {
    children: React.ReactNode;
};

const AdminLayout = ({children,}: Props) => {
    return (

        <div className="min-h-screen flex flex-row bg-dash">
        <>
        <SideBarAdmin/>
          <main className="flex-grow pl-[250px]">
                <div className="h-full">
                {children}
                </div>
          </main>
        </>
        </div>
    );
}

export default AdminLayout;