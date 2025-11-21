// app/customer/quotation_request/NewRequest/page.tsx
"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];


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
          You need to complete your account details (name, address, contact, email, and code)
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
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("Mode");
  const [otherMode, setOtherMode] = useState("");

  // ✅ include email in profile
  const [profile, setProfile] = useState<{ companyName: string; contactPerson: string; address: string; phone: string; } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messageRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isSending,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSending?: boolean;
  }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
        <div className="bg-white w-[400px] rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Are you sure?</h2>
          <p className="text-gray-600 mb-6">Do you want to send this quotation request?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={isSending}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-2 rounded-full bg-[#fed795] text-gray-700 hover:bg-[#fccc65] shadow cursor-pointer"
            >
              Yes, Send
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Clerk user
  const { isLoaded, isSignedIn } = useUser();

  // Fetch profile from DB
  useEffect(() => {
    async function fetchProfile() {
      if (!isLoaded || !isSignedIn) return;

      try {
        const res = await fetch("/api/customer");
        if (res.ok) {
          const result = await res.json();

          if (result.status  === "ok" && result.data) {
            setProfile(result.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    }
    fetchProfile();
  }, [isLoaded, isSignedIn]);

  // check if account is complete
  const isAccountComplete = useMemo(() => {
    return Boolean(
      isSignedIn &&
      profile?.companyName.trim() !== "" &&
      profile?.contactPerson.trim() !== "" &&
      profile?.address.trim() !== "" &&
      profile?.phone.trim() !== ""
    );
  }, [isSignedIn, profile]);

  // Auto-resize textarea
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.style.height = "auto";
      messageRef.current.style.height = messageRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: File[] = [];
    for (const file of Array.from(fileList)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("File type not allowed");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File is too large. Maximum is 10MB.");
        continue;
      }
      newFiles.push(file);
    }
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  // File handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0)
      handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const isSubmitDisabled =
    projectName.trim() === "" ||
    mode === ""

  // Submit handler
  const handleSubmit = async () => {
    if (!isAccountComplete) {
      setShowModal(true);
      return;
    }

    if (isSubmitDisabled) {
      toast.error("Please complete all fields before submitting.");
      return;
    }
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("project_name", projectName);
      formData.append("mode", mode);
      formData.append("message", message);

      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/customer/q_request", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Quotation request submitted successfully!");
        setTimeout(() => router.push("/customer/quotation_request"), 1200);
        setIsSending(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
      setIsSending(false);
    }
  };

  return (
      <main className="bg-[#ffedce] min-h-screen w-full">
        <CustomerHeader />

        <div className="flex justify-center p-6 relative">
          <div className="bg-white w-full rounded-2xl shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <section className="bg-gradient-to-r from-[#de4730] to-[#fab937] p-4 text-white flex justify-between">
              <div>
                <h2 className="text-2xl font-bold">Request for Quotation</h2>
                <p className="text-lg font-sans italic">Type of Request: Services</p>
              </div>
            </section>

            <section className="p-4">
              <div className="bg-[#f59f0b57] shadow-lg rounded-2xl p-6">
              <div className="bg-[#f59f0b63] shadow-lg rounded-2xl p-6">

            <div className="space-y-2">
              {/* Request From / To */}
            <div className="">

              <div className="bg-white w-[500px] rounded shadow mb-2">
                <div className="flex flex-row">
                  <div className="bg-white w-[300px]">
                <span>Send request to:</span>
                <input 
                  type="text" 
                  placeholder="Contact person name"
                  className="border"
                />
              </div>
              </div>
              </div>

              <div className="bg-white flex justify-between p-6 border border-[#f59e0b] rounded-xl shadow-sm text-base font-sans text-gray-700">
              <div>
                <p className="border-b pb-2"><strong>Request from:</strong></p>

                {!isLoaded ? (
                  <p className="text-gray-500 italic">Loading...</p>
                ) : isSignedIn ? (
                  <>
                    <p><strong>Company:</strong> {profile?.companyName || "No name on file"}</p>
                    <p><strong>Address:</strong> {profile?.address || "No address on file"}</p>
                    <p><strong>Contact Number:</strong> {profile?.phone || "No contact on file"}</p>
                    <p><strong>Contact Person:</strong> {profile?.contactPerson  || "No name on file"}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Guest</p>
                    <p>Not signed in</p>
                    <p>-</p>
                  </>
                )}
              </div>

              <div>
                <p className="border-b pb-2"><strong>Request to:</strong></p>
                <p><strong>Company:</strong> Canlubang Techno-Industrial Corporation</p>
                <p><strong>Address:</strong> Siranglupa, Canlubang, Calamba City, 4027</p>
                <p><strong>TIN:</strong> 000-0000-000</p>
              </div>
            </div>
            </div>

            <section>
              <div className="border border-[#f59e0b] rounded-xl shadow-sm bg-white font-sans text-gray-700 p-2">
                {/* Request Details */}
            <div className="px-4 py-4 space-y-2">
              <h3 className="block font-bold text-lg text-gray-700 border-b pb-2 border-[#f59e0b] mb-2">Request Details</h3>

              {/* Project Name */}
              <div>
                <label className="block font-semibold mb-2">Project Name <span className="text-red-500"> *</span></label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full border rounded-lg px-4 py-2 hover:bg-gray-100 uppercase"
                />
              </div>

              {/* Mode */}
              <div>
            <label className="block font-semibold mb-2">Mode of Delivery <span className="text-red-500"> *</span></label>
            <Select onValueChange={setMode} value={mode}>
            <SelectTrigger className="w-full border rounded-lg px-4 py-2 hover:bg-gray-100">
              <SelectValue placeholder="Select a mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mode" className="cursor-pointer">Select mode</SelectItem>
              <SelectItem value="Deliver" className="cursor-pointer">Deliver</SelectItem>
              <SelectItem value="Pickup" className="cursor-pointer">Pickup</SelectItem>
              <SelectItem value="Other" className="cursor-pointer">Other</SelectItem>
            </SelectContent>
          </Select>

          {mode === "Other" && (
            <input 
              type="text"
              placeholder="Please specify other delivery mode"
              className="w-full border rounded-lg px-4 py-2 hover:bg-gray-100 mt-2"
              value={otherMode}
              onChange={(e) => setOtherMode(e.target.value)}
            />
          )}
              </div>

              {/* Message */}
              <div>
                <label className="block font-semibold mb-2">Message</label>
                <textarea
                  ref={messageRef}
                  className="w-full px-5 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-blue-500 resize-none hover:bg-gray-100"
                  placeholder="Type your message or notes here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
              </div>
            </section>

<section className="bg-white font-sans rounded-xl p-4 shadow-lg border border-[#f59e0b] space-y-2">
  {/* Upload */} 
  <div>
    <label className="block font-bold text-lg text-gray-700 border-b pb-2 border-[#f59e0b] mb-2">Upload Files</label>
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      htmlFor="upload-file"
      className={`h-20 border-2 border-dashed rounded-xl cursor-pointer flex flex-col justify-center items-center transition ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-100"
      }`}
    >
      <input id="upload-file" type="file" multiple name="files" className="hidden" onChange={handleFileChange} />
      <Image src="/upload-cloud-svgrepo-com.svg" width={30} height={30} alt="upload" />
      <p className="text-base text-gray-600 mt-2">Drag & drop files here, or click to upload</p>
    </label>
    <p className="text-xs text-gray-500 mt-2">
      Allowed types: PDF, JPG, PNG, DOC, XLS — Max size: 10MB
    </p>
  </div>

  {/* File Preview */}
  {files.length > 0 && (
    <div className="bg-[#f59f0b2f] p-4 rounded-xl">
      <h4 className="block font-semibold mb-2">Uploaded Files</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file, index) => {
          const fileExt = file.name.split(".").pop()?.toLowerCase();
          const isImage = ["jpg", "jpeg", "png"].includes(fileExt!);
          const isPDF = fileExt === "pdf";

          return (
<div
  key={index}
  className="relative border border-gray-300 rounded-xl p-3 bg-white shadow"
>
  <button
    onClick={() => handleRemoveFile(index)}
    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100 cursor-pointer"
  >
    ✕
  </button>

  <div className="h-32 flex items-center justify-center overflow-hidden bg-gray-200 rounded-xl">
    {isImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={URL.createObjectURL(file)}
        alt={file.name}
        className="object-contain h-full w-full cursor-pointer"
      />
    ) : isPDF ? (
      <iframe
        src={URL.createObjectURL(file)}
        className="w-full h-full rounded"
      />
    ) : (
      <div className="text-gray-600 text-sm text-center flex flex-col items-center justify-center h-full">
        📄
        <span className="mt-2">{fileExt?.toUpperCase()} File</span>
        <span className="text-xs mt-1">Preview not available</span>
      </div>
    )}
  </div>

  <div className="mt-2 text-center text-sm text-gray-700 truncate">
    {file.name}
  </div>
</div>

          )
        })}
        </div>
      </div>
    )}
</section>
      </div>
            
      </div>
    </div>
</section>
            

            {/* Footer */}
            <div>
              {/* Buttons */}
            <div className="flex justify-end gap-4 px-5 py-4 bg-gray-50 border-t">
              <button
                className="h-8 w-20 rounded-full bg-white border border-gray-300 shadow hover:bg-gray-100 font-medium cursor-pointer"
                onClick={() => router.back()}
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                className={`h-8 w-20 rounded-full font-medium shadow ${
                  isSubmitDisabled || isSending ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                }`}
                disabled={isSending}
                onClick={() => {
                  if (!isSubmitDisabled) setShowConfirm(true);
                }}
              >
                {isSending ? "Sending..." : "Send"}
              </button>
              <ConfirmModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleSubmit} isSending={isSending} />
            </div>
            </div>
            
          </div>
        </div>

        {/* Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} onGoProfile={() => router.push("/customer/profile")} />
      </main>
  );
};

export default NewRequest;
