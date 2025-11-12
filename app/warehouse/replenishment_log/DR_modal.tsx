// app/warehouse/replenishment_log/DR_modal.tsx

import { useState } from "react";

export type DRConfirmData = {
    drRefNum: string;
    isDraft: boolean;
};

type DRModalProps = {
    onClose: () => void;
    onConfirm: (data: DRConfirmData) => void;
};

export default function DelRefModal({ onClose, onConfirm }: DRModalProps) {
    const [drRefNum, setDrRefNum] = useState("");
    const [isDraft, ] = useState(false);

    const canConfirm = drRefNum.trim() !== "" || isDraft;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white p-6 rounded shadow-md w-[400px]">
                <h2 className="text-lg font-bold mb-3">Finalize Replenishment</h2>
                <input 
                    type="text"
                    placeholder="Enter DR Number"
                    className="w-full border p-2 rounded mb-2 hover:bg-gray-100"
                    value={drRefNum}
                    onChange={(e) => setDrRefNum(e.target.value)}
                    disabled={isDraft}
                />
                {/* <label className="flex items-center space-x-2 mb-4">
                    <input 
                        type="checkbox"
                        checked={isDraft}
                        onChange={() => {
                            setIsDraft(!isDraft);
                            if (!isDraft) setDrRefNum("");
                        }}
                    />
                    <span>Save as Draft</span>
                </label> */}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-600 cursor-pointer hover:bg-gray-400">Cancel</button>
                    <button
                        onClick={() => onConfirm({ drRefNum, isDraft })}
                        className={`px-4 py-2 rounded ${
                         canConfirm ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
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