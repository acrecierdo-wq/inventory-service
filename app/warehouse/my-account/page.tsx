// app/warehouse/my-account/page.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Header } from "@/components/header";

export default function MyAccountPage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [hasPin, setHasPin] = useState<boolean | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    // check if PIN exist
    useEffect(() => {
        if (!user) return;
        const checkPin = async () => {
            try {
                const res = await fetch("/api/warehouse_pin", { method: "GET" });
                const data = await res.json();
                setUpdatedAt(data.updatedAt);

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
    // validation first
    if (hasPin) {
        if (!oldPin) {
        toast.error("Enter your current PIN.");
        return;
        }
        if (!/^\d{4}$/.test(newPin) || !/^\d{4}$/.test(confirmPin)) {
        toast.error("New PIN must be 4 digits.");
        return;
        }
        if (newPin !== confirmPin) {
        toast.error("New PINs do not match.");
        setNewPin("");
        setConfirmPin("");
        return;
        }
    } else {
        if (!/^\d{4}$/.test(newPin)) {
        toast.error("PIN must be 4 digits.");
        return;
        }
    }

    setLoading(true);
    try {
        const body = hasPin ? { oldPin, newPin } : { newPin };
        const res = await fetch("/api/warehouse_pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
        // show toast directly from server message
        toast.error(data.error || "Failed to update PIN.");

        // clear fields if incorrect PIN
        if (data.error?.toLowerCase().includes("Current pin is incorrect. Please try again.")) {
            setOldPin("");
            setNewPin("");
            setConfirmPin("");
        }

        setLoading(false);
        return; // stop here
        }

        // success
        toast.success("PIN updated successfully!");
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
        setHasPin(true);
        // if API returns updatedAt
        if (data.updatedAt) setUpdatedAt(data.updatedAt);
        else setUpdatedAt(new Date().toISOString());
    } catch (error) {
        console.error("Failed to update PIN:", error);
        toast.error("Failed to update PIN. Please try again.");
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
                <div className="">
                    <label className="text-sm font-medium">Set / Update PIN</label>
                    <div className="mt-5 mb-5">
                        {hasPin === null ? (
                        <p className="text-gray-500 text-sm">Checking PIN status...</p>
                    ) : hasPin ? (
                        <p className="text-green-600 text-sm"> ✅ You already have a PIN set. You can update it below.</p>
                    ) : (
                        <p className="text-red-600 etxt-sm"> ⚠️ No PIN set yet. Please create one.</p>
                    )}
                    </div>

                {hasPin ? (
                    <>
                    <p className="text-xs text-gray-600 mb-2">
                            <strong>PIN created at:</strong>{" "}
                            {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
                    </p>
                    <Input 
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={oldPin}
                        onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter your current PIN"
                        maxLength={4}
                        className=""
                    />
                    <div className="flex flex-row justify-center items-center mt-2">
                        <span className="text-sm text-gray-400">Update below</span>
                        <div className="ml-2 border-t pt-4 mt-4 w-[300px]"></div>
                    </div>
                    <Input 
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter your new PIN"
                        maxLength={4}
                        className="mb-2"
                    />
                    <Input 
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Confirm new PIN"
                        maxLength={4}
                        className="mb-2"
                    />
                    <p className="text-xs text-gray-600 mb-5">
                            <strong>PIN updated at:</strong>{" "}
                            {updatedAt ? new Date(updatedAt).toLocaleString() : "N/A"}
                    </p>
                    </>
                ) : (
                    <Input 
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 4 digit PIN"
                        maxLength={4}
                        className="mt-2"
                    />
                )}
                
                {/* timestamp */}
                {/* <div className="space-y-3">
                    {hasPin && (
                        <>
                        
                        
                        </>
                    )}
                </div> */}
                
                <button
                    onClick={handleSavePin}
                    disabled={loading}
                    className="w-full bg-[#642248] text-white py-2 rounded"
                >
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