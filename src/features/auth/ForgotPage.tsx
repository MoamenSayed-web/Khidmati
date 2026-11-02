import { useState } from "react"
import { Button, Card, Icon, Input, VerificationCode } from "../../components/ui"
import { AuthLayout } from "./AuthLayout"
import type { AlertState, Route } from "../../types"

export function ForgotPage({
  go,
  showAlert,
}: {
  go: (route: Route) => void
  showAlert: (alert: AlertState) => void
}) {
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const titles = [
    "نسيت كلمة المرور؟",
    "أدخل رمز التحقق",
    "أنشئ كلمة مرور جديدة",
    "تم تغيير كلمة المرور بنجاح",
  ]
  return (
    <AuthLayout>
      <div className="auth-title small">{titles[step - 1]}</div>
      <Card className="auth-card forgot-card">
        {step === 1 && (
          <>
            <p>أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل إليك رمز التحقق.</p>
            <Input
              label="البريد الإلكتروني أو رقم الهاتف"
              icon="mail"
              value={identifier}
              onChange={setIdentifier}
            />
            <Button
              className="full"
              onClick={() => {
                if (!identifier) {
                  showAlert({
                    type: "warning",
                    title: "بيانات ناقصة",
                    message: "من فضلك أدخل البريد الإلكتروني أو رقم الهاتف.",
                  })
                  return
                }
                setStep(2)
              }}
            >
              إرسال رمز التحقق
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <p>أرسلنا رمزاً مكوناً من 6 أرقام. أدخله للمتابعة.</p>
            <VerificationCode value={code} onChange={setCode} />
            <Button
              className="full"
              onClick={() => {
                if (!/^\d{6}$/.test(code)) {
                  showAlert({
                    type: "error",
                    title: "بيانات غير صحيحة",
                    message: "يرجى إدخال رمز تحقق صحيح مكون من 6 أرقام.",
                  })
                  return
                }
                setStep(3)
              }}
            >
              تحقق من الرمز
            </Button>
          </>
        )}
        {step === 3 && (
          <>
            <Input
              label="كلمة المرور الجديدة"
              type="password"
              icon="lock"
              value={password}
              onChange={setPassword}
            />
            <Input
              label="تأكيد كلمة المرور"
              type="password"
              icon="lock"
              value={confirm}
              onChange={setConfirm}
              error={
                confirm && password !== confirm
                  ? "كلمتا المرور غير متطابقتين."
                  : undefined
              }
            />
            <Button
              className="full"
              onClick={() => {
                if (password.length < 8 || password !== confirm) {
                  showAlert({
                    type: "error",
                    title: "بيانات غير صحيحة",
                    message:
                      password !== confirm
                        ? "كلمتا المرور غير متطابقتين."
                        : "يجب ألا تقل كلمة المرور عن 8 أحرف.",
                  })
                  return
                }
                setStep(4)
              }}
            >
              حفظ كلمة المرور
            </Button>
          </>
        )}
        {step === 4 && (
          <div className="success-state">
            <span className="success-icon">
              <Icon name="check" size={34} />
            </span>
            <p>يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>
            <Button onClick={() => go("login")}>تسجيل الدخول</Button>
          </div>
        )}
      </Card>
      {step < 4 && (
        <div className="steps">
          {[1, 2, 3, 4].map((item) => (
            <span key={item} className={item <= step ? "done" : ""} />
          ))}
        </div>
      )}
    </AuthLayout>
  )
}
