// app/warehouse/issuance_log/summary_table.tsx

interface SummaryProps {
    data: {
        clientName: string;
        dispatcherName: string;
        issuedAt: string;
        drNumber: string;
        status: string;
        items: {
            itemName: string;
            size?: string;
            variant?: string;
            unit?: string;
            quantity: number;
        }[];
    };

    onCancel: () => void;
    onSave: () => void;
}

export default function SummaryTable({ data, onCancel, onSave }: SummaryProps) {
    return (
        <div className="p-6 bg-white rounded shadow-md max-w-4xl mx-auto mt-5">
            <h2 className="etxt-xl font-bold mb-4 text-[#173f63]">Issuance Summary</h2>

            <div className="mb-4">
                <p><strong>Client:</strong> {data.clientName}</p>
                <p><strong>Dispatcher:</strong> {data.dispatcherName}</p>
                <p><strong>Date Issued:</strong> {new Date(data.issuedAt).toLocaleString()}</p>
                <p><strong>DR No.:</strong> {data.drNumber || "Draft"}</p>
                <p><strong>Status:</strong> {data.status}</p>

                {/* Table */}
                <table className="w-full border text-sm">
                    <thead>
                        <tr className="bg-[#ffedce]">
                            <th className="border px-2 py-1">Item</th>
                            <th className="border px-2 py-1">Size</th>
                            <th className="border px-2 py-1">Variant</th>
                            <th className="border px-2 py-1">Unit</th>
                            <th className="border px-2 py-1">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((items, idx) => (
                            <tr key={idx}>
                                <td className="border px-2 py-1">{items.itemName}</td>
                                <td className="broder px-2 py-1">{items.size || "-"}</td>
                                <td className="border px-2 py-1">{items.variant || "-"}</td>
                                <td className="broder px-2 py-1">{items.unit || "-"}</td>
                                <td className="border px-2 py-1">{items.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mt-4 gap-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                    <button onClick={onSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                </div>
            </div>
        </div>
    )
}