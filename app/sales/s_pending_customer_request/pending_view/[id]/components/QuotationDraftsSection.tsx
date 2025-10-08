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

"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export type Draft = {
  id: string;
  quotationNumber?: string;
  projectName?: string;
  quotationNotes?: string;
  mode?: string;
  items?: [];
  delivery?: string;
  warranty?: string;
  validity?: string;
  vat?: number;
  markup?: number;
  status: "draft";
  requestId: number;
};

type Props = {
  requestId: number;
  locked?: boolean;
  onRestore?: (draft: Draft) => void;
  restoringDraftId?: number | string | null;
};

export function QuotationDraftsSection({ requestId, onRestore, restoringDraftId, locked }: Props) {
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

    // const handleUpdated = (event: CustomEvent) => {
    //   if (event.detail?.removedDraftId) {
    //     setDrafts((prev) => prev.filter((d) => d.id !== event.detail.removedDraftId));
    //   } else {
    //     fetchDrafts();
    //   }
    // };

    // const handleLocked = () => setLocked(true);
    // const handleUnlocked = () => {
    //   setLocked(false);
    //   setRestoringDraftId(null);
    //   fetchDrafts();
    // };

    // window.addEventListener("drafts-updated", handleUpdated as EventListener);
    // window.addEventListener("drafts-locked", handleLocked);
    // window.addEventListener("drafts-unlocked", handleUnlocked);

    // return () => {
    //   window.removeEventListener("drafts-updated", handleUpdated as EventListener);
    //   window.removeEventListener("drafts-locked", handleLocked);
    //   window.removeEventListener("drafts-unlocked", handleUnlocked);
    // };
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

  const handleRestore = async (draft: Draft) => {
    if (locked || restoringDraftId) {
      toast.warning("Another draft is already being restored.");
      return;
    }

    // setRestoringDraftId(draft.id);
    // setLocked(true);

    try {
      // mark draft as restoring in backend so it doesn't show up in fetch drafts
      await fetch(`/api/sales/quotations/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "restoring"}),
      });

      onRestore?.(draft);

      setDrafts((prev) => prev.filter((d) => d.id !== draft.id));

      //window.dispatchEvent(new CustomEvent("drafts-locked"));
      window.dispatchEvent(new CustomEvent("drafts-updated", { detail: { removedDraftId: draft.id }, }));

      toast.success("Draft restored successfully!");
    } catch (err) {
      console.error("Failed to restore draft:", err);
      toast.error("Failed to restore draft. Please try again.");
      // setLocked(false);
      // setRestoringDraftId(null);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-bold text-2xl text-[#5a2347] mb-6">Quotation Drafts</h3>

      {drafts.length === 0 ? (
        <p className="text-gray-500 italic">No drafts saved yet.</p>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div 
            key={draft.id} 
            className="border p-4 rounded-xl bg-gray-50 shadow-sm">

              <p><strong>Quotation #:</strong> {draft.quotationNumber || `Draft-${draft.id}`}</p>
              <p><strong>Project:</strong> {draft.projectName}</p>
              <p><strong>Notes:</strong> {draft.quotationNotes || "-"}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleRestore(draft)}
                  disabled={!!locked || !!restoringDraftId}
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
      )}
    </div>
  );
}

export default QuotationDraftsSection;

