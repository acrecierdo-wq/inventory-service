// app/warehouse/issuance_log/continue/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LogNewIssuanceForm from "@/components/add/LogNewIssuanceForm";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";

export default function ContinueIssuancePage() {
  const { id } = useParams(); // draft ID
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [draftData, setDraftData] = useState<any>(null);

  // Fetch draft data
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch(`/api/issuances/${id}`); // corrected endpoint
        if (!res.ok) throw new Error("Failed to fetch draft");
        const data = await res.json();
        setDraftData(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load draft issuance.");
        router.push("/warehouse/issuance_log"); // fallback redirect
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDraft();
  }, [id, router]);

  if (loading) {
    return (
      <main className="bg-[#ffedce] w-full min-h-screen">
        <Header />
        <section className="p-10 max-w-4xl mx-auto">
          {/* Page Title */}
          <Skeleton className="h-10 w-64 mb-6 rounded-md bg-[#e2d4c0]" />

          {/* Form Card */}
          <div className="grid grid-cols-1 gap-4 bg-white p-6 rounded shadow">
            {/* Fake inputs */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded bg-[#e2d4c0]" />
              <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded bg-[#e2d4c0]" />
              <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-48 rounded bg-[#e2d4c0]" />
              <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded bg-[#e2d4c0]" />
              <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
            </div>

            {/* Items Section */}
            <div className="border-t pt-4 mt-4 space-y-4">
              <Skeleton className="h-6 w-40 mx-auto rounded bg-[#e2d4c0]" />
              <div className="grid grid-cols-5 gap-2">
                <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
                <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
                <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
                <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
                <Skeleton className="h-10 w-full rounded bg-[#f0e6dc]" />
              </div>
              <Skeleton className="h-10 w-28 rounded mx-auto bg-[#e2d4c0]" />
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <Skeleton className="h-10 w-24 rounded bg-gray-300" />
              <Skeleton className="h-10 w-24 rounded bg-blue-300" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!draftData) {
    return <div className="p-6 text-center text-red-600">Draft not found.</div>;
  }

  return (
    <div>

      {/* LogNewIssuanceForm now pre-filled with draft data */}
      <LogNewIssuanceForm
        draftData={draftData}
        draftId={String(id)}
        onSaveSuccess={() => {
          toast.success("Draft updated successfully!");
          router.push("/warehouse/issuance_log");
        }}
      />
    </div>
  );
}

// Latest version - Sept.2
