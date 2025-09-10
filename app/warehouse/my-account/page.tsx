// app/warehouse/my-account/page.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Header } from "@/components/header";

export default function MyAccountPage() {
    const { user } = useUser();
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasPin, setHasPin] = useState<boolean | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    // check if PIN exist
    useEffect(() => {
        if (!user) return;
        const checkPin = async () => {
            try {
                const res = await fetch("/api/warehouse_pin", { method: "GET" });
                const data = await res.json();

                if (res.ok) {
                    setHasPin(data.hasPin);
                    setCreatedAt(data.createdAt);
                    setUpdatedAt(data.updatedAt);
                } else {
                    setHasPin(false);
                }
            } catch (err) {
                console.error("Failed to check PIN:", err);
                setHasPin(false);
            }
        };
        checkPin();
    }, [user]);

    if (!user) {
        return <div className="p-6">Loading...</div>
    }

    // save/update PIN

    const handleSavePin = async () => {
        if (!/^\d{4}$/.test(pin)) {
            toast.error("PIN must be 4 digits.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/warehouse_pin", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPin: pin }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update PIN.");
            }

            toast.success("PIN updated successfully!");
            setPin("");
            setHasPin(true);
        } catch (error) {
            console.error("Failed to update PIN:", error);
            toast.error("Failed to update PIN.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-[#ffedce] w-full h-full">
            <Header />
            <div className="flex justify-center items-center p-6">
            <div className="h-auto w-full max-w-md shadow-lg rounded-2xl p-6 bg-white">
                <h2 className="mb-5 text-lg text-center font-bold text-[#642248]">My Account</h2>
            <div className="space-y-4">
                {/* user info */}
                <div className="space-y-3">
                    <p><strong>Name:</strong> {user.fullName}</p>
                    <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
                </div>
                
                <div className="border-t pt-4 mt-4 w-[400px]">
                {/* Pin update */}
                <div className="space-y-5">
                    <label className="text-sm font-medium">Set / Update PIN</label>
                    <div className="mt-5">
                        {hasPin === null ? (
                        <p className="text-gray-500 text-sm">Checking PIN status...</p>
                    ) : hasPin ? (
                        <p className="text-green-600 text-sm mb-2"> ✅ You already have a PIN set. You can update it below.</p>
                    ) : (
                        <p className="text-red-600 etxt-sm mb-2"> ⚠️ You don`&apos;`t have a PIN set yet. Please create one.</p>
                    )}
                    </div>

                    <Input 
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} // strip non-digits
                        placeholder="Enter 4 digit PIN"
                        maxLength={4}
                        className="mt-2"
                    />

                    <div className="space-y-3">
                        {hasPin && (
                            <>
                            <p className="text-sm text-gray-600">
                                <strong>PIN created at:</strong>{" "}
                                {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>PIN updated at:</strong>{" "}
                                {updatedAt ? new Date(updatedAt).toLocaleString() : "N/A"}
                            </p>
                            </>
                        )}
                    </div>
                    <button onClick={handleSavePin} disabled={loading} className="w-full bg-[#642248] text-white py-2 rounded">
                        {loading ? "Saving..." : hasPin ? "Update PIN" : "Set PIN"}
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        </main>
    );
}