// components/add/ImportInventoryModal.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";

interface ImportInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItems: {
    name: string;
    categoryName: string;
    unitName: string;
  }[];
  onImportSuccess: () => void;
}

// Define the type for CSV row
interface CSVRow {
  "Item name": string;
  Category: string;
  Size?: string;
  Variant?: string;
  Unit: string;
  Stock?: string;
  Status?: string;
}

const ImportInventoryModal = ({
  isOpen,
  onClose,
  existingItems,
  onImportSuccess,
}: ImportInventoryModalProps) => {
  const [importing, setImporting] = useState(false);

  const handleImport = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const importedItems = results.data;

        // Map CSV rows to inventory item structure
        const itemsToImport = importedItems.map((row) => ({
          name: row["Item name"]?.trim(),
          categoryName: row.Category?.trim(),
          sizeName: row.Size?.trim() || null,
          variantName: row.Variant?.trim() || null,
          unitName: row.Unit?.trim(),
          stock: Number(row.Stock || 0),
          status: row.Status?.trim() || "In Stock",
        }));

        // Filter out duplicates
        const filteredItems = itemsToImport.filter(
          (item) =>
            item.name &&
            item.categoryName &&
            item.unitName &&
            !existingItems.some(
              (existing) =>
                existing.name.toLowerCase() === item.name.toLowerCase() &&
                existing.categoryName.toLowerCase() === item.categoryName.toLowerCase() &&
                existing.unitName.toLowerCase() === item.unitName.toLowerCase()
            )
        );

        if (filteredItems.length === 0) {
          toast.error("All items in the CSV already exist in the inventory.");
          return;
        }

        try {
          setImporting(true);
          const res = await fetch("/api/items/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: filteredItems }),
          });
          const json = await res.json();

          if (res.ok && json.success) {
            toast.success("Inventory imported successfully!");
            onImportSuccess();
            onClose();
          } else {
            toast.error(json.message || "Failed to import inventory");
          }
        } catch (err) {
          console.error(err);
          toast.error("Something went wrong during import");
        } finally {
          setImporting(false);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Import Inventory</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleImport(e.target.files)}
          disabled={importing}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 cursor-pointer"
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </button>
          <button
            className={`px-3 py-1 rounded bg-green-600 text-white ${
              importing ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700 cursor-pointer"
            }`}
            disabled
          >
            {importing ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportInventoryModal;