// app/customer/cus_myrequest/track_my_order/quotation_request/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PreviewDocumentCustomer from "@/app/customer/cus_myrequest/track_my_order/quotation_request/components/PreviewDocumentCustomer";
import { QuotationItem, PreviewFile, Customer } from "@/app/sales/types/quotation";
import { CustomerHeader } from "@/components/header-customer";

type CustomerQuotation = {
  items?: QuotationItem[];
  payment: string;
  warranty: string;
  validity: string;
  delivery: string;
  quotationNotes: string;
  requestId?: number;
  projectName?: string;
  vat: number;
  markup: number;
  cadSketchFile?: PreviewFile[];
  revisionLabel: string;
  baseQuotationId?: number;
  customer? : Customer | null;
  quotationNumber: string;
};

export default function CustomerQuotationPage() {
  const router = useRouter();
  const { id } = useParams();
  const [quotation, setQuotation] = useState<CustomerQuotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await fetch(`/api/customer/q_request/${id}`);
        if (!res.ok) throw new Error("Failed to fetch quotation");
        const data = await res.json();
        if (!data.quotation) {
          setQuotation(null);
          return;
        }
        setQuotation({
          ...data.quotation,
          customer: data.customer,
          cadSketchFile: data.files,
        });
        console.log("Fetched quotation:", data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  const handleCustomerAction = async (status: "accepted" | "rejected" | "revision_requested") => {
    try {
      const res = await fetch(`/api/customer/q_request/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      alert(`Quotation ${status.replace("_", " ")} successfully!`);
      router.back();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating quotation status.");
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading quotation...</div>;
  if (!quotation) return <div className="text-center mt-10 text-red-500">Quotation not found.</div>;

  return (
    <main className="bg-[#ffedce]">
    <CustomerHeader />
    <PreviewDocumentCustomer
      {...quotation}
      onBack={() => router.back()}
      onCustomerAction={handleCustomerAction}
    />
    </main>
  );
}
