// app/admin/page.tsx
"use client";

import { Header } from "@/components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreHorizontal } from "lucide-react";

type PersonnelAccount = {
  id: number;
  personnelId: number;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

type StaffUser = {
  id: string; 
  username: string | null;
  email: string | null;
  role: string | null;
  status: "Active" | "Inactive";
  createdAt: string;
};

type Personnel = {
  id: number;
  username: string;
  personnelName: string;
  email: string;
};

type CreatedUser = {
  userId: string;
  username: string;
  personnelName: string;
  tempPassword: string;
  email: string;
  createdAt: string;
};

export default function CreateUserPage() {
  const [personnels, setPersonnels] = useState<Personnel[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("role");
  const [loading, setLoading] = useState(false);

  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [isSending, ] = useState(false);
  const [, setRecentUsers] = useState<CreatedUser[]>([]);
  
  // new state to show the generated credentials
  const [lastCreated, setLastCreated] = useState<CreatedUser | null>(null);
  const [mustCopy, setMustCopy] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PersonnelAccount | null>(null);

  function openAccountModal(account: PersonnelAccount) {
    setSelectedAccount(account);
    setShowModal(true);
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (mustCopy) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [mustCopy]);

  async function fetchPersonnels() {
    try {
      const res = await fetch("/api/admin/personnels");
      const data = await res.json();
      if (res.ok) {
        setPersonnels(data.personnels ?? data);
      } else {
        toast.error(data.error || "Failed to load personnels");
      }
    } catch (error) {
      console.error("[admin page] fetch personnels error:", error);
      toast.error("Network error fetching personnels");
    }
  }

  useEffect(() => {
    fetchPersonnels();
  }, []);

  async function fetchStaff() {
    setLoadingStaff(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setStaff(data.staff || []);
      } else {
        toast.error(data.error || "Failed to load staff");
      }
    } catch (error) {
      console.error("[admin page] fetch staff error:", error);
      toast.error("Network error fetching staff");
    } finally {
      setLoadingStaff(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedPersonnelId) {
        toast.error("Please select a personnel");
        return;
      }

      const payload = {
        personnelId: selectedPersonnelId,
        username,
        email,
        role,
      };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error creating user");
        return;
      }

      const createdUser = {
        userId: data.userId,
        username: data.username,
        personnelName: data.personnelName || "",
        email: data.email,
        tempPassword: data.tempPassword,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      toast.success("User created!");

      setLastCreated(createdUser);
      setRecentUsers((prev) => [createdUser, ...prev]);
      setMustCopy(true);

      setSelectedPersonnelId(null);
      setUsername("");
      setEmail("");
      setRole("role");

      fetchStaff();
    } catch (error) {
      console.error("[admin page] create user error:", error);
      toast.error("Network error creating user");
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(userId: string, action: string, newRole?: string) {
    setLoadingUserId(userId);
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
        toast.error(data.error || "Error updating user");
      }
    } catch (error) {
      console.error("[admin page] update user error:", error);
      toast.error("Network error updating user");
    } finally {
      setLoadingUserId(null);
    }
  }

  return (
    <main className="h-full w-full bg-[#ffedce]">
      <Header />

      <div >
        
      <section className="flex flex-col gap-6 mt-4 md:flex-row justify-center items-start">
      
      {/* Form */}
      <div className="w-[600px] bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-[#173f63] mb-2">Create Accounts</h1>

        <Select
        value={selectedPersonnelId ? String(selectedPersonnelId) : ""}
          onValueChange={(value) => {
            const p = personnels.find((x) => String(x.id) === value);
            if (p) {
              setSelectedPersonnelId(p.id);
              setUsername(p.username);
              setEmail(p.email);
            }
          }}
        >
          <label className="text-[#173f63]">Personnel</label>
          <SelectTrigger className="border p-2 w-full rounded mb-2 hover:bg-gray-100 cursor-pointer">
            <SelectValue placeholder="Select Personnel" />
          </SelectTrigger>

          <SelectContent>
            {personnels.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.username} - {p.personnelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <form  onSubmit={handleSubmit} className="space-y-2 w-full">
          <label className="text-[#173f63]">Username (Employee Code)</label>
          <input 
            className="border p-2 w-full rounded"
            value={username}
            disabled
          />

          <label className="text-[#173f63]">Email</label>
          <input 
            className="border p-2 w-full rounded"
            value={email}
            disabled
          />
 
          <Select onValueChange={setRole} value={role}>
            <SelectTrigger className="border p-2 w-full rounded hover:bg-gray-100 cursor-pointer">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="role">Select a Role</SelectItem>
              <SelectItem value="warehouseman">Warehouseman</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="purchasing">Purchasing</SelectItem>
            </SelectContent>
          </Select>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className={`text-white px-4 py-2 rounded transition ${loading ? "cursor-not-allowed" : "bg-blue-600 hover:bg-blue-800 mt-2 cursor-pointer"} `}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
        </form>
      </div>

        </section>
        
        <section className="p-5">
        <h2 className="text-xl font-bold text-[#173f63] p-2">Accounts List</h2>

  <ScrollArea className="bg-white h-[250px] rounded shadow p-2 relative">
    <div className="">
      <table className="min-w-full text-left border-collapse">
        <thead className="sticky top-0 z-0">
          <tr className="bg-[#fff4e0] rounded shadow">
                  <th className="p-2">Username</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-center">Actions</th>
                  <th className="p-2 text-center">Details</th>
                </tr>
        </thead>
        <tbody>
          {loadingStaff ? (
          <tr>
            <td colSpan={6} className="p-2 text-center italic">Loading...</td>
          </tr>
          ) : staff.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-2 text-center italic">No staff found</td>
          </tr>
          ) : (
          staff.map((u) => (
            <tr key={u.id} className="bg-white">
              <td className="p-2 border-b">{u.username ?? "-"}</td>
              <td className="p-2 border-b">{u.email ?? "-"}</td>
              <td className="p-2 border-b capitalize">{u.role}</td>
              <td className="p-2 border-b">
                <div className="flex flex-col gap-2">
                  <span
                    className={`px-5 py-1 rounded-full text-xs font-medium text-center
                    ${
                      u.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status === "Active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td className="p-2 border-b text-center">
                <div className="inline-flex gap-2 text-center">
                  {!mounted ? (
                    <div className="h-5 w-5" />
                  ) : loadingUserId === u.id ? (
                    <svg
                      className="animate-spin h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    <>
                    {u.status === "Active" ? (
                      <button
                        onClick={() => updateUser(u.id, "deactivate")}
                        className="w-[100px] bg-red-600 text-white text-sm font-semibold py-1 rounded-4xl hover:bg-red-800 cursor-pointer"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUser(u.id, "activate")}
                        className="w-[100px] bg-green-600 text-white text-sm font-semibold py-1 rounded-3xl hover:bg-green-800 cursor-pointer"
                      >
                        Activate
                      </button>
                    )}
                    </>
                  )}
                </div>
              </td>
              <td className="p-2 border-b">
                <div className="flex justify-center">
                  <MoreHorizontal 
                    size={20} 
                    className="cursor-pointer hover:bg-gray-100 rounded-full" 
                    onClick={() =>
                      openAccountModal({
                        id: Number(u.id),
                        personnelId: 0,
                        username: u.username ?? "",
                        email: u.email ?? "",
                        role: u.role ?? "",
                        status: u.status,
                        createdAt: u.createdAt
                      })
                    }
                  />
                </div>
              </td>
            </tr>
          ))
          )}
        </tbody>
      </table>
    </div>
    <div className="absolute top-[46px] left-0 right-0 border-b-2 border-[#d2bda7] pointer-events-none"></div>
  </ScrollArea>
        </section>
{mustCopy && lastCreated && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-bold mb-4">New User Created</h2>
      <p><strong>Username:</strong> {lastCreated.username}</p>
      <p><strong>Personnel Name:</strong> {lastCreated.personnelName}</p>
      <p><strong>Temporary Password:</strong> {lastCreated.tempPassword}</p>
      <p><strong>Created At:</strong> {new Date(lastCreated.createdAt).toLocaleString()}</p>
      <button
        onClick={async () => {
          try {
            const res = await fetch("/api/admin/users/send-credentials", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: lastCreated.email,
                username: lastCreated.username,
                tempPassword: lastCreated.tempPassword
              }),
            });
            const data = await res.json();
            if (res.ok) {
              toast.success("Credentials sent to user's email!");
              setMustCopy(false);
              setLastCreated(null);
            } else {
              toast.error(data.error || "Failed to send email.");
            }
          } catch (err) {
            console.error("Send email error:", err);
            toast.error("Network error sending email");
          }
        }}
        className={`mt-4 px-4 py-2 rounded text-white ${isSending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-800 cursor-pointer"}`}
      >
        {isSending ? "Sending..." : "Send to Email"}
      </button>
    </div>
  </div>
)}

{showModal && selectedAccount && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-[#173f63]">
        Account Details
      </h2>

      <div className="space-y-2">
        <p><strong>Username:</strong> {selectedAccount.username}</p>
        <p><strong>Email:</strong> {selectedAccount.email}</p>
        <p><strong>Role:</strong> {selectedAccount.role}</p>
        <p><strong>Status:</strong> {selectedAccount.status}</p>
        <p>
          <strong>Created:</strong>{" "}
          {new Date(selectedAccount.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className="px-4 py-2 bg-[#173f63] text-white rounded-md hover:bg-[#1f4e7a]"
          onClick={() => setShowModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
    </main>
  );
}
