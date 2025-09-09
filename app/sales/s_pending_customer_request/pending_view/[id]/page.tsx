"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useParams, useRouter } from "next/navigation";
import QuotationForm from "./quotationform";

type QuotationFile = {
  id: number;
  path: string;
  uploaded_at: string;
};

type QuotationRequest = {
  id: number;
  project_name: string;
  mode: string;
  status: string;
  message?: string;
  created_at: string;
  reason?: string;
  files?: QuotationFile[];
  quotation_notes?: string;
};

const PendingViewPage = () => {
  const params = useParams();
  const requestId = params?.id;
  const router = useRouter();

  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFloatingValidation, setShowFloatingValidation] = useState(false);
  const [actionType, setActionType] = useState<"Approved" | "Rejected" | "Cancelled" | null>(null);

  const fetchRequest = async () => {
    if (!requestId) {
      console.error("No request ID provided in URL");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/q_request?id=${requestId}`);
      if (!res.ok) throw new Error("Request not found");

      const json = await res.json();
      const data: QuotationRequest | null = Array.isArray(json) ? json[0] : json;
      if (!data) throw new Error("Request not found");

      setRequest(data);
    } catch (err) {
      console.error("Failed to fetch request:", err);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const initiateAction = (type: "Approved" | "Rejected" | "Cancelled") => {
    setActionType(type);
    setShowFloatingValidation(true);
  };

  const confirmAction = async () => {
    if (!request || !actionType) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/q_request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, status: actionType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setRequest(data.data ?? data);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
      setShowFloatingValidation(false);
      setActionType(null);
    }
  };

  const handleBack = () => router.back();

  if (loading) {
    return (
      <div className="bg-[#ffedce] min-h-screen w-full">
        <Header />
        <div className="px-10 py-6 w-full text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-[#ffedce] min-h-screen w-full">
        <Header />
        <div className="px-10 py-6 w-full text-center text-gray-500">
          {requestId ? "Request not found." : "Invalid URL. No request ID provided."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ffedce] min-h-screen w-full relative">
      <Header />
      <div className="px-10 py-6 w-full">
        <button
          className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
          onClick={handleBack}
        >
          &larr; Back
        </button>

        {/* Container: side by side layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Request Details Paper */}
          <div className="bg-white p-6 rounded-xl shadow flex-1">
            <h1 className="text-3xl font-bold text-[#0c2a42] mb-4">Request Details</h1>
            <p><strong>Request ID:</strong> {request.id}</p>
            <p><strong>Project Name:</strong> {request.project_name}</p>
            <p><strong>Mode:</strong> {request.mode}</p>

            <p className="relative inline-block group">
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded font-semibold ${
                  request.status === "Pending" ? "bg-yellow-100 text-yellow-600" :
                  request.status === "Approved" ? "bg-green-100 text-green-700" :
                  request.status === "Rejected" ? "bg-red-100 text-red-600" :
                  request.status === "Cancelled" ? "bg-gray-100 text-gray-600" :
                  request.status === "CancelRequested" ? "bg-orange-100 text-orange-600" : ""
                }`}
              >
                {request.status}
              </span>

              {request.reason && ["CancelRequested", "Cancelled"].includes(request.status) && (
                <div className="absolute left-full top-0 ml-2 hidden group-hover:block w-80 p-3 rounded-xl shadow-lg border bg-white z-50">
                  <p className={`font-semibold ${request.status === "Cancelled" ? "text-red-600" : "text-orange-600"}`}>
                    Customer Cancellation Reason:
                  </p>
                  <p className="mt-1 text-gray-700">{request.reason}</p>
                </div>
              )}
            </p>

            <p className="whitespace-pre-wrap break-words"><strong>Message:</strong> {request.message || "N/A"}</p>
            <p><strong>Date & Time Requested:</strong> {new Date(request.created_at).toLocaleString()}</p>

            {request.files && request.files.length > 0 && (
              <div>
                <strong>Uploaded Files:</strong>
                <ul className="list-disc list-inside mt-2">
                  {request.files.map((file) => (
                    <li key={file.id}>
                      <a href={file.path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {file.path.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            {["Pending", "CancelRequested"].includes(request.status) && (
              <div className="flex gap-4 mt-6 relative">
                {request.status === "Pending" && (
                  <>
                    <button
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                      onClick={() => initiateAction("Approved")}
                      disabled={updating}
                    >
                      Accept
                    </button>
                    <button
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                      onClick={() => initiateAction("Rejected")}
                      disabled={updating}
                    >
                      Reject
                    </button>
                  </>
                )}
                {request.status === "CancelRequested" && (
                  <>
                    <button
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                      onClick={() => initiateAction("Cancelled")}
                      disabled={updating}
                    >
                      Approve Cancellation
                    </button>
                    <button
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                      onClick={() => initiateAction("Rejected")}
                      disabled={updating}
                    >
                      Reject Cancellation
                    </button>
                  </>
                )}

                {showFloatingValidation && actionType && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-white border shadow-lg p-4 rounded-xl z-50 w-80">
                    <p className="mb-4 text-gray-700 text-center">
                      Are you sure you want to {actionType.toLowerCase()} this request?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400" onClick={() => setShowFloatingValidation(false)}>Cancel</button>
                      <button
                        className={`px-4 py-2 rounded-lg text-white ${
                          actionType === "Approved" || actionType === "Cancelled"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        onClick={confirmAction}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quotation Form Paper – Only show if Approved */}
          {request.status === "Approved" && (
            <div className="bg-white p-6 rounded-xl shadow flex-1">
              <h1 className="text-3xl font-bold text-[#0c2a42] mb-4">Quotation Form</h1>
              <QuotationForm
                requestId={request.id}
                projectName={request.project_name}
                mode={request.mode}
                initialNotes={request.quotation_notes}
                onSaved={(data) => setRequest((prev) => prev ? { ...prev, ...data } : prev)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingViewPage;
