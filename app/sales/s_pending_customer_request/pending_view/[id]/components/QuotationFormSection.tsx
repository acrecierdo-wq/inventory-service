// app/sales/s_pending_customer_request/pending_view/[id]/components/QuotationFormSection.tsx

"use client";

import QuotationForm from "../quotationform";
import { PreviewDocument } from "../components/quotationcomponents/PreviewDocument";
import { SavedQuotation } from "@/app/sales/types/quotation";

export interface QuotationFormData {
  id: number,
  notes?: string,
  status: "draft" | "sent",
}

type Props = {
  requestId: number;
  projectName: string;
  mode: string;
  status: string;
  quotationForms: SavedQuotation[];
  handleAddQuotation: () => void;
  setQuotationForms: React.Dispatch<React.SetStateAction<SavedQuotation[]>>;
};

export function QuotationFormSection({
  requestId,
  projectName,
  mode,
  status,
  quotationForms,
  setQuotationForms,
  
}: Props){
  // ✅ Save draft and remove form from section
  const handleDraftSaved = (formId: number, draft: SavedQuotation) => {
    console.log("Saving draft for ID:", formId);

    // Remove form from active state
    setQuotationForms((prev) => prev.filter((ff) => ff.id !== formId));

    // Save draft into localStorage
    if (typeof window !== "undefined") {
      const existing: QuotationFormData[] = JSON.parse(
        localStorage.getItem("quotationDrafts") || "[]"
      );
      localStorage.setItem("quotationDrafts", JSON.stringify([...existing, draft]));
      
      // Notify QuotationDraftsSection
      window.dispatchEvent(new Event("drafts-updated"));
    }
  };

  // ✅ Mark as sent
  const handleSendQuotation = (formId: number) => {
    setQuotationForms((prev) =>
      prev.map((f) =>
        f.id === formId ? { ...f, status: "sent" } : f
      )
    );
  };

  // ✅ Add quotation with unique ID
  const handleAddNewQuotation = () => {
    setQuotationForms(prev => [
  ...prev,
  {
    id: Date.now(),
    requestId,
    quotationNotes: "",
    vat: 0,
    markup: 0,
    items: [],
    delivery: "",
    warranty: "",
    validity: "",
    status: "draft",
  }
]);
  };


  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-2xl text-[#5a2347]">Quotation Form</h3>

        <button
          className={`px-6 py-2 rounded-full font-medium shadow ${
            status === "Accepted"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={handleAddNewQuotation}
          disabled={status !== "Accepted"}
        >
          + Add Quotation
        </button>
      </div>

      {quotationForms.length > 0 ? (
        <div className="flex flex-col gap-6">
          {quotationForms.map((form) => (
            <div
              key={form.id}
              className="relative border rounded-xl p-4 shadow"
            >
              {/* Remove button */}
              <button
                className="absolute top-2 right-2 text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() =>
                  setQuotationForms((prev) => prev.filter((ff) => ff.id !== form.id))
                }
              >
                Remove
              </button>

              {form.status === "draft" ? (
                <QuotationForm
                  requestId={requestId}
                  projectName={projectName}
                  mode={mode}
                  initialNotes={form.quotationNotes}
                  onSavedDraft={(draft) => handleDraftSaved(form.id, draft)}
                  onSendQuotation={() => handleSendQuotation(form.id)} // ✅ now handled
                />
              ) : (
                <PreviewDocument
                  {...form}
                  key={form.id}
                  vat={0}
                  markup={0}
                  items={[]}
                  delivery={""}
                  warranty={""}
                  validity={""}
                  quotationNotes={""}
                  requestId={0}
                  cadSketchFile={[]}
                  revisionLabel={""}
                  baseQuotationId={0}
                  customer={null}
                  quotationNumber={""}
                  isSent={true} 
                  onBack={() => {}}
                  onSend={() => {}}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          {status === "Accepted"
            ? "Click '+ Add Quotation' to start adding quotations."
            : "Quotation can only be added once the request is accepted."}
        </p>
      )}
    </>
  );
};
export default QuotationFormSection;
