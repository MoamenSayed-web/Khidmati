import { RoleDashboardLayout, AccountLayout } from "../../layouts"
import { SectionTitle } from "../../components/shared"
import { Button, Card, Icon, Select, StatusBadge } from "../../components/ui"
import type { ComplaintRecord, CurrentUser, Route, IconName } from "../../types"

export function AdminDashboardPage({
  go,
  currentUser,
  onLogout,
  complaints,
  onOpenComplaint,
}: {
  go: (route: Route) => void
  currentUser: CurrentUser
  onLogout: () => void
  complaints: ComplaintRecord[]
  onOpenComplaint: (id: string) => void
}) {
  const management = [
    [
      "جميع البلاغات",
      "متابعة البلاغات وتوزيعها على الإدارات",
      "file",
      "admin-complaints",
    ],
    [
      "إدارة المواطنين",
      "مراجعة حسابات المواطنين ونشاطهم",
      "user",
      "admin-citizens",
    ],
    [
      "إدارة الموظفين",
      "إدارة موظفي الحي والصلاحيات",
      "user",
      "admin-employees",
    ],
    [
      "الإدارات والمكاتب",
      "إدارة الأقسام ومراكز خدمة المواطنين",
      "office",
      "admin-departments",
    ],
    [
      "التحليلات والتقارير",
      "مؤشرات الأداء ونسب إنجاز البلاغات",
      "search",
      "admin-analytics",
    ],
    [
      "إعدادات النظام",
      "إعدادات المنصة والأدوار والصلاحيات",
      "settings",
      "admin-settings",
    ],
  ] as Array<[string, string, IconName, Route]>
  return (
    <RoleDashboardLayout
      role="admin"
      currentUser={currentUser}
      go={go}
      onLogout={onLogout}
    >
      <SectionTitle
        title={`مرحباً، ${currentUser.name}`}
        text="نظرة شاملة على أداء منظومة خدمَتي وإدارة المستخدمين والخدمات"
        action={<StatusBadge status="مدير النظام" />}
      />
      <div className="stats-grid">
        {[
          ["إجمالي البلاغات", String(complaints.length + 1282)],
          [
            "بلاغات جديدة",
            String(
              complaints.filter((item) =>
                ["جديد", "تم استلام البلاغ"].includes(item.status),
              ).length,
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
            "تم الحل",
            String(
              complaints.filter((item) => item.status === "تم الحل").length,
            ),
          ],
          [
            "البلاغات المغلقة",
            String(complaints.filter((item) => item.status === "مغلق").length),
          ],
          ["الموظفون النشطون", "64"],
          ["الإدارات", "8"],
        ].map(([label, value], index) => (
          <Card key={label} className={`stat stat-${index}`}>
            <span>{label}</span>
            <b>{value}</b>
          </Card>
        ))}
      </div>
      <SectionTitle title="إدارة المنصة" />
      <div className="admin-management-grid">
        {management.map(([title, text, icon, target]) => (
          <Card
            key={title}
            className="management-card"
            onClick={() => go(target)}
          >
            <span className="icon-box">
              <Icon name={icon} />
            </span>
            <div>
              <div className="card-title">{title}</div>
              <p>{text}</p>
            </div>
            <Icon name="arrow" />
          </Card>
        ))}
      </div>
      <Card className="dashboard-reports admin-latest-reports">
        <SectionTitle title="آخر البلاغات" />
        {complaints.map((complaint) => (
          <div className="report-list-item" key={complaint.id}>
            <div>
              <b>{complaint.title}</b>
              <span>
                <code>{complaint.id}</code> · {complaint.department} · الموظف:{" "}
                {complaint.assignedEmployee}
              </span>
              <span>
                تاريخ التقديم: {complaint.date} · تاريخ الحل:{" "}
                {complaint.status === "تم الحل" ? "2026/10/02" : "—"}
              </span>
            </div>
            <StatusBadge status={complaint.status} />
            <Button
              variant="secondary"
              onClick={() => onOpenComplaint(complaint.id)}
            >
              تفاصيل البلاغ
            </Button>
          </div>
        ))}
      </Card>
      <div className="admin-overview-grid">
        <Card>
          <SectionTitle title="نشاط الموظفين" />
          <div className="employee-performance">
            <div>
              <b>أحمد محمد</b>
              <span>إدارة النظافة</span>
            </div>
            <span>مسندة: 12</span>
            <span>مكتملة: 8</span>
            <span>قيد التنفيذ: 3</span>
            <span className="attention">تحتاج متابعة: 1</span>
          </div>
        </Card>
        <Card>
          <SectionTitle title="إحصائيات النظام" />
          <div className="system-stats">
            <span>
              <b>92%</b> نسبة الاستجابة
            </span>
            <span>
              <b>36 ساعة</b> متوسط الحل
            </span>
            <span>
              <b>4.6/5</b> رضا المواطنين
            </span>
          </div>
        </Card>
      </div>
      <Card className="analytics-card">
        <SectionTitle title="أداء البلاغات هذا الشهر" />
        <div className="analytics-bars">
          <span>
            <b>النظافة</b>
            <i className="bar-84" />
          </span>
          <span>
            <b>الطرق والإنارة</b>
            <i className="bar-68" />
          </span>
          <span>
            <b>المياه والصرف</b>
            <i className="bar-76" />
          </span>
        </div>
      </Card>
    </RoleDashboardLayout>
  )
}

export function AdminManagementPage({
  route,
  currentUser,
  go,
  onLogout,
  complaints,
  onOpenComplaint,
  toast,
}: {
  route: Route
  currentUser: CurrentUser
  go: (route: Route) => void
  onLogout: () => void
  complaints: ComplaintRecord[]
  onOpenComplaint: (id: string) => void
  toast: (text: string) => void
}) {
  const pageMeta: Partial<Record<Route, [string, string]>> = {
    "admin-complaints": [
      "إدارة البلاغات",
      "مراقبة جميع البلاغات وحالتها والموظفين المسندة إليهم.",
    ],
    "admin-citizens": [
      "إدارة المواطنين",
      "متابعة الحسابات المسجلة ونشاط تقديم البلاغات.",
    ],
    "admin-employees": [
      "إدارة الموظفين",
      "مراقبة الأحمال والأداء والحالات التي تحتاج إلى متابعة.",
    ],
    "admin-departments": [
      "الأقسام والإدارات",
      "إدارة الجهات المسؤولة ومسارات تحويل البلاغات.",
    ],
    "admin-offices": [
      "مكاتب الخدمة",
      "إدارة مكاتب خدمة المواطنين وساعات العمل.",
    ],
    "admin-analytics": [
      "التقارير والإحصائيات",
      "تحليل أداء البلاغات وسرعة الاستجابة والحل.",
    ],
    "admin-map": [
      "الخريطة التشغيلية",
      "توزيع البلاغات والمكاتب والفرق الميدانية.",
    ],
    "admin-settings": [
      "إعدادات النظام",
      "إعدادات المنصة والإشعارات ومسارات العمل.",
    ],
  }
  const [title, text] = pageMeta[route] ?? ["إدارة المنصة", "متابعة النظام."]
  const renderContent = () => {
    if (route === "admin-complaints")
      return (
        <Card className="employee-complaints-table">
          {complaints.map((complaint) => (
            <div className="employee-complaint-row" key={complaint.id}>
              <div>
                <code>{complaint.id}</code>
                <span>{complaint.category}</span>
              </div>
              <div>
                <b>{complaint.title}</b>
                <span>{complaint.location}</span>
              </div>
              <div>
                <span>{complaint.department}</span>
                <span>{complaint.assignedEmployee}</span>
              </div>
              <StatusBadge status={complaint.status} />
              <Button
                variant="secondary"
                onClick={() => onOpenComplaint(complaint.id)}
              >
                تفاصيل البلاغ
              </Button>
            </div>
          ))}
        </Card>
      )
    if (route === "admin-citizens")
      return (
        <div className="admin-entity-grid">
          {[
            ["محمد أحمد", "mohamed@example.com", "4 بلاغات"],
            ["سارة محمود", "sara@example.com", "2 بلاغ"],
            ["أحمد علي", "ahmed@example.com", "7 بلاغات"],
          ].map(([name, email, activity]) => (
            <Card key={email} className="entity-card">
              <span className="profile-avatar">
                <Icon name="user" />
              </span>
              <div>
                <b>{name}</b>
                <span className="technical-value">{email}</span>
              </div>
              <span>{activity}</span>
              <StatusBadge status="نشط" />
            </Card>
          ))}
        </div>
      )
    if (route === "admin-employees")
      return (
        <Card className="employee-monitoring-table">
          {[
            ["أحمد محمد", "النظافة", "12", "8", "3", "1"],
            ["محمود حسن", "الطرق والإنارة", "9", "7", "2", "0"],
            ["سلمى علي", "المياه والصرف", "11", "6", "4", "1"],
          ].map(([name, department, assigned, done, progress, attention]) => (
            <div className="employee-monitor-row" key={name}>
              <div>
                <b>{name}</b>
                <span>{department}</span>
              </div>
              <span>
                مسندة: <b>{assigned}</b>
              </span>
              <span>
                مكتملة: <b>{done}</b>
              </span>
              <span>
                قيد التنفيذ: <b>{progress}</b>
              </span>
              <span className="attention">
                تحتاج متابعة: <b>{attention}</b>
              </span>
            </div>
          ))}
        </Card>
      )
    if (route === "admin-departments")
      return (
        <div className="admin-entity-grid">
          {[
            ["إدارة النظافة والإشغالات", "18 بلاغاً نشطاً"],
            ["إدارة الطرق والإنارة", "12 بلاغاً نشطاً"],
            ["إدارة المياه والصرف", "9 بلاغات نشطة"],
            ["إدارة الحدائق", "5 بلاغات نشطة"],
          ].map(([name, count]) => (
            <Card key={name} className="management-card">
              <span className="icon-box">
                <Icon name="office" />
              </span>
              <div>
                <div className="card-title">{name}</div>
                <p>{count}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() =>
                  toast(`تم اختيار ${name}. لا توجد بيانات تحرير إضافية حالياً.`)
                }
              >
                إدارة
              </Button>
            </Card>
          ))}
        </div>
      )
    if (route === "admin-offices")
      return (
        <div className="office-list">
          {[
            [
              "المركز التكنولوجي الرئيسي",
              "شارع ديوان عام الحي",
              "8:30 — 15:00",
            ],
            ["مكتب القطاع الشمالي", "ميدان النصر", "8:30 — 15:00"],
            ["مكتب القطاع الغربي", "شارع الثورة", "8:30 — 15:00"],
          ].map(([name, address, hours]) => (
            <Card key={name} className="office-item">
              <div className="office-main">
                <span className="icon-box">
                  <Icon name="office" />
                </span>
                <div>
                  <div className="card-title">{name}</div>
                  <p>{address}</p>
                  <span>{hours}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  toast(`تم اختيار ${name}. لا توجد بيانات تحرير إضافية حالياً.`)
                }
              >
                إدارة المكتب
              </Button>
            </Card>
          ))}
        </div>
      )
    if (route === "admin-analytics")
      return (
        <div className="admin-overview-grid">
          <Card className="analytics-card">
            <SectionTitle title="أداء البلاغات" />
            <div className="analytics-bars">
              <span>
                <b>النظافة</b>
                <i className="bar-84" />
              </span>
              <span>
                <b>الطرق والإنارة</b>
                <i className="bar-68" />
              </span>
              <span>
                <b>المياه والصرف</b>
                <i className="bar-76" />
              </span>
            </div>
          </Card>
          <Card>
            <SectionTitle title="مؤشرات النظام" />
            <div className="system-stats">
              <span>
                <b>92%</b> الاستجابة
              </span>
              <span>
                <b>36 ساعة</b> متوسط الحل
              </span>
              <span>
                <b>4.6/5</b> رضا المواطنين
              </span>
            </div>
          </Card>
        </div>
      )
    if (route === "admin-map")
      return (
        <Card className="map-card admin-map-card">
          <div className="map-grid" />
          <span className="map-center">
            <Icon name="pin" size={38} />
            <b>الخريطة التشغيلية للبلاغات</b>
            <small>الفرق الميدانية والبلاغات النشطة</small>
          </span>
          {[1, 2, 3, 4].map((item) => (
            <button
              className={`map-pin pin-${item}`}
              key={item}
              onClick={() => toast(`تم تحديد نقطة البلاغ رقم ${item}`)}
              aria-label={`عرض نقطة البلاغ رقم ${item}`}
            >
              {item}
            </button>
          ))}
        </Card>
      )
    return (
      <Card className="admin-settings-form">
        <div className="settings-row">
          <span>إشعارات البلاغات الجديدة</span>
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span />
          </label>
        </div>
        <div className="settings-row">
          <span>السماح بإعادة فتح البلاغ</span>
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span />
          </label>
        </div>
        <Select label="مهلة المراجعة">
          <option>24 ساعة</option>
          <option>48 ساعة</option>
        </Select>
        <Select label="مهلة التنفيذ">
          <option>72 ساعة</option>
          <option>5 أيام</option>
        </Select>
        <Button onClick={() => toast("تم حفظ إعدادات النظام")}>
          حفظ الإعدادات
        </Button>
      </Card>
    )
  }
  return (
    <AccountLayout
      route={route}
      go={go}
      currentUser={currentUser}
      onLogout={onLogout}
      role="admin"
    >
      <SectionTitle title={title} text={text} />
      {renderContent()}
    </AccountLayout>
  )
}
