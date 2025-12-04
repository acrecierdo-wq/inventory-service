import React, { useState } from "react";
import Papa from "papaparse";
import {toast} from "sonner";

interface ImportItem {
  name: string;
  categoryId: number;
  unitId: number;
  variantId?: number;
  sizeId?: number;
  criticalLevel?: number;
  reorderLevel?: number;
  ceilingLevel?: number;
  errors?: string[];
}

const DEFAULT_CRITICAL = 5;
const DEFAULT_REORDER = 10;
const DEFAULT_CEILING = 50;

interface Props {
  onClose: () => void;
}

const ItemImport: React.FC<Props> = ({ onClose }) => {
  const [importPreview, setImportPreview] = useState<ImportItem[]>([]);

  type LevelField = "criticalLevel" | "reorderLevel" | "ceilingLevel";

  const handleFileUpload = (file: File) => {
    Papa.parse<ImportItem>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const itemsWithDefaults = results.data.map((item) => {
          const errors: string[] = [];
          if (!item.name) errors.push("Name is required");
          if (!item.categoryId) errors.push("Category is required");
          if (!item.unitId) errors.push("Unit is required");

          return {
            ...item,
            criticalLevel: item.criticalLevel ?? DEFAULT_CRITICAL,
            reorderLevel: item.reorderLevel ?? DEFAULT_REORDER,
            ceilingLevel: item.ceilingLevel ?? DEFAULT_CEILING,
            errors,
          };
        });
        setImportPreview(itemsWithDefaults);
        toast.success("CSV parsed successfully");
      },
      error: (err) => {
        console.error("CSV parsing error:", err);
        toast.error("Failed to parse CSV");
      },
    });
  };

  const updateItemLevel = (index: number, field: LevelField, value: number) => {
    setImportPreview((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleImport = async () => {
    const invalidItems = importPreview.filter((item) => item.errors?.length);
    if (invalidItems.length > 0) {
      toast.error("Please fix errors before importing");
      return;
    }

    try {
      const res = await fetch("/api/items/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importPreview),
      });
      if (!res.ok) throw new Error("Import failed");

      toast.success("Items imported successfully");
      setImportPreview([]);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to import items");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold">Import Items</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* File Upload */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <input
            type="file"
            accept=".csv"
            className="border rounded px-2 py-1"
            onChange={(e) =>
              e.target.files && handleFileUpload(e.target.files[0])
            }
          />
          <span className="text-sm text-gray-500">
            CSV columns: name, categoryId, unitId, variantId, sizeId, criticalLevel, reorderLevel, ceilingLevel
          </span>
        </div>

        {/* Preview Table */}
        {importPreview.length > 0 && (
          <div className="overflow-auto flex-1 p-4">
            <table className="min-w-full border border-gray-300 table-auto">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-2 py-1 text-left">Name</th>
                  <th className="border px-2 py-1">Critical Level</th>
                  <th className="border px-2 py-1">Reorder Level</th>
                  <th className="border px-2 py-1">Ceiling Level</th>
                  <th className="border px-2 py-1 text-left">Errors</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border px-2 py-1">{item.name}</td>
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="number"
                        className="w-16 border rounded px-1 py-0.5 text-center"
                        value={item.criticalLevel}
                        onChange={(e) =>
                          updateItemLevel(index, "criticalLevel", e.target.valueAsNumber)
                        }
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="number"
                        className="w-16 border rounded px-1 py-0.5 text-center"
                        value={item.reorderLevel}
                        onChange={(e) =>
                          updateItemLevel(index, "reorderLevel", e.target.valueAsNumber)
                        }
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="number"
                        className="w-16 border rounded px-1 py-0.5 text-center"
                        value={item.ceilingLevel}
                        onChange={(e) =>
                          updateItemLevel(index, "ceilingLevel", e.target.valueAsNumber)
                        }
                      />
                    </td>
                    <td className="border px-2 py-1 text-red-600 text-sm">
                      {item.errors && item.errors.length > 0 && (
                        <ul className="list-disc ml-4">
                          {item.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            onClick={onClose}
          >
            Close
          </button>
          {importPreview.length > 0 && (
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={handleImport}
            >
              Finalize Import
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemImport;
