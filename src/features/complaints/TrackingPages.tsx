import { useState } from "react"
import { initialComplaint } from "../../data/mockData"
import { reportData } from "../../data/catalogs"
import { Hero, ReportCard, SectionTitle } from "../../components/shared"
import { ComplaintSwitcher } from "./SubmissionPages"
import {
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  StatusBadge,
  TextArea,
} from "../../components/ui"
import type { AlertState, ComplaintRecord, Route } from "../../types"

export function TrackPage({
  go,
  showAlert,
  complaints,
}: {
  go: (route: Route) => void
  showAlert: (alert: AlertState) => void
  complaints: ComplaintRecord[]
}) {
  const [number, setNumber] = useState("")
  const [contact, setContact] = useState("")
  const [searched, setSearched] = useState(false)
  const resultComplaint = complaints.find(
    (complaint) =>
      complaint.id === number.trim().toUpperCase() &&
      [complaint.citizen.phone, complaint.citizen.email].includes(
        contact.trim(),
      ),
  )
  const searchReport = () => {
    if (!number.trim() || !contact.trim()) {
      showAlert({
        type: "warning",
        title: "بيانات ناقصة",
        message: "من فضلك أدخل جميع البيانات المطلوبة.",
      })
      return
    }
    const normalizedId = number.trim().toUpperCase()
    const validIdFormat = /^KH-\d{4}-\d{5}$/.test(normalizedId)
    const validContactFormat =
      /^01\d{9}$/.test(contact.trim()) ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())
    if (!validIdFormat || !validContactFormat) {
      setSearched(false)
      showAlert({
        type: "error",
        title: "بيانات غير صحيحة",
        message: "يرجى التأكد من رقم البلاغ وبيانات التواصل.",
      })
      return
    }
    const match = complaints.find(
      (complaint) =>
        complaint.id === normalizedId &&
        [complaint.citizen.phone, complaint.citizen.email].includes(
          contact.trim(),
        ),
    )
    if (!match) {
      setSearched(false)
      showAlert({
        type: "error",
        title: "لم يتم العثور على البلاغ",
        message: "تأكد من رقم البلاغ وبيانات التواصل ثم حاول مرة أخرى.",
      })
      return
    }
    setSearched(true)
  }
  return (
    <>
      <Hero
        title="تتبع حالة ومسار بلاغ الحي"
        text="أدخل رقم البلاغ وبيانات التواصل لمتابعة مراحل المعاينة والإجراءات والتأكد من الحل ضمن مهلة 72 ساعة"
        compact
      />
      <main className="page-shell narrow">
        <ComplaintSwitcher active="track" go={go} />
        {!searched && (
          <Card className="track-entry">
            <Input
              label="رقم البلاغ"
              value={number}
              onChange={setNumber}
              placeholder="KH-2026-00125"
              technical
            />
            <Input
              label="رقم الهاتف أو البريد الإلكتروني"
              value={contact}
              onChange={setContact}
            />
            <Button className="full" onClick={searchReport}>
              متابعة البلاغ
            </Button>
          </Card>
        )}
        {searched && resultComplaint && (
          <>
            <Card className="summary-strip">
              <StatusBadge status={resultComplaint.status} />
              <span>
                رقم البلاغ<b className="technical-value">{number}</b>
              </span>
            </Card>
            <Card className="detail-card">
              <div className="card-title">{resultComplaint.title}</div>
              <p>{resultComplaint.description}</p>
              <div className="details-grid">
                <span>
                  القسم<b>{resultComplaint.category}</b>
                </span>
                <span>
                  الموقع<b>{resultComplaint.location}</b>
                </span>
                <span>
                  تاريخ التقديم
                  <b className="technical-value">{resultComplaint.date}</b>
                </span>
                <span>
                  الإدارة المسؤولة<b>{resultComplaint.department}</b>
                </span>
              </div>
              <Button variant="secondary" onClick={() => go("report-details")}>
                عرض تفاصيل البلاغ
              </Button>
            </Card>
            <SharedComplaintTimeline complaint={resultComplaint} />
          </>
        )}
      </main>
    </>
  )
}

export function Timeline() {
  const steps = [
    ["تم الاستلام", true],
    ["قيد المراجعة", true],
    ["تم تحويله للجهة المختصة", true],
    ["جاري التنفيذ", false],
    ["تم الحل", false],
    ["مغلق", false],
  ]
  return (
    <Card className="timeline">
      <div className="card-title">سجل ومسار الشكوى</div>
      {steps.map(([label, done]) => (
        <div
          className={`timeline-step ${done ? "done" : ""}`}
          key={String(label)}
        >
          <span>{done ? <Icon name="check" size={15} /> : ""}</span>
          <div>
            <b>{label}</b>
            <small>{done ? "تم تحديث الحالة" : "في انتظار الإجراء"}</small>
          </div>
        </div>
      ))}
    </Card>
  )
}

export function SharedComplaintTimeline({
  complaint,
}: {
  complaint: ComplaintRecord
}) {
  return (
    <Card className="timeline">
      <div className="card-title">السجل الزمني للبلاغ</div>
      {complaint.timeline.map((entry, index) => (
        <div className="timeline-record" key={`${entry.label}-${index}`}>
          <time>{entry.date}</time>
          <span />
          <div>
            <b>{entry.label}</b>
            {entry.note && <p>{entry.note}</p>}
          </div>
        </div>
      ))}
    </Card>
  )
}

export function ReportDetailsPage({
  go,
  complaint = initialComplaint,
  canClarify = false,
  onClarification,
  toast,
}: {
  go: (route: Route) => void
  complaint?: ComplaintRecord
  canClarify?: boolean
  onClarification?: (text: string) => void
  toast: (text: string) => void
}) {
  const [clarification, setClarification] = useState("")
  return (
    <main className="page-shell report-detail-page">
      <Button variant="ghost" icon="arrow" onClick={() => go("reports")}>
        العودة للبلاغات
      </Button>
      <Card className="report-summary">
        <div>
          <span className="category-label">{complaint.category}</span>
          <div className="page-title">{complaint.title}</div>
          <code>{complaint.id}</code>
        </div>
        <StatusBadge status={complaint.status} />
      </Card>
      <div className="details-layout">
        <Card className="detail-card">
          <div className="card-title">تفاصيل البلاغ</div>
          <div className="details-grid">
            <span>
              تاريخ البلاغ<b>{complaint.date}</b>
            </span>
            <span>
              الموقع<b>{complaint.location}</b>
            </span>
            <span>
              الإدارة المسؤولة<b>{complaint.department}</b>
            </span>
            <span>
              القسم<b>{complaint.category}</b>
            </span>
            <span>
              الأولوية<b className="priority-high">{complaint.priority}</b>
            </span>
          </div>
          <div className="description">
            <b>وصف المشكلة</b>
            <p>{complaint.description}</p>
          </div>
          <div className="uploaded-image">
            {complaint.image ? (
              <img src={complaint.image} alt="صورة مرفقة توضح موقع البلاغ" />
            ) : (
              <span>لا توجد صورة مرفقة</span>
            )}
          </div>
        </Card>
        <SharedComplaintTimeline complaint={complaint} />
      </div>
      {canClarify && complaint.status === "يحتاج إلى توضيح" && (
        <Card className="clarification-reply">
          <div className="card-title">
            الجهة المختصة تحتاج إلى معلومات إضافية
          </div>
          <p>
            أضف المعلومات المطلوبة حتى يتمكن الموظف المختص من استكمال مراجعة
            البلاغ.
          </p>
          <TextArea
            label="المعلومات الإضافية"
            placeholder="اكتب ردك والمعلومات الإضافية هنا..."
            value={clarification}
            onChange={setClarification}
          />
          <Button
            onClick={() => {
              if (!clarification.trim()) return
              onClarification?.(clarification)
              setClarification("")
            }}
          >
            إرسال المعلومات
          </Button>
        </Card>
      )}
      <div className="action-row">
        <Button onClick={() => go("track")}>متابعة البلاغ</Button>
        <Button onClick={() => go("submit")}>تقديم بلاغ مشابه</Button>
        <Button
          variant="secondary"
          icon="plus"
          onClick={() =>
            toast("إضافة التعليقات غير متاحة لهذا النوع من البلاغات حالياً")
          }
        >
          إضافة تعليق
        </Button>
        <Button
          variant="secondary"
          icon="upload"
          onClick={() =>
            toast("يمكن إضافة الصور عند تقديم بلاغ جديد أو طلب توضيح")
          }
        >
          إضافة صورة
        </Button>
      </div>
      <SectionTitle
        title="بلاغات مرتبطة"
        text="بلاغات قريبة من نفس الموقع أو التصنيف"
      />
      <div className="reports-preview related-reports">
        {reportData.slice(1).map((report) => (
          <ReportCard key={report.id} report={report} go={go} />
        ))}
      </div>
    </main>
  )
}
