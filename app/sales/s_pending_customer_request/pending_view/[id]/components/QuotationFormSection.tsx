"use client";

import QuotationForm from "../quotationform";

type Props = {
  requestId: number;
  projectName: string;
  mode: string;
  status: string;
  quotationForms: any[];
  handleAddQuotation: () => void;
  setQuotationForms: React.Dispatch<React.SetStateAction<any[]>>;
};

const QuotationFormSection = ({
  requestId,
  projectName,
  mode,
  status,
  quotationForms,
  handleAddQuotation,
  setQuotationForms,
}: Props) => {
  // ✅ Save draft and remove form from section
  const handleDraftSaved = (formId: number, draft: any) => {
    console.log("Removing form with ID:", formId);

    // 1. Remove the form from active quotationForms
    setQuotationForms((prev) => prev.filter((ff) => ff.id !== formId));

    // 2. Save draft into localStorage
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("quotationDrafts") || "[]");
      localStorage.setItem("quotationDrafts", JSON.stringify([...existing, draft]));

      // 3. Notify QuotationDraftsSection
      window.dispatchEvent(new Event("drafts-updated"));
    }
  };

  // ✅ Add quotation with unique ID
  const handleAddNewQuotation = () => {
    setQuotationForms((prev) => [
      ...prev,
      { id: Date.now(), notes: "" }, // ✅ unique id
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

              {/* Quotation Form */}
              <QuotationForm
                requestId={requestId}
                projectName={projectName}
                mode={mode}
                initialNotes={form.notes}
                onSavedDraft={(draft) => handleDraftSaved(form.id, draft)} // ✅ handle draft
              />
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
