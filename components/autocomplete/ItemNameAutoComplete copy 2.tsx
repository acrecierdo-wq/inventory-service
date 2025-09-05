// components/autocomplete/ItemNameAutoComplete.tsx

"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = {
    id: string;
    name: string;
};

type ItemNameAutoCompleteProps = {
    label: string;
    placeholder?: string;
    endpoint: string;
    value: string;
    onChange: (value: Suggestion) => void;
}

export default function ItemNameAutoComplete({
    label,
    placeholder,
    endpoint,
    value,
    onChange,
}: ItemNameAutoCompleteProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, ] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (value.length < 1) {
                setSuggestions([]);
                return;
            }
            fetch(`${endpoint}?query=${value}`)
            .then(res => res.json())
            .then(setSuggestions);
        }, 300);

        return () => clearTimeout(timeout);
    }, [value, endpoint]);

    const handleSelect = (selected: Suggestion) => {
        onChange(selected);
        setShowSuggestions(false);
    };

      const dropdownRef = useRef<HTMLDivElement | null>(null);
    
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
            <label className="block text-sm front-medium">{label}</label>
            <input 
            type="text"
            value={value}
            onChange={(e) => {
                onChange( {id: "", name: e.target.value });
                setShowSuggestions(true);
            }}
            placeholder={placeholder}
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            />

            {loading && (
                <div className="p-2 text-sm text-muted-foreground">
                    <span className="animate-pulse">⏳</span>
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full border bg-white rounded shadow max-h-40 overflow-y-auto">
                    {suggestions.map((s, index) => (
                        <li
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            handleSelect(s);
                        }}
                        >
                         {s.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}