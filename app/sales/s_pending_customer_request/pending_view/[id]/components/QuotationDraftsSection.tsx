"use client";
import { useEffect, useState } from "react";

type Draft = {
  quotationNumber: string;
  projectName: string;
  quotationNotes: string;
};

const QuotationDraftsSection = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const loadDrafts = () => {
      try {
        const saved: Draft[] = JSON.parse(
          localStorage.getItem("quotationDrafts") || "[]"
        );
        setDrafts(saved);
      } catch (err) {
        console.error("Failed to parse drafts from localStorage", err);
        setDrafts([]);
      }
    };

    loadDrafts();
    window.addEventListener("drafts-updated", loadDrafts);

    return () => {
      window.removeEventListener("drafts-updated", loadDrafts);
    };
  }, []);

  return (
    <>
      <h3 className="font-bold text-2xl text-[#5a2347] mb-6">
        Quotation Drafts
      </h3>

      {drafts.length === 0 ? (
        <p className="text-gray-500 italic">No drafts saved yet.</p>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft, idx) => (
            <div key={idx} className="border p-4 rounded shadow bg-white">
              <p>
                <strong>Quotation #:</strong> {draft.quotationNumber}
              </p>
              <p>
                <strong>Project:</strong> {draft.projectName}
              </p>
              <p>
                <strong>Notes:</strong> {draft.quotationNotes}
              </p>
              <p className="text-sm text-gray-500">Status: Draft</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default QuotationDraftsSection;
