"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; // ✅ import router
import { CustomerHeader } from "@/components/header-customer";
import { toast } from "sonner";
import { Mail, User, Phone, MapPin, Loader2, Edit3, X, Check } from "lucide-react";

export default function CustomerProfile() {
  const { user } = useUser();
  const router = useRouter(); // ✅ initialize router

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
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
        fullName: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone: "",
        address: "",
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
        if (res.ok) {
          const data = await res.json();
          if (data && (data.phone || data.address)) {
            setProfile((prev) => ({
              ...prev,
              phone: data.phone || "",
              address: data.address || "",
            }));
            setOriginalProfile((prev) => ({
              ...prev,
              phone: data.phone || "",
              address: data.address || "",
            }));
            setIsFirstTime(false); // user already has info
          } else {
            setIsFirstTime(true); // first-time setup
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profile.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^09\d{9}$/.test(profile.phone) && !/^63\d{10}$/.test(profile.phone)) {
      newErrors.phone =
        "Phone number must be 11 digits (e.g., 09XXXXXXXXX or 63XXXXXXXXXX).";
    }

    if (!profile.address || profile.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters.";
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
        toast.success("✅ Profile updated!");
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
    <>
      <CustomerHeader />
      <div className="p-8 bg-white shadow-xl rounded-2xl max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-extrabold mb-8 text-[#173f63] text-center">
          Customer Profile
        </h1>

        <div className="space-y-6">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={profile.fullName}
              readOnly
              className="w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <label className="text-xs text-gray-500 absolute left-10 -top-2 bg-white px-1">
              Full Name
            </label>
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {(!isEditing && !isFirstTime) && (
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#173f63] hover:bg-[#0f2b45] text-white font-semibold shadow-md transition"
              >
                <Edit3 size={18} /> Edit
              </button>
            )}
            {(isEditing || isFirstTime) && (
              <>
                {!isFirstTime && (
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold transition"
                  >
                    <X size={18} /> Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} /> Save
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
