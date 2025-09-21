// // app/admin/page.tsx

// "use client";

// import { Header } from "@/components/header";
// import { useState } from "react";

// export default function AdminCreateAccountsPage() {
//     const [username, setUsername] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [role, setRole] = useState("warehouseman");
//     const [loading, setLoading] = useState(false);

//     async function handleSubmit(e: React.FormEvent) {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             const res = await fetch("/api/admin/users", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ username, email, password, role }),
//             });
//             const data = await res.json();
//             if (res.ok) {
//                 alert("user created! ID: " + data.userId);
//                 setUsername(""); setEmail(""); setPassword("");
//             } else {
//                 alert("Error: " + data.error);
//             }
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <main className="h-screen w-full bg-[#ffedce] flex flex-col">
//             <Header />
//             Create Accounts
//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <input 
//                     className="border p-2 w-full"
//                     placeholder="Username"
//                     value={username}
//                     onChange={e => setUsername(e.target.value)}
//                 />
//                 <input 
//                     className="border p-2 w-full"
//                     placeholder="Email"
//                     value={email}
//                     onChange={e => setEmail(e.target.value)}
//                 />
//                 <input 
//                     className="border p-2 w-full"
//                     placeholder="Temporary Password"
//                     type="password"
//                     value={password}
//                     onChange={e => setPassword(e.target.value)}
//                 />
//                 <select
//                     className="border p-2 w-full"
//                     value={role}
//                     onChange={e => setRole(e.target.value)}
//                 >
//                     <option value ="warehouseman">Warehouseman</option>
//                     <option value="sales">Sales</option>
//                 </select>
//                 <button
//                     type="submit"
//                     className="bg-blue-600 text-white px-4 py-2 rounded"
//                     disabled={loading}
//                 >
//                     {loading ? "Creating..." : "Create User"}
//                 </button>
//             </form>
//             </main>
//     );
// }

// app/admin/page.tsx
"use client";

import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type StaffUser = {
  id: string;
  username: string | null;
  email: string | null;
  role: string | null;
  status: "active" | "deactivated";
};

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("warehouseman");
  const [loading, setLoading] = useState(false);

  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  async function fetchStaff() {
    setLoadingStaff(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setStaff(data.staff || []);
      } else {
        // handle 401/403 specially
        if (res.status === 401) {
          toast.error("You must be signed in as an admin to view this page.");
        } else if (res.status === 403) {
          toast.error("Access denied. Admin role required.");
        } else {
          toast.error(data.error || "Failed to load staff");
        }
      }
    } catch (err: any) {
      console.error("[admin page] fetch staff error:", err);
      toast.error("Network error fetching staff");
    } finally {
      setLoadingStaff(false);
    }
  }

  useEffect(() => {
    fetchStaff();
  }, []);

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
        toast.success("User created! ID: " + data.userId);
        setUsername("");
        setEmail("");
        setPassword("");
        fetchStaff();
      } else {
        toast.error(data.error || "Error creating user");
      }
    } catch (err: any) {
      console.error("[admin page] create user error:", err);
      toast.error("Network error creating user");
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(userId: string, action: string, newRole?: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User updated");
        fetchStaff();
      } else {
        if (res.status === 401) {
          toast.error("Sign in required (admin).");
        } else if (res.status === 403) {
          toast.error("Forbidden: admin only.");
        } else {
          toast.error(data.error || "Error updating user");
        }
      }
    } catch (err: any) {
      console.error("[admin page] update user error:", err);
      toast.error("Network error updating user");
    }
  }

  return (
    <main className="h-screen w-full bg-[#ffedce] flex flex-col p-4 space-y-6">
      <Header />

      <div className="max-w-4xl w-full mx-auto space-y-6">
        <h1 className="text-xl font-bold">Create Accounts</h1>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <input className="border p-2 w-full" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="border p-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border p-2 w-full" placeholder="Temporary Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select className="border p-2 w-full" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="warehouseman">Warehouseman</option>
            <option value="sales">Sales</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>

        <h2 className="text-xl font-bold">Staff List</h2>

        {loadingStaff ? (
          <p>Loading staff…</p>
        ) : staff.length === 0 ? (
          <p>No staff found</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Username</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.username ?? "-"}</td>
                  <td className="p-2 border">{u.email ?? "-"}</td>
                  <td className="p-2 border">{u.role}</td>
                  <td className="p-2 border">{u.status}</td>
                  <td className="p-2 border space-x-2">
                    {u.status === "active" ? (
                      <button onClick={() => updateUser(u.id, "deactivate")} className="bg-red-600 text-white px-2 py-1 rounded">
                        Deactivate
                      </button>
                    ) : (
                      <button onClick={() => updateUser(u.id, "activate")} className="bg-green-600 text-white px-2 py-1 rounded">
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => updateUser(u.id, "changeRole", u.role === "warehouseman" ? "sales" : "warehouseman")}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Switch Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
