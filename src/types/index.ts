export type Route = "home" | "login" | "register" | "forgot" | "dashboard" | "employee-dashboard" | "employee-complaints" | "employee-new" | "employee-review" | "employee-progress" | "employee-clarification" | "employee-resolved" | "employee-complaint" | "employee-notifications" | "employee-profile" | "admin-dashboard" | "admin-complaints" | "admin-citizens" | "admin-employees" | "admin-departments" | "admin-offices" | "admin-analytics" | "admin-map" | "admin-notifications" | "admin-settings" | "admin-profile" | "admin-complaint" | "reports" | "report-details" | "submit" | "submit-success" | "track" | "offices" | "office-details" | "assistant" | "about" | "profile" | "notifications" | "favorites" | "faq" | "search" | "emergency"

export type Language = "ar" | "en"
export type Theme = "light" | "dark"
export type AlertType = "success" | "error" | "warning" | "info" | "confirmation"
export type Role = "citizen" | "employee" | "admin"

export type CurrentUser = {
  name: string
  email: string
  phone: string
}

export type CitizenAccount = CurrentUser & {
  password: string
}

export type ComplaintStatus = "جديد" | "تم استلام البلاغ" | "قيد المراجعة" | "تم تعيين البلاغ" | "جاري التنفيذ" | "يحتاج إلى توضيح" | "تم الحل" | "مغلق" | "مرفوض" | "ملغي" | "أعيد فتحه"

export type ComplaintTimelineEntry = {
  label: string
  date: string
  note?: string
}

export type ComplaintRecord = {
  id: string
  title: string
  category: string
  description: string
  location: string
  date: string
  priority: "عالية" | "متوسطة" | "منخفضة"
  status: ComplaintStatus
  department: string
  assignedEmployee: string
  citizen: CurrentUser
  image?: string
  timeline: ComplaintTimelineEntry[]
}

export type WorkspaceNotification = {
  id: string
  title: string
  message: string
  complaintId: string
  read: boolean
}

export type AlertState = {
  type: AlertType
  title: string
  message: string
  primaryLabel?: string
  secondaryLabel?: string
  onPrimary?: () => void
  onSecondary?: () => void
}

export type IconName = "search" | "moon" | "user" | "bell" | "heart" | "file" | "pin" | "clock" | "phone" | "mail" | "lock" | "eye" | "upload" | "send" | "menu" | "check" | "arrow" | "office" | "bot" | "home" | "settings" | "logout" | "plus" | "mic"

export type WorkspaceSidebarItem = {
  label: string
  icon: IconName
  route: Route
  child?: boolean
  section?: "complaints"
}