// app/sales/s_pending_customer_request/pending_view/[id]/components/QuotationDraftsSection.tsx

// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { toast } from "sonner";

// export type Draft = {
//   id: string;
//   quotationNumber?: string;
//   projectName?: string;
//   quotationNotes?: string;
//   mode?: string;
//   items?: [];
//   delivery?: string;
//   warranty?: string;
//   validity?: string;
//   vat?: number;
//   markup?: number;
//   status: "draft";
//   requestId: number;
// };

// type Props = {
//   requestId: number;
//   onRestore?: (draft: Draft) => void;
//   restoringDraftId?: number | string | null;
// };

// export function QuotationDraftsSection({ requestId, onRestore }: Props) {
//   const [drafts, setDrafts] = useState<Draft[]>([]);
//   const [locked, setLocked] = useState(false);
//   const [restoringDraftId, setRestoringDraftId] = useState<string | null>(null);


//   const fetchDrafts = useCallback(async () => {
//     try {
//       const res = await fetch(`/api/sales/quotations?status=draft&requestId=${requestId}`);
//       const data = await res.json();
//       setDrafts(data.quotations || []);
//     } catch (err) {
//       console.error("Error loading drafts:", err);
//       setDrafts([]);
//     }
//   }, [requestId]);

//   useEffect(() => {
//     if (requestId) fetchDrafts();

//     const handleUpdated = (event: CustomEvent) => {
//       if (event.detail?.removedDraftId) {
//         setDrafts((prev) => prev.filter((d) => d.id !== event.detail.removedDraftId));
//       } else {
//         fetchDrafts();
//       }
//     };

//     const handleLocked = () => setLocked(true);
//     const handleUnlocked = () => {
//       setLocked(false);
//       setRestoringDraftId(null);
//       fetchDrafts();
//     };

//     window.addEventListener("drafts-updated", handleUpdated as EventListener);
//     window.addEventListener("drafts-locked", handleLocked);
//     window.addEventListener("drafts-unlocked", handleUnlocked);

//     return () => {
//       window.removeEventListener("drafts-updated", handleUpdated as EventListener);
//       window.removeEventListener("drafts-locked", handleLocked);
//       window.removeEventListener("drafts-unlocked", handleUnlocked);
//     };
//   }, [fetchDrafts, requestId]);

//   const handleDelete = async (id: string) => {
//     if (locked) {
//       toast.warning("A draft is currently being restored. Please wait.");
//       return;
//     }
//     try {
//       await fetch(`/api/sales/quotations?id=${id}`, { method: "DELETE" });
//       setDrafts((prev) => prev.filter((d) => d.id !== id));
//       toast.success("Draft deleted successfully.");
//     } catch {
//       toast.error("Failed to delete draft.");
//     }
//   };

//   const handleRestore = async (draft: Draft) => {
//     if (locked || restoringDraftId) {
//       toast.warning("Another draft is already being restored.");
//       return;
//     }

//     setRestoringDraftId(draft.id);
//     setLocked(true);

//     try {
//       // mark draft as restoring in backend so it doesn't show up in fetch drafts
//       await fetch(`/api/sales/quotations?id=${draft.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: "restoring "}),
//       });

//       onRestore?.(draft);

//       setDrafts((prev) => prev.filter((d) => d.id !== draft.id));

//       window.dispatchEvent(new CustomEvent("drafts-locked"));
//       window.dispatchEvent(new CustomEvent("drafts-updated", { detail: { removedDraftId: draft.id }, }));

//       toast.success("Draft restored successfully!");
//     } catch (err) {
//       console.error("Failed to restore draft:", err);
//       toast.error("Failed to restore draft. Please try again.");
//       setLocked(false);
//       setRestoringDraftId(null);
//     }
//   };

//   return (
//     <div className="mt-4">
//       <h3 className="font-bold text-2xl text-[#5a2347] mb-6">Quotation Drafts</h3>

//       {drafts.length === 0 ? (
//         <p className="text-gray-500 italic">No drafts saved yet.</p>
//       ) : (
//         <div className="space-y-4">
//           {drafts.map((draft) => (
//             <div 
//             key={draft.id} 
//             className="border p-4 rounded-xl bg-gray-50 shadow-sm">

//               <p><strong>Quotation #:</strong> {draft.quotationNumber || `Draft-${draft.id}`}</p>
//               <p><strong>Project:</strong> {draft.projectName}</p>
//               <p><strong>Notes:</strong> {draft.quotationNotes || "-"}</p>

//               <div className="flex gap-3 mt-3">
//                 <button
//                   onClick={() => handleRestore(draft)}
//                   disabled={locked || restoringDraftId === draft.id}
//                   className={`px-4 py-2 rounded text-white ${
//                     locked ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
//                   }`}
//                 >
//                   {restoringDraftId === draft.id
//                     ? "Restoring..."
//                     : "Restore"
//                     }
//                 </button>

//                 <button
//                   onClick={() => handleDelete(draft.id)}
//                   disabled={locked}
//                   className={`px-4 py-2 rounded text-white ${
//                     locked ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
//                   }`}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default QuotationDraftsSection;

// app/sales/s_pending_customer_request/pending_view/[id]/components/QuotationDraftsSection.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { QuotationItem } from "@/app/sales/types/quotation";

export type Draft = {
  id: string;
  requestId: number;
  quotationNumber?: string;
  projectName?: string;
  quotationNotes?: string;
  mode?: string;
  items?: QuotationItem[];
  payment?: string;
  delivery?: string;
  warranty?: string;
  validity?: string;
  vat?: number;
  markup?: number;
  status?: "draft" | "restoring" | "sent" | string;
  attachedFiles?: QuotationFile[];
  // cadSketch?: string | null;
  // cadSketchFile?: PreviewFile[];
  // files?: {
  //   id?: string;
  //   fileName: string;
  //   filePath: string;
  // }[],
};

interface QuotationFile {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt?: string;
};

type Props = {
  requestId: number;
  locked?: boolean;
  onRestore?: (draft: Draft) => void;
  restoringDraftId?: number | string | null;
  hasSentQuotation?: boolean;
};

export function QuotationDraftsSection({ 
  requestId, 
  onRestore, 
  restoringDraftId, 
  locked, 
  hasSentQuotation 
}: Props) {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch(`/api/sales/quotations?status=draft&requestId=${requestId}`);
      const data = await res.json();
      setDrafts(data.quotations || []);
    } catch (err) {
      console.error("Error loading drafts:", err);
      setDrafts([]);
    }
  }, [requestId]);

  useEffect(() => {
    if (requestId) fetchDrafts();
  }, [fetchDrafts, requestId]);

  const handleDelete = async (id: string) => {
    if (locked) {
      toast.warning("A draft is currently being restored. Please wait.");
      return;
    }
    try {
      await fetch(`/api/sales/quotations?id=${id}`, { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success("Draft deleted successfully.");
    } catch {
      toast.error("Failed to delete draft.");
    }
  };

const handleRestore = useCallback(
  async (draft: Draft) => {
    console.log("%c[handleRestoreDraft] CALLED", "color: red; font-weight: bold;", draft);

    // Prevent restoring if a quotation has already been sent
    if (hasSentQuotation) {
      toast.warning("You cannot restore drafts after a quotation has been sent.");
      return;
    }

    // Prevent restoring if another draft is being restored
    if (locked || restoringDraftId) {
      toast.warning("Another draft is already being restored.");
      return;
    }

    try {
      // Step 1: Update backend status to 'restoring' and include files
      const restorePayload = {
        requestId: draft.requestId,
        status: "restoring",
        attachedFiles: draft.attachedFiles ?? [],
        //cadSketch: (draft as string).cadSketch ?? null, // Add cadSketch if present
      };

      const res = await fetch(`/api/sales/quotations/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restorePayload),
      });

      if (!res.ok) {
        console.error("❌ Failed to mark draft as restoring:", res.status);
        toast.error("Failed to restore draft. Please try again.");
        return;
      }

      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to fetch restored draft from server.");
        return;
      }

      // Step 2: Update local state with full restored draft
      const restoredForm: Draft = {
        ...draft, // local draft info
        ...data.data, // server updated info (status = restoring + full files)
      };

      setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      onRestore?.(restoredForm);

      sessionStorage.setItem("activeRestoringDraftId", draft.id);

      // Dispatch events to lock UI and notify updates
      window.dispatchEvent(new CustomEvent("drafts-locked"));
      window.dispatchEvent(
        new CustomEvent("drafts-updated", { detail: { removedDraftId: draft.id } })
      );

      toast.success("Draft restored successfully!");
      console.log("✅ [handleRestoreDraft] Finished restoring draft:", draft.id);
    } catch (err) {
      console.error("🔥 Error restoring draft:", err);
      toast.error("Failed to restore draft. Please try again.");
    }
  },
  [locked, restoringDraftId, hasSentQuotation, onRestore]
);


  useEffect(() => {
    const handleDraftsUpdated = () => {
      console.log("[QuotationDraftsSection] Refreshing drfat lists after update...");
      fetchDrafts();
    };

    window.addEventListener("drafts-updated", handleDraftsUpdated);
    window.addEventListener("drafts-unlocked", handleDraftsUpdated);

    return () => {
      window.removeEventListener("drafts-updated", handleDraftsUpdated);
      window.removeEventListener("drafts-unlocked", handleDraftsUpdated);
    };
  }, [fetchDrafts]);

  return (
    <div className="mb-5 space-y-4">
      <h3 className="font-bold text-lg text-[#880c0c]">Quotation Drafts</h3>

      {hasSentQuotation ? (
        <p className="text-[#880c0c9b] italic">
          A quotation has already been sent to the customer. You cannot restore drafts, but you can delete them if needed.
        </p>
      ) : drafts.length === 0 ? (
        <p className="text-[#880c0c9b] italic">No drafts saved yet.</p>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => {
            const isLocked = !!locked || !!restoringDraftId || hasSentQuotation;
            const isRestoring = restoringDraftId === draft.id;

            return (
              <div
                key={draft.id}
                className="border p-4 rounded-xl bg-gray-50 shadow-sm"
              >
                <p>
                  <strong className="font-semibold text-[#880c0c]">Quotation #:</strong>{" "}
                  {draft.quotationNumber || `Draft-${draft.id}`}
                </p>
                <p>
                  <strong className="font-semibold text-[#880c0c]">Project:</strong>{" "}
                  <span className="uppercase">{draft.projectName}</span>
                </p>
                <p>
                  <strong className="font-semibold text-[#880c0c]">Notes:</strong>{" "}
                  {draft.quotationNotes || "-"}
                </p>

                <div className="flex flex-col">
                <div className="flex gap-3 mt-3">
                  {/* Restoring Button */}
                  {/* <button
                    onClick={() => handleRestore(draft)}
                    disabled={isLocked}
                    className={`px-4 py-2 rounded text-white transition-all ${
                      hasSentQuotation
                        ? "bg-gray-400 cursor-not-allowed"
                        : isRestoring
                        ? "bg-blue-400 cursor-wait"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    }`}
                  >
                    {isRestoring ? "Restoring..." : "Restore"}
                  </button> */}
                  <button
                    onClick={() => handleRestore(draft)}
                    disabled={isLocked || draft.status === "restoring"}
                    className={`px-4 py-2 rounded text-white transition-all ${
                      hasSentQuotation
                        ? "bg-gray-400 cursor-not-allowed"
                        : draft.status === "restoring"
                        ? "bg-blue-400 cursor-wait"
                        : isRestoring
                        ? "bg-blue-400 cursor-wait"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    }`}
                  >
                    {draft.status === "restoring" || isRestoring ? "Restoring..." : "Restore"}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(draft.id)}
                    // disabled={!!isLocked || !!restoringDraftId}
                    // className={`px-4 py-2 rounded text-white transition-all ${
                    //   !!locked || !!restoringDraftId
                    //     ? "bg-gray-400 cursor-not-allowed"
                    //     : "bg-red-600 hover:bg-red-700 cursor-pointer"
                    // }`}
                    disabled={!!locked || !!restoringDraftId || draft.status === "restoring"}
                    className={`px-4 py-2 rounded text-white transition-all ${
                      !!locked || !!restoringDraftId || draft.status === "restoring"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 cursor-pointer"
                    }`}
                  >
                    Delete
                  </button>
                </div>
                {hasSentQuotation ? (
                    <p className="text-sm text-gray-400 italic mt-2">
                      A quotation has already been sent to the customer. There won&apos;t be any drafts to restore.
                    </p>
                  ) : isRestoring || draft.status === "restoring"? (
                    <p className="text-sm text-gray-400 italic mt-2">
                      This draft is currently being restored. Cancel it before restoring or deleting.
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default QuotationDraftsSection;

{/* {drafts.length === 0 ? (
        <p className="text-[#880c0c9b] italic">No drafts saved yet.</p>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div 
            key={draft.id} 
            className="border p-4 rounded-xl bg-gray-50 shadow-sm">

              <p><strong className="font-semibold text-[#880c0c]">Quotation #:</strong> {draft.quotationNumber || `Draft-${draft.id}`}</p>
              <p><strong className="font-semibold text-[#880c0c]">Project:</strong> <span className="uppercase">{draft.projectName}</span></p>
              <p><strong className="font-semibold text-[#880c0c]">Notes:</strong> {draft.quotationNotes || "-"}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleRestore(draft)}
                  disabled={!!locked || !!restoringDraftId || hasSentQuotation}
                  className={`px-4 py-2 rounded text-white ${
                    !!locked || !!restoringDraftId 
                      ? "bg-gray-400" 
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {restoringDraftId === draft.id ? "Restoring...": "Restore"}
                </button>

                <button
                  onClick={() => handleDelete(draft.id)}
                  disabled={!!locked || !!restoringDraftId}
                  className={`px-4 py-2 rounded text-white ${
                    !!locked || !!restoringDraftId 
                      ? "bg-gray-400" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )} */}

