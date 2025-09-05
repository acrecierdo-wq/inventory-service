// app/warehouse/issuance_log/dr_modal.tsx

import { useState } from "react";

export default function DRModal({ onClose, onConfirm }: any) {
    const [drNumber, setDrNumber] = useState("");
    const [saveAsDraft, setSaveAsDraft] = useState(false);

    const canConfirm = drNumber.trim() !== "" || saveAsDraft;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white p-6 rounded shadow-md w-[400px]">
                <h2 className="text-lg font-bold mb-3">Finalize Issuance</h2>
                <input 
                    type="text"
                    placeholder="Enter DR Number"
                    className="w-full border p-2 rounded mb-2 hover:bg-gray-100"
                    value={drNumber}
                    onChange={(e) => setDrNumber(e.target.value)}
                    disabled={saveAsDraft}
                />
                <label className="flex items-center space-x-2 mb-4">
                    <input 
                        type="checkbox"
                        checked={saveAsDraft}
                        onChange={() => {
                            setSaveAsDraft(!saveAsDraft);
                            if (!saveAsDraft) setDrNumber("");
                        }}
                    />
                    <span>Save as Draft</span>
                </label>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="text-gray-600 cursor-pointer">Cancel</button>
                    <button
                        onClick={() => onConfirm({ drNumber, saveAsDraft })}
                        className={`px-4 py-2 rounded ${
                         canConfirm ? "bg-blue-600 text-white cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!canConfirm}
                         >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}