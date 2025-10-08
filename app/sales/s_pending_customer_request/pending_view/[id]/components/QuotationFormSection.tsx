// "use client";

// import QuotationForm from "../quotationform";
// import { PreviewDocument } from "../components/quotationcomponents/PreviewDocument";
// import { SavedQuotation } from "@/app/sales/types/quotation";
// import { useState, useEffect } from "react";
// import { Draft } from "./QuotationDraftsSection";

// export interface QuotationFormData {
//   id: number | string;
//   notes?: string;
//   status: "draft" | "sent";
// }

// type Props = {
//   requestId: number;
//   projectName: string;
//   mode: string;
//   status: string;
//   quotationForms: SavedQuotation[];
//   handleAddQuotation: () => void;
//   setQuotationForms: React.Dispatch<React.SetStateAction<SavedQuotation[]>>;
// };

// export function QuotationFormSection({
//   requestId,
//   projectName,
//   mode,
//   status,
//   quotationForms,
//   setQuotationForms,
// }: Props) {
//   //const [isSaving, setIsSaving] = useState(false);
//   const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

//   // ✅ Handle saving as draft
//   const handleDraftSaved = (formId: string, draft: SavedQuotation) => {
//     console.log("Draft callback received:", draft);

//     // remove form from the active quotation section
//     setQuotationForms((prev) => prev.filter((ff) => ff.id !== formId));

//     // notify draft list to refresh
//     window.dispatchEvent(new Event("drafts-updated"));

//     // unlock restore buttons (so user can restore another one)
//     window.dispatchEvent(new Event("drafts-unlocked"));
//     setActiveDraftId(null);
//   };

//   // ✅ Mark as sent
//   const handleSendQuotation = (formId: number | string) => {
//     setQuotationForms((prev) =>
//       prev.map((f) =>
//         f.id === formId ? { ...f, status: "sent" } : f
//       )
//     );
//   };

//   // ✅ Add a fresh quotation
//   const handleAddNewQuotation = () => {
//     if (activeDraftId) return;
//     setQuotationForms((prev) => [
//       ...prev,
//       {
//         id: String(Date.now()),
//         requestId,
//         quotationNotes: "",
//         vat: 12,
//         markup: 0,
//         items: [],
//         delivery: "",
//         warranty: "",
//         validity: "",
//         status: "draft",
//       },
//     ]);
//   };

//   // ✅ Restore draft (from QuotationDraftsSection)
//   const handleRestoreDraft = (draft: Draft) => {
//     if (activeDraftId) return;

//     setActiveDraftId(draft.id);

//     // use real draft.id instead of Date.now() (generate a new one)
//     setQuotationForms([
//       {
//         id: draft.id,
//         requestId: draft.requestId,
//         projectName: draft.projectName || projectName,
//         mode: draft.mode || mode,
//         quotationNotes: draft.quotationNotes || "",
//         vat: draft.vat ?? 12,
//         markup: draft.markup ?? 0,
//         items: draft.items || [],
//         delivery: draft.delivery || "",
//         warranty: draft.warranty || "",
//         validity: draft.validity || "",
//         status: "draft",
//       },
//     ]);

//     // remove restored draft from drafts section
//     window.dispatchEvent(
//       new CustomEvent("drafts-updated", { detail: { removedDraftId: draft.id } })
//     );
//   };

//   // 🔹 Listen for completed save (from QuotationForm)
//   useEffect(() => {
//     const handleDone = () => {
//       setActiveDraftId(null);
//     };
//     window.addEventListener("drafts-unlocked", handleDone);
//     return () => window.removeEventListener("drafts-unlocked", handleDone);
//   }, []);

//   return (
//     <>
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="font-bold text-2xl text-[#5a2347]">Quotation Form</h3>

//         <button
//           className={`px-6 py-2 rounded-full font-medium shadow ${
//             status === "Accepted"
//               ? "bg-blue-600 text-white hover:bg-blue-700"
//               : "bg-gray-300 text-gray-500 cursor-not-allowed"
//           }`}
//           onClick={handleAddNewQuotation}
//           disabled={status !== "Accepted" || !!activeDraftId}
//         >
//           + Add Quotation
//         </button>
//       </div>

//       {quotationForms.length > 0 ? (
//         <div className="flex flex-col gap-6">
//           {quotationForms.map((form) => (
//             <div
//               key={form.id}
//               className="relative border rounded-xl p-4 shadow"
//             >
//               {/* Remove button */}
//               <button
//                 className="absolute top-2 right-2 text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                 onClick={() => {
//                   setQuotationForms((prev) =>
//                     prev.filter((ff) => ff.id !== form.id));

//                   window.dispatchEvent(new Event("drafts-unlocked"));
//                 }
//                 }
//               >
//                 Remove
//               </button>

//               {form.status === "draft" ? (
//                 <QuotationForm
//                   requestId={requestId}
//                   projectName={form.projectName || projectName}
//                   mode={form.mode || mode}
//                   initialNotes={form.quotationNotes}
//                   initialItems={form.items}
//                   initialVat={form.vat || 12}
//                   initialMarkup={form.markup || 0}
//                   initialDelivery={form.delivery}
//                   initialWarranty={form.warranty}
//                   initialValidity={form.validity}
//                   onSavedDraft={(draft) => handleDraftSaved(form.id, draft)}
//                   onSendQuotation={() => handleSendQuotation(form.id)}
//                 />
//               ) : (
//                 <PreviewDocument
//                   {...form}
//                   key={form.id}
//                   vat={12}
//                   markup={0}
//                   items={[]}
//                   delivery={""}
//                   warranty={""}
//                   validity={""}
//                   quotationNotes={""}
//                   requestId={0}
//                   cadSketchFile={[]}
//                   revisionLabel={""}
//                   baseQuotationId={0}
//                   customer={null}
//                   quotationNumber={""}
//                   isSent={true}
//                   onBack={() => {}}
//                   onSend={() => {}}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500 italic">
//           {status === "Accepted"
//             ? "Click '+ Add Quotation' to start adding quotations."
//             : "Quotation can only be added once the request is accepted."}
//         </p>
//       )}

//       {/* 🔹 Hook the restore handler */}
//       <script
//         dangerouslySetInnerHTML={{
//           __html: `
//           window.handleRestoreDraft = ${handleRestoreDraft.toString()};
//         `,
//         }}
//       />
//     </>
//   );
// }

// export default QuotationFormSection;

"use client";

import QuotationForm from "../quotationform";
import { PreviewDocument } from "../components/quotationcomponents/PreviewDocument";
import { SavedQuotation } from "@/app/sales/types/quotation";
import { Draft } from "./QuotationDraftsSection";
import { useState, useEffect, useCallback } from "react";

type Props = {
  requestId: number;
  projectName?: string;
  mode?: string;
  status?: string;
  quotationForms: SavedQuotation[];
  handleAddQuotation: () => void;
  setQuotationForms: React.Dispatch<React.SetStateAction<SavedQuotation[]>>;
  initialId?: string;
  restoredDraft?: Draft | null;
  setActiveDraftId?: React.Dispatch<React.SetStateAction<string | null>>;
};

export function QuotationFormSection({
  requestId,
  projectName,
  mode,
  status,
  quotationForms,
  setQuotationForms,
}: Props) {
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const isDraftActive = quotationForms.some(
    (f) => f.status === "draft" || f.status === "restoring"
  );

  const handleAddNewQuotation = () => {
    if (isDraftActive) return;

    const newDraft: SavedQuotation = {
      id: String(Date.now()),
      requestId,
      quotationNotes: "",
      vat: 12,
      markup: 0,
      items: [],
      delivery: "",
      warranty: "",
      validity: "",
      status: "draft",
    };

    setQuotationForms((prev) => [...prev, newDraft]);
    setActiveDraftId(newDraft.id);
  };

  // ✅ Memoized to make ESLint happy and prevent stale closure
  const handleRestoreDraft = useCallback(
    (draft: Draft) => {
      if (isDraftActive) return;

      const restoredForm: SavedQuotation = {
        id: draft.id,
        requestId: draft.requestId,
        projectName: draft.projectName || projectName,
        mode: draft.mode || mode,
        quotationNotes: draft.quotationNotes || "",
        vat: draft.vat ?? 12,
        markup: draft.markup ?? 0,
        items: draft.items || [],
        delivery: draft.delivery || "",
        warranty: draft.warranty || "",
        validity: draft.validity || "",
        status: "restoring",
      };

      setQuotationForms([restoredForm]);
      setActiveDraftId(draft.id);

      window.dispatchEvent(new CustomEvent("drafts-locked"));
      window.dispatchEvent(
        new CustomEvent("drafts-updated", {
          detail: { removedDraftId: draft.id },
        })
      );
    },
    [isDraftActive, projectName, mode, setQuotationForms]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDraftSaved = (formId: string, draft: SavedQuotation) => {
    setQuotationForms((prev) => prev.filter((f) => f.id !== formId));
    setActiveDraftId(null);

    window.dispatchEvent(new CustomEvent("drafts-unlocked"));
    window.dispatchEvent(new CustomEvent("drafts-updated"));
  };

  const handleSendQuotation = (formId: string) => {
    setQuotationForms((prev) =>
      prev.map((f) => (f.id === formId ? { ...f, status: "sent" } : f))
    );
  };

  // ✅ Clean useEffect — dependency properly added
  useEffect(() => {
    const handleExternalRestore = (e: CustomEvent<{ draft: Draft }>) =>
      handleRestoreDraft(e.detail.draft);

    window.addEventListener(
      "restore-draft",
      handleExternalRestore as EventListener
    );
    return () =>
      window.removeEventListener(
        "restore-draft",
        handleExternalRestore as EventListener
      );
  }, [handleRestoreDraft]);

  useEffect(() => {
    console.log("Active Draft ID changed:", activeDraftId);
  }, [activeDraftId]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-[#880c0c]">Quotation Form</h3>

        {status === "Accepted" && !isDraftActive && (
          <button
            className="px-6 py-2 rounded-full font-medium shadow bg-white text-[#880c0c] hover:bg-[#cf3a3a] hover:text-white"
            onClick={handleAddNewQuotation}
          >
            + Add Quotation
          </button>
        )}
      </div>

      {quotationForms.length > 0 ? (
        <div className="flex flex-col gap-6">
          {quotationForms.map((form) => {
            const isEditable =
              form.status === "draft" || form.status === "restoring";

            return (
              <div
                key={form.id}
                className="relative border rounded-xl p-4 shadow"
              >
                {isEditable && (
                  <button
                    className="absolute top-2 right-2 text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => {
                      setQuotationForms((prev) =>
                        prev.filter((f) => f.id !== form.id)
                      );
                      setActiveDraftId(null);
                      window.dispatchEvent(new Event("drafts-unlocked"));
                    }}
                  >
                    Remove
                  </button>
                )}

                {isEditable ? (
                  <QuotationForm
                    requestId={requestId}
                    projectName={form.projectName || projectName}
                    mode={form.mode || mode}
                    initialId={form.id}
                    initialNotes={form.quotationNotes}
                    initialItems={form.items}
                    initialVat={form.vat || 12}
                    initialMarkup={form.markup || 0}
                    initialDelivery={form.delivery}
                    initialWarranty={form.warranty}
                    initialValidity={form.validity}
                    setActiveDraftId={setActiveDraftId}
                    onSavedDraft={(draft) => 
                      handleDraftSaved(form.id, 
                        { ...draft, revisionLabel: String(draft.revisionLabel ?? ""), }) }
                    onSendQuotation={() => handleSendQuotation(form.id)}
                  />
                ) : (
                  <PreviewDocument
                    {...form}
                    vat={form.vat ?? 12}
                    markup={form.markup ?? 0}
                    items={form.items ?? []}
                    delivery={form.delivery ?? ""}
                    warranty={form.warranty ?? ""}
                    validity={form.validity ?? ""}
                    quotationNotes={form.quotationNotes ?? ""}
                    requestId={form.requestId ?? requestId}
                    cadSketchFile={form.cadSketchFile ?? []}
                    revisionLabel={form.revisionLabel ?? ""}
                    baseQuotationId={Number(form.baseQuotationId ?? 0)}
                    customer={form.customer ?? null}
                    quotationNumber={form.quotationNumber ?? ""}
                    isSent={true}
                    onBack={() => {}}
                    onSend={() => {}}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[#880c0c9b] italic">
          {status === "Accepted"
            ? "Click '+ Add Quotation' to start adding quotations."
            : "Quotation can only be added once the request is accepted."}
        </p>
      )}
    </>
  );
}

export default QuotationFormSection;
