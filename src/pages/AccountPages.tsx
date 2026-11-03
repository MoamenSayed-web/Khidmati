import { useState } from "react"
import type { ReactNode } from "react"
import { AccountLayout, CitizenLayout } from "../layouts"
import { SectionTitle } from "../components/shared"
import { Button, Card, Icon, Input, Modal, Select, StatusBadge } from "../components/ui"
import type { AlertState, CurrentUser, Role, Route, WorkspaceNotification } from "../types"

function AccountPageLayout({
  route,
  go,
  children,
  currentUser,
  onLogout,
  role,
}: {
  route: Route
  go: (route: Route) => void
  children: ReactNode
  currentUser: CurrentUser
  onLogout: () => void
  role: Role
}) {
  if (role === "citizen")
    return (
      <CitizenLayout route={route} go={go} currentUser={currentUser} onLogout={onLogout}>
        {children}
      </CitizenLayout>
    )
  return (
    <AccountLayout route={route} go={go} currentUser={currentUser} onLogout={onLogout} role={role}>
      {children}
    </AccountLayout>
  )
}


export function ProfilePage({
  go,
  toast,
  currentUser,
  onUpdateUser,
  onLogout,
  showAlert,
  role,
  activeRoute = "profile",
}: {
  go: (route: Route) => void
  toast: (text: string) => void
  currentUser: CurrentUser
  onUpdateUser: (user: CurrentUser) => void
  onLogout: () => void
  showAlert: (alert: AlertState) => void
  role: Role
  activeRoute?: Route
}) {
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [profile, setProfile] = useState(currentUser)
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  })
  const profileEmailInvalid =
    !profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
  const profilePhoneInvalid = !profile.phone || !/^01\d{9}$/.test(profile.phone)
  return (
    <>
      <AccountPageLayout
        route={activeRoute}
        go={go}
        currentUser={currentUser}
        onLogout={onLogout}
        role={role}
      >
        <div className="page-title">حسابي</div>
        <Card className="profile-card">
          <span className="profile-avatar">
            <Icon name="user" size={34} />
          </span>
          <SectionTitle title="المعلومات الشخصية" />
          <Input
            label="الاسم الكامل"
            value={profile.name}
            onChange={(name) => setProfile({ ...profile, name })}
            error={!profile.name ? "هذا الحقل مطلوب." : undefined}
          />
          <Input
            label="البريد الإلكتروني"
            value={profile.email}
            onChange={(email) => setProfile({ ...profile, email })}
            error={
              profileEmailInvalid ? "يرجى إدخال بريد إلكتروني صحيح." : undefined
            }
          />
          <Input
            label="رقم الهاتف المحمول"
            value={profile.phone}
            onChange={(phone) => setProfile({ ...profile, phone })}
            error={
              profilePhoneInvalid ? "يرجى إدخال رقم هاتف صحيح." : undefined
            }
          />
          <Select label="اللغة">
            <option>العربية</option>
            <option>English</option>
          </Select>
          <div className="settings-row">
            <span>الإشعارات</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span />
            </label>
          </div>
          <Button variant="secondary" onClick={() => setPasswordOpen(true)}>
            تغيير كلمة المرور
          </Button>
          <Button
            className="full"
            onClick={() => {
              if (!profile.name || profileEmailInvalid || profilePhoneInvalid) {
                showAlert({
                  type: "warning",
                  title: "بيانات ناقصة",
                  message: "من فضلك أدخل جميع البيانات المطلوبة.",
                })
                return
              }
              onUpdateUser(profile)
              showAlert({
                type: "success",
                title: "تم حفظ التغييرات",
                message: "تم تحديث بيانات حسابك بنجاح.",
              })
            }}
          >
            حفظ التغييرات
          </Button>
          <Button variant="danger" onClick={onLogout}>
            تسجيل الخروج
          </Button>
        </Card>
      </AccountPageLayout>
      <Modal
        open={passwordOpen}
        title="تغيير كلمة المرور"
        onClose={() => setPasswordOpen(false)}
      >
        <div className="modal-form">
          <Input
            label="كلمة المرور الحالية"
            type="password"
            icon="lock"
            value={passwords.current}
            onChange={(current) => setPasswords({ ...passwords, current })}
          />
          <Input
            label="كلمة المرور الجديدة"
            type="password"
            icon="lock"
            value={passwords.next}
            onChange={(next) => setPasswords({ ...passwords, next })}
          />
          <Input
            label="تأكيد كلمة المرور"
            type="password"
            icon="lock"
            value={passwords.confirm}
            onChange={(confirm) => setPasswords({ ...passwords, confirm })}
            error={
              passwords.confirm && passwords.next !== passwords.confirm
                ? "كلمتا المرور غير متطابقتين."
                : undefined
            }
          />
          <div className="action-row">
            <Button
              onClick={() => {
                if (
                  !passwords.current ||
                  !passwords.next ||
                  !passwords.confirm
                ) {
                  showAlert({
                    type: "warning",
                    title: "بيانات ناقصة",
                    message: "من فضلك أدخل جميع البيانات المطلوبة.",
                  })
                  return
                }
                if (passwords.next !== passwords.confirm) {
                  showAlert({
                    type: "error",
                    title: "بيانات غير صحيحة",
                    message: "كلمتا المرور غير متطابقتين.",
                  })
                  return
                }
                setPasswordOpen(false)
                setPasswords({ current: "", next: "", confirm: "" })
                toast("تم تغيير كلمة المرور بنجاح")
              }}
            >
              حفظ كلمة المرور
            </Button>
            <Button variant="ghost" onClick={() => setPasswordOpen(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function NotificationsPage({
  go,
  currentUser,
  onLogout,
  role,
  notices,
  onMarkAll,
  onOpenComplaint,
  activeRoute = "notifications",
}: {
  go: (route: Route) => void
  currentUser: CurrentUser
  onLogout: () => void
  role: Role
  notices: WorkspaceNotification[]
  onMarkAll: () => void
  onOpenComplaint: (id: string) => void
  activeRoute?: Route
}) {
  return (
    <AccountPageLayout
      route={activeRoute}
      go={go}
      currentUser={currentUser}
      onLogout={onLogout}
      role={role}
    >
      <SectionTitle
        title="الإشعارات والتنبيهات"
        action={
          <Button variant="secondary" onClick={onMarkAll}>
            تحديد الكل كمقروء
          </Button>
        }
      />
      <div className="notification-list">
        {notices.map((notice, index) => (
          <Card
            key={notice.id}
            className={`notification notification-clickable ${
              notice.read ? "read" : "unread"
            }`}
            onClick={() => onOpenComplaint(notice.complaintId)}
          >
            <span className="icon-box">
              <Icon name="bell" />
            </span>
            <div>
              <div className="card-title">{notice.title}</div>
              <p>{notice.message}</p>
              <small>اليوم، {11 + index}:30</small>
            </div>
          </Card>
        ))}
      </div>
    </AccountPageLayout>
  )
}
