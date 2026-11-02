import { useState } from "react"
import type { ReactNode } from "react"
import { mockUser } from "../data/mockData"
import { Icon } from "../components/ui"
import type { CurrentUser, IconName, Role, Route, WorkspaceSidebarItem } from "../types"

export const sideItems: Array<[string, IconName, Route]> = [
  ["لوحة التحكم", "home", "dashboard"],
  ["ملفي الشخصي", "user", "profile"],
  ["بلاغاتي وشكاواي", "clock", "reports"],
  ["طلبات الخدمات", "file", "reports"],
  ["المفضلة", "heart", "favorites"],
  ["الإشعارات", "bell", "notifications"],
]

export const employeeSidebarItems: WorkspaceSidebarItem[] = [
  { label: "لوحة العمل", icon: "home", route: "employee-dashboard" },
  {
    label: "البلاغات",
    icon: "file",
    route: "employee-complaints",
    section: "complaints",
  },
  {
    label: "البلاغات الجديدة",
    icon: "mail",
    route: "employee-new",
    child: true,
    section: "complaints",
  },
  {
    label: "قيد المراجعة",
    icon: "search",
    route: "employee-review",
    child: true,
    section: "complaints",
  },
  {
    label: "قيد التنفيذ",
    icon: "clock",
    route: "employee-progress",
    child: true,
    section: "complaints",
  },
  {
    label: "تحتاج إلى توضيح",
    icon: "bot",
    route: "employee-clarification",
    child: true,
    section: "complaints",
  },
  {
    label: "البلاغات المحلولة",
    icon: "check",
    route: "employee-resolved",
    child: true,
    section: "complaints",
  },
  {
    label: "الإشعارات",
    icon: "bell",
    route: "employee-notifications",
  },
  {
    label: "الملف الشخصي",
    icon: "user",
    route: "employee-profile",
  },
]

export const adminSidebarItems: WorkspaceSidebarItem[] = [
  { label: "لوحة التحكم", icon: "home", route: "admin-dashboard" },
  { label: "البلاغات", icon: "file", route: "admin-complaints" },
  { label: "المواطنون", icon: "user", route: "admin-citizens" },
  { label: "الموظفون", icon: "user", route: "admin-employees" },
  { label: "الأقسام", icon: "menu", route: "admin-departments" },
  { label: "مكاتب الخدمة", icon: "office", route: "admin-offices" },
  {
    label: "التقارير والإحصائيات",
    icon: "search",
    route: "admin-analytics",
  },
  { label: "الخريطة", icon: "pin", route: "admin-map" },
  { label: "الإشعارات", icon: "bell", route: "admin-notifications" },
  { label: "إعدادات النظام", icon: "settings", route: "admin-settings" },
  { label: "الملف الشخصي", icon: "user", route: "admin-profile" },
]

export function AccountLayout({
  route,
  go,
  children,
  currentUser = mockUser,
  onLogout,
  role = "citizen",
}: {
  route: Route
  go: (route: Route) => void
  children: ReactNode
  currentUser?: CurrentUser
  onLogout?: () => void
  role?: Role
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const workspaceItems =
    role === "employee"
      ? employeeSidebarItems
      : role === "admin"
        ? adminSidebarItems
        : null
  const employeeComplaintRoutes: Route[] = [
    "employee-complaints",
    "employee-new",
    "employee-review",
    "employee-progress",
    "employee-clarification",
    "employee-resolved",
    "employee-complaint",
  ]
  return (
    <main className="account-page page-shell">
      <button
        className="workspace-sidebar-toggle"
        onClick={() => setDrawerOpen(true)}
      >
        <Icon name="menu" />
        <span>القائمة</span>
      </button>
      {drawerOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="إغلاق القائمة"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside className={`side-nav card ${drawerOpen ? "drawer-open" : ""}`}>
        <div className="side-user">
          {currentUser.name}
          <small>
            {role === "employee"
              ? "موظف الحي"
              : role === "admin"
                ? "مدير النظام"
                : "مواطن"}
          </small>
        </div>
        {workspaceItems
          ? workspaceItems.map((item) => {
              const active = route === item.route
              const related =
                (item.route === "employee-complaints" &&
                  employeeComplaintRoutes.includes(route)) ||
                (item.route === "admin-complaints" &&
                  route === "admin-complaint")
              return (
                <button
                  key={item.label}
                  className={`${active ? "active" : ""} ${
                    related && !active ? "section-related" : ""
                  } ${item.child ? "sidebar-child" : ""}`}
                  onClick={() => {
                    go(item.route)
                    setDrawerOpen(false)
                  }}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.label === "الإشعارات" && <b className="counter">2</b>}
                </button>
              )
            })
          : sideItems.map(([label, icon, target]) => (
              <button
                key={label}
                className={route === target ? "active" : ""}
                onClick={() => {
                  go(target)
                  setDrawerOpen(false)
                }}
              >
                <Icon name={icon} />
                <span>{label}</span>
                {label === "الإشعارات" && <b className="counter">2</b>}
              </button>
            ))}
        {!workspaceItems && (
          <button onClick={() => go("profile")}>
            <Icon name="settings" />
            <span>الإعدادات</span>
          </button>
        )}
        <button
          className="logout"
          onClick={() => {
            setDrawerOpen(false)
            if (onLogout) onLogout()
            else go("login")
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

export function RoleDashboardLayout({
  role,
  currentUser,
  go,
  onLogout,
  children,
}: {
  role: "employee" | "admin"
  currentUser: CurrentUser
  go: (route: Route) => void
  onLogout: () => void
  children: ReactNode
}) {
  return (
    <AccountLayout
      route={role === "employee" ? "employee-dashboard" : "admin-dashboard"}
      go={go}
      currentUser={currentUser}
      onLogout={onLogout}
      role={role}
    >
      {children}
    </AccountLayout>
  )
}
