// components/autocomplete/ItemNameAutoComplete.tsx

"use client";

import { useState, useEffect, useRef } from "react";

export default function ItemNameAutoComplete({
  label,
  placeholder,
  endpoint,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  endpoint: string;
  value: string; // from parent (e.g., newItem.itemName)
  onChange: (selected: { id: string; name: string }) => void;
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync input value when parent changes it
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.trim() === "") {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`${endpoint}?query=${encodeURIComponent(inputValue)}`);
      const data = await res.json();
      setSuggestions(data || []);
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [inputValue, endpoint]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value); // ✅ input controlled
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        className="w-full border border-gray-300 px-3 py-2 rounded-md"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full border bg-white rounded shadow max-h-40 overflow-y-auto">
          {suggestions.map((item: any) => (
            <li
              key={item.id}
              onClick={() => {
                // ✅ When selected, tell parent AND update local input
                onChange({ id: item.id, name: item.name });
                setInputValue(item.name);
                setShowSuggestions(false);
              }}
              className="cursor-pointer px-3 py-2 hover:bg-gray-100"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
      {showSuggestions && suggestions.length === 0 && (
        <div className="absolute z-10 w-full bg-white border px-3 py-2 text-gray-500 italic text-xs">
          No matches found
        </div>
      )}
    </div>
  );
}
