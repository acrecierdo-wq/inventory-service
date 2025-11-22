"use client";

import { Camera, Upload } from "lucide-react";

/**
 * Props for the OCR Mode Modal component
 */
interface OCRModeModalProps {
  onClose: () => void; // Function to close the modal
  onSelectWebcam: () => void; // Function called when user selects webcam option
  onSelectUpload: () => void; // Function called when user selects file upload option
}

/**
 * OCRModeModal Component
 *
 * A modal dialog that lets users choose how they want to scan a document for OCR:
 * - Option 1: Use their device's webcam to capture a photo in real-time
 * - Option 2: Upload an existing image file from their device
 *
 * This modal appears when the user clicks the "Scan via OCR" button in the issuance form.
 * After selecting an option, the modal closes and triggers the appropriate capture method.
 */
export default function OCRModeModal({
  onClose,
  onSelectWebcam,
  onSelectUpload,
}: OCRModeModalProps) {
  return (
    // Full-screen overlay with semi-transparent black background
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      {/* Modal card */}
      <div className="bg-white rounded-lg shadow-xl w-[400px] p-6">
        {/* Modal header */}
        <h2 className="text-xl font-bold text-[#173f63] mb-4 text-center">
          Select OCR Scan Method
        </h2>

        {/* Instruction text */}
        <p className="text-sm text-gray-600 mb-6 text-center">
          Choose how you want to scan the delivery receipt
        </p>

        {/* Two scan method options displayed as clickable cards */}
        <div className="flex flex-col gap-3">
          {/* WEBCAM OPTION - Opens webcam capture modal */}
          <button
            type="button"
            onClick={() => {
              onSelectWebcam(); // Trigger webcam modal
              onClose(); // Close this modal
            }}
            className="flex items-center gap-4 p-4 border-2 border-[#d2bda7] rounded-lg hover:bg-[#f5e6d3] hover:border-[#674d33] transition group"
          >
            {/* Camera icon with colored background */}
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200">
              <Camera className="text-blue-600" size={24} />
            </div>

            {/* Option description */}
            <div className="text-left flex-1">
              <p className="font-semibold text-[#482b0e]">Use Webcam</p>
              <p className="text-xs text-gray-600">
                Capture photo directly from camera
              </p>
            </div>
          </button>

          {/* UPLOAD OPTION - Opens file picker */}
          <button
            type="button"
            onClick={() => {
              onSelectUpload(); // Trigger file input
              onClose(); // Close this modal
            }}
            className="flex items-center gap-4 p-4 border-2 border-[#d2bda7] rounded-lg hover:bg-[#f5e6d3] hover:border-[#674d33] transition group"
          >
            {/* Upload icon with colored background */}
            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200">
              <Upload className="text-green-600" size={24} />
            </div>

            {/* Option description */}
            <div className="text-left flex-1">
              <p className="font-semibold text-[#482b0e]">Upload Image</p>
              <p className="text-xs text-gray-600">
                Select image file from device
              </p>
            </div>
          </button>
        </div>

        {/* Cancel button - closes modal without taking action */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
