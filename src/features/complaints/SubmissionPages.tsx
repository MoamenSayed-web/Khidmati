import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { categoryData } from "../../data/catalogs"
import {
  Button,
  Card,
  Icon,
  Input,
  Select,
  StatusBadge,
  TextArea,
} from "../../components/ui"
import type { AlertState, ComplaintRecord, CurrentUser, Route } from "../../types"

export function ComplaintSwitcher({
  active,
  go,
}: {
  active: "submit" | "track"
  go: (route: Route) => void
}) {
  return (
    <div className="segmented" role="tablist" aria-label="التقديم والمتابعة">
      <button
        className={active === "submit" ? "active" : ""}
        aria-selected={active === "submit"}
        role="tab"
        onClick={() => go("submit")}
      >
        تقديم بلاغ للحي
      </button>
      <button
        className={active === "track" ? "active" : ""}
        aria-selected={active === "track"}
        role="tab"
        onClick={() => go("track")}
      >
        متابعة بلاغ سابق
      </button>
    </div>
  )
}

export function SubmitPage({
  go,
  selectedCategory,
  showAlert,
  onSubmitted,
  currentUser,
}: {
  go: (route: Route) => void
  selectedCategory: string
  showAlert: (alert: AlertState) => void
  onSubmitted: (complaint: ComplaintRecord) => void
  currentUser: CurrentUser
}) {
  const [category, setCategory] = useState(selectedCategory)
  const [department, setDepartment] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [recordingError, setRecordingError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const invalidPhone = !!phone && !/^01\d{9}$/.test(phone)
  const invalidEmail = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  useEffect(() => {
    return () => {
      audioStreamRef.current?.getTracks().forEach((track) => track.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError("التسجيل الصوتي غير مدعوم في هذا المتصفح.")
      return
    }
    try {
      setRecordingError("")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioStreamRef.current = stream
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size) audioChunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        setAudioUrl(URL.createObjectURL(audioBlob))
        stream.getTracks().forEach((track) => track.stop())
        audioStreamRef.current = null
      }
      recorder.start()
      setIsRecording(true)
    } catch {
      setRecordingError(
        "تعذر الوصول إلى الميكروفون. اسمح باستخدامه ثم حاول مرة أخرى.",
      )
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    const invalid =
      !category ||
      !department ||
      !title ||
      !location ||
      !description ||
      !phone ||
      invalidPhone ||
      invalidEmail ||
      !!uploadError
    if (invalid) {
      showAlert({
        type: "warning",
        title: "بيانات ناقصة",
        message: "يرجى استكمال البيانات المطلوبة قبل إرسال البلاغ.",
      })
      return
    }
    showAlert({
      type: "confirmation",
      title: "تأكيد إرسال البلاغ",
      message: "هل أنت متأكد من إرسال البلاغ؟",
      primaryLabel: "إرسال البلاغ",
      secondaryLabel: "مراجعة البيانات",
      onPrimary: () => {
        setLoading(true)
        window.setTimeout(() => {
          setLoading(false)
          const generatedId = `KH-2026-${String(Date.now()).slice(-5)}`
          onSubmitted({
            id: generatedId,
            title,
            category,
            description,
            location,
            date: "2026/10/01 — 09:30",
            priority: "متوسطة",
            status: "تم استلام البلاغ",
            department,
            assignedEmployee: "أحمد محمد",
            citizen: currentUser,
            timeline: [{ label: "تم إرسال البلاغ", date: "09:30" }],
          })
          go("submit-success")
        }, 850)
      },
    })
  }
  return (
    <main className="form-page page-shell">
      <ComplaintSwitcher active="submit" go={go} />
      <form className="card complaint-form" onSubmit={submit}>
        <div className="form-grid">
          <Select
            label="قسم البلاغ بالحي"
            value={category}
            onChange={setCategory}
            error={
              submitted && !category ? "يرجى اختيار قسم البلاغ" : undefined
            }
          >
            <option value="">اختر القسم المختص</option>
            {categoryData.map(([title]) => (
              <option key={title}>{title}</option>
            ))}
          </Select>
          <Select
            label="إدارة الحي المختصة"
            value={department}
            onChange={setDepartment}
            error={
              submitted && !department ? "يرجى اختيار إدارة الحي" : undefined
            }
          >
            <option value="">اختر إدارة الحي المعنية</option>
            <option>إدارة النظافة والإشغالات</option>
            <option>إدارة الطرق والإنارة</option>
          </Select>
        </div>
        <Input
          label="عنوان المشكلة بالحي بالتفصيل"
          placeholder="مثال: تراكم قمامة أمام مدرسة النصر"
          value={title}
          onChange={setTitle}
          error={submitted && !title ? "عنوان المشكلة مطلوب" : undefined}
        />
        <Input
          label="الموقع التفصيلي للمشكلة"
          icon="pin"
          placeholder="اسم الشارع وأقرب علامة مميزة"
          value={location}
          onChange={setLocation}
          error={submitted && !location ? "موقع المشكلة مطلوب" : undefined}
        />
        <TextArea
          label="تفاصيل المشكلة والملاحظات الميدانية"
          placeholder="اشرح تفاصيل المشكلة وما يحتاجه فريق الحي للمعاينة..."
          value={description}
          onChange={setDescription}
          error={
            submitted && !description
              ? "يرجى كتابة وصف واضح للمشكلة"
              : undefined
          }
        />
        <div className={`voice-recorder ${isRecording ? "is-recording" : ""}`}>
          <span className="voice-recorder-icon">
            <Icon name="mic" size={20} />
          </span>
          <div className="voice-recorder-copy">
            <b>اضغط لتسجيل صوت المشكلة</b>
            <span>
              {isRecording
                ? "جارٍ التسجيل الآن، اضغط إيقاف عند الانتهاء."
                : "سجّل وصفاً مختصراً للمشكلة ليساعد فريق الحي."}
            </span>
          </div>
          <Button
            type="button"
            variant={isRecording ? "danger" : "primary"}
            icon="mic"
            onClick={toggleRecording}
          >
            {isRecording ? "إيقاف التسجيل" : "ابدأ التسجيل"}
          </Button>
        </div>
        {recordingError && (
          <span className="field-message voice-message">{recordingError}</span>
        )}
        {audioUrl && (
          <div className="recording-preview">
            <span>تم حفظ التسجيل الصوتي</span>
            <audio controls src={audioUrl}>
              متصفحك لا يدعم تشغيل التسجيل الصوتي.
            </audio>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                URL.revokeObjectURL(audioUrl)
                setAudioUrl("")
              }}
            >
              حذف التسجيل
            </button>
          </div>
        )}
        <label className={`upload-area ${uploadError ? "upload-error" : ""}`}>
          <span className="icon-box">
            <Icon name="upload" />
          </span>
          <b>اضغط لرفع الملفات الداعمة للشكوى</b>
          <span>صورة بصيغة JPG أو PNG — بحد أقصى 5MB</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return setUploadError("")
              if (!file.type.startsWith("image/"))
                return setUploadError("الملف المرفوع يجب أن يكون صورة")
              if (file.size > 5 * 1024 * 1024)
                return setUploadError("حجم الصورة يتجاوز 5MB")
              setUploadError("")
            }}
          />
          {uploadError && <span className="field-message">{uploadError}</span>}
        </label>
        <div className="form-grid">
          <Input
            label="رقم الهاتف"
            icon="phone"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={setPhone}
            error={
              invalidPhone
                ? "يرجى إدخال رقم هاتف مصري صحيح"
                : submitted && !phone
                  ? "رقم الهاتف مطلوب"
                  : undefined
            }
          />
          <Input
            label="البريد الإلكتروني"
            icon="mail"
            placeholder="name@example.com"
            value={email}
            onChange={setEmail}
            error={invalidEmail ? "يرجى إدخال بريد إلكتروني صحيح" : undefined}
          />
        </div>
        <Button type="submit" loading={loading} className="full">
          إرسال الشكوى
        </Button>
      </form>
    </main>
  )
}

export function SubmitSuccessPage({
  go,
  complaintId,
}: {
  go: (route: Route) => void
  complaintId: string
}) {
  return (
    <main className="state-page page-shell">
      <Card className="success-panel">
        <span className="success-icon">
          <Icon name="check" size={38} />
        </span>
        <div className="auth-title small">تم إرسال البلاغ بنجاح</div>
        <p>تم استلام بلاغك وسيتم مراجعته من الجهة المختصة.</p>
        <div className="success-details">
          <span>
            رقم البلاغ<b className="technical-value">{complaintId}</b>
          </span>
          <span>
            القسم<b>النظافة وتراكم القمامة</b>
          </span>
          <span>
            الموقع<b>شارع الجمهورية</b>
          </span>
          <span>
            تاريخ التقديم<b>اليوم، 11:30 ص</b>
          </span>
          <span>
            الحالة الحالية
            <StatusBadge status="تم استلام البلاغ" />
          </span>
        </div>
        <div className="action-row centered">
          <Button onClick={() => go("track")}>متابعة حالة البلاغ</Button>
          <Button variant="secondary" onClick={() => go("home")}>
            العودة للرئيسية
          </Button>
        </div>
      </Card>
    </main>
  )
}
