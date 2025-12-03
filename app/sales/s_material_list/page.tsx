"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";
import { Pencil, Trash2, Plus, Search, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

interface Material {
  id: number;
  materialName: string;
  specifications: string | null;
  pricePerKg: string;
  addedBy: string;
  addedAt: string;
  updatedAt: string | null;
}

interface CSVMaterial {
  materialName: string;
  specifications: string;
  pricePerKg: number;
  tempId?: string; // For tracking in preview
  error?: string; // For validation errors
}

const MaterialListPage = () => {
  const { user, isLoaded } = useUser();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );

  // Form states
  const [materialName, setMaterialName] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // CSV Import states
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV Preview Modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMaterials, setPreviewMaterials] = useState<CSVMaterial[]>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  // Add state for duplicate checking
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);

  // Fetch materials
  const fetchMaterials = async (search = "") => {
    setIsLoading(true);
    try {
      const url = search
        ? `/api/sales/materials?search=${encodeURIComponent(search)}`
        : "/api/sales/materials";

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setMaterials(data.materials);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSearch = () => {
    fetchMaterials(searchQuery);
  };

  const handleAddMaterial = () => {
    if (!isLoaded || !user) {
      toast.error("Please wait while we load your account information");
      return;
    }

    setIsEditing(false);
    setSelectedMaterial(null);
    setMaterialName("");
    setSpecifications("");
    setPricePerKg("");
    setModalOpen(true);
  };

  const handleEditMaterial = (material: Material) => {
    setIsEditing(true);
    setSelectedMaterial(material);
    setMaterialName(material.materialName);
    setSpecifications(material.specifications || "");
    setPricePerKg(material.pricePerKg);
    setModalOpen(true);
  };

  // Add function to check for duplicate material name
  const checkDuplicateMaterial = async (
    materialName: string,
    excludeId?: number
  ): Promise<boolean> => {
    if (!materialName.trim()) return false;

    setIsDuplicateChecking(true);

    try {
      const res = await fetch(
        `/api/sales/materials/check-duplicate?name=${encodeURIComponent(
          materialName.trim()
        )}${excludeId ? `&excludeId=${excludeId}` : ""}`
      );
      const data = await res.json();
      return data.isDuplicate;
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return false;
    } finally {
      setIsDuplicateChecking(false);
    }
  };

  // Update handleSaveMaterial function
  const handleSaveMaterial = async () => {
    if (!materialName.trim() || !pricePerKg) {
      toast.error("Material name and price are required");
      return;
    }

    const price = parseFloat(pricePerKg);
    if (isNaN(price) || price <= 0) {
      toast.error("Invalid price per kg");
      return;
    }

    // ✅ Check for duplicate material name
    const isDuplicate = await checkDuplicateMaterial(
      materialName,
      isEditing && selectedMaterial ? selectedMaterial.id : undefined
    );

    if (isDuplicate) {
      toast.error(
        `Material "${materialName.trim()}" already exists in the list`,
        {
          description: "Please use a different material name",
          duration: 5000,
        }
      );
      return;
    }

    const username =
      user?.username ||
      user?.fullName ||
      user?.firstName ||
      user?.primaryEmailAddress?.emailAddress ||
      "Unknown";

    try {
      const payload = {
        materialName: materialName.trim(), // ✅ Trim whitespace
        specifications: specifications.trim() || null,
        pricePerKg: price.toFixed(2),
        addedBy: username,
      };

      if (isEditing && selectedMaterial) {
        const res = await fetch(`/api/sales/materials/${selectedMaterial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          toast.success("Material updated successfully");
          fetchMaterials(searchQuery);
          setModalOpen(false);
        } else {
          toast.error(data.error || "Failed to update material");
        }
      } else {
        const res = await fetch("/api/sales/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          toast.success("Material added successfully");
          fetchMaterials(searchQuery);
          setModalOpen(false);
        } else {
          toast.error(data.error || "Failed to add material");
        }
      }
    } catch (error) {
      console.error("Error saving material:", error);
      toast.error("Failed to save material");
    }
  };

  const handleDeleteClick = (material: Material) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/sales/materials/${materialToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Material deleted successfully");
        fetchMaterials(searchQuery);
        setDeleteDialogOpen(false);
        setMaterialToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete material");
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Import functionality
  const parseCSV = (text: string): CSVMaterial[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    // Material Name and Price/Kg are required, Specifications is optional
    const requiredHeaders = ["material name", "price/kg"];
    const headerIndices: Record<string, number> = {};

    requiredHeaders.forEach((required) => {
      const index = headers.findIndex((h) => h === required);
      if (index === -1) {
        throw new Error(`Missing required column: "${required}"`);
      }
      headerIndices[required] = index;
    });

    // Check for optional specifications column
    const specsIndex = headers.findIndex((h) => h === "specifications");
    if (specsIndex !== -1) {
      headerIndices["specifications"] = specsIndex;
    }

    const materials: CSVMaterial[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values.length < 2) continue;

      const materialName = values[headerIndices["material name"]] || "";
      const specifications =
        specsIndex !== -1 ? values[headerIndices["specifications"]] || "" : "";
      const priceStr = values[headerIndices["price/kg"]] || "";

      let error = "";

      if (!materialName) {
        error = "Material name is required";
      }

      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) {
        error = error || `Invalid price: ${priceStr}`;
      }

      materials.push({
        materialName,
        specifications,
        pricePerKg: isNaN(price) ? 0 : price,
        tempId: `temp-${i}`,
        error,
      });
    }

    return materials;
  };

  const handleCSVImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    if (!isLoaded || !user) {
      toast.error("Please wait for user information to load");
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const materials = parseCSV(text);

      if (materials.length === 0) {
        toast.error("No valid materials found in CSV");
        return;
      }

      // Show preview modal
      setPreviewMaterials(materials);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("CSV import error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to parse CSV file"
      );
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Update preview material
  const updatePreviewMaterial = (
    tempId: string,
    field: keyof CSVMaterial,
    value: string | number
  ) => {
    setPreviewMaterials((prev) =>
      prev.map((m) => {
        if (m.tempId === tempId) {
          const updated = { ...m, [field]: value };

          // Validate
          let error = "";
          if (!updated.materialName.trim()) {
            error = "Material name is required";
          } else if (
            typeof updated.pricePerKg === "number" &&
            (isNaN(updated.pricePerKg) || updated.pricePerKg <= 0)
          ) {
            error = "Invalid price";
          }

          return { ...updated, error };
        }
        return m;
      })
    );
  };

  // Remove material from preview
  const removePreviewMaterial = (tempId: string) => {
    setPreviewMaterials((prev) => prev.filter((m) => m.tempId !== tempId));
  };

  // Confirm and import materials
  const handleConfirmImport = async () => {
    const validMaterials = previewMaterials.filter((m) => !m.error);

    if (validMaterials.length === 0) {
      toast.error("No valid materials to import");
      return;
    }

    setIsProcessingImport(true);

    try {
      const username =
        user?.username ||
        user?.fullName ||
        user?.firstName ||
        user?.primaryEmailAddress?.emailAddress ||
        "Unknown";

      // ✅ Check for duplicates before importing
      const duplicateChecks = await Promise.all(
        validMaterials.map(async (m) => {
          const isDuplicate = await checkDuplicateMaterial(m.materialName);
          return { material: m, isDuplicate };
        })
      );

      const duplicates = duplicateChecks.filter((c) => c.isDuplicate);

      if (duplicates.length > 0) {
        const duplicateNames = duplicates
          .map((d) => `"${d.material.materialName}"`)
          .join(", ");
        toast.error("Duplicate materials found", {
          description: `The following materials already exist: ${duplicateNames}`,
          duration: 8000,
        });
        return;
      }

      const res = await fetch("/api/sales/materials/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materials: validMaterials.map((m) => ({
            materialName: m.materialName.trim(), // ✅ Trim whitespace
            specifications: m.specifications.trim() || null,
            pricePerKg: m.pricePerKg,
            addedBy: username,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Successfully imported ${data.count} materials!`, {
          duration: 5000,
        });
        fetchMaterials(searchQuery);
        setShowPreviewModal(false);
        setPreviewMaterials([]);
      } else {
        toast.error(data.error || "Failed to import materials");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import materials");
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = `Material Name,Specifications,Price/Kg
Steel Plate,Grade A36 10mm thickness,125.50
Aluminum Sheet,6061-T6 5mm thickness,85.75
Copper Wire,,450.00`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "materials_template.csv";
    link.click();
  };

  return (
    <div className="min-h-screen w-full bg-[#ffedce]">
      <Header />

      <div className="px-10 py-8">
        <h1 className="text-3xl font-extrabold text-[#5a4632] tracking-wide mb-6">
          Material List
        </h1>

        {!isLoaded && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            ⏳ Loading user information...
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="px-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-[#880c0c]"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#880c0c] text-white rounded-lg hover:bg-[#a31212] transition flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
              title="Download CSV template"
            >
              <Upload size={18} className="rotate-180" />
              Template
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!isLoaded || isImporting}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 font-semibold ${
                !isLoaded || isImporting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              <Upload size={18} />
              {isImporting ? "Processing..." : "Import CSV"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />

            <button
              onClick={handleAddMaterial}
              disabled={!isLoaded}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 font-semibold ${
                !isLoaded
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              <Plus size={18} />
              Add Material
            </button>
          </div>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p className="font-semibold text-yellow-800 mb-1">
            📋 CSV Import Format:
          </p>
          <p className="text-yellow-700">
            Required columns:{" "}
            <code className="bg-yellow-100 px-1 rounded">Material Name</code>,
            <code className="bg-yellow-100 px-1 rounded mx-1">Price/Kg</code>
            <br />
            Optional:{" "}
            <code className="bg-yellow-100 px-1 rounded">Specifications</code>
            <br />
            Column order is flexible. Download the template for an example.
          </p>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#debca3]">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1.5fr_0.8fr] gap-4 px-6 py-4 bg-[#fcd0d0] text-[#5a4632] font-bold border-b border-[#d2bda7] rounded-t-2xl">
            <span>MATERIAL NAME</span>
            <span>SPECIFICATIONS</span>
            <span>PRICE/KG</span>
            <span>ADDED BY</span>
            <span>ADDED AT</span>
            <span className="text-center">ACTION</span>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              Loading materials...
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-10 text-gray-500 italic">
              No materials found
            </div>
          ) : (
            <div className="divide-y divide-[#d2bda7]">
              {materials.map((material, index) => (
                <div
                  key={material.id}
                  className={`grid grid-cols-[1fr_2fr_1fr_1fr_1.5fr_0.8fr] gap-4 px-6 py-4 hover:bg-[#fef9f3] transition ${
                    index % 2 === 0 ? "bg-white" : "bg-[#fffcf6]"
                  }`}
                >
                  <span className="font-medium text-gray-800 self-center">
                    {material.materialName}
                  </span>
                  <span className="text-gray-600 self-center text-sm">
                    {material.specifications || (
                      <span className="italic text-gray-400">
                        No specifications
                      </span>
                    )}
                  </span>
                  <span className="text-gray-800 font-semibold self-center">
                    ₱
                    {parseFloat(material.pricePerKg).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-gray-600 self-center text-sm">
                    {material.addedBy}
                  </span>
                  <span className="text-gray-600 self-center text-sm">
                    {new Date(material.addedAt).toLocaleString()}
                  </span>
                  <div className="flex justify-center gap-2 self-center">
                    <button
                      onClick={() => handleEditMaterial(material)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(material)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-[600px] p-8 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#880c0c]">
                {isEditing ? "Edit Material" : "Add New Material"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-600 hover:text-black text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#880c0c]"
                  placeholder="e.g., Steel Plate"
                />
                {isDuplicateChecking && (
                  <p className="text-blue-600 text-xs mt-1 italic flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Checking for duplicates...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specifications{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#880c0c]"
                  placeholder="e.g., Grade A36, 10mm thickness"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price per Kg (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#880c0c]"
                  placeholder="e.g., 125.50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                disabled={isDuplicateChecking}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMaterial}
                disabled={isDuplicateChecking}
                className={`px-6 py-2 rounded-lg transition font-semibold ${
                  isDuplicateChecking
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-[#880c0c] text-white hover:bg-[#a31212]"
                }`}
              >
                {isDuplicateChecking
                  ? "Checking..."
                  : isEditing
                  ? "Update"
                  : "Add"}{" "}
                Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[1200px] max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-[#880c0c]">
                  Preview Import ({previewMaterials.length} materials)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Review and edit materials before importing. Remove invalid
                  entries or fix errors.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewMaterials([]);
                }}
                className="text-gray-600 hover:text-black text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-[#fcd0d0] z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-[#5a4632] border-b-2 border-[#d2bda7]">
                      Material Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-[#5a4632] border-b-2 border-[#d2bda7]">
                      Specifications
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-[#5a4632] border-b-2 border-[#d2bda7]">
                      Price/Kg
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-[#5a4632] border-b-2 border-[#d2bda7] w-20">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewMaterials.map((material, index) => (
                    <tr
                      key={material.tempId}
                      className={`${
                        material.error
                          ? "bg-red-50"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="px-4 py-3 border-b border-gray-200">
                        <input
                          type="text"
                          value={material.materialName}
                          onChange={(e) =>
                            updatePreviewMaterial(
                              material.tempId!,
                              "materialName",
                              e.target.value
                            )
                          }
                          className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 ${
                            material.error && !material.materialName.trim()
                              ? "border-red-500 focus:ring-red-300"
                              : "border-gray-300 focus:ring-blue-300"
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <input
                          type="text"
                          value={material.specifications}
                          onChange={(e) =>
                            updatePreviewMaterial(
                              material.tempId!,
                              "specifications",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder="Optional"
                        />
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={material.pricePerKg}
                          onChange={(e) =>
                            updatePreviewMaterial(
                              material.tempId!,
                              "pricePerKg",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 ${
                            material.error &&
                            (isNaN(material.pricePerKg) ||
                              material.pricePerKg <= 0)
                              ? "border-red-500 focus:ring-red-300"
                              : "border-gray-300 focus:ring-blue-300"
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 text-center">
                        <button
                          onClick={() =>
                            removePreviewMaterial(material.tempId!)
                          }
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {previewMaterials.length === 0 && (
                <div className="text-center py-10 text-gray-500 italic">
                  All materials have been removed
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">
                  {previewMaterials.filter((m) => !m.error).length}
                </span>{" "}
                valid materials ready to import
                {previewMaterials.some((m) => m.error) && (
                  <span className="ml-4 text-red-600">
                    ({previewMaterials.filter((m) => m.error).length} with
                    errors)
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewMaterials([]);
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                  disabled={isProcessingImport}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={
                    isProcessingImport ||
                    previewMaterials.filter((m) => !m.error).length === 0
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessingImport ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Import Materials
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Material"
        description="Are you sure you want to delete this material?"
        itemName={materialToDelete?.materialName}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MaterialListPage;