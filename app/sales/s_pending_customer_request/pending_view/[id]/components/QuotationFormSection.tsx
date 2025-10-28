// app/sales/s_pending_customer_request/pending_view/[id]/components/QuotationFormSection.tsx
"use client";

import QuotationForm from "../quotationform";
import { PreviewDocument } from "../components/quotationcomponents/PreviewDocument";
import { SavedQuotation, PreviewFile } from "@/app/sales/types/quotation";
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
  const [, setCadSketchFile] = useState<PreviewFile[]>([]);

  const [hasSentQuotation, setHasSentQuotation] = useState(false);

useEffect(() => {
  const restoringId = sessionStorage.getItem("activeRestoringDraftId");
  if (!restoringId) return;

  (async () => {
    try {
      const res = await fetch(`/api/sales/quotations/${restoringId}`);
      const data = await res.json();

      if (data?.success && data.data?.status === "restoring") {
        console.log("Restoring draft found, restoring state...");
        setQuotationForms([data.data]);
        setActiveDraftId(restoringId);
      } else {
        console.log("Restoring drfat no longer active, clearing session...");
        sessionStorage.removeItem("activeRestoringDraftId");
      }
    } catch (err) {
      console.error("Error restoring draft:", err);
      sessionStorage.removeItem("activeRestoringDraftId");
    }
  })();
}, [setQuotationForms, setActiveDraftId]);


  const fetchQuotationStatus = useCallback(async () => {
  const activeRestoringId = sessionStorage.getItem("activeRestoringDraftId");
  if (activeRestoringId) {
    console.log("[fetchQuotationStatus] Skipping fetch because restoring draft is active");
    return; // ✅ Don’t run at all if we’re restoring
  }

  console.log("%c[fetchQuotationStatus] START", "color: orange", { requestId });

  try {
    const res = await fetch(`/api/sales/quotations?requestId=${requestId}`);
    if (!res.ok) {
      console.warn(`[fetchQuotationStatus] HTTP ${res.status}`);
      return;
    }

    const data = await res.json();
    let quotations = data?.quotations ?? (Array.isArray(data) ? data : []);

    quotations = quotations.filter((q: SavedQuotation) => q.status !== "draft" && q.status !== "restoring");

    setQuotationForms(quotations);
    setHasSentQuotation(quotations.some((q: SavedQuotation) => q.status === "sent"));
  } catch (err) {
    console.error("[fetchQuotationStatus] error:", err);
    setQuotationForms([]);
    setHasSentQuotation(false);
  }

  console.log("%c[fetchQuotationStatus] END", "color: orange");
}, [requestId, setQuotationForms]);


  const isDraftActive = quotationForms.some(
    (f) => f.status === "draft" || f.status === "restoring"
  );

  //const hasSentQuotation = quotationForms.some(q => q.status === "sent");

  const handleAddNewQuotation = () => {
    if (isDraftActive) return;

    if (hasSentQuotation) {
      console.warn("Add blocked: a quotation has already been sent for this request.");
      return;
    }

    const newDraft: SavedQuotation = {
      id: String(Date.now()),
      requestId,
      quotationNotes: "",
      vat: 12,
      markup: 5,
      items: [],
      payment: "",
      delivery: "",
      warranty: "",
      validity: "",
      status: "draft",
      isNew: true,
    };

    setQuotationForms((prev) => [...prev, newDraft]);
    setActiveDraftId(newDraft.id);
  };

  

const handleRestoreDraft = useCallback(
  async (draft: Draft) => {
    console.log("🟡 [handleRestoreDraft] Starting restore for draft:", draft.id);

    if (isDraftActive) {
      console.warn("Restore blocked: another draft is already active.");
      return;
    }

    // 🔧 Normalize CAD files
    const restoredCadFiles =
      draft.cadSketchFile?.length
        ? draft.cadSketchFile
        : draft.files?.map((f) => ({
            id: f.id,
            name: f.fileName || f.filePath.split("/").pop() || "uploaded_file",
            filePath: f.filePath,
          })) ||
          (draft.cadSketch
            ? [
                {
                  id: Date.now(),
                  name: draft.cadSketch.split("/").pop() || "uploaded_file",
                  filePath: draft.cadSketch,
                },
              ]
            : []);

    // ✅ Step 1: Send update to backend (status = restoring)
    const restorePayload = {
      ...draft,
      status: "restoring",
    };
    console.log("📤 Sending restore payload:", restorePayload);

    try {
      const res = await fetch(`/api/sales/quotations/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restorePayload),
      });

      if (!res.ok) {
        console.error("❌ Failed to update draft status to restoring:", res.status);
      } else {
        const data = await res.json();
        console.log("✅ Draft updated to restoring on server:", data);
      }
    } catch (err) {
      console.error("🔥 Error sending restore request:", err);
    }

    // ✅ Step 2: Update local state to reflect restoring
    const restoredForm: SavedQuotation = {
      id: draft.id,
      requestId: draft.requestId,
      projectName: draft.projectName || projectName,
      mode: draft.mode || mode,
      quotationNotes: draft.quotationNotes || "",
      vat: draft.vat ?? 12,
      markup: draft.markup ?? 5,
      items: (draft.items || []).map((it) => ({
        ...it,
        materials:
          Array.isArray(it.materials) && it.materials.length > 0
            ? it.materials
            : [
                {
                  id: crypto.randomUUID(),
                  name: "",
                  specification: "",
                  quantity: 0,
                  error: {},
                },
              ],
      })),
      payment: draft.payment || "",
      delivery: draft.delivery || "",
      warranty: draft.warranty || "",
      validity: draft.validity || "",
      status: "restoring",
      cadSketchFile: restoredCadFiles as PreviewFile[],
    };

    setCadSketchFile(restoredCadFiles as PreviewFile[]);
    setQuotationForms([restoredForm]);
    setActiveDraftId(draft.id);
    sessionStorage.setItem("activeRestoringDraftId", draft.id);

    window.dispatchEvent(new CustomEvent("drafts-locked"));
    window.dispatchEvent(
      new CustomEvent("drafts-updated", {
        detail: { removedDraftId: draft.id },
      })
    );

    console.log("✅ [handleRestoreDraft] Finished restoring draft:", draft.id);
  },
  [isDraftActive, projectName, mode, setQuotationForms]
);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDraftSaved = (formId: string, draft: SavedQuotation) => {
   setQuotationForms((prev) => prev.filter((f) => f.id !== formId));
    setActiveDraftId(null);

    window.dispatchEvent(new CustomEvent("drafts-unlocked"));
    window.dispatchEvent(new CustomEvent("drafts-updated"));
  }

  const handleSendQuotation = async (formId: string) => {
    console.log("[handleSendQuotation] Sending quotation:", formId);

    const quotationToSend = quotationForms.find((f) => f.id === formId);
    if (!quotationToSend) {
      console.error("Quotation not found for formId:", formId);
      return;
    }

    try {
      const res = await fetch(`/api/sales/quotations/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...quotationToSend, status: "sent" }),
      });

      if (!res.ok) {
        console.error("Failed to update quotation to 'sent' on server:", res.status);
        return;
      }

      const data = await res.json();
      console.log("Server updated to 'sent':", data);

      setQuotationForms((prev) => 
      prev.map((f) => (f.id === formId ? { ...f, status: "sent" } : f)));

      setHasSentQuotation(true);
      setActiveDraftId(null);

      await fetchQuotationStatus();

      window.dispatchEvent(new CustomEvent("drafts-locked"));
      window.dispatchEvent(new CustomEvent("drafts-updated"));
      window.dispatchEvent(new CustomEvent("quotation-sent"));

      console.log("Quotation sent successfully - all drafts locked.");
    } catch (err) {
      console.error("Error while sending quotation:", err);
    }
  };

  useEffect(() => {
  if (activeDraftId) {
    sessionStorage.setItem("activeRestoringDraftId", activeDraftId);
  }
}, [activeDraftId]);

  useEffect(() => {
    const hasRestoring = quotationForms.some(q => q.status === "restoring");
    const hasSent = quotationForms.some(q => q.status === "sent");
    const hasDraft = quotationForms.some(q => q.status === "draft");

    if (!hasRestoring && (hasSent || hasDraft)) {
      console.log("[Cleanup] Removing restoring draft from session after send.");
      sessionStorage.removeItem("activeRestoringDraftId");
      setActiveDraftId(null);
    }
  }, [quotationForms, setActiveDraftId]);

  useEffect(() => {
  const sentExists = quotationForms.some((q) => q.status === "sent");
  setHasSentQuotation(sentExists);
}, [quotationForms]);

  useEffect(() => {
    const handleLockAfterSend = () => {
      console.log("%[EVENT] quotation-sent caught in QuotationFormSection - resetting form state & showing preview only", "color: limegreen; font-weight: bold;");

      setActiveDraftId(null);
      setCadSketchFile([]);

      setQuotationForms((prev) =>
        prev.map((f) => ({ ...f, status: "sent" })));

      window.dispatchEvent(new CustomEvent("drafts-locked"));
    };

    //console.log("%[EVENT] quotation-sent dispatched", "color: cyan; font-weight: bold;");
    window.addEventListener("quotation-sent", handleLockAfterSend);
    return () => window.removeEventListener("quotation-sent", handleLockAfterSend);
  }, [setQuotationForms]);

  // ✅ Clean useEffect — dependency properly added 
  useEffect(() => { 
  const handleExternalRestore = (e: CustomEvent<{ draft: Draft }>) => { 
  console.log("⚠️ restore-draft EVENT FIRED", e.detail); // handleRestoreDraft(e.detail.draft); 
  } 
  window.addEventListener("restore-draft", handleExternalRestore as EventListener); 
  return () => window.removeEventListener("restore-draft", handleExternalRestore as EventListener); 
  }, [handleRestoreDraft]);

  useEffect(() => {
    console.log("Active Draft ID changed:", activeDraftId);
  }, [activeDraftId]);

useEffect(() => {
  const restoringId = sessionStorage.getItem("activeRestoringDraftId");
  if (restoringId) {
    console.log("[QuotationFormSection] Skipping fetchQuotationStatus — restoring draft detected");
    return; // 🛑 Don't refetch if a restoring draft is active
  }

  if (quotationForms.length === 0) {
    fetchQuotationStatus();
  }
}, [fetchQuotationStatus, quotationForms.length]);


  useEffect(() => {
    const handleQuotationSent = () => fetchQuotationStatus();
    window.addEventListener("quotation-sent", handleQuotationSent);
    return () => window.removeEventListener("quotation-sent", handleQuotationSent);
  }, [fetchQuotationStatus]);

  useEffect(() => {
  console.group("%c[quotationForms changed]", "color: yellow");
  console.log("New quotationForms state:", quotationForms);
  console.log("Active draft ID:", activeDraftId);
  console.groupEnd();
}, [quotationForms, activeDraftId]);

useEffect(() => {
  const restoringId = sessionStorage.getItem("activeRestoringDraftId");
  if (restoringId && quotationForms.length === 0) {
    console.log("[Rehydrate] Restoring draft after tab switch...");
    fetch(`/api/sales/quotations/${restoringId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.data?.status === "restoring") {
          setQuotationForms([data.data]);
          setActiveDraftId(restoringId);
        }
      })
      .catch(err => console.error("Error rehydrating restoring draft:", err));
  }
}, [quotationForms.length, setQuotationForms, setActiveDraftId,])

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-[#880c0c]">Quotation Form</h3>

        {status === "Accepted" && (
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleAddNewQuotation}
            disabled={isDraftActive || hasSentQuotation}
            className={`px-6 py-2 rounded-full font-medium shadow transition-all ${
              isDraftActive || hasSentQuotation
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-white text-[#880c0c] hover:bg-[#cf3a3a] hover:text-white cursor-pointer"
            }`}
          >
            + Add Quotation
          </button>

          {/* 🟢 This part ensures message is always visible */}
          {hasSentQuotation ? (
            <p className="text-sm text-[#880c0c] italic text-right">
              A quotation has already been sent to the customer. You cannot add another.
            </p>
          ) : isDraftActive ? (
            <p className="text-sm text-[#880c0c] italic text-right">
              You already have an active draft. Complete or cancel it before adding a new quotation.
            </p>
          ): null}
        </div>
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
                className="relative bg-[#ffb7b75f] rounded-xl p-4 shadow-lg"
              >
                {form.isNew && (
  <button
    className="absolute top-2 right-2 text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
    onClick={() => {
      // remove locally
      setQuotationForms((prev) =>
        prev.filter((f) => f.id !== form.id)
      );
      setActiveDraftId(null);

      // dispatch events to unlock Add button
      window.dispatchEvent(new Event("drafts-unlocked"));
      window.dispatchEvent(new Event("drafts-updated"));
    }}
  >
    Cancel
  </button>
)}

                {quotationForms.some((q) => q.status === "sent") && (
                  <div className="w-full bg-green-50 border border-green-400 text-green-800 px-4 py-2 rounded-md mb-4 flex items-center justify-between">
                    <span className="font-medium">
                      ✅ Quotation has been sent to the customer.
                    </span>
                    {/* <span className="text-sm italic text-green-700">
                      You can still delete drafts later if needed.
                    </span> */}
                  </div>
                )}

                {isEditable ? (
                  <QuotationForm
                    key={form.id}
                    requestId={requestId}
                    projectName={form.projectName || projectName}
                    mode={form.mode || mode}
                    initialId={form.id}
                    initialNotes={form.quotationNotes}
                    initialItems={form.items}
                    initialVat={form.vat || 12}
                    initialMarkup={form.markup || 5}
                    initialPayment={form.payment}
                    initialDelivery={form.delivery}
                    initialWarranty={form.warranty}
                    initialValidity={form.validity}
                    initialCadSketch={form.cadSketchFile}
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
                    markup={form.markup ?? 5}
                    items={form.items ?? []}
                    payment={form.payment ?? ""}
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
                    quotation={{ createdAt: form.createdAt ?? ""}}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[#880c0c9b] italic">
          {status !== "Accepted"
            ? "Quotation can only be added once the request has been accepted."
            : hasSentQuotation
            ? "A quotation has already been sent to the customer. To create another, wait for a revision request."
            : isDraftActive
            ? "You already have an active draft. Complete or cancel it before adding a new quotation."
            : "Click '+ Add Quotation' to start adding quotations."
          }
        </p>
      )}
    </>
  );
}

export default QuotationFormSection;
