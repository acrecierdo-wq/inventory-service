// app/sales/s_pending_customer_request/pending_view/[id]/components/NumericInput.tsx

import { toast } from "sonner";

type NumericInputProps = {
  label: string;
  value: number | "";
  setValue: (val: string) => void;
  max: number;
  required?: boolean;
  allowDecimal?: boolean;
  disabled?: boolean;
};

const sanitizeToDigits = (input: string, allowDecimal: boolean) => {
  const regex = allowDecimal ? /[^0-9.]/g : /\D+/g;
  let cleaned = input.replace(regex, "");

  // prevent multiple decimals
  const parts = cleaned.split(".");
  if (parts.length > 2) cleaned = parts[0] + "." + parts[1];

  // prevent leading zeros like "0123" (but allow "0.x")
  if (!allowDecimal && cleaned.length > 1 && cleaned.startsWith("0")) {
    cleaned = cleaned.replace(/^0+/, "");
  } else if (allowDecimal && cleaned.startsWith("0") && !cleaned.startsWith("0.")) {
    cleaned = cleaned.replace(/^0+/, "");
  }

  // avoid starting with just "."
  if (cleaned === ".") cleaned = "0.";

  return cleaned;
};

export function NumericInput({
  label,
  value,
  setValue,
  max,
  required = false,
  allowDecimal = false,
  disabled = false,
}: NumericInputProps) {
  // ✅ value = "" means blank field, no 0 shown
  const stringValue =
    value === null || value === undefined || value === 0
      ? ""
      : String(value);

  const handleChange = (val: string) => {
    let sanitized = sanitizeToDigits(val, allowDecimal);

    if (sanitized === "") {
      setValue("");
      return;
    }

    const numericValue = parseFloat(sanitized);

    if (!Number.isNaN(numericValue) && numericValue > max) {
      sanitized = String(max);
      toast.error(`${label} cannot exceed ${max}`, { duration: 2000 });
    }

    setValue(sanitized);
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1 text-[#880c0c]">{label}</label>
      <input
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        pattern={allowDecimal ? "[0-9]*[.]?[0-9]*" : "[0-9]*"}
        value={stringValue}
        disabled={disabled}
        onKeyDown={(e) => {
          if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
          if (!allowDecimal && e.key === ".") e.preventDefault();
        }}
        onPaste={(e) => {
          e.preventDefault();
          handleChange(e.clipboardData.getData("text"));
        }}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full border rounded-lg px-4 py-2 hover:bg-gray-100 ${
          required && stringValue === ""
            ? "border-red-500"
            : stringValue
            ? "border-green-500"
            : "border-[#d2bda7]"
        }`}
      />
      {required && stringValue === "" && (
        <p className="text-red-600 text-sm mt-1">Required</p>
      )}
    </div>
  );
}
