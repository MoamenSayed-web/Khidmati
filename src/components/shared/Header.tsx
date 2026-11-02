import { useState } from "react"
import { navItems } from "./navigation"
import { Button, Icon } from "../ui"
import type { CurrentUser, Language, Role, Route, Theme } from "../../types"

export function Header({
  route,
  go,
  language,
  theme,
  isLoggedIn,
  currentUser,
  role,
  onToggleLanguage,
  onToggleTheme,
  onLogout,
}: {
  route: Route
  go: (route: Route) => void
  language: Language
  theme: Theme
  isLoggedIn: boolean
  currentUser: CurrentUser | null
  role: Role | null
  onToggleLanguage: () => void
  onToggleTheme: () => void
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dashboardRoute: Route =
    role === "employee"
      ? "employee-dashboard"
      : role === "admin"
        ? "admin-dashboard"
        : "dashboard"
  const roleLabel =
    role === "employee"
      ? "موظف الحي"
      : role === "admin"
        ? "مدير النظام"
        : "مواطن"
  return (
    <header className="main-header" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="header-inner">
        <button className="brand" onClick={() => go("home")}>
          خدمَتي
        </button>
        <nav className={`main-nav ${open ? "nav-open" : ""}`}>
          {navItems.map(([label, target]) => (
            <button
              key={target}
              className={route === target ? "active" : ""}
              onClick={() => {
                go(target)
                setOpen(false)
              }}
            >
              {label}
            </button>
          ))}
          {!isLoggedIn && (
            <button
              className="mobile-login-link"
              onClick={() => {
                go("login")
                setOpen(false)
              }}
            >
              <Icon name="lock" size={18} />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </nav>
        <div className="header-tools">
          <button
            className="icon-button"
            onClick={() => go("search")}
            aria-label="البحث"
          >
            <Icon name="search" size={18} />
          </button>
          <button className="language" onClick={onToggleLanguage}>
            {language === "ar" ? "EN" : "ع"}
          </button>
          <button
            className={`icon-button ${theme === "dark" ? "active" : ""}`}
            aria-label="الوضع الليلي"
            onClick={onToggleTheme}
          >
            <Icon name="moon" size={18} />
          </button>
          {!isLoggedIn ? (
            <Button onClick={() => go("login")}>تسجيل الدخول</Button>
          ) : (
            <div className="header-user">
              <button
                className="user-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="user-avatar">
                  <Icon name="user" size={17} />
                </span>
                <span className="user-copy">
                  <span>
                    {language === "ar"
                      ? `مرحباً، ${currentUser?.name}`
                      : `Welcome, ${currentUser?.name}`}
                  </span>
                  <small>{roleLabel}</small>
                </span>
              </button>
              {userMenuOpen && (
                <div className="user-menu">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go(dashboardRoute)
                    }}
                  >
                    لوحة التحكم
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go("reports")
                    }}
                  >
                    {role === "citizen"
                      ? "بلاغاتي"
                      : role === "employee"
                        ? "إدارة البلاغات"
                        : "جميع البلاغات"}
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go("profile")
                    }}
                  >
                    الملف الشخصي
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go("notifications")
                    }}
                  >
                    الإشعارات
                  </button>
                  <button
                    className="logout"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout()
                    }}
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label="القائمة"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </header>
  )
}

export function WorkspaceHeader({
  role,
  currentUser,
  language,
  theme,
  go,
  onToggleLanguage,
  onToggleTheme,
  onLogout,
}: {
  role: "employee" | "admin"
  currentUser: CurrentUser
  language: Language
  theme: Theme
  go: (route: Route) => void
  onToggleLanguage: () => void
  onToggleTheme: () => void
  onLogout: () => void
}) {
  const dashboard =
    role === "employee" ? "employee-dashboard" : "admin-dashboard"
  const notifications =
    role === "employee" ? "employee-notifications" : "admin-notifications"
  const profile = role === "employee" ? "employee-profile" : "admin-profile"
  return (
    <header className="main-header workspace-header">
      <div className="header-inner">
        <button className="brand" onClick={() => go(dashboard)}>
          خدمَتي
        </button>
        <div className="workspace-name">
          <b>
            {role === "employee" ? "مساحة عمل موظف الحي" : "مساحة إدارة المنصة"}
          </b>
          <span>
            {role === "employee" ? "تشغيل البلاغات" : "إدارة ومراقبة النظام"}
          </span>
        </div>
        <nav className="workspace-nav">
          <button onClick={() => go(dashboard)}>لوحة التحكم</button>
          {role === "employee" && (
            <button onClick={() => go("employee-dashboard")}>بلاغاتي</button>
          )}
          {role === "admin" && (
            <button onClick={() => go("admin-dashboard")}>إدارة المنصة</button>
          )}
          <button onClick={() => go(notifications)}>الإشعارات</button>
          <button onClick={() => go(profile)}>الملف الشخصي</button>
        </nav>
        <div className="header-tools">
          <button className="language" onClick={onToggleLanguage}>
            {language === "ar" ? "EN" : "ع"}
          </button>
          <button
            className={`icon-button ${theme === "dark" ? "active" : ""}`}
            onClick={onToggleTheme}
          >
            <Icon name="moon" size={18} />
          </button>
          <button className="workspace-user" onClick={() => go(profile)}>
            <span className="user-avatar">
              <Icon name="user" size={17} />
            </span>
            <span>
              <b>{currentUser.name}</b>
              <small>{role === "employee" ? "موظف الحي" : "مدير النظام"}</small>
            </span>
          </button>
          <button className="icon-button workspace-logout" onClick={onLogout}>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
