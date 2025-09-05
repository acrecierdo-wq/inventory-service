"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = {
  id: string | number;
  name: string;
};

type AutoCompleteProps = {
  label: string;
  placeholder?: string;
  options?: Suggestion[];       // Local options
  endpoint?: string;            // API endpoint
  value: Suggestion | null;
  onChange: (value: Suggestion | null) => void;
  disabled?: boolean;
  parentId?: number | string | null; // for dependent dropdowns
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
  const [inputValue, setInputValue] = useState(value?.name || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const justSelectedRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value?.name || "");
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    if (!endpoint) return;

    setLoading(true);
    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set("query", query);
      if (parentId) url.searchParams.set("itemId", String(parentId));

      const res = await fetch(url.toString());
      const data: Suggestion[] = await res.json();

      if (data.length === 1) {
        handleSelect(data[0]);
        return;
      }

      setSuggestions(data);
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options && options.length > 0) {
      // Local options filtering
      const filtered = inputValue
        ? options.filter((o) =>
            o.name.toLowerCase().includes(inputValue.toLowerCase())
          )
        : options;

      setSuggestions(filtered);

      // Auto-select if only one option
      if (filtered.length === 1) {
        handleSelect(filtered[0]);
      }

      return;
    }

    if (!endpoint) return;

    if (!inputValue || inputValue.length < 1) {
      setSuggestions([]);
      return;
    }

    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    const timeout = setTimeout(() => fetchSuggestions(inputValue), 300);
    return () => clearTimeout(timeout);
  }, [inputValue, options, endpoint, parentId]);

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
          if (value?.name === "(None)") return;
          const val = e.target.value;
          setInputValue(val);
          setShowSuggestions(true);
          if (!val) onChange(null);
        }}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setShowSuggestions(true)}
        className="w-full border border-[#d2bda7] p-2 rounded disabled:bg-gray-100"
      />

      {loading && (
        <div className="absolute mt-1 px-3 py-1 text-sm text-gray-500">Loading...</div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full border bg-white rounded shadow max-h-40 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.id}
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


// "use client";

// import { useEffect, useRef, useState } from "react";

// type Suggestion = {
//   id: string | number;
//   name: string;
// };

// type AutoCompleteProps = {
//   label: string;
//   placeholder?: string;
//   endpoint: string;
//   value: Suggestion | null;
//   onChange: (value: Suggestion | null) => void;
//   disabled?: boolean;
//   parentId?: number | string | null; // parent itemId for dependent dropdowns
// };

// export default function AutoComplete({
//   label,
//   placeholder,
//   endpoint,
//   value,
//   onChange,
//   disabled = false,
//   parentId = null,
// }: AutoCompleteProps) {
//   const [inputValue, setInputValue] = useState(value?.name || "");
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const justSelectedRef = useRef(false);

//   useEffect(() => {
//     setInputValue(value?.name || "");
//   }, [value]);

//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (!parentId && endpoint !== "/api/autocomplete/item-name") {
//         // dependent dropdowns wait for parentId
//         setSuggestions([]);
//         return;
//       }

//       if (justSelectedRef.current) {
//         justSelectedRef.current = false;
//         return;
//       }

//       setLoading(true);
//       try {
//         const url = new URL(endpoint, window.location.origin);
//         if (endpoint === "/api/autocomplete/item-name") {
//           if (inputValue) url.searchParams.set("query", inputValue);
//         } else {
//           url.searchParams.set("itemId", String(parentId));
//         }

//         const res = await fetch(url.toString());
//         const data: Suggestion[] = await res.json();

//         if (data.length === 1 && data[0].name === "(None)") {
//           handleSelect(data[0]);
//           return;
//         }

//         setSuggestions(data);
//       } catch (err) {
//         console.error("Autocomplete fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const timeout = setTimeout(fetchSuggestions, 300);
//     return () => clearTimeout(timeout);
//   }, [inputValue, endpoint, parentId]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowSuggestions(false);
//       }
//     };

//     window.addEventListener("click", handleClickOutside);
//     return () => window.removeEventListener("click", handleClickOutside);
//   }, []);

//   const handleSelect = (selected: Suggestion) => {
//     justSelectedRef.current = true;
//     setInputValue(selected.name);
//     onChange(selected);
//     setSuggestions([]);
//     setShowSuggestions(false);
//     setLoading(false);
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <label className="block text-sm font-medium">{label}</label>
//       <input
//         type="text"
//         value={inputValue}
//         onChange={(e) => {
//           if (value?.name === "(None)") return;
//           const val = e.target.value;
//           setInputValue(val);
//           setShowSuggestions(true);

//           if (val === "") {
//             onChange(null);
//           }
//         }}
//         placeholder={placeholder}
//         disabled={disabled}
//         className="w-full border border-[#d2bda7] p-2 rounded disabled:bg-gray-100"
//       />

//       {loading && (
//         <div className="absolute mt-1 px-3 py-1 text-sm text-gray-500">Loading...</div>
//       )}

//       {showSuggestions && suggestions.length > 0 && (
//         <ul className="absolute z-10 w-full border bg-white rounded shadow max-h-40 overflow-y-auto">
//           {suggestions.map((s) => (
//             <li
//               key={s.id}
//               className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => handleSelect(s)}
//             >
//               {s.name}
//             </li>
//           ))}
//         </ul>
//       )}

//       {showSuggestions && !loading && suggestions.length === 0 && (
//         <div className="absolute z-10 w-full bg-white border px-3 py-2 text-gray-500 italic text-xs">
//           No matches found
//         </div>
//       )}
//     </div>
//   );
// }
