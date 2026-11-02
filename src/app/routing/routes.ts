import type { Route } from "../../types"

export const routePaths: Record<Route, string> = {
  home: "/",
  login: "/login",
  register: "/register",
  forgot: "/forgot-password",
  dashboard: "/dashboard",
  "employee-dashboard": "/employee/dashboard",
  "employee-complaints": "/employee/complaints",
  "employee-new": "/employee/complaints/new",
  "employee-review": "/employee/complaints/review",
  "employee-progress": "/employee/complaints/in-progress",
  "employee-clarification": "/employee/complaints/clarification",
  "employee-resolved": "/employee/complaints/resolved",
  "employee-complaint": "/employee/complaints/KH-2026-00125",
  "employee-notifications": "/employee/notifications",
  "employee-profile": "/employee/profile",
  "admin-dashboard": "/admin/dashboard",
  "admin-complaints": "/admin/complaints",
  "admin-citizens": "/admin/citizens",
  "admin-employees": "/admin/employees",
  "admin-departments": "/admin/departments",
  "admin-offices": "/admin/offices",
  "admin-analytics": "/admin/analytics",
  "admin-map": "/admin/map",
  "admin-notifications": "/admin/notifications",
  "admin-settings": "/admin/settings",
  "admin-profile": "/admin/profile",
  "admin-complaint": "/admin/complaints/KH-2026-00125",
  reports: "/services",
  "report-details": "/services/KH-2026-00125",
  submit: "/report",
  "submit-success": "/report/success",
  track: "/track",
  offices: "/offices",
  "office-details": "/offices/main-center",
  assistant: "/assistant",
  about: "/about",
  profile: "/profile",
  notifications: "/notifications",
  favorites: "/favorites",
  faq: "/faq",
  search: "/search",
  emergency: "/emergency",
}

export function routeFromLocation(): Route {
  const legacyHash = window.location.hash.replace("#/", "")
  if (legacyHash && legacyHash in routePaths) return legacyHash as Route
  const path = window.location.pathname.replace(/\/+$/, "") || "/"
  const exactMatch = Object.entries(routePaths).find(
    ([, routePath]) => routePath === path,
  )
  if (exactMatch) return exactMatch[0] as Route
  if (/^\/employee\/complaints\/[^/]+$/.test(path)) return "employee-complaint"
  if (/^\/admin\/complaints\/[^/]+$/.test(path)) return "admin-complaint"
  if (/^\/services\/[^/]+$/.test(path)) return "report-details"
  if (/^\/offices\/[^/]+$/.test(path)) return "office-details"
  return "home"
}
