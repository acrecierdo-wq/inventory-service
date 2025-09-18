// app/admin/page.tsx

"use client";

import { Header } from "@/components/header";
import { useState } from "react";

export default function AdminCreateAccountsPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("warehouseman");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, role }),
            });
            const data = await res.json();
            if (res.ok) {
                alert("user created! ID: " + data.userId);
                setUsername(""); setEmail(""); setPassword("");
            } else {
                alert("Error: " + data.error);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="h-screen w-full bg-[#ffedce] flex flex-col">
            <Header />
            Create Accounts
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    className="border p-2 w-full"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input 
                    className="border p-2 w-full"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input 
                    className="border p-2 w-full"
                    placeholder="Temporary Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <select
                    className="border p-2 w-full"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                >
                    <option value ="warehouseman">Warehouseman</option>
                    <option value="sales">Sales</option>
                </select>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create User"}
                </button>
            </form>
            </main>
    );
}