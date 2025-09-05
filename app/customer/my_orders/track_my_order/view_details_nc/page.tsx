"use client";

import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TrackOrderDetailsNCPage = () => {
 // const [activeTab, setActiveTab] = useState("Requests");

  const requestData = [
    { id: "001", date: "04/10/2025", type: "Consumables", status: "Completed" },
  ];

  const quotationData = [
    { id: "QT001", date: "04/12/2025", request: "001", type: "Consumables", status: "Pending" },

  ];

  const poData = [
    { id: "PO001", date: "04/19/2025", supplier: "XYZ Traders", type: "Consumables", status: "Processing" },
  ];

  const router = useRouter();

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return "bg-[#777777]";
      case "pending":
        return "bg-[#173f63]";
      case "completed":
        return "bg-green-600";
      case "in progress":
        return "bg-[#ffc922]";
      case "accepted":
        return "bg-green-600";
      case "delivered":
        return "bg-green-600";
      case "processing":
        return "bg-[#173f63]";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <CustomerClientComponent>
      <div className="h-full w-full bg-[#fed795] pb-10">
        <CustomerHeader />
  
        {/* Table Wrapper */}
        <div className="mt-6 px-5 space-y-12">
  {/* Requests Section */}
  <div className="w-full max-w-[90rem]">
    <div className="bg-[#173f63] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md">
      Request
    </div>
    <div className="bg-white shadow-md rounded-b overflow-hidden">
      <div className="bg-[#ffffff] flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
        <div className="basis-1/6">Request ID</div>
        <div className="basis-1/5">Date Created</div>
        <div className="basis-1/4">Type of Request</div>
        <div className="basis-1/5">Status</div>
        <div className="basis-1/5">Actions</div>
      </div>
      {requestData.map((req, index) => (
        <div
          key={req.id}
          className={`flex items-center text-[#5a4632] py-3 px-6 ${
            index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
          }`}
        >
          <div className="basis-1/6">{req.id}</div>
          <div className="basis-1/5">{req.date}</div>
          <div className="basis-1/4">{req.type}</div>
          <div className="basis-1/5">
            <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(req.status)}`}>
              {req.status}
            </span>
          </div>
          <div className="basis-1/5">
            <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
              <Link
                href={
                  req.type === "Consumables"
                    ? `/customer/my_orders/track_my_order/view_details/request`
                    : `/customer/my_orders/order_history/requests/nonconsumables/`
                }
              >
                <div className="text-sm font-semibold">View Details</div>
              </Link>
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Quotation Section */}
  <div className="w-full max-w-[90rem]">
    <div className="bg-[#173f63] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md">
      Quotation
    </div>
    <div className="bg-white shadow-md rounded-b overflow-hidden">
      <div className="bg-[#ffffff] flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
        <div className="basis-1/6">Quotation No.</div>
        <div className="basis-1/5">Date|Time Created</div>
        <div className="basis-1/5">Date|Time Received</div>
        <div className="basis-1/5">Type</div>
        <div className="basis-1/5">Linked Request</div>
        <div className="basis-1/6">Status</div>
        <div className="basis-1/6">Action</div>
      </div>
      {quotationData.map((q, index) => (
        <div
          key={q.id}
          className={`flex items-center text-[#5a4632] py-3 px-6 ${
            index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
          }`}
        >
          <div className="basis-1/6">{q.id}</div>
          <div className="basis-1/5">{q.date}</div>
          <div className="basis-1/5">04/13/2025 2:10 PM</div>
          <div className="basis-1/5">{q.type}</div>
          <div className="basis-1/5">{q.request}</div>
          <div className="basis-1/6">
            <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(q.status)}`}>
              {q.status}
            </span>
          </div>
          <div className="basis-1/6">
            <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
              <Link
                href={
                  q.type === "Consumables"
                    ? `/customer/my_orders/track_my_order/view_details/quotation/`
                    : `/customer/my_orders/order_history/quotation/nonconsumables/`
                }
              >
                <div className="text-sm font-semibold">View Details</div>
              </Link>
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Purchase Order Section */}
  <div className="w-full max-w-[90rem]">
  <div className="bg-[#173f63] text-white px-4 py-2 text-sm font-semibold tracking-widest uppercase rounded-t-md flex items-center justify-between">
  <div>Purchase Order</div>
  <button className="px-4 py-1 border border-[#d2bda7] bg-white rounded-3xl shadow hover:bg-[#ffe9b6] transition-all">
    <Link href="/customer/my_orders/track_my_order/view_details/po">
      <div className="text-sm font-semibold text-[#5a4632]">Upload PO</div>
    </Link>
  </button>
</div> 
    <div className="bg-white shadow-md rounded-b overflow-hidden">
      <div className="bg-[#ffffff] flex text-[#5a4632] font-semibold text-lg py-3 px-6 border-[2px]">
        <div className="basis-1/6">P.O. No.</div>
        <div className="basis-1/5">Date|Time Created</div>
        <div className="basis-1/5">Date|Time Received</div>
        <div className="basis-1/5">Type</div>
        <div className="basis-1/5">Linked Quotation</div>
        <div className="basis-1/6">Status</div>
        <div className="basis-1/6">Action</div>
      </div>
      {poData.map((po, index) => (
        <div
          key={po.id}
          className={`flex items-center text-[#5a4632] py-3 px-6 ${
            index % 2 === 0 ? "bg-[#fef4e4]" : "bg-white"
          }`}
        >
          <div className="basis-1/6">{po.id}</div>
          <div className="basis-1/5">{po.date}</div>
          <div className="basis-1/5">04/14/2025 3:45 PM</div>
          <div className="basis-1/5">{po.type}</div>
          <div className="basis-1/5">QT001</div>
          <div className="basis-1/6">
            <span className={`px-4 py-1 rounded-3xl text-white ${getStatusClass(po.status)}`}>
              {po.status}
            </span>
          </div>
          <div className="basis-1/6">
            <a
              href={
                po.type === "Consumables"
                  ? `/customer_c_po.pdf`
                  : `/customer_nc_po.pdf`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <Image
                src="/file-pdf-svgrepo-com.svg"
                width={24}
                height={24}
                alt="View PO"
                className="cursor-pointer"
              />
            </a>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
<div className="px-5 pt-4">
  <button
    onClick={() => router.push("/customer/my_orders/track_my_order")}
    className="text-sm px-4 py-2 bg-white border border-[#d2bda7] text-[#5a4632] rounded-3xl shadow hover:bg-[#ffe9b6] transition-all"
  >
    ← Back to Track My Order
  </button>
</div>
</div>
    </CustomerClientComponent>
  );
  
};

export default TrackOrderDetailsNCPage;
