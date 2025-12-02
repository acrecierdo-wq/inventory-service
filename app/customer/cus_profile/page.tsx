"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/header-customer";
import { toast } from "sonner";
import {
  Mail,
  User,
  Phone,
  MapPin,
  Building2,
  Hash,
  ShieldCheck,
  Info,
} from "lucide-react";

type Profile = {
  companyName: string;
  tinNumber: string;
  contactPerson: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  clientCode: string;
};

const initialProfile: Profile = {
  companyName: "",
  tinNumber: "",
  contactPerson: "",
  role: "",
  email: "",
  phone: "",
  address: "",
  clientCode: "",
};

const CustomerProfile = () => {
  const { user } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [originalProfile, setOriginalProfile] = useState<Profile>(initialProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    if (user) {
      const newProfile: Profile = {
        ...initialProfile,
        contactPerson: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      };
      setProfile(newProfile);
      setOriginalProfile(newProfile);
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/customer");
        if (!res.ok) return;

        const result = await res.json();
        if (result.status === "ok" && result.data) {
          setProfile(result.data);
          setOriginalProfile(result.data);
          setIsFirstTime(false);
        } else {
          setIsFirstTime(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.companyName.trim()) newErrors.companyName = "Required field.";
    if (!profile.tinNumber.trim()) newErrors.tinNumber = "Required field.";
    if (!profile.contactPerson.trim())
      newErrors.contactPerson = "Required field.";
    if (!profile.role.trim()) newErrors.role = "Required field.";

    if (!profile.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^09\d{9}$/.test(profile.phone) && !/^63\d{10}$/.test(profile.phone)) {
      newErrors.phone = "Format must be 09XXXXXXXXX or 63XXXXXXXXXX.";
    }

    if (!profile.address.trim()) newErrors.address = "Address is required.";
    if (!profile.clientCode.trim()) {
      newErrors.clientCode = "Client code required.";
    } else if (profile.clientCode.length > 5) {
      newErrors.clientCode = "Max 5 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const editable = isEditing || isFirstTime;

  const handlePhoneChange = (value: string) => {
    let sanitized = value.replace(/\D/g, "");
    if (sanitized.startsWith("63")) sanitized = sanitized.slice(0, 12);
    else sanitized = sanitized.slice(0, 11);
    setProfile((prev) => ({ ...prev, phone: sanitized }));
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        toast.success("Profile saved");
        setOriginalProfile(profile);
        setIsEditing(false);
        setIsFirstTime(false);
        router.push("/customer/cus_dashboard");
      } else {
        toast.error("Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setErrors({});
    setIsEditing(false);
  };

  const statusChip = useMemo(() => {
    if (isFirstTime) return { label: "Setup required", color: "bg-[#ffca99]/60 text-[#7c3a00]" };
    if (isEditing) return { label: "Editing", color: "bg-[#fef3c7] text-[#92400e]" };
    return { label: "Profile up to date", color: "bg-[#d1fae5] text-[#065f46]" };
  }, [isFirstTime, isEditing]);

  return (
    <div className="min-h-screen bg-[#ffedce] text-[#4f2d12]">
      <CustomerHeader />

      <main className="px-4 py-6 lg:px-8">
        <section className="max-w-4xl mx-auto space-y-6">
          {/* Header card */}
          <div className="rounded-[30px] border border-white/50 bg-gradient-to-r from-[#fff4dd] to-[#ffe0c2] p-6 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-[#be7424]">
                  Profile
                </p>
                <h1 className="mt-2 text-3xl font-semibold">
                  Account & company information
                </h1>
                <p className="mt-2 text-[#7b4c23] text-sm">
                  Keep your profile complete to ensure faster processing of quotation
                  requests and order schedules.
                </p>
              </div>
              <div className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold ${statusChip.color}`}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {statusChip.label}
              </div>
            </div>
          </div>

          {/* Info + form */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sidebar */}
            <div className="rounded-3xl bg-white border border-white/70 p-5 shadow-md space-y-4">
              <div className="rounded-2xl bg-[#fff7ed] border border-[#ffe2c0] p-4">
                <h3 className="text-lg font-semibold text-[#7b4c23]">Account details</h3>
                <p className="mt-2 text-sm text-[#a26b37]">
                  Logged in as <strong>{profile.contactPerson || "Customer"}</strong>
                </p>
                <p className="text-sm text-[#a26b37]">{profile.email}</p>
              </div>
              <div className="rounded-2xl bg-[#fff7ed] border border-[#ffe2c0] p-4">
                <h3 className="text-lg font-semibold text-[#7b4c23]">Need help?</h3>
                <p className="mt-2 text-sm text-[#a26b37]">
                  Call or message CTIC support at{" "}
                  <span className="font-semibold">central@canlubangtechno.com.ph</span>
                  <br />or dial (049) 252-8988.
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff7ed] border border-[#ffe2c0] p-4 flex items-start gap-3 text-sm text-[#a26b37]">
                <Info className="h-5 w-5 text-[#e48a2d]" />
                <p>
                  Your client code helps our sales team quickly identify your account during
                  quotation and purchase order processing.
                </p>
              </div>
            </div>

            {/* Form fields */}
            <div className="lg:col-span-2 rounded-3xl bg-white border border-white/70 shadow-xl p-6 space-y-6">
              {[
                {
                  label: "Company Name",
                  value: profile.companyName,
                  onChange: (val: string) => setProfile((prev) => ({ ...prev, companyName: val })),
                  icon: Building2,
                  key: "companyName",
                },
                {
                  label: "TIN Number",
                  value: profile.tinNumber,
                  onChange: (val: string) => setProfile((prev) => ({ ...prev, tinNumber: val })),
                  icon: Hash,
                  key: "tinNumber",
                },
                {
                  label: "Contact Person",
                  value: profile.contactPerson,
                  onChange: (val: string) => setProfile((prev) => ({ ...prev, contactPerson: val })),
                  icon: User,
                  key: "contactPerson",
                  readOnly: !!user?.fullName,
                },
                {
                  label: "Role",
                  value: profile.role,
                  onChange: (val: string) => setProfile((prev) => ({ ...prev, role: val })),
                  icon: User,
                  key: "role",
                },
                {
                  label: "Email",
                  value: profile.email,
                  onChange: () => {},
                  icon: Mail,
                  key: "email",
                  readOnly: true,
                },
                {
                  label: "Phone",
                  value: profile.phone,
                  onChange: handlePhoneChange,
                  icon: Phone,
                  key: "phone",
                },
                {
                  label: "Address",
                  value: profile.address,
                  onChange: (val: string) => setProfile((prev) => ({ ...prev, address: val })),
                  icon: MapPin,
                  key: "address",
                },
                {
                  label: "Client Code",
                  value: profile.clientCode,
                  onChange: (val: string) =>
                    setProfile((prev) => ({ ...prev, clientCode: val.toUpperCase() })),
                  icon: Building2,
                  key: "clientCode",
                },
              ].map(({ label, value, onChange, icon: Icon, key, readOnly }) => {
                const isDisabled = key === "email" ? true : readOnly ? true : !editable;
                return (
                  <div key={key}>
                    <label className="text-sm font-semibold text-[#825233]">{label}</label>
                    <div className="relative mt-1">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c79b69]" size={18} />
                      <input
                        value={value}
                        readOnly={isDisabled}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className={`w-full rounded-2xl border px-10 py-3 text-sm ${
                          isDisabled
                            ? "bg-[#f5f2ed] cursor-not-allowed"
                            : "bg-white focus:ring-2 focus:ring-[#d6a25b] focus:outline-none"
                        } ${errors[key] ? "border-red-400" : "border-[#f1dfc6]"}`}
                      />
                    </div>
                    {errors[key] && (
                      <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
                    )}
                  </div>
                );
              })}

              {/* Actions */}
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#f4e1c8]">
                {!editable && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl bg-[#173f63] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#0f2b45]"
                  >
                    Edit Profile
                  </button>
                )}
                {editable && (
                  <>
                    {!isFirstTime && (
                      <button
                        onClick={handleCancel}
                        className="rounded-xl border border-[#d5b89c] px-5 py-2 text-sm font-semibold text-[#7b4c23] hover:bg-[#fff4e3]"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="rounded-xl bg-[#1f8a4b] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#166136] disabled:bg-[#9bc4ae]"
                    >
                      {loading ? "Saving..." : "Save Profile"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerProfile;