import { useState } from "react"
import type { FormEvent } from "react"
import { Button, Input } from "../../components/ui"
import { AuthLayout } from "./AuthLayout"
import type { CitizenAccount, Route } from "../../types"

export function RegisterPage({
  go,
  onRegister,
}: {
  go: (route: Route) => void
  onRegister: (user: CitizenAccount) => void
}) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (key: keyof typeof values) => (value: string) =>
    setValues({ ...values, [key]: value })
  const invalidEmail =
    !!values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
  const invalidPhone = !!values.phone && !/^01\d{9}$/.test(values.phone)
  const mismatch = !!values.confirm && values.password !== values.confirm
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (
      Object.values(values).some((value) => !value) ||
      invalidEmail ||
      invalidPhone ||
      mismatch
    )
      return
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      onRegister({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })
    }, 700)
  }
  return (
    <AuthLayout>
      <div className="auth-title small">إنشاء حساب جديد</div>
      <p className="auth-subtitle">
        انضم إلى خدمَتي — كل خدماتك الحكومية في مكان واحد
      </p>
      <form className="auth-card card register-card" onSubmit={submit}>
        <Input
          label="الاسم الكامل"
          icon="user"
          value={values.name}
          onChange={set("name")}
          error={submitted && !values.name ? "الاسم الكامل مطلوب" : undefined}
        />
        <Input
          label="البريد الإلكتروني"
          icon="mail"
          value={values.email}
          onChange={set("email")}
          error={
            invalidEmail
              ? "يرجى إدخال بريد إلكتروني صحيح"
              : submitted && !values.email
                ? "البريد الإلكتروني مطلوب"
                : undefined
          }
        />
        <Input
          label="رقم الهاتف"
          icon="phone"
          placeholder="01XXXXXXXXX"
          value={values.phone}
          onChange={set("phone")}
          error={invalidPhone ? "رقم الهاتف غير صحيح" : undefined}
        />
        <Input
          label="كلمة المرور"
          type="password"
          icon="lock"
          value={values.password}
          onChange={set("password")}
          error={
            submitted && values.password.length < 8
              ? "يجب ألا تقل كلمة المرور عن 8 أحرف"
              : undefined
          }
        />
        <Input
          label="تأكيد كلمة المرور"
          type="password"
          icon="lock"
          value={values.confirm}
          onChange={set("confirm")}
          error={mismatch ? "كلمتا المرور غير متطابقتين" : undefined}
        />
        <Button type="submit" loading={loading} className="full">
          إنشاء حساب جديد
        </Button>
        <div className="center-text">
          لديك حساب بالفعل؟{" "}
          <button
            className="text-link"
            type="button"
            onClick={() => go("login")}
          >
            تسجيل الدخول
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
