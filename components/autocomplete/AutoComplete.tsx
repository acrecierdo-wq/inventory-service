// api/components/autocomplete/AutoComplete.tsx

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Suggestion = { 
  id: string | number; 
  name: string 
  supplierName?: string;
  itemName?: string;
  personnelName?: string;
  clientName?: string;
};

type AutoCompleteProps = {
  label: string;
  placeholder?: string;
  options?: Suggestion[];
  endpoint?: string;
  value: Suggestion | null;
  onChange: (value: Suggestion | null) => void;
  disabled?: boolean;
  parentId?: number | string | null;
};

export default function AutoComplete({
  label,
  placeholder,
  options,
  endpoint,
  value,
  onChange,
  disabled = false,
  parentId = null,
}: AutoCompleteProps) {
  const [inputValue, setInputValue] = useState(value?.name || value?.supplierName || value?.itemName || value?.personnelName || value?.clientName || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);
  const fetchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // keep input synced with external value
  useEffect(() => {
    const next = value?.name || value?.supplierName || value?.itemName || value?.personnelName || value?.clientName || "";
    setInputValue((prev) => (prev !== next ? next : prev));
  }, [value]);

  const handleSelect = useCallback((selected: Suggestion) => {
    justSelectedRef.current = true;
    setInputValue(selected.name || selected.supplierName || selected.itemName || selected.personnelName || selected.clientName || "");
    onChange(selected);
    setSuggestions([]);
    setShowSuggestions(false);
    setLoading(false);
  }, [onChange]);

  // local options OR remote fetch
  useEffect(() => {
  if (fetchTimeout.current) clearTimeout(fetchTimeout.current);

  // local options mode
  if (options && options.length > 0) {
    const next =
      inputValue.trim().length === 0
        ? options
        : options.filter(o =>
            (o.name || o.supplierName || o.itemName || o.personnelName || o.clientName || "")
            .toLowerCase()
            .includes(inputValue.toLowerCase())
          );
    setSuggestions(next);
    return;
  }

  // remote mode
  if (!endpoint) return;

  fetchTimeout.current = setTimeout(async () => {
    if (!inputValue || inputValue.length < 1) {
      setSuggestions([]);
      return;
    }
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    setLoading(true);
    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set("query", inputValue);
      if (parentId) url.searchParams.set("itemId", String(parentId));

      const res = await fetch(url.toString());
      const data: Suggestion[] = await res.json();

      // auto-select if 1 match AND not already selected
      // if (data.length === 1 && (!value || value.id !== data[0].id)) {
      //   handleSelect(data[0]);
      //   return;
      // }

      setSuggestions(data);
    } catch (e) {
      console.error("Autocomplete fetch error:", e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  return () => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
  };
}, [inputValue, options, endpoint, parentId, value, handleSelect]);

  // outside click: only listen while open; use pointerdown to avoid focus/blur loops
  useEffect(() => {
    if (!showSuggestions) return;

    const handlePointerDown = (e: PointerEvent) => {
      const root = dropdownRef.current;
      if (root && !root.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [showSuggestions]);

  const getDisplayName = (s: Suggestion) => {
    if (s.personnelName && s.name) {
      return `${s.name} - ${s.personnelName}`;
    }
    return (
      s.name ||
      s.supplierName ||
      s.itemName ||
      s.personnelName ||
      s.clientName ||
      "Unnamed"
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium">{label}</label>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value;
          setInputValue(val);
          if (!showSuggestions) setShowSuggestions(true);
          if (val === "" && value !== null) {
            onChange(null);
          }
        }}
        onFocus={() => {
          if (!showSuggestions) setShowSuggestions(true);
        }}
        placeholder={placeholder || "Select..."}
        disabled={disabled}
        className="w-full border border-[#d2bda7] p-2 rounded disabled:bg-gray-100 hover:bg-gray-100"
      />

      {loading && (
            <div className="absolute mt-1 px-3 py-1">
              <div className="w-2 h-2 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

      {showSuggestions && (
        <div className="absolute z-10 w-full bg-white border rounded shadow">
          {!loading && suggestions.length > 0 && (
            <ul className="max-h-40 overflow-y-auto">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                  onClick={() => handleSelect(s)}
                >
                  {getDisplayName(s)}
                </li>
              ))}
            </ul>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-gray-500 italic text-xs">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
