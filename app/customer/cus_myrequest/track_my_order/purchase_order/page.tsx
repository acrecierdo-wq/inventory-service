// app/customer/cus_myrequest/track_my_order/purchase_order/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface CustomerProfile {
    id: number;
    clerkId: string;
    companyName: string;
    contactPerson: string;
    address: string;
    email: string;
    phone: string;
    clientCode: string;
    createdAt: string;
    updatedAt: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function UploadPO() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("quotationId");
  const requestId = searchParams.get("requestId");

  const { isLoaded, isSignedIn } = useUser();

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [poNumber, setPONumber] = useState("");

  // Validate and handle file
  const handleFiles = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error(`File type not allowed: ${selectedFile.name}`);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`"${selectedFile.name}" is too large. Max 10MB.`);
      return;
    }
    setFile(selectedFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  // Upload PO
  async function handleUpload() {
    if (!file) return toast.error("Please select a file first.");
    if (!quotationId || !requestId)
      return toast.error("Missing quotation or request ID.");
    if (!poNumber.trim())
      return toast.error("please enter your Purchase Order Number.");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quotationId", quotationId);
      formData.append("requestId", requestId);
      formData.append("poNumber", poNumber);

      const res = await fetch("/api/customer/upload_po", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok)
        return toast.error(data.error || "Upload failed");

      toast.success("Purchase Order uploaded successfully!");
      router.push(`/customer/cus_myrequest/track_my_order/${requestId}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during upload.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchProfile() {
        if (!isLoaded || !isSignedIn) return;
        try {
            const res = await fetch("/api/customer");
            const result = await res.json();
            console.log("Profile fetch result:", result);

            if (result.status === "ok" && result.data) {
                setProfile(result.data as CustomerProfile);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    }
    fetchProfile();
  }, [isLoaded, isSignedIn]);

  return (
    <main className="min-h-screen bg-[#ffedce]">
      <CustomerHeader />

      <div className="flex justify-center p-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Upload Purchase Order
          </h2>

          {/* Profile Info Section */}
          {profile ? (
            <div className="border border-[#f59e0b] rounded-xl bg-[#fff9f2] p-4 mb-6">
                <h3 className="font-semibold text-lg border-b pb-2 mb-3 text-[#d97706]">
                    Customer Information
                </h3>
                <div className="text-gray-700 text-sm space-y-1">
                    <p><strong>Company:</strong> {profile.companyName}</p>
                    <p><strong>ContactPerson:</strong> {profile.contactPerson}</p>
                    <p><strong>Address:</strong> {profile.address}</p>
                    <p><strong>Phone:</strong> {profile.phone}</p>
                    <p><strong>TIN:</strong></p>
                </div>
            </div>
          ) : (
            <p className="text-gray-500 italic mb-4">Loading customer info...</p>
          )}

          <div className="flex flex-col mb-4">
            <label className="text-sm font-medium text-gray-700">Purchase Order Number: <span className="text-red-500">*</span></label>
            <input 
              type="text"
              value={poNumber}
              onChange={(e) => setPONumber(e.target.value)}
              placeholder="Enter PO number..."
              className="border rounded-md p-2 mt-1 focus:outline-none focus:ring-[#173f63]"
              required
            />
          </div>

          <span className="font-sans">Select Purchase Order File</span><span className="text-red-500"> *</span>
          {/* Drag & Drop Upload */}
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            htmlFor="upload-po"
            className={`border-2 border-dashed rounded-xl h-32 flex flex-col mt-2 justify-center items-center cursor-pointer transition ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <input
              id="upload-po"
              type="file"
              accept=".pdf,.jpg,.png,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <Image
              src="/upload-cloud-svgrepo-com.svg"
              width={40}
              height={40}
              alt="upload icon"
            />
            <p className="text-gray-600 text-sm mt-2">
              Drag & drop or click to upload PO file
            </p>
          </label>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Allowed: PDF, JPG, PNG, DOCX (Max: 10MB)
          </p>

          {/* File Preview */}
          {file && (
            <div className="mt-4 bg-gray-50 border p-3 rounded-lg flex items-center justify-between">
              <div className="text-sm text-gray-700 truncate">{file.name}</div>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className={`mt-6 w-full py-2 rounded-lg font-semibold transition ${
              loading || !file
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#f59e0b] hover:bg-[#d48a0a] text-white"
            }`}
          >
            {loading ? "Uploading..." : "Upload PO"}
          </button>
        </div>
      </div>
    </main>
  );
}
