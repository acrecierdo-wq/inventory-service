"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CustomerHeader } from "@/components/header-customer";
import CustomerClientComponent from "@/app/validate/customer_validate";
import { Package, Truck, FileCheck, CheckCircle2 } from "lucide-react"; // added icons

type QuotationRequest = {
  id: number;
  project_name: string;
  mode: string | null;
  status: string;
  created_at: string;
};

const steps = ["Quotation", "Purchase Order", "Step 3", "Step 4"]; // added placeholders

const TrackMyOrderPage = () => {
  const { id } = useParams();
  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [activeStep, setActiveStep] = useState("Quotation");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/my_request/${id}`);
        if (!res.ok) throw new Error("Failed to fetch request");
        const data = await res.json();
        setRequest(data);
        if (data.status) setActiveStep(data.status);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchRequest();
  }, [id]);

  if (!request) {
    return (
      <CustomerClientComponent>
        <div className="min-h-screen bg-[#fed795]">
          <div className="border-2 shadow-md">
            <CustomerHeader />
          </div>
          <div className="flex justify-center items-center h-[80vh]">
            <p className="text-lg text-gray-600">Loading request...</p>
          </div>
        </div>
      </CustomerClientComponent>
    );
  }

  return (
    <CustomerClientComponent>
      <div className="bg-[#fed795] min-h-screen w-full">
        {/* Header */}
        <div className="border-2 shadow-md">
          <CustomerHeader />
        </div>

        {/* White Container */}
        <div className="flex justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="bg-white rounded-2xl shadow-lg 
                          p-4 sm:p-6 md:p-8 lg:p-10 
                          w-full max-w-4xl 
                          max-h-[90vh] overflow-y-auto">
            
            {/* Order Info */}
            <h2 className="text-2xl sm:text-3xl font-bold text-[#482b0e] mb-6">
              Tracking Request #{request.id}
            </h2>
            <div className="space-y-2 mb-10">
              <p className="text-[#482b0e]/90">
                <span className="font-semibold">Project:</span>{" "}
                {request.project_name}
              </p>
              <p className="text-[#482b0e]/90">
                <span className="font-semibold">Mode:</span>{" "}
                {request.mode || "N/A"}
              </p>
              <p className="text-[#482b0e]/90">
                <span className="font-semibold">Status:</span> {request.status}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Requested at:{" "}
                {new Date(request.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                {new Date(request.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {/* Progress Circles */}
            <div className="px-2 sm:px-6 py-6">
              <div className="flex justify-between items-center relative">
                {steps.map((step, idx) => {
                  const isActive = activeStep === step;

                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center text-center flex-1 relative"
                    >
                      {/* Circle */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition cursor-pointer z-10
                          ${
                            isActive
                              ? "bg-[#f59e0b] text-white"
                              : "bg-gray-300 text-gray-500"
                          }`}
                        onClick={() => setActiveStep(step)}
                      >
                        {step === "Quotation" ? (
                          <Package className="w-6 h-6" />
                        ) : step === "Purchase Order" ? (
                          <Truck className="w-6 h-6" />
                        ) : step === "Step 3" ? (
                          <FileCheck className="w-6 h-6" />
                        ) : (
                          <CheckCircle2 className="w-6 h-6" />
                        )}
                      </div>

                      {/* Label */}
                      <button
                        onClick={() => setActiveStep(step)}
                        className={`mt-3 pb-1 font-semibold text-lg transition border-b-2 ${
                          isActive
                            ? "text-[#5a2347] border-[#5a2347]"
                            : "text-gray-500 border-transparent hover:text-[#5a2347]"
                        }`}
                      >
                        {step}
                      </button>

                      {/* Connector */}
                      {idx < steps.length - 1 && (
                        <div
                          className={`absolute top-6 left-1/2 w-full h-1 
                            ${
                              activeStep === steps[idx + 1] || activeStep === step
                                ? "bg-[#f59e0b]"
                                : "bg-gray-300"
                            }`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-50 rounded-xl shadow-inner p-6 mt-6 space-y-4">
              {activeStep === "Quotation" && (
                <p className="text-gray-700 text-lg">
                  Your quotation details are being processed.
                </p>
              )}
              {activeStep === "Purchase Order" && (
                <p className="text-gray-700 text-lg">
                  Your purchase order is now active.
                </p>
              )}
              {activeStep === "Step 3" && (
                <p className="text-gray-700 text-lg">This is Step 3 (empty).</p>
              )}
              {activeStep === "Step 4" && (
                <p className="text-gray-700 text-lg">This is Step 4 (empty).</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomerClientComponent>
  );
};

export default TrackMyOrderPage;
