import type { HTMLAttributes, ReactNode } from "react"

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: "default" | "outlined" | "muted"
  padding?: "default" | "compact" | "none"
}

export function Card({
  children,
  className = "",
  onClick,
  variant = "default",
  padding = "default",
  role,
  tabIndex,
  onKeyDown,
  ...attributes
}: CardProps) {
  const classes = [
    "card",
    variant !== "default" ? "card-" + variant : "",
    padding !== "default" ? "card-padding-" + padding : "",
    onClick ? "card-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      {...attributes}
      className={classes}
      onClick={
        onClick
          ? (event) => {
              const target = event.target
              const control =
                target instanceof Element
                  ? target.closest("a, button, input, select, textarea")
                  : null
              if (control && control !== event.currentTarget) return
              onClick()
            }
          : undefined
      }
      role={onClick ? "button" : role}
      tabIndex={onClick ? (tabIndex ?? 0) : tabIndex}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (!onClick || event.defaultPrevented || event.currentTarget !== event.target)
          return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
    >
      {children}
    </div>
  )
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div className="card-title">{title}</div>
          <button onClick={onClose} aria-label="إغلاق النافذة">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
