// components/autocomplete/ItemUnitAutoComplete.tsx

"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = {
  id: string;
  name: string;
};

type ItemUnitAutoCompleteProps = {
  label: string;
  placeholder?: string;
  endpoint: string;
  value: string;
  onChange: (value: Suggestion) => void;
};

export default function ItemUnitAutoComplete({
  label,
  placeholder,
  endpoint,
  value,
  onChange,
}: ItemUnitAutoCompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length < 1) {
        setSuggestions([]);
        return;
      }

      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${endpoint}?query=${inputValue}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
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

  const handleSelect = (selected: Suggestion) => {
    justSelectedRef.current = true;
    setInputValue(selected.name);
    onChange(selected);
    setSuggestions([]);
    setShowSuggestions(false);
    setLoading(false);
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
          setShowSuggestions(true);

          if (val === "") {
            onChange({ id: "", name: "" });
          }
        }}
        placeholder={placeholder}
        className="w-full border border-gray-300 px-3 py-2 rounded-md"
      />

      {loading && (
        <div className="absolute mt-1 px-3 py-1 text-sm text-gray-500 animate-spin">⏳</div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full border bg-white rounded shadow max-h-40 overflow-y-auto mt-1">
          {suggestions.map((s, index) => (
            <li
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(s)}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && !loading && suggestions.length === 0 && (
        <div className="absolute z-10 w-full bg-white border px-3 py-2 text-gray-500 italic text-xs">
          No matches found
        </div>
      )}
    </div>
  );
}