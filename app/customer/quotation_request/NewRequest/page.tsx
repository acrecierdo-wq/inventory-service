"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";


// Types
type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

// Toast Component
const Toast = ({ message, type = "success", onClose }: ToastProps) => {
  const colors = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-10 py-6 rounded-2xl shadow-2xl flex items-center gap-6 animate-slide-in ${colors[type]} z-50 max-w-3xl text-xl`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="text-white text-2xl hover:opacity-70">
        ✕
      </button>
    </div>
  );
};

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  onGoProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGoProfile: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Complete Your Account
        </h2>
        <p className="text-gray-600 mb-6">
          You need to complete your account details (name, address, and contact)
          before submitting a request.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={onGoProfile}
            className="px-6 py-2 rounded-full bg-[#fed795] text-gray-700 hover:bg-[#fccc65] shadow"
          >
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const NewRequest = () => {
  const [projectName, setProjectName] = useState("");
  const [mode, setMode] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [profile, setProfile] = useState<{ name: string; address: string; contact: string } | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);


  const messageRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success"
  );

  const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white w-[400px] rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Are you sure?
        </h2>
        <p className="text-gray-600 mb-6">
          Do you want to send this quotation request?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2 rounded-full bg-[#fed795] text-gray-700 hover:bg-[#fccc65] shadow"
          >
            Yes, Send
          </button>
        </div>
      </div>
    </div>
  );
};


  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
  };

  // Clerk user
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();

  // derive display values with fallbacks
  const requesterName = useMemo(() => {
    const u: any = clerkUser as any;
    const fullname =
      u?.fullName || `${u?.firstName || ""} ${u?.lastName || ""}`.trim();
    return fullname || "";
  }, [clerkUser]);

  // Fetch profile from DB
  useEffect(() => {
    async function fetchProfile() {
      if (!isLoaded || !isSignedIn) return;

      try {
        const res = await fetch("/api/customer");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: requesterName,
            address: data?.address || "",
            contact: data?.phone || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    }
    fetchProfile();
  }, [isLoaded, isSignedIn, requesterName]);

  // check if account is complete
  const isAccountComplete = useMemo(() => {
    return Boolean(
      isSignedIn &&
        requesterName.trim() !== "" &&
        profile?.address.trim() !== "" &&
        profile?.contact.trim() !== ""
    );
  }, [isSignedIn, requesterName, profile]);

  // Auto-resize textarea
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.style.height = "auto";
      messageRef.current.style.height = messageRef.current.scrollHeight + "px";
    }
  }, [message]);

  // File handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0)
      setFiles((prev) => [...prev, ...Array.from(fileList)]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragActive(false);
    },
    []
  );

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const isSubmitDisabled =
    projectName.trim() === "" ||
    mode === "" ||
    message.trim() === "" ||
    files.length === 0;

  // Submit handler
  const handleSubmit = async () => {
    if (!isAccountComplete) {
      setShowModal(true);
      return;
    }

    if (isSubmitDisabled) {
      showToast("Please complete all fields before submitting.", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("project_name", projectName);
      formData.append("mode", mode);
      formData.append("message", message);

      if (requesterName) formData.append("requester_name", requesterName);
      if (profile?.address) formData.append("requester_address", profile.address);
      if (profile?.contact) formData.append("requester_contact", profile.contact);
      if ((clerkUser as any)?.id)
        formData.append("requester_user_id", (clerkUser as any).id);

      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/q_request", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        showToast("Quotation request submitted successfully!", "success");
        setTimeout(() => router.push("/customer/quotation_request"), 1200);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to submit request.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong.", "error");
    }
  };

  return (
    <CustomerClientComponent>
      <div className="bg-[#FFCD7A] min-h-screen w-full">
        <CustomerHeader />

        <div className="flex justify-center mt-6 relative">
          <div className="bg-white w-[900px] rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#133657] to-[#2c5b7d] p-8 text-white flex justify-between">
              <div>
                <h2 className="text-2xl font-bold">Request #001</h2>
                <p className="text-lg">Type of Request: Services</p>
              </div>
              <div className="text-right text-sm"></div>
            </div>

            {/* Request From / To */}
            <div className="flex justify-between px-10 py-5 border-b text-base text-gray-700">
              <div>
                <p className="font-semibold">Request from:</p>

                {!isLoaded ? (
                  <p className="text-gray-500 italic">Loading...</p>
                ) : isSignedIn ? (
                  <>
                    <p>{profile?.name || "No name on file"}</p>
                    <p>{profile?.address || "No address on file"}</p>
                    <p>{profile?.contact || "No contact on file"}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Guest</p>
                    <p>Not signed in</p>
                    <p>-</p>
                  </>
                )}
              </div>

              <div className="text-right">
                <p className="font-semibold">Request to:</p>
                <p>Canlubang Techno-Preneurship Industrial Corporation</p>
                <p>Siranglupa, Canlubang, Calamba City, 4027</p>
                <p>000-0000-000</p>
              </div>
            </div>

            {/* Request Details */}
            <div className="px-10 py-8 space-y-8">
              <h3 className="font-bold text-2xl text-[#5a2347]">
                Request Details
              </h3>

              {/* Project Name */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-5 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mode */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-5 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select Mode
                  </option>
                  <option value="Pick-up">Pick-up</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  ref={messageRef}
                  className="w-full px-5 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Type your message or notes here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Upload */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  htmlFor="upload-file"
                  className={`h-52 border-2 border-dashed rounded-xl cursor-pointer flex flex-col justify-center items-center transition ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    id="upload-file"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Image
                    src="/upload-cloud-svgrepo-com.svg"
                    width={70}
                    height={70}
                    alt="upload"
                  />
                  <p className="text-base text-gray-600 mt-3">
                    Drag & drop files here, or click to upload
                  </p>
                </label>
              </div>

              {/* File Preview */}
              {files.length > 0 && (
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h4 className="text-lg font-semibold mb-4">Uploaded Files</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative border border-gray-300 rounded-xl p-3 bg-white shadow"
                      >
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                        >
                          ✖
                        </button>
                        <div className="h-20 flex items-center justify-center text-sm text-gray-600 px-2 text-center">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-6 px-10 py-8 bg-gray-50 rounded-b-2xl">
              <button
                className="px-8 py-3 rounded-full bg-white border border-gray-300 shadow hover:bg-gray-100 font-medium text-lg"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
  className={`px-8 py-3 rounded-full font-medium text-lg shadow ${
    isSubmitDisabled
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-[#fed795] text-gray-700 hover:bg-[#fccc65]"
  }`}
  disabled={isSubmitDisabled}
  onClick={() => {
    if (!isSubmitDisabled) {
      setShowConfirm(true);
    }
  }}
>
  Send
</button>
<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleSubmit}
/>

            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onGoProfile={() => router.push("/customer/profile")}
        />

        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage("")}
          />
        )}
      </div>
    </CustomerClientComponent>
  );
};

export default NewRequest;
