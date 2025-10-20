"use client";

import { useEffect, useRef } from "react";

type Props = {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hasError?: boolean;
};

export default function OtpCode({ length = 6, value, onChange, disabled, hasError }: Props) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleInput = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const chars = value.split("");
    chars[i] = v;
    const next = chars.join("").slice(0, length).padEnd(length, "");
    onChange(next);
    if (v && i < length - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) inputsRef.current[i + 1]?.focus();
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const txt = e.clipboardData.getData("text").trim();
    if (/^\d+$/.test(txt)) onChange(txt.slice(0, length).padEnd(length, ""));
  };

  return (
    <div className="verify-code-inputs">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`verify-code-input ${value[i] ? "filled" : ""} ${hasError ? "error" : ""}`}
        />
      ))}
    </div>
  );
}
