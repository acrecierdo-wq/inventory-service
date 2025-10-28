// app/sales/s_customer_profile/s_customers/s_view_details/[customerId]/request_details/[requestId]/view_quotation/[quotationId]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import PreviewDocumentViewOnly from "./components/PreviewDocumentViewOnly";

interface MaterialRow {
  id: string;
  name: string;
  specification: string;
  quantity: number;
};

interface QuotationItem {
  itemName: string;
  scopeOfWork: string;
  materials: MaterialRow[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

interface PreviewFile {
  id: string | number;
  name: string;
  filePath: string;
  url?: string;
};

interface QuotationData {
    id: string;
    quotationNumber: string;
    revisionLabel: string;
    requestId: number;
    createdAt: string;
    status: string;
    items?: QuotationItem[];
    payment?: string;
    delivery?: string;
    validity?: string;
    warranty?: string;
    quotationNotes?: string;
    customer?: {
        id?: string;
        companyName?: string;
        contactPerson?: string;
        email?: string;
        address?: string;
        phone?: string;
    };
    vat?: number;
    markup?: number;
    projectName?: string;
    cadSketchFile?: PreviewFile[];
}

export default function ViewQuotationPage() {
    const { quotationId } = useParams();
    const [quotation, setQuotation] = useState<QuotationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuotation = async () => {
            try {
                const res = await fetch(`/api/sales/quotations/${quotationId}`);
                const data = await res.json();

                if (data.success) {
                    setQuotation(data.data);
                } else {
                    setError("Quotation not found.");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load quotation.");
            } finally {
                setLoading(false)
            }
        };

        if (quotationId) fetchQuotation();
    }, [quotationId]);

    if (loading)

        return (
    <div className="h-full w-full bg-[#ffedce]">
        <Header />
        <div className="text-gray-500 text-center py-10 italic flex justify-center items-center">
            Loading quotation...
    </div>
        </div>
);

if (error)
    return (
    <div className="h-full w-full bg-[#ffedce] text-red-500 text-center py-10 font-semibold italic">{error}</div>
);

if (!quotation)
    return (
        <div className="h-full w-full bg-[#ffedce] text-center py-10 text-gray-500 italic">
             <Header />
                No quotation found.
        </div>
    );

    return (
        <main className="bg-[#ffedce] h-full">
            <Header />
        {/* <div className="p-6">
            <div className=" mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="font-bold text-[#173f63] mb-6 border-b">
                    Quotation Preview
                </h1> */}
                {/* Temporary */}
                {/* <div className="text-gray-700">
                    <p>
                        <strong>Quotation #:</strong> {quotation.quotationNumber}
                    </p>
                    <p>
                        <strong>Linked Request:</strong> {quotation.requestId}
                    </p>
                    <p>
                        <strong>Revision Number:</strong> {quotation.revisionLabel}
                    </p>
                    <p>
                        <strong>Status:</strong> <span className="uppercase">{quotation.status}</span>
                    </p><p>
                        <strong>Created at:</strong> {quotation.createdAt}
                    </p>
                </div> */}

                {/* <div className="mt-8 text-sm text-gray-600 italic text-center">
                    (Quotation document preview will be shown here soon)
                </div> */}
            {/* </div> */}
        {/* </div> */}
        <div className="p-6">
            {quotation ? (
                <PreviewDocumentViewOnly
                    quotation={quotation}
                />

            ): (
                <p className="text-gray-500 italic text-center">No quotation data.</p>
            )}
        </div>
        </main>
    );
}