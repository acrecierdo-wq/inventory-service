// app/sales/s_pending_customer_request/pending_view/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { QuotationFormSection } from "./components/QuotationFormSection";
import { QuotationItem } from "@/app/sales/types/quotation";

type QuotationFile = {
  id: number;
  path: string;
  uploaded_at: string;
};

type CustomerProfile = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
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
  customer?: CustomerProfile;
  quotation_notes?: string;
};

type QuotationFormState = {
  id: number;
  saved?: boolean;
  notes?: string;
  expanded?: boolean;
  items: QuotationItem[];
  delivery: string;
  warranty: string;
  validity: string;
};

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  CancelRequested: "bg-orange-100 text-orange-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

const PendingViewPage = () => {
  const params = useParams();
  const requestId = params?.id;
  const router = useRouter();

  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFloatingValidation, setShowFloatingValidation] = useState(false);
  const [actionType, setActionType] = useState<"Accepted" | "Rejected" | "Cancelled" | null>(null);
  const [activeTab, setActiveTab] = useState<"request" | "quotation" | "drafts">("request");
  const [quotationForms, setQuotationForms] = useState<QuotationFormState[]>([]);

  // Fetch request with customer
  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/sales/my_request/${requestId}`);
        const data = await res.json();
        setRequest(data || null);
      } catch (err) {
        console.error(err);
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId]);

  const initiateAction = (type: "Accepted" | "Rejected" | "Cancelled") => {
    setActionType(type);
    setShowFloatingValidation(true);
  };

  const confirmAction = async () => {
    if (!request || !actionType) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/sales/my_request/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: actionType }),
      });
      const data = await res.json();
      if (data) {
        setRequest(data);
        toast.success(`Request ${actionType.toLowerCase()} successfully!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request.");
    } finally {
      setUpdating(false);
      setShowFloatingValidation(false);
      setActionType(null);
    }
  };

  const handleBack = () => router.back();

  const handleAddQuotation = () => {
    const last = quotationForms[quotationForms.length - 1];
    if (last && !last.saved) {
      toast.error("Please complete and save the current quotation before adding a new one.");
      return;
    }
    setQuotationForms((prev) => [...prev, { id: Date.now(), saved: false, notes: undefined, items: [], delivery: "", warranty: "", validity: "" }]);
    setActiveTab("quotation");
  };

  if (loading) {
    return (
      <div className="bg-[#ffedce] min-h-screen w-full">
        <Header />
        <div className="px-10 py-6 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-[#ffedce] min-h-screen w-full">
        <Header />
        <div className="px-10 py-6 text-center text-gray-500">
          {requestId ? "Request not found." : "Invalid URL. No request ID provided."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <Header />

      <div className="max-w-7xl mx-auto my-10 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#133657] to-[#2c5b7d] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Request #{request.id}</h2>
            <p className="text-lg">Type of Request: Services</p>
          </div>
          <button
            className="px-4 py-2 rounded-full bg-white text-[#133657] hover:bg-gray-100 font-medium"
            onClick={handleBack}
          >
            &larr; Back
          </button>
        </div>

        {/* Tabs */}
        <div className="px-10 py-6">
          <div className="flex gap-6 border-b border-gray-300 mb-6">
            <button
              className={`pb-2 font-semibold text-lg ${
                activeTab === "request" ? "text-[#5a2347] border-b-2 border-[#5a2347]" : "text-gray-500 hover:text-[#5a2347]"
              }`}
              onClick={() => setActiveTab("request")}
            >
              Request Details
            </button>
            <button
              className={`pb-2 font-semibold text-lg ${
                activeTab === "quotation" ? "text-[#5a2347] border-b-2 border-[#5a2347]" : "text-gray-500 hover:text-[#5a2347]"
              }`}
              onClick={() => setActiveTab("quotation")}
            >
              Quotation Form
            </button>
            <button
              className={`pb-2 font-semibold text-lg ${
                activeTab === "drafts" ? "text-[#5a2347] border-b-2 border-[#5a2347]" : "text-gray-500 hover:text-[#5a2347]"
              }`}
              onClick={() => setActiveTab("drafts")}
            >
              Quotation Drafts
            </button>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 text-gray-700 text-lg">
            {activeTab === "request" && (
              <>
                <h3 className="font-bold text-2xl text-[#5a2347] mb-6">Request Details</h3>

                {/* Request Info */}
                <p><span className="font-semibold">Project Name: </span>{request.project_name}</p>
                <p><span className="font-semibold">Mode: </span>{request.mode}</p>
                <p>
                  <span className="font-semibold">Message: </span>
                  <span className="whitespace-pre-wrap">{request.message || "N/A"}</span>
                </p>
                <p>
                  <span className="font-semibold">Status: </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[request.status] || ""}`}>
                    {request.status}
                  </span>
                </p>
                {request.reason && (
                  <p><span className="font-semibold">Cancellation Reason: </span><span className="italic">{request.reason}</span></p>
                )}
                <p><span className="font-semibold">Requested At: </span>{new Date(request.created_at).toLocaleString()}</p>

                {/* Customer Info */}
                {request.customer && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-xl mb-3 text-[#5a2347]">Customer Information</h4>

                    <p><span className="font-semibold">Company: </span>{request.customer.companyName} <span className=""></span></p>
                    <p><span className="font-semibold">Contact Person: </span>{request.customer.contactPerson}</p>
                    <p><span className="font-semibold">Email: </span>{request.customer.email}</p>
                    <p><span className="font-semibold">Phone: </span>{request.customer.phone || "N/A"}</p>
                    <p><span className="font-semibold">Address: </span>{request.customer.address || "N/A"}</p>
                  </div>
                )}

                {/* Attachments */}
                {request.files && request.files.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-lg mb-4">Attachments</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {request.files.map((file) => (
                        <div
                          key={file.id}
                          className="relative border border-gray-300 rounded-xl p-3 bg-white shadow cursor-pointer hover:shadow-lg hover:scale-105 transition"
                          onClick={() => window.open(file.path, "_blank")}
                        >
                          <div className="h-32 flex items-center justify-center text-sm text-gray-600 text-center">
                            {file.path.split("/").pop()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "quotation" && (
              <QuotationFormSection
                requestId={request.id}
                projectName={request.project_name}
                mode={request.mode}
                status={request.status}
                quotationForms={quotationForms}
                handleAddQuotation={handleAddQuotation}
                setQuotationForms={setQuotationForms}
              />
            )}


{activeTab === "drafts" && (
  <div>
    <h3 className="font-bold text-2xl text-[#5a2347] mb-6">Quotation Drafts</h3>
    {quotationForms.length === 0 ? (
      <p className="text-gray-500">No drafts yet.</p>
    ) : (
      <ul className="space-y-4">
        {quotationForms.map((form) => (
          <li key={form.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <p>Draft #{form.id}</p>
            <p>Status: {form.saved ? "Saved" : "In Progress"}</p>
            {form.notes && <p>Notes: {form.notes}</p>}
          </li>
        ))}
      </ul>
    )}
  </div>
)}

            
          </div>
        </div>

        {/* Footer */}
        {activeTab === "request" && (
          <div className="flex justify-end gap-4 px-10 py-6 bg-gray-50 border-t">
            {request.status === "Pending" && (
              <>
                <button
                  className="px-8 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 font-medium text-lg shadow"
                  onClick={() => initiateAction("Accepted")}
                  disabled={updating}
                >
                  Accept
                </button>
                <button
                  className="px-8 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 font-medium text-lg shadow"
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
                  className="px-8 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 font-medium text-lg shadow"
                  onClick={() => initiateAction("Cancelled")}
                  disabled={updating}
                >
                  Approve Cancellation
                </button>
                <button
                  className="px-8 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 font-medium text-lg shadow"
                  onClick={() => initiateAction("Rejected")}
                  disabled={updating}
                >
                  Reject Cancellation
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showFloatingValidation && actionType && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <p className="mb-4 text-gray-700 text-center">
              Are you sure you want to {actionType.toLowerCase()} this request?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowFloatingValidation(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white ${
                  actionType === "Accepted" || actionType === "Cancelled"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={confirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingViewPage;
