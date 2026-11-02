import { useState } from "react"
import { Button, Card, Icon, Modal, StatusBadge, TextArea } from "../../components/ui"
import type { ComplaintRecord, ComplaintStatus, Route } from "../../types"

export function OperationalComplaintDetails({
  complaint,
  mode,
  go,
  onStatusChange,
  toast,
}: {
  complaint: ComplaintRecord
  mode: "employee" | "admin"
  go: (route: Route) => void
  onStatusChange?: (
    status: ComplaintStatus,
    label: string,
    note?: string,
  ) => void
  toast: (text: string) => void
}) {
  const [clarificationOpen, setClarificationOpen] = useState(false)
  const [clarification, setClarification] = useState("")
  const employeeActions = () => {
    switch (complaint.status) {
      case "جديد":
      case "تم استلام البلاغ":
        return (
          <Button
            onClick={() =>
              onStatusChange?.("قيد المراجعة", "تمت مراجعة وقبول البلاغ")
            }
          >
            قبول البلاغ
          </Button>
        )
      case "قيد المراجعة":
        return (
          <>
            <Button
              onClick={() =>
                onStatusChange?.(
                  "تم تعيين البلاغ",
                  "تم تعيين البلاغ للموظف المختص",
                )
              }
            >
              تعيين البلاغ
            </Button>
            <Button
              variant="secondary"
              onClick={() => setClarificationOpen(true)}
            >
              طلب توضيح
            </Button>
          </>
        )
      case "تم تعيين البلاغ":
        return (
          <>
            <Button
              onClick={() =>
                onStatusChange?.("جاري التنفيذ", "بدأ تنفيذ البلاغ")
              }
            >
              بدء التنفيذ
            </Button>
            <Button
              variant="secondary"
              onClick={() => setClarificationOpen(true)}
            >
              طلب توضيح
            </Button>
          </>
        )
      case "يحتاج إلى توضيح":
        return (
          <Button
            onClick={() =>
              onStatusChange?.("قيد المراجعة", "استؤنفت مراجعة البلاغ")
            }
          >
            استئناف المراجعة
          </Button>
        )
      case "جاري التنفيذ":
        return (
          <Button
            onClick={() =>
              onStatusChange?.("تم الحل", "تم حل البلاغ وإضافة دليل التنفيذ")
            }
          >
            تم الحل
          </Button>
        )
      case "تم الحل":
        return (
          <Button onClick={() => onStatusChange?.("مغلق", "تم إغلاق البلاغ")}>
            إغلاق البلاغ
          </Button>
        )
      case "مغلق":
        return (
          <Button
            variant="secondary"
            onClick={() =>
              onStatusChange?.("أعيد فتحه", "تمت إعادة فتح البلاغ")
            }
          >
            إعادة فتح البلاغ
          </Button>
        )
      case "أعيد فتحه":
        return (
          <Button
            onClick={() =>
              onStatusChange?.(
                "قيد المراجعة",
                "بدأت مراجعة البلاغ بعد إعادة فتحه",
              )
            }
          >
            مراجعة البلاغ
          </Button>
        )
      default:
        return null
    }
  }
  return (
    <div className="workspace-detail">
      <Button
        variant="ghost"
        icon="arrow"
        onClick={() =>
          go(mode === "employee" ? "employee-dashboard" : "admin-dashboard")
        }
      >
        العودة للوحة العمل
      </Button>
      <Card className="workspace-complaint-head">
        <div>
          <span className="category-label">{complaint.category}</span>
          <div className="page-title">{complaint.title}</div>
          <code>{complaint.id}</code>
        </div>
        <div className="complaint-head-status">
          <StatusBadge status={complaint.status} />
          <span>
            الأولوية: <b>{complaint.priority}</b>
          </span>
        </div>
      </Card>
      <div className="workspace-detail-grid">
        <Card className="detail-card">
          <div className="card-title">معلومات البلاغ</div>
          <div className="details-grid">
            <span>
              الموقع<b>{complaint.location}</b>
            </span>
            <span>
              تاريخ التقديم<b>{complaint.date}</b>
            </span>
            <span>
              الإدارة<b>{complaint.department}</b>
            </span>
            <span>
              الموظف المسؤول<b>{complaint.assignedEmployee}</b>
            </span>
          </div>
          <div className="description">
            <b>وصف المشكلة</b>
            <p>{complaint.description}</p>
          </div>
          <div className="uploaded-image">
            {complaint.image ? (
              <img src={complaint.image} alt="صورة البلاغ" />
            ) : (
              <span>لا توجد صورة مرفقة</span>
            )}
          </div>
        </Card>
        {mode === "employee" ? (
          <Card className="citizen-contact-card">
            <div className="card-title">بيانات التواصل اللازمة للبلاغ</div>
            <div className="contact-person">
              <span className="profile-avatar">
                <Icon name="user" size={26} />
              </span>
              <div>
                <b>{complaint.citizen.name}</b>
                <span>صاحب البلاغ</span>
              </div>
            </div>
            <div className="info-line">
              <Icon name="phone" />
              <span>
                رقم الهاتف
                <b className="technical-value">{complaint.citizen.phone}</b>
              </span>
            </div>
            <div className="info-line">
              <Icon name="mail" />
              <span>
                البريد الإلكتروني
                <b className="technical-value">{complaint.citizen.email}</b>
              </span>
            </div>
            <div className="contact-actions">
              <Button
                variant="secondary"
                icon="phone"
                onClick={() => {
                  toast("تم تسجيل محاولة الاتصال بالمواطن")
                  onStatusChange?.(
                    complaint.status,
                    "تم التواصل مع المواطن للحصول على تفاصيل إضافية",
                    "اتصال هاتفي",
                  )
                  window.location.href = `tel:${complaint.citizen.phone}`
                }}
              >
                اتصال بالمواطن
              </Button>
              <Button
                variant="secondary"
                icon="mail"
                onClick={() => {
                  toast("تم تسجيل إرسال بريد إلكتروني للمواطن")
                  onStatusChange?.(
                    complaint.status,
                    "تم التواصل مع المواطن للحصول على تفاصيل إضافية",
                    "بريد إلكتروني",
                  )
                  window.location.href = `mailto:${complaint.citizen.email}?subject=${complaint.id}`
                }}
              >
                إرسال بريد إلكتروني
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="citizen-contact-card">
            <div className="card-title">بيانات المتابعة الإدارية</div>
            <div className="info-line">
              <Icon name="office" />
              <span>
                الإدارة المسؤولة<b>{complaint.department}</b>
              </span>
            </div>
            <div className="info-line">
              <Icon name="user" />
              <span>
                الموظف المسند إليه<b>{complaint.assignedEmployee}</b>
              </span>
            </div>
            <div className="info-line">
              <Icon name="clock" />
              <span>
                تاريخ التقديم<b>{complaint.date}</b>
              </span>
            </div>
            <div className="info-line">
              <Icon name="check" />
              <span>
                تاريخ الحل
                <b>
                  {complaint.status === "تم الحل"
                    ? "2026/10/02"
                    : "لم يتم الحل بعد"}
                </b>
              </span>
            </div>
          </Card>
        )}
      </div>
      {mode === "employee" && (
        <Card className="workspace-actions">
          <div>
            <div className="card-title">إجراءات البلاغ</div>
            <p>تظهر الإجراءات المناسبة فقط وفقاً للحالة الحالية.</p>
          </div>
          <div className="action-row">
            {complaint.status === "جاري التنفيذ" && (
              <label className="resolution-upload btn btn-secondary">
                <Icon name="upload" size={17} />
                <span>إضافة دليل التنفيذ</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={() => toast("تمت إضافة دليل التنفيذ")}
                />
              </label>
            )}
            {employeeActions()}
          </div>
        </Card>
      )}
      <Card className="operational-timeline">
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
      <Modal
        open={clarificationOpen}
        title="طلب معلومات إضافية"
        onClose={() => setClarificationOpen(false)}
      >
        <div className="modal-form">
          <TextArea
            label="المعلومات المطلوبة من المواطن"
            placeholder="اكتب المعلومات المطلوبة من المواطن..."
            value={clarification}
            onChange={setClarification}
          />
          <Button
            onClick={() => {
              if (!clarification.trim()) return
              onStatusChange?.(
                "يحتاج إلى توضيح",
                "تم طلب معلومات إضافية من المواطن",
                clarification,
              )
              setClarification("")
              setClarificationOpen(false)
            }}
          >
            إرسال الطلب
          </Button>
        </div>
      </Modal>
    </div>
  )
}
