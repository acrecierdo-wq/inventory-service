// components/change-password/change-password-form.tsx

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSignIn, useUser, useClerk } from "@clerk/nextjs";

export default function ChangePasswordForm() {
    const { signIn, isLoaded: signLoaded } = useSignIn();
    const { user, isLoaded: userLoaded } = useUser();
    const { setActive, signOut } = useClerk();
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [strength, setStrength] = useState(0);
    const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const mustChangePassword = user?.publicMetadata?.mustChangePassword === true;

    const handleSubmit = async () => {
        if (!signLoaded || !signIn) {
            toast.error("Sign-in not ready yet.");
            return;
        }

        if (!userLoaded || !user) {
            toast.error("User not loaded yet.");
            return;
        }

        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        } 

        if (!strongPassword.test(newPassword)) {
            toast.error("Password must be at least 8 characters long and include one uppercase, one number, and one special character.");
            return;
        }

        if (newPassword !== confirmPassword) { 
            toast.error("Passwords do not match.");
            setNewPassword("");
            setConfirmPassword("");
            return;
        }

        setLoading(true);
        try {
            // only verify current password if NOT first-time change
            if (!mustChangePassword) {
                try {
                await signIn?.create({
                    identifier: user?.primaryEmailAddress?.emailAddress ?? "",
                    password: currentPassword,
                });
            } catch {
                toast.error("Current password is incorrect.");
                setLoading(false);
                return;
            }
            }
            
            // call server for updating of password
            const res = await fetch("/api/users/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || "Error updating password.");
            } else {
                toast.success("Password updated successfully!");
                
                try {
                    const signInAttempt = await signIn.create({
                        identifier: user?.primaryEmailAddress?.emailAddress ?? "",
                        password: newPassword,
                    });

                    if (signInAttempt.status === "complete") {
                        await setActive({ session: signInAttempt.createdSessionId });
                    } else {
                        await signOut();
                    }
                } catch (err) {
                    console.error("Error refreshing sessions:", err);
                    await signOut();
                }
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateStrength = (value: string) => {
        let score = 0;
        if (value.length >= 8) score += 25;
        if (/[A-Z]/.test(value)) score +=25;
        if (/\d/.test(value)) score += 25;
        if (/[^A-Za-z0-9]/.test(value)) score += 25;
        return score;
    };

    const isStrong = strongPassword.test(newPassword);

    return (
        <main className="flex flex-col items-center justify-center">

            <section className="bg-white w-[500px] rounded shadow p-5 mt-5">
                <div className="mx-auto mt-2 h-[20px] w-[450px] bg-gradient-to-r from-[#e3ae01] via-[#dc5034] to-[#faf0c5] rounded-2xl" />
                
                <h1 className="text-2xl font-bold mb- text-center text-[#173f63] mt-5 mb-5">My Account</h1>

                <div>
                {!mustChangePassword && (
                    <>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <Input 
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mb-5 hover:bg-gray-100"
            />
            </>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>

            {/* New Password */}
            <Input 
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                    const value = e.target.value;
                    setNewPassword(value);
                    setStrength(calculateStrength(value));
                }}
                className={`${
                    isStrong
                        ? "border-green-500 focus:ring-green-500"
                        : newPassword
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                } hover:bg-gray-100`}
            />
            {/* Strength bar */}
            {newPassword && (
                <div className="h-2 w-full rounded bg-gray-200">
                    <div
                        className={`h-2 rounded transition-all ${
                            strength < 50
                            ? "bg-red-500"
                            : strength < 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${strength}%`}}
                    ></div>
                </div>
            )}

            <p className="text-xs text-gray-500 italic mb-1">
                * Must be at least 8 characters, include one uppercase, one number, and one special character.
            </p>

            {newPassword && (
                <p
                    className={`text-xs font-medium italic ${
                        isStrong ? "text-green-600" : "text-red-600"
                    }`}
                >
                    {isStrong ? "✔ Strong password" : "✖ Weak password"}
                </p>
            )}
            </div>

            <label className="block text-sm font-medium text-gray-700 mt-5">Confirm Password</label>
            <Input 
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="hover:bg-gray-100"
            />
                </div>

        <div className="flex flex-col items-center mt-2">
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center bg-[#173f63] text-white py-2 px-4 rounded hover:bg-[#1f5e8a] disabled:bg-gray-300 disabled:cursor-not-allowed mt-5"
            >
                {loading ? "Changing..." : "Change Password"}
            </button>
        </div>
            <div className="flex items-center justify-center mt-2 h-[20px] w-[450px] bg-gradient-to-r from-[#e3ae01] via-[#dc5034] to-[#faf0c5] rounded-2xl" />

            </section>
        </main>
    )
}