import { useState } from "react"
import type { ReactNode } from "react"
import { Icon } from "../components/ui"
import type { CurrentUser, IconName, Route } from "../types"

const citizenNavigation: Array<{ label: string; icon: IconName; route: Route }> = [
  { label: "لوحة التحكم", icon: "home", route: "dashboard" },
  { label: "الخدمات والبلاغات", icon: "file", route: "reports" },
  { label: "تسجيل بلاغ جديد", icon: "plus", route: "submit" },
  { label: "تتبع بلاغ", icon: "search", route: "track" },
  { label: "المفضلة", icon: "heart", route: "favorites" },
  { label: "الإشعارات", icon: "bell", route: "notifications" },
  { label: "ملفي الشخصي", icon: "user", route: "profile" },
]

export function CitizenLayout({
  route,
  go,
  children,
  currentUser,
  onLogout,
}: {
  route: Route
  go: (route: Route) => void
  children: ReactNode
  currentUser: CurrentUser
  onLogout: () => void
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = (target: Route) => {
    go(target)
    setDrawerOpen(false)
  }

  return (
    <main className="account-page page-shell citizen-account-page">
      <button
        className="workspace-sidebar-toggle"
        type="button"
        aria-expanded={drawerOpen}
        aria-controls="citizen-side-navigation"
        onClick={() => setDrawerOpen((open) => !open)}
      >
        <Icon name="menu" />
        <span>قائمة بوابة المواطن</span>
      </button>
      {drawerOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        id="citizen-side-navigation"
        className={[
          "side-nav",
          "card",
          "citizen-side-nav",
          drawerOpen ? "drawer-open" : "",
        ].filter(Boolean).join(" ")}
        aria-label="بوابة المواطن"
      >
        <div className="side-user">
          {currentUser.name}
          <small>حساب مواطن</small>
        </div>
        <nav aria-label="التنقل في بوابة المواطن">
          {citizenNavigation.map((item) => {
            const active = route === item.route
            return (
              <button
                key={item.route}
                type="button"
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(item.route)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <button
          className="logout"
          type="button"
          onClick={() => {
            setDrawerOpen(false)
            onLogout()
          }}
        >
          <Icon name="logout" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>
      <section className="account-content">{children}</section>
    </main>
  )
}
