import { RoleDashboardLayout, AccountLayout } from "../../layouts"
import { SectionTitle } from "../../components/shared"
import { Button, Card, EmptyState, StatusBadge } from "../../components/ui"
import type { ComplaintRecord, ComplaintStatus, CurrentUser, Route } from "../../types"

export function EmployeeDashboardPage({
  go,
  currentUser,
  onLogout,
  complaints,
  onOpenComplaint,
  toast,
}: {
  go: (route: Route) => void
  currentUser: CurrentUser
  onLogout: () => void
  complaints: ComplaintRecord[]
  onOpenComplaint: (id: string) => void
  toast: (text: string) => void
}) {
  return (
    <RoleDashboardLayout
      role="employee"
      currentUser={currentUser}
      go={go}
      onLogout={onLogout}
    >
      <SectionTitle
        title={`مرحباً، ${currentUser.name}`}
        text="إدارة البلاغات الميدانية المسندة إليك ومتابعة تنفيذها"
        action={<StatusBadge status="موظف الحي" />}
      />
      <div className="stats-grid">
        {[
          [
            "بلاغات جديدة",
            String(
              complaints.filter((item) =>
                ["جديد", "تم استلام البلاغ"].includes(item.status),
              ).length,
            ),
          ],
          [
            "قيد المراجعة",
            String(
              complaints.filter((item) => item.status === "قيد المراجعة")
                .length,
            ),
          ],
          [
            "قيد التنفيذ",
            String(
              complaints.filter((item) => item.status === "جاري التنفيذ")
                .length,
            ),
          ],
          [
            "تحتاج إلى توضيح",
            String(
              complaints.filter((item) => item.status === "يحتاج إلى توضيح")
                .length,
            ),
          ],
          [
            "تم الحل",
            String(
              complaints.filter((item) => item.status === "تم الحل").length,
            ),
          ],
        ].map(([label, value], index) => (
          <Card key={label} className={`stat stat-${index}`}>
            <span>{label}</span>
            <b>{value}</b>
          </Card>
        ))}
      </div>
      <div className="action-row">
        <Button onClick={() => go("employee-complaints")}>
          إدارة البلاغات
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast("الخريطة التشغيلية متاحة حالياً لمسؤولي النظام فقط")
          }
        >
          خريطة البلاغات
        </Button>
        <Button
          variant="secondary"
          onClick={() => go("employee-notifications")}
        >
          إشعارات الموظف
        </Button>
      </div>
      <Card className="dashboard-reports">
        <SectionTitle title="البلاغات المسندة إليّ" />
        {complaints.map((report) => (
          <div className="report-list-item employee-queue-item" key={report.id}>
            <div>
              <b>{report.title}</b>
              <span>
                <code>{report.id}</code> · {report.location}
              </span>
              <span>
                {report.category} · {report.date} · الأولوية: {report.priority}
              </span>
            </div>
            <StatusBadge status={report.status} />
            <div className="report-actions">
              <Button
                variant="secondary"
                onClick={() => onOpenComplaint(report.id)}
              >
                عرض البلاغ
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </RoleDashboardLayout>
  )
}

export function EmployeeComplaintsPage({
  route,
  title,
  text,
  statuses,
  complaints,
  currentUser,
  go,
  onLogout,
  onOpenComplaint,
}: {
  route: Route
  title: string
  text: string
  statuses?: ComplaintStatus[]
  complaints: ComplaintRecord[]
  currentUser: CurrentUser
  go: (route: Route) => void
  onLogout: () => void
  onOpenComplaint: (id: string) => void
}) {
  const filtered = statuses
    ? complaints.filter((complaint) => statuses.includes(complaint.status))
    : complaints
  return (
    <AccountLayout
      route={route}
      go={go}
      currentUser={currentUser}
      onLogout={onLogout}
      role="employee"
    >
      <SectionTitle
        title={title}
        text={text}
        action={<span className="queue-count">{filtered.length} بلاغ</span>}
      />
      <Card className="employee-complaints-table">
        {filtered.length ? (
          filtered.map((complaint) => (
            <div className="employee-complaint-row" key={complaint.id}>
              <div className="complaint-id-cell">
                <code>{complaint.id}</code>
                <span>{complaint.category}</span>
              </div>
              <div>
                <b>{complaint.title}</b>
                <span>{complaint.location}</span>
              </div>
              <div className="complaint-meta-cell">
                <span>{complaint.date}</span>
                <span>الأولوية: {complaint.priority}</span>
              </div>
              <StatusBadge status={complaint.status} />
              <Button
                variant="secondary"
                onClick={() => onOpenComplaint(complaint.id)}
              >
                عرض البلاغ
              </Button>
            </div>
          ))
        ) : (
          <EmptyState
            title="لا توجد بلاغات في هذه الحالة"
            text="ستظهر البلاغات هنا تلقائياً عند تحديث حالتها."
          />
        )}
      </Card>
    </AccountLayout>
  )
}
