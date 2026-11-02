import { useState } from "react"
import type { FormEvent } from "react"
import { adminUser, employeeUser } from "../../data/mockData"
import { Button, Input } from "../../components/ui"
import { AuthLayout } from "./AuthLayout"
import type { AlertState, CitizenAccount, CurrentUser, Role, Route } from "../../types"

export function LoginPage({
  go,
  onLogin,
  showAlert,
  citizenAccount,
}: {
  go: (route: Route) => void
  onLogin: (role: Role, user: CurrentUser) => void
  showAlert: (alert: AlertState) => void
  citizenAccount: CitizenAccount
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!email) {
      showAlert({
        type: "warning",
        title: "بيانات ناقصة",
        message: "من فضلك أدخل البريد الإلكتروني أو رقم الهاتف.",
      })
      return
    }
    if (!password) {
      showAlert({
        type: "warning",
        title: "بيانات ناقصة",
        message: "من فضلك أدخل كلمة المرور.",
      })
      return
    }
    const identity = email.trim().toLowerCase()
    let loginResult: { role: Role user: CurrentUser } | null = null
    if (identity === "employee@khadmaty.com" && password === "Employee@123") {
      loginResult = { role: "employee", user: employeeUser }
    } else if (identity === "admin@khadmaty.com" && password === "Admin@123") {
      loginResult = { role: "admin", user: adminUser }
    } else if (
      (identity === citizenAccount.email.toLowerCase() ||
        identity === citizenAccount.phone) &&
      password === citizenAccount.password
    ) {
      loginResult = { role: "citizen", user: citizenAccount }
    }
    if (!loginResult) {
      showAlert({
        type: "error",
        title: "فشل تسجيل الدخول",
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      })
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      onLogin(loginResult.role, loginResult.user)
    }, 700)
  }
  return (
    <AuthLayout>
      <div className="auth-title">تسجيل الدخول</div>
      <form className="auth-card card" onSubmit={submit}>
        <Input
          label="البريد الإلكتروني أو رقم الهاتف"
          icon="mail"
          value={email}
          onChange={setEmail}
          error={
            submitted && !email
              ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف"
              : undefined
          }
        />
        <Input
          label="كلمة المرور"
          type="password"
          icon="lock"
          value={password}
          onChange={setPassword}
          error={submitted && !password ? "يرجى إدخال كلمة المرور" : undefined}
        />
        <div className="form-between">
          <label className="check-label">
            <input type="checkbox" /> تذكرني على هذا الجهاز
          </label>
          <button
            className="text-link"
            type="button"
            onClick={() => go("forgot")}
          >
            نسيت كلمة المرور؟
          </button>
        </div>
        <Button type="submit" loading={loading} className="full">
          تسجيل الدخول
        </Button>
        <div className="login-hint">
          <b>بيانات الدخول التجريبية</b>
          <span>مواطن</span>
          <span className="technical-value">{citizenAccount.email}</span>
          <span className="technical-value">{citizenAccount.password}</span>
          <span>موظف الحي</span>
          <span className="technical-value">employee@khadmaty.com</span>
          <span className="technical-value">Employee@123</span>
          <span>مدير النظام</span>
          <span className="technical-value">admin@khadmaty.com</span>
          <span className="technical-value">Admin@123</span>
        </div>
      </form>
      <div className="auth-links">
        ليس لديك حساب بعد؟{" "}
        <button onClick={() => go("register")}>إنشاء حساب جديد</button>
        <span>أو</span>
        <button onClick={() => go("home")}>المتابعة كزائر</button>
      </div>
      <div className="citizen-only-note">
        إنشاء الحساب متاح للمواطنين فقط. حسابات الموظفين والإدارة محددة مسبقاً.
      </div>
    </AuthLayout>
  )
}
