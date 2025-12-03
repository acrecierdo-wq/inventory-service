// components/PhysicalInventoryReport.tsx
import React, { forwardRef } from "react";

type Item = {
  id: string;
  name: string;
  category: string;
  variant?: string;
  size?: string;
  unit: string;
  physicalQty: number;
};

type Session = {
  id: string;
  createdAt: string;
  createdBy: string;
  status: string;
  remarks?: string;
  items: Item[];
};

type Props = {
  sessions: Session[];
};

const PhysicalInventoryReport = forwardRef<HTMLDivElement, Props>(
  ({ sessions }, ref) => {
    return (
      <div ref={ref} className="p-6 bg-white text-gray-900 w-full">
        <h2 className="text-2xl font-bold mb-4">PHYSICAL INVENTORY REPORT</h2>

        {sessions.map((session) => (
          <div key={session.id} className="mb-8 border-b border-gray-300 pb-4">
            {/* Session Header */}
            <div className="mb-4">
              <p><strong>Session ID:</strong> {session.id}</p>
              <p><strong>Warehouseman:</strong> {session.createdBy}</p>
              <p><strong>Status:</strong> {session.status}</p>
              <p><strong>Date Created:</strong> {new Date(session.createdAt).toLocaleString()}</p>
              {session.remarks && <p><strong>Remarks:</strong> {session.remarks}</p>}
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">Item Name</th>
                    <th className="border px-3 py-2 text-left">Category</th>
                    <th className="border px-3 py-2 text-left">Variant</th>
                    <th className="border px-3 py-2 text-left">Size</th>
                    <th className="border px-3 py-2 text-left">Unit</th>
                    <th className="border px-3 py-2 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {session.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{item.name}</td>
                      <td className="border px-3 py-2">{item.category}</td>
                      <td className="border px-3 py-2">{item.variant || "-"}</td>
                      <td className="border px-3 py-2">{item.size || "-"}</td>
                      <td className="border px-3 py-2">{item.unit}</td>
                      <td className="border px-3 py-2 text-right">{item.physicalQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Session Totals */}
            <div className="mt-2">
              <p><strong>Total Items:</strong> {session.items.length}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

PhysicalInventoryReport.displayName = "PhysicalInventoryReport";
export default PhysicalInventoryReport;
