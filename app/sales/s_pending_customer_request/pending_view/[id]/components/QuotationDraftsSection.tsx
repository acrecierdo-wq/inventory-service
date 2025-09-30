// app/sales/s_pending_customer_request/pending_view/[id]/components/QuotationDraftsSection.tsx

"use client";
import { useEffect, useState } from "react";

type Draft = {
  id: number;
  quotationNumber: string;
  projectName: string;
  quotationNotes: string;
  status: string;
};

type Props = {
  newDraft?: Draft | null;
};

const QuotationDraftsSection = ({ newDraft }: Props) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const loadDrafts = async () => {
      try {
        const res = await fetch("/api/sales/quotations?status=draft");
        if (!res.ok) throw new Error("Failed to fetch draft");
        const data = await res.json();
        setDrafts(data.quotations || []);
      } catch (err) {
        console.error("Error loading drafts:", err);
        setDrafts([]);
      }
    };

    loadDrafts();
  }, []);

  useEffect(() => {
    if (newDraft) {
      setDrafts((prev) => [newDraft, ... prev]);
    }
  }, [newDraft]);

  return (
    <>
      <h3 className="font-bold text-2xl text-[#5a2347] mb-6">
        Quotation Drafts
      </h3>

      {drafts.length === 0 ? (
        <p className="text-gray-500 italic">No drafts saved yet.</p>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="border p-4 rounded shadow bg-white">
              <p>
                <strong>Quotation #:</strong> {draft.quotationNumber}
              </p>
              <p>
                <strong>Project:</strong> {draft.projectName}
              </p>
              <p>
                <strong>Notes:</strong> {draft.quotationNotes}
              </p>
              <p className="text-sm text-gray-500">Status: {draft.status}</p>
            </div>
          ))}
        </div>
      )}

    </>
  );
};

export default QuotationDraftsSection;
