"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Material {
  id: number;
  materialName: string;
  specifications: string | null;
}

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelectMaterial?: (material: Material) => void;
  materials: Material[];
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  showSpecifications?: boolean;
  selectedMaterialName?: string; // ✅ NEW: For dependent specification dropdown
}

export function MaterialAutocompleteInput({
  label,
  value,
  onChange,
  onSelectMaterial,
  materials,
  disabled,
  error,
  placeholder,
  showSpecifications = false,
  selectedMaterialName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ✅ Filter materials based on search query
  useEffect(() => {
    if (showSpecifications && selectedMaterialName) {
      // ✅ SPECIFICATION MODE: Filter by selected material name
      const filtered = materials.filter(
        (m) =>
          m.materialName === selectedMaterialName &&
          m.specifications &&
          m.specifications.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMaterials(filtered);
    } else if (!showSpecifications) {
      // ✅ MATERIAL NAME MODE: Show all materials
      const filtered = materials.filter((m) =>
        m.materialName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMaterials(filtered);
    } else {
      setFilteredMaterials([]);
    }
  }, [
    searchQuery,
    materials,
    showSpecifications,
    selectedMaterialName,
    isOpen,
  ]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (material: Material) => {
    if (showSpecifications) {
      onChange(material.specifications || "");
    } else {
      onChange(material.materialName);
    }
    onSelectMaterial?.(material);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onChange("");
    setSearchQuery("");
    setIsOpen(false);
  };

  // ✅ Get display text
  const displayText = value || placeholder || "Select...";

  // ✅ Check if specification dropdown should be disabled
  const isSpecDisabled =
    showSpecifications && (!selectedMaterialName || disabled);

  return (
    <div className="relative flex flex-col">
      <label className="text-sm font-medium text-[#880c0c] mb-1">
        {label} <span className="text-red-400">*</span>
      </label>

      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !isSpecDisabled && setIsOpen(!isOpen)}
        disabled={isSpecDisabled}
        className={`w-full border rounded-lg px-4 py-2 text-left flex items-center justify-between transition
          ${
            isSpecDisabled
              ? "bg-gray-100 cursor-not-allowed"
              : "hover:bg-gray-50"
          }
          ${
            error
              ? "border-red-500"
              : value
              ? "border-green-500"
              : "border-[#d2bda7]"
          }`}
      >
        <span
          className={`truncate ${!value ? "text-gray-400" : "text-gray-800"}`}
        >
          {displayText}
        </span>
        <ChevronDown
          size={20}
          className={`transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {error && <p className="text-red-600 text-xs mt-1 italic">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 flex flex-col"
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  showSpecifications
                    ? "Search specifications..."
                    : "Search materials..."
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-60">
            {filteredMaterials.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {showSpecifications && !selectedMaterialName
                  ? "Please select a material name first"
                  : "No results found"}
              </div>
            ) : (
              <>
                {/* Clear Option */}
                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 transition border-b border-gray-100 text-red-600 text-sm font-medium"
                  >
                    ✕ Clear Selection
                  </button>
                )}

                {/* Material Options */}
                {filteredMaterials.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => handleSelect(material)}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition flex flex-col border-b last:border-b-0 ${
                      value ===
                      (showSpecifications
                        ? material.specifications
                        : material.materialName)
                        ? "bg-blue-100"
                        : ""
                    }`}
                  >
                    {showSpecifications ? (
                      // Specification Mode
                      <span className="text-sm text-gray-800">
                        {material.specifications}
                      </span>
                    ) : (
                      // Material Name Mode
                      <>
                        <span className="font-medium text-gray-800">
                          {material.materialName}
                        </span>
                        {material.specifications && (
                          <span className="text-xs text-gray-500 mt-1">
                            {material.specifications}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
