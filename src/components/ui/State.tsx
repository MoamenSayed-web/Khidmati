import type { ReactNode } from "react"
import { Button } from "./Button"
import { Card } from "./Card"
import { Icon } from "./Icon"
import type { Route } from "../../types"

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <Card className="empty-state">
      <span className="empty-icon">
        <Icon name="search" size={30} />
      </span>
      <div className="card-title">{title}</div>
      <p>{text}</p>
      {action}
    </Card>
  )
}

export function ProtectedState({
  go,
  title = "تسجيل الدخول مطلوب",
  message = "يجب تسجيل الدخول للوصول إلى لوحة التحكم.",
  target = "login",
}: {
  go: (route: Route) => void
  title?: string
  message?: string
  target?: Route
}) {
  return (
    <main className="state-page page-shell">
      <Card className="success-panel protected-panel">
        <span className="empty-icon">
          <Icon name="lock" size={30} />
        </span>
        <div className="auth-title small">{title}</div>
        <p>{message}</p>
        <Button onClick={() => go(target)}>
          {target === "login" ? "تسجيل الدخول" : "العودة للوحة التحكم"}
        </Button>
      </Card>
    </main>
  )
}
