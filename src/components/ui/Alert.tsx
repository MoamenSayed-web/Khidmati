import { Button } from "./Button"
import { Icon } from "./Icon"
import type { AlertState, Language } from "../../types"

export function SweetAlert({
  alert,
  onClose,
  language,
}: {
  alert: AlertState | null
  onClose: () => void
  language: Language
}) {
  if (!alert) return null
  const run = (action?: () => void) => {
    onClose()
    action?.()
  }
  return (
    <div className="alert-backdrop" role="presentation">
      <div
        className={`sweet-alert sweet-alert-${alert.type}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <span className="alert-icon">
          {alert.type === "success" ? (
            <Icon name="check" size={34} />
          ) : alert.type === "error" ? (
            <b>×</b>
          ) : alert.type === "warning" || alert.type === "confirmation" ? (
            <b>!</b>
          ) : (
            <b>i</b>
          )}
        </span>
        <div id="alert-title" className="alert-title">
          {alert.title}
        </div>
        <p id="alert-message">{alert.message}</p>
        <div className="alert-actions">
          <Button onClick={() => run(alert.onPrimary)}>
            {alert.primaryLabel ?? (language === "ar" ? "حسناً" : "OK")}
          </Button>
          {alert.secondaryLabel && (
            <Button variant="secondary" onClick={() => run(alert.onSecondary)}>
              {alert.secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
