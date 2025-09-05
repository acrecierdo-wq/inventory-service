"use client";

import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

const RequestServicePage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const router = useRouter();


  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
  
      if (updatedFiles.length === 0) {
        setIsEditing(false);
      }
    }
  }, [files]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const newFiles = Array.from(fileList);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
  
      // Exit edit mode if previously empty and now uploading again
      if (updatedFiles.length === 0) {
        setIsEditing(false);
      }
    }
  };

  const isSendDisabled = files.length === 0 || mode === '';
  
  useEffect(() => {
    if (files.length === 0 && isEditing) {
      setIsEditing(false);
    }
  }, [files, isEditing]);

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSend = () => {
    setShowConfirmModal(true);
  };
  
  const confirmSend = () => {
    setShowConfirmModal(false);
    router.push("/customer/p&s/non-consumables/mf");
  };
  
  const cancelSend = () => {
    setShowConfirmModal(false);
  };
  return (
    <CustomerClientComponent>
      <div className="bg-[#fed795] h-full w-full min-h-screen">
        <CustomerHeader />
        <div className="flex justify-center flex-col items-center mt-5">
          <div className="bg-white w-[1200px] rounded-xl p-6">
            <div className="bg-gradient-to-r from-[#0c2a42] to-[#476886] w-full h-15 rounded-xl px-5 py-2">
              <div className="text-white font-semibold text-lg">Request #001</div>
              <div className="text-white text-sm">Type of Request: Services</div>
            </div>

            <div className="flex justify-between text-[#777777] text-xs mt-3">
              <div className="ml-2">
                <span className="font-bold">Request from:</span><br />
                Canlubang Techno-Preneurship Industrial Corporation<br />
                Siranglupa, Canlubang, Calamba City, 4027<br />
                000-0000-000
              </div>
              <div className="mr-2 text-right">
                <span className="font-bold">Request to:</span><br />
                Canlubang Techno-Preneurship Industrial Corporation<br />
                Siranglupa, Canlubang, Calamba City, 4027<br />
                000-0000-000
              </div>
            </div>

            <hr className="mt-2 border-1 border-gray-500 w-full" />

            <div className="text-[#44164e] font-semibold ml-2 mt-2">Request Details</div>

            <div className="flex flex-row mt-2 gap-4">
              {/* Upload area */}
              <div className="w-1/2">
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  htmlFor="upload-file"
                  className={`h-[170px] w-full bg-white rounded border-[3px] border-dashed cursor-pointer flex flex-col justify-center items-center ${dragActive ? "border-[#44164e] bg-[#f3f3f3]" : "border-gray-300"}`}
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
                    width={80}
                    height={80}
                    alt="upload"
                  />
                  <p className="text-[#44164e] text-center mt-2">
                    Drag and drop files here or click to upload
                  </p>
                </label>

                {files.length > 0 && (
                  <div className="bg-[#fff7eb] mt-4 p-2 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-[#44164e] font-semibold">File Preview:</div>
                      <button
                        className="text-blue-500 text-xs"
                        onClick={() => setIsEditing((prev) => !prev)}
                      >
                        {isEditing ? "Done Editing" : "Edit"}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="flex gap-4">
                        {files.map((file, index) => {
                          const fileURL = URL.createObjectURL(file);
                          const isImage = file.type.startsWith("image/");
                          const isPDF = file.type === "application/pdf";

                          return (
                            <div
                              key={index}
                              className="relative min-w-[140px] max-w-[140px] border border-gray-300 rounded-md overflow-hidden shadow-sm"
                            >
                              {isEditing && (
                                <button
                                  onClick={() => handleRemoveFile(index)}
                                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                                >
                                  <Image
                                    src="/delete-remove-uncheck-svgrepo-com.svg"
                                    alt="Remove"
                                    className="w-3 h-3"
                                  />
                                </button>
                              )}
                              {isImage ? (
                                <Image
                                  src={fileURL}
                                  alt={file.name}
                                  className="w-full h-[120px] object-cover"
                                />
                              ) : isPDF ? (
                                <iframe
                                  src={fileURL}
                                  title={file.name}
                                  className="w-full h-[120px]"
                                />
                              ) : (
                                <div className="h-[120px] flex items-center justify-center text-sm text-gray-500">
                                  {file.name}
                                </div>
                              )}
                              <div className="text-xs text-center py-1 px-2 truncate">{file.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode and Message */}
              <div className="w-1/2 flex flex-col">
                <div className="text-[#44164e] font-semibold">Mode:</div>
                <select
  className="h-8 w-full mt-1 rounded border border-gray-300 bg-white px-2 text-sm text-gray-700"
  value={mode}
  onChange={(e) => setMode(e.target.value)}
>
  <option value="" disabled>Select Mode</option>
  <option value="Pick-up">Pick-up</option>
  <option value="Delivery">Delivery</option>
</select>

                <div className="text-[#44164e] font-semibold mt-4">Message:</div>
                <textarea
  className="mt-1 h-40 w-full border border-gray-300 rounded p-2 text-sm resize-none"
  placeholder="Type your message or notes here..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
></textarea>

                {/* Buttons */}
                <div className="mt-8 self-end flex gap-2">
                  <Button
                    variant="superOutline"
                    className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg bg-white hover:bg-gray-100 border-gray-400 hover:text-[#482b0e] text-[#482b0e]"
                  >
                    <Link href="/customer/p&s/non-consumables/mf">Cancel</Link>
                  </Button>
                  <Button
  variant="superOutline"
  className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg hover:bg-yellow-500/90 bg-[#ffc922] border-gray-400 hover:text-white text-[#ffffff]"
  onClick={handleSend}
  disabled={isSendDisabled}
>
  Send
</Button>
                </div>
                {showConfirmModal && (
  <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
      <h2 className="text-lg font-semibold text-gray-800">Confirm Send</h2>
      <p className="text-sm text-gray-600 mt-2">
        Are you sure you want to send this request?
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={cancelSend}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-[#ffc922] text-white rounded hover:bg-yellow-500"
          onClick={confirmSend}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerClientComponent>
  );
};

export default RequestServicePage;
