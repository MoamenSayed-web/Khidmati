import { useState } from "react"
import type { ReactNode } from "react"
import { Icon } from "./Icon"
import type { IconName } from "../../types"

export function Input({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
  error,
  success,
  required,
  disabled,
  technical,
}: {
  label?: string
  placeholder?: string
  type?: string
  icon?: IconName
  value?: string
  onChange?: (value: string) => void
  error?: string
  success?: boolean
  required?: boolean
  disabled?: boolean
  technical?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const password = type === "password"
  return (
    <label
      className={`field ${error ? "field-error" : ""} ${
        success ? "field-success" : ""
      }`}
    >
      {label && (
        <span className="field-label">
          {label}
          {required && " *"}
        </span>
      )}
      <span className="input-wrap">
        {icon && <Icon name={icon} size={18} />}
        <input
          className={
            technical || icon === "mail" || icon === "phone"
              ? "technical-input"
              : undefined
          }
          dir={
            technical || icon === "mail" || icon === "phone" ? "ltr" : undefined
          }
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          type={password && visible ? "text" : type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {password && (
          <button
            className="input-action"
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label="إظهار أو إخفاء كلمة المرور"
          >
            <Icon name="eye" size={18} />
          </button>
        )}
        {success && <Icon name="check" size={18} />}
      </span>
      {error && <span className="field-message">{error}</span>}
    </label>
  )
}

export function Select({
  label,
  value,
  onChange,
  children,
  error,
}: {
  label: string
  value?: string
  onChange?: (value: string) => void
  children: ReactNode
  error?: string
}) {
  return (
    <label className={`field ${error ? "field-error" : ""}`}>
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        <select
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {children}
        </select>
      </span>
      {error && <span className="field-message">{error}</span>}
    </label>
  )
}

export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string
  placeholder: string
  value?: string
  onChange?: (value: string) => void
  error?: string
}) {
  return (
    <label className={`field ${error ? "field-error" : ""}`}>
      <span className="field-label">{label}</span>
      <span className="input-wrap textarea-wrap">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </span>
      {error && <span className="field-message">{error}</span>}
    </label>
  )
}
