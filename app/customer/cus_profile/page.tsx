// app/customer/cus_profile/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; // ✅ import router
import { CustomerHeader } from "@/components/header-customer";
import { toast } from "sonner";
import { Mail, User, Phone, MapPin, Building2 } from "lucide-react";

export default function CustomerProfile() {
  const { user } = useUser();
  const router = useRouter(); // ✅ initialize router

  const [profile, setProfile] = useState({
    companyName: "",
    tinNumber: "",
    contactPerson: "",
    role: "",
    email: "",
    phone: "",
    address: "",
    clientCode: "",
  });

  const [originalProfile, setOriginalProfile] = useState(profile);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Load profile from Clerk
  useEffect(() => {
    if (user) {
      const newProfile = {
        companyName: "",
        contactPerson: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        role: "",
        phone: "",
        address: "",
        tinNumber: "",
        clientCode: "",
      };
      setProfile(newProfile);
      setOriginalProfile(newProfile);
    }
  }, [user]);

  // Fetch existing profile from DB
  useEffect(() => {
  async function fetchProfile() {
    try {
      const res = await fetch("/api/customer");
      if (!res.ok) return;

      const result = await res.json();

      if (result.status === "ok" && result.data) {
        setProfile(result.data);          // fill entire profile
        setOriginalProfile(result.data);  // keep original for cancel
        setIsFirstTime(false);
      } else {
        setIsFirstTime(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }
  fetchProfile();
}, []);


  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profile.companyName || profile.companyName.trim().length < 2) {
      newErrors.companyName = "Company name is required.";
    }

    if (!profile.tinNumber || profile.tinNumber.trim().length < 2) {
      newErrors.tinNumber = "TIN number is required.";
    }

    if (!profile.contactPerson || profile.contactPerson.trim().length < 2) {
      newErrors.contactPerson = "Contact person is required.";
    }

    if (!profile.role || profile.role.trim().length < 2) {
      newErrors.role = "Contact person's role is required.";
    }

    if (!profile.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^09\d{9}$/.test(profile.phone) && !/^63\d{10}$/.test(profile.phone)) {
      newErrors.phone =
        "Phone number must be 11 digits (e.g., 09XXXXXXXXX or 63XXXXXXXXXX).";
    }

    if (!profile.address || profile.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters.";
    }

    if (!profile.clientCode || profile.clientCode.length < 2) {
      newErrors.clientCode = "Client code is required (Min. of 2 characters).";
    } else if (!profile.clientCode || profile.clientCode.length > 5) {
      newErrors.clientCode = "Client code is required (Max. of 5 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    let sanitized = value.replace(/\D/g, "");
    if (sanitized.startsWith("63")) {
      if (sanitized.length > 12) sanitized = sanitized.slice(0, 12);
    } else {
      if (sanitized.length > 11) sanitized = sanitized.slice(0, 11);
    }
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
        toast.success("Profile updated!");
        setOriginalProfile(profile);
        setIsEditing(false);
        setIsFirstTime(false); // After saving, no longer first time

        // ✅ Redirect to dashboard after save
        router.push("/customer/cus_dashboard");
      } else {
        toast.error("❌ Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <main className="bg-[#ffedce] h-full">
      <CustomerHeader />
      <section className="p-2">
        <div className="p-8 bg-white shadow-xl rounded-2xl max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-4 text-[#173f63] text-center">
          Customer Profile
        </h1>

        <div className="space-y-6">
          {/* Company Name */}
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              placeholder="Enter company name"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#173f63] focus:outline-none`}
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              Company Name
            </label>
            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
            )}
          </div>
          {/* TIN Number */}
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={profile.tinNumber}
              onChange={(e) => setProfile({ ...profile, tinNumber: e.target.value })}
              placeholder="Enter TIN number"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#173f63] focus:outline-none`}
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              TIN Number
            </label>
            {errors.tinNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.tinNumber}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={profile.contactPerson}
              readOnly={!!user?.fullName}
              onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg ${
                user?.fullName
                  ? "bg-gray-100 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-[#173f63] focus:outline-none"
              }`}
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              Contact Person
            </label>
            {errors.contactPerson && (
              <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>
            )}
          </div>

          {/* Role */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              placeholder="Enter your company role"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#173f63] focus:outline-none`}
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              Role
            </label>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              Email
            </label>
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={profile.phone}
              readOnly={!isEditing && !isFirstTime}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="09XXXXXXXXX or 63XXXXXXXXXX"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg ${
                isEditing || isFirstTime
                  ? "focus:ring-2 focus:ring-[#173f63] focus:outline-none"
                  : "bg-gray-100 cursor-not-allowed"
              } ${errors.phone ? "border-red-500" : ""}`}
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              Phone
            </label>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={profile.address}
              readOnly={!isEditing && !isFirstTime}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              placeholder="Enter your address"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg ${
                isEditing || isFirstTime
                  ? "focus:ring-2 focus:ring-[#173f63] focus:outline-none"
                  : "bg-gray-100 cursor-not-allowed"
              } ${errors.address ? "border-red-500" : ""}`}
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              Address
            </label>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          {/* Client Code (eg. SPX for shopee, LAZ for lazada)*/}
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text"
              value={profile.clientCode || ""}
              readOnly={!isEditing && !isFirstTime}
              onChange={(e) => setProfile({ ...profile, clientCode: e.target.value.toUpperCase() })}
              placeholder="Enter your client code (e.g. LV for Luis Vuitton)"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg ${
                isEditing || isFirstTime
                  ? "focus:ring-2 focus:ring-[#173f63] focus:outline-none}"
                  : "bg-gray-100 cursor-not-allowed"
              } ${errors.clientCode ? "border-red-500" : ""}`}
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              Client Code
            </label>
            {errors.clientCode && (
              <p className="text-red-500 text-sm mt-1">{errors.clientCode}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {(!isEditing && !isFirstTime) && (
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className="h-8 w-15 text-center gap-2 px-2 rounded-lg bg-[#173f63] hover:bg-[#0f2b45] text-white font-semibold shadow-md transition cursor-pointer"
              >
                Edit
              </button>
            )}
            {(isEditing || isFirstTime) && (
              <>
                {!isFirstTime && (
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="h-8 w-15 text-center gap-2 px-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`h-8 w-15 text-center gap-2 px-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition cursor-pointer ${
                    loading ? "cursor-not-allowed bg-gray-200" : ""
                  }`}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      </section>
    </main>
  );
}
