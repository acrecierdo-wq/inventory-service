"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { Camera, RotateCcw, X } from "lucide-react";

/**
 * Props for the Webcam Capture Modal component
 */
interface WebcamCaptureModalProps {
  onClose: () => void; // Function to close the modal
  onCapture: (imageFile: File) => void; // Callback with the captured image as a File object
}

/**
 * WebcamCaptureModal Component
 *
 * A full-featured webcam capture interface for OCR scanning.
 *
 * Features:
 * - Live webcam preview
 * - Camera flip (front/back on mobile devices)
 * - Capture photo with preview
 * - Retake option if not satisfied
 * - Converts captured image to File object for upload
 *
 * Workflow:
 * 1. User sees live webcam feed
 * 2. User clicks "Capture Photo"
 * 3. Preview of captured image is shown
 * 4. User can either retake or confirm
 * 5. Confirmed image is converted to File and sent back to parent
 */
export default function WebcamCaptureModal({
  onClose,
  onCapture,
}: WebcamCaptureModalProps) {
  // Reference to the webcam component for capturing screenshots
  const webcamRef = useRef<Webcam>(null);

  // Stores the base64-encoded captured image (null when showing live feed)
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Controls which camera to use: "user" = front-facing, "environment" = back-facing
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment" // Default to back camera (better for scanning documents)
  );

  /**
   * Captures a screenshot from the webcam feed
   * Converts the current video frame to a base64 JPEG image
   */
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  /**
   * Clears the captured image and returns to live webcam view
   * Allows user to take another photo if they're not satisfied
   */
  const retake = () => {
    setCapturedImage(null);
  };

  /**
   * Confirms the captured image and prepares it for OCR processing
   * Steps:
   * 1. Convert base64 image string to Blob
   * 2. Create a File object with proper filename and MIME type
   * 3. Send File to parent component via onCapture callback
   * 4. Close the modal
   */
  const handleConfirm = async () => {
    if (!capturedImage) return;

    // Convert base64 data URL to Blob
    const blob = await fetch(capturedImage).then((r) => r.blob());

    // Create a File object with timestamp-based filename
    const file = new File([blob], `receipt-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    // Send file to parent component for OCR processing
    onCapture(file);

    // Close this modal
    onClose();
  };

  /**
   * Toggles between front and back cameras on devices with multiple cameras
   * Useful on mobile devices - back camera typically has better quality for scanning
   */
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    // Full-screen dark overlay for better focus on the camera view
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Modal header with title and close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-[#173f63]">
            Capture Receipt Photo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main content area - shows either live webcam or captured image preview */}
        <div
          className="relative bg-black flex items-center justify-center"
          style={{ minHeight: "400px" }}
        >
          {!capturedImage ? (
            // LIVE WEBCAM VIEW - Active when no image has been captured yet
            <Webcam
              ref={webcamRef}
              audio={false} // We only need video, no audio
              screenshotFormat="image/jpeg" // Format for captured screenshots
              videoConstraints={{
                facingMode: facingMode, // Use selected camera (front/back)
              }}
              className="w-full h-auto rounded"
            />
          ) : (
            // IMAGE PREVIEW - Shows after user clicks "Capture Photo"
            <Image
              src={capturedImage}
              alt="Captured receipt"
              width={800}
              height={600}
              className="w-full h-auto rounded object-contain"
              unoptimized // Don't optimize since it's a temporary base64 image
            />
          )}
        </div>

        {/* Control buttons - changes based on capture state */}
        <div className="p-4 flex items-center justify-center gap-4">
          {!capturedImage ? (
            // CAPTURE MODE CONTROLS - Shown during live webcam view
            <>
              {/* Button to switch between front and back cameras */}
              <button
                type="button"
                onClick={toggleCamera}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                title="Switch Camera"
              >
                <RotateCcw size={20} />
                Flip Camera
              </button>

              {/* Main capture button - takes the photo */}
              <button
                type="button"
                onClick={capture}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"
              >
                <Camera size={20} />
                Capture Photo
              </button>
            </>
          ) : (
            // PREVIEW MODE CONTROLS - Shown after photo is captured
            <>
              {/* Button to discard photo and return to live webcam */}
              <button
                type="button"
                onClick={retake}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Retake
              </button>

              {/* Button to confirm and use the captured photo for OCR */}
              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Use This Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
