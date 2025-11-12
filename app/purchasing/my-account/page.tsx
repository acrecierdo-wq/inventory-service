// app/warehouse/my-account/page.tsx

"use client";

import ChangePasswordForm from "@/components/change-password/change-password-form";
import { Header } from "@/components/header";

export default function PurchasingMyAccountPage() {
    return(
        <main className="bg-[#ffedce] w-full h-full flex flex-col">
            <Header />

            <section>
                <div>
                    {/* <h1 className="text-2xl font-bold mb-4">My Account</h1> */}
                    <ChangePasswordForm />
            </div>
            </section>
            
        </main>
    );
}