// app/admin/page.tsx
"use client";

import { Header } from "@/components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area"
import { set } from "zod";

type StaffUser = {
  id: string;
  username: string | null;
  email: string | null;
  contactNumber: string | null;
  role: string | null;
  status: "Active" | "Inactive";
};

type CreatedUser = {
  userId: string;
  username: string;
  tempPassword: string;
  email: string;
};

export default function CreateUserPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [role, setRole] = useState("role");
  const [loading, setLoading] = useState(false);

  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // new state to show the generated credentials
  const [lastCreated, setLastCreated] = useState<CreatedUser | null>(null);
  
  const [mustCopy, setMustCopy] = useState(false);

  const [mounted, setMounted] = useState(false);

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
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, role, contactNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User created!");
        setUsername("");
        setEmail("");
        setContactNumber("");
        setRole("role");
        // show credentails to admin
        setLastCreated({
          userId: data.userId,
          username: data.username,
          email: email,
          tempPassword: data.tempPassword
        });
        setMustCopy(true);
        fetchStaff();
      } else {
        toast.error(data.error || "Error creating user");
      }
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
      <div className="w-[600px] h-[300px] bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold text-[#173f63] mb-2">Create Accounts</h1>

        <form  onSubmit={handleSubmit} className="space-y-2 w-full">
          <input 
            className="border p-2 w-full rounded hover:bg-gray-100 text-sm"
            placeholder="Username (Employee Code)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input 
            className="border p-2 w-full rounded hover:bg-gray-100 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input 
            className="border p-2 w-full rounded hover:bg-gray-100 text-sm"
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />

          <Select onValueChange={setRole} value={role}>
            <SelectTrigger className="border p-2 w-full rounded hover:bg-gray-100">
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 mt-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
        </form>
      </div>
      
      {/* Credentials box */}
      <div className="w-[600px] h-[250px] p-4 bg-green-100 rounded shadow">
        <h3 className="text-[#173f63] font-bold">New User Credentials</h3>
        <div className="border-t border-[#173f63] pt-4 mt-4 w-[550px]"></div>
        
        {lastCreated ? (
          <>
            <div className="space-y-2">
            <p><strong>Username:</strong> {lastCreated.username}</p>
            <p><strong>Temporary Password:</strong> {lastCreated.tempPassword}</p>
            </div>
            
            <div className="flex gap-2 mt-3 mb-5">
              <button
                onClick={async () => {
                  setIsSending(true);
                  try {
                    const res = await fetch("/api/admin/users/send-credentials", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: lastCreated.email,
                        username: lastCreated.username,
                        tempPassword: lastCreated.tempPassword,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      toast.success("Credentials emailed!");
                    } else {
                      toast.error(data.error || "Failed to send email");
                    }
                  } catch (err) {
                    console.error("send email error", err);
                    toast.error("Network error sending email");
                  } finally {
                    setIsSending(false);
                  }
                }}
                disabled={isSending}
                className={`bg-blue-600 text-white px-3 py-1 rounded 
                  ${isSending ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-800 cursor-pointer"}`}
              >
                {isSending ? "Sending..." : "Send to Email"}
              </button>

              <button
                onClick={async () => {
                  setIsCopying(true);
                  await navigator.clipboard.writeText(`Username: ${lastCreated.username}\nPassword: ${lastCreated.tempPassword}`);
                  toast.success("Credentials copied to clipboard");
                  setTimeout(() => setIsCopying(false), 500);
                }}
                disabled={isCopying}
                className={`bg-gray-600 text-white px-3 py-1 rounded
                  ${isCopying ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800 cursor-pointer"}`}
              >
                {isCopying ? "Copying..." : "Copy"}
              </button>
            </div>

            <small className="block text-sm text-gray-600 italic">
              You can send the credentials now or copy them and send via your preferred channel.
            </small>
          </>
        ) : (
          <p className="text-gray-600 italic">No new account created yet.</p>
        )}

        </div>
        </section>
        
        <section className="p-5">
        <h2 className="text-xl font-bold text-[#173f63] p-2">Staff List</h2>

  <ScrollArea className="bg-white h-[250px] rounded shadow p-2 relative">
    <div className="">
      <table className="min-w-full text-left border-collapse">
        <thead className="sticky top-0 z-0">
          <tr className="bg-[#fff4e0] rounded shadow">
                  <th className="p-2">Username</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Contact</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-center">Actions</th>
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
              <td className="p-2 border-b">{u.contactNumber ?? "-"}</td>
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
                    <button
                      onClick={() =>
                        updateUser(u.id, "changeRole", u.role === "warehouseman" ? "sales" : "warehouseman")
                      }
                      className="w-[100px] bg-blue-600 text-white text-sm font-semibold py-1 rounded-4xl hover:bg-blue-800 cursor-pointer"
                    >
                      Change Role
                    </button>
                    </>
                  )}
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

    </div>

    </main>
  );
}
