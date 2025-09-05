"use client"
import SalesClientComponent from "@/app/validate/sales_validate";
import { CustomerHeader } from "@/components/header-customer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {  useEffect, useState } from "react";
import { toast } from "sonner";

const SalesViewDetailsCPOPage = () => {
    const [files] = useState<File[]>([]);
      const [isEditing, setIsEditing] = useState(false);
      const [mode, setMode] = useState("");
      //const [message, setMessage] = useState("");
    const router = useRouter();
    
    
      // const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      //   e.preventDefault();
      //   e.stopPropagation();
      //   setDragActive(false);
      //   if (e.dataTransfer.files) {
      //     const newFiles = Array.from(e.dataTransfer.files);
      //     const updatedFiles = [...files, ...newFiles];
      //     setFiles(updatedFiles);
      
      //     if (updatedFiles.length === 0) {
      //       setIsEditing(false);
      //     }
      //   }
      // }, [files]);
    
      // const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      //   e.preventDefault();
      //   e.stopPropagation();
      //   setDragActive(true);
      // }, []);
    
      // const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      //   e.preventDefault();
      //   e.stopPropagation();
      //   setDragActive(false);
      // }, []);
    
      // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      //   const fileList = e.target.files;
      //   if (fileList) {
      //     const newFiles = Array.from(fileList);
      //     const updatedFiles = [...files, ...newFiles];
      //     setFiles(updatedFiles);
      
      //     // Exit edit mode if previously empty and now uploading again
      //     if (updatedFiles.length === 0) {
      //       setIsEditing(false);
      //     }
      //   }
      // };
    
      // const isSendDisabled = files.length === 0 || mode === '';
      
      useEffect(() => {
        if (files.length === 0 && isEditing) {
          setIsEditing(false);
        }
      }, [files, isEditing]);
    
      // const handleRemoveFile = (indexToRemove: number) => {
      //   setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
      // };
    
      // const handleSend = () => {
      //   setShowConfirmModal(true);
      // };
      
      // const confirmSend = () => {
      //   setShowConfirmModal(false);
      //   router.push("/customer/p&s/non-consumables/mf");
      // };
      
      // const cancelSend = () => {
      //   setShowConfirmModal(false);
      // };

      const handleSave = () => {
        // Display toast saying the status has been updated
        toast.success("Status has been updated!");
        // After the toast, you can redirect to the previous page or perform any other action
        router.push("/sales/sales_requests/s_nonconsumables_request");
      };
    return (
        <SalesClientComponent>
    <div className="bg-[#fed795] h-full w-full min-h-screen">
        <CustomerHeader />
                <div className="flex justify-center flex-col items-center mt-5">
                  <div className="bg-white w-[1200px] rounded-xl p-5 h-[600px]">
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
                        <span className="font-bold">Quote to:</span><br />
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
                        
                        <div className="bg-[#fff7eb] mt-4 p-2 rounded flex flex-col">
                        
                        <span className="text-sm text-[#44164e] font-semibold mt-1 mb-2 ml-2">File Preview:</span>
                        
                        <div className="flex flex-row gap-2">
                          {/* Image Preview 1 */}
                          <div className="relative w-[140px] border border-gray-300 rounded-md overflow-hidden shadow-sm">
                            <div className="w-full h-[120px]">
                            <Image src={"/sketch_1.jpg"} width={140} height={120} alt="sketch" className="object-cover w-full h-full"/>
                            </div>
                            <span className="flex items-center justify-center text-sm text-gray-500">sketch.jpg</span>
                          </div>

                          {/* Image Preview 2 */}
                          <div className="relative w-[140px] border border-gray-300 rounded-md overflow-hidden shadow-sm">
                            <div className="w-full h-[120px]">
                            <Image src="/sketch.jpg"  alt="skect_1" width={140} height={120} className="object-cover w-full h-full"/>
                            </div>
                            <span className="flex items-center justify-center text-sm text-gray-500">sketch(1).jpg</span>
                          </div>
                          </div>
                        </div>
                      </div>
        
                      {/* Mode and Message */}
                      <div className="w-1/2 flex flex-col">
                        <div className="text-[#44164e] font-semibold">Mode:</div>
                        <div className="h-8 w-full mt-5 rounded border border-gray-300 bg-white px-2 text-sm text-gray-700">
                  <div className="mt-1">Delivery</div>
                </div>
        
                        <div className="text-[#44164e] font-semibold mt-4">Message:</div>
                        <div
                  className="bg-[#fef4e4] p-3 rounded mt-1 text-xs text-[#482b0e]">
                <div className="text-">Urgent Delivery Date: <br></br><br></br>May 7, 1015 | 7:00 AM<br></br><br></br><br></br>Thank You!</div>
                  </div>

                  <div className="text-[#44164e] font-semibold mt-4">
                  Status:
                  <select
                    className="h-8 w-full mt-1 rounded border border-gray-300 bg-white px-2 text-sm text-gray-700"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="" disabled>
                      Pending
                    </option>
                    <option value="Pick-up">Received</option>
                  </select>
                </div>
        
                        {/* Buttons */}
                <div className="mt-8 self-end flex gap-2">
                  <Button
                    variant="superOutline"
                    className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg bg-white hover:bg-gray-100 border-gray-400 hover:text-[#482b0e] text-[#482b0e]"
                  >
                    <Link href="/sales/sales_requests/s_nonconsumables_request">Back</Link>
                  </Button>
                  <Button
                    variant="superOutline"
                    className="h-8 w-30 px-2 py-1 rounded-4xl shadow-lg bg-[#ffc922] hover:bg-gray-300 border-gray-400 hover:text-[#ffffff] text-[#ffffff]"
                    onClick={handleSave} // Call handleSave on click
                  >
                    Save
                  </Button>
                </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </SalesClientComponent>
    );
};

export default SalesViewDetailsCPOPage;