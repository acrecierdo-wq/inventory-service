// components/autocomplete/ItemUnitAutoComplete.tsx

"use client";

import { useEffect, useState } from "react";

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
}

export default function ItemUnitAutoComplete({
    label,
    placeholder,
    endpoint,
    value,
    onChange,
}: ItemUnitAutoCompleteProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (value.length < 1) {
                setSuggestions([]);
                return;
            }
            const res = await fetch(`${endpoint}?query=${value}`);
            const data = await res.json();
            setSuggestions(data);
        };

        fetchSuggestions();
    }, [value, endpoint]);

    const handleSelect = (selected: Suggestion) => {
        onChange(selected);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <label className="block text-sm front-medium">{label}</label>
            <input 
            type="text"
            value={value}
            onChange={(e) => {
                onChange({ id: "", name: e.target.value });
                setShowSuggestions(true);
            }}
            placeholder={placeholder}
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            />

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