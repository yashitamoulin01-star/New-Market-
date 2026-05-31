"use client"

import { useState } from "react"

// Indian mobile: starts with 6-9, exactly 10 digits
const INDIAN_PHONE_RE = /^[6-9]\d{9}$/

interface PhoneInputProps {
  name: string
  id?: string
  lang?: string
  required?: boolean
  className?: string
  onValidChange?: (valid: boolean) => void
}

export function PhoneInput({
  name, id, lang = "en", required, className, onValidChange,
}: PhoneInputProps) {
  const hi = lang === "hi"
  const [value, setValue] = useState("")
  const [touched, setTouched] = useState(false)

  const isValid = INDIAN_PHONE_RE.test(value)

  const error: string | null = (() => {
    if (!touched) return null
    if (required && value.length === 0) return hi ? "फ़ोन नंबर अनिवार्य है।" : "Phone number is required."
    if (value.length > 0 && !isValid) return hi ? "वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (6–9 से शुरू)।" : "Enter a valid 10-digit Indian mobile number starting with 6–9."
    return null
  })()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
    setValue(digits)
    onValidChange?.(INDIAN_PHONE_RE.test(digits))
    if (touched && !INDIAN_PHONE_RE.test(digits)) return
  }

  function handleBlur() {
    setTouched(true)
    onValidChange?.(isValid)
  }

  return (
    <>
      <input
        id={id ?? name}
        name={name}
        type="tel"
        inputMode="numeric"
        maxLength={10}
        value={value}
        required={required}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={hi ? "10 अंकों का मोबाइल नंबर (जैसे 9876543210)" : "10-digit mobile number (e.g. 9876543210)"}
        className={`${className ?? ""} ${touched && error ? "border-destructive ring-destructive/30 focus:ring-destructive/40" : ""}`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 flex items-center gap-1 text-xs text-destructive" role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </>
  )
}
