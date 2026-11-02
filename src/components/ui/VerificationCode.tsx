import { useRef } from "react"

export function VerificationCode({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "")

  const updateDigit = (index: number, digit: string) => {
    const next = [...digits]
    next[index] = digit.replace(/\D/g, "").slice(-1)
    onChange(next.join(""))
    if (next[index] && index < 5) inputs.current[index + 1]?.focus()
  }

  return (
    <div className="otp-field">
      <span className="field-label">رمز التحقق</span>
      <div
        className="otp-grid"
        dir="ltr"
        onPaste={(event) => {
          const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6)
          if (!pasted) return
          event.preventDefault()
          onChange(pasted)
          inputs.current[Math.min(pasted.length, 6) - 1]?.focus()
        }}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element
            }}
            className="otp-cell"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`الرقم ${index + 1} من رمز التحقق`}
            maxLength={1}
            value={digit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digit && index > 0) {
                inputs.current[index - 1]?.focus()
              }
              if (event.key === "ArrowLeft" && index > 0) {
                inputs.current[index - 1]?.focus()
              }
              if (event.key === "ArrowRight" && index < 5) {
                inputs.current[index + 1]?.focus()
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
