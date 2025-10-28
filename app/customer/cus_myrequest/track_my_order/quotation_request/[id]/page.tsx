// // app/customer/cus_myrequest/track_my_order/quotation_request/[id]/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import PreviewDocumentCustomer from "@/app/customer/cus_myrequest/track_my_order/quotation_request/components/PreviewDocumentCustomer";
// import { QuotationItem, PreviewFile, Customer } from "@/app/sales/types/quotation";
// import { CustomerHeader } from "@/components/header-customer";

// type CustomerQuotation = {
//   items?: QuotationItem[];
//   payment: string;
//   warranty: string;
//   validity: string;
//   delivery: string;
//   quotationNotes: string;
//   requestId?: number;
//   projectName?: string;
//   vat: number;
//   markup: number;
//   cadSketchFile?: PreviewFile[];
//   revisionLabel: string;
//   baseQuotationId?: number;
//   customer? : Customer | null;
//   quotationNumber: string;
// };

// export default function CustomerQuotationPage() {
//   const router = useRouter();
//   const { id } = useParams();
//   const [quotation, setQuotation] = useState<CustomerQuotation | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchQuotation = async () => {
//       try {
//         const res = await fetch(`/api/customer/q_request/${id}`);
//         if (!res.ok) throw new Error("Failed to fetch quotation");
//         const data = await res.json();
//         if (!data.quotation) {
//           setQuotation(null);
//           return;
//         }
//         setQuotation({
//           ...data.quotation,
//           customer: data.customer,
//           cadSketchFile: data.files,
//         });
//         console.log("Fetched quotation:", data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuotation();
//   }, [id]);

//   const handleCustomerAction = async (status: "accepted" | "rejected" | "revision_requested") => {
//     try {
//       const res = await fetch(`/api/customer/q_request/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status }),
//       });

//       if (!res.ok) throw new Error("Failed to update status");
//       alert(`Quotation ${status.replace("_", " ")} successfully!`);
//       router.back();
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong while updating quotation status.");
//     }
//   };

//   if (loading) return <div className="text-center mt-10 text-gray-500">Loading quotation...</div>;
//   if (!quotation) return <div className="text-center mt-10 text-red-500">Quotation not found.</div>;

//   return (
//     <main className="bg-[#ffedce]">
//     <CustomerHeader />
//     <PreviewDocumentCustomer
//       {...quotation}
//       onBack={() => router.back()}
//       onCustomerAction={handleCustomerAction}
//     />
//     </main>
//   );
// }

// app/customer/cus_myrequest/track_my_order/quotation_request/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import PreviewDocumentCustomer from "@/app/customer/cus_myrequest/track_my_order/quotation_request/components/PreviewDocumentCustomer";
import { QuotationItem, PreviewFile, Customer } from "@/app/sales/types/quotation";
import { CustomerHeader } from "@/components/header-customer";
import { toast } from "sonner";

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
  createdAt: string;
  quotationNumber: string;
  status: string;
  customerActionAt?: string;
};

export default function CustomerQuotationPage() {
  const router = useRouter();
  const { id } = useParams();
  const [quotation, setQuotation] = useState<CustomerQuotation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuotation = useCallback(async () => {
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
          cadSketchFile: data.quotation.cadSketch || [],
          status: data.quotation.status || data.status,
          customerActionAt: data.quotation.customerActionAt || null,
        });
        console.log("CAD Sketch Files:", data.quotation.cadSketch);
        console.log("Fetched quotation:", data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quotation.")
      } finally {
        setLoading(false);
      }
    }, [id])

  useEffect(() => {
    fetchQuotation(); 
  }, [fetchQuotation]);

  const handleCustomerAction = async (status: "approved" | "rejected" | "revision_requested"): Promise<{ success: boolean; message?: string, timestamp: string }> => {
    try {
      const res = await fetch(`/api/customer/q_request/${id}`, {
        method: "PUT",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Failed to update status: ${errText || res.status}`);
      }
      const data = await res.json();
      setQuotation((prev) =>
      prev ? { ...prev, status: status } : prev );
      toast.success(data?.message || `Quotation ${status} successfully!`);

      return {
        success: true,
        message: data?.message,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error(err);
      toast.error("Something went wront while updating quotation status.");
      return {
        success: false,
        message: "Error updating quotation.",
        timestamp: new Date().toISOString(),
      };
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading quotation...</div>;
  if (!quotation) return <div className="text-center mt-10 text-red-500">Quotation not found.</div>;

  return (
    <main className="bg-[#ffedce]">
    <CustomerHeader />
    <PreviewDocumentCustomer
      {...quotation}
      status={quotation.status}
      customerActionAt={quotation.customerActionAt}
      onBack={() => router.back()}
      onCustomerAction={handleCustomerAction}
    />
    </main>
  );
}
