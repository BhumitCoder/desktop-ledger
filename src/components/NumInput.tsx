import { useEffect, useRef, useState } from "react";

/**
 * Billing-friendly numeric input:
 *  - shows EMPTY instead of a pre-filled 0 (no "delete the 0 first" annoyance)
 *  - no browser spinner arrows (plain text input with numeric keyboard)
 *  - select-all on focus so typing replaces the old value instantly
 *  - accepts only digits and one decimal point while typing ("0.5" works)
 */
export function NumInput({
  value,
  onValue,
  className,
  placeholder = "0",
  ...rest
}: {
  value: number;
  onValue: (n: number) => void;
  className?: string;
  placeholder?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const [text, setText] = useState(value === 0 ? "" : String(value));
  const lastNum = useRef(value);

  // Re-sync display when the value differs from what was last typed (new
  // line added, "Full" button, clamping…). Runs on EVERY render — a clamp
  // that lands back on the previous prop value (e.g. Disc% typed 1000,
  // clamped to 100 which it already was) doesn't change the prop, so a
  // [value]-keyed effect would never fire and the box would keep showing
  // the unclamped text.
  useEffect(() => {
    if (value !== lastNum.current) {
      setText(value === 0 ? "" : String(value));
      lastNum.current = value;
    }
  });

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        const t = e.target.value;
        if (!/^\d*\.?\d*$/.test(t)) return; // digits + at most one dot
        setText(t);
        const n = parseFloat(t);
        lastNum.current = isNaN(n) ? 0 : n;
        onValue(lastNum.current);
      }}
      onFocus={(e) => e.target.select()}
      className={className}
      {...rest}
    />
  );
}
