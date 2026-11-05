import type { ReactNode } from "react"
import { Icon } from "./Icon"
import type { IconName } from "../../types"

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  loading,
  icon,
  className = "",
  fullWidth = false,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  type?: "button" | "submit"
  disabled?: boolean
  loading?: boolean
  icon?: IconName
  className?: string
  fullWidth?: boolean
}) {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? "full" : ""} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <span className="spinner" />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      <span>{children}</span>
    </button>
  )
  
}
