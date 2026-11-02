import { useState } from "react"
import { reportData } from "../../data/catalogs"
import { AccountLayout } from "../../layouts"
import { ReportCard, SectionTitle } from "../../components/shared"
import { Button, Card, EmptyState, Icon, StatusBadge } from "../../components/ui"
import type { AlertState, ComplaintRecord, CurrentUser, Route } from "../../types"

export function DashboardPage({
  go,
  currentUser,
  onLogout,
  showAlert,
  toast,
  complaints,
  onOpenComplaint,
  onCancelComplaint,
}: {
  go: (route: Route) => void
  currentUser: CurrentUser
  onLogout: () => void
  showAlert: (alert: AlertState) => void
  toast: (text: string) => void
  complaints: ComplaintRecord[]
  onOpenComplaint: (id: string) => void
  onCancelComplaint: (id: string) => void
}) {
  return (
    <AccountLayout
      route="dashboard"
      go={go}
      currentUser={currentUser}
      onLogout={onLogout}
    >
      <SectionTitle
        title={`مرحباً، ${currentUser.name}`}
        text="متابعة بلاغاتك الميدانية وخدماتك الإلكترونية في مكان واحد"
        action={
          <Button icon="plus" onClick={() => go("submit")}>
            تسجيل بلاغ جديد بالحي
          </Button>
        }
      />
      <div className="stats-grid">
        {[
          ["إجمالي البلاغات", String(complaints.length)],
          [
            "البلاغات قيد التنفيذ",
            String(
              complaints.filter((item) => item.status === "جاري التنفيذ")
                .length,
            ),
          ],
          [
            "البلاغات المحلولة",
            String(
              complaints.filter((item) => item.status === "تم الحل").length,
            ),
          ],
          [
            "البلاغات المغلقة",
            String(complaints.filter((item) => item.status === "مغلق").length),
          ],
        ].map(([label, value], index) => (
          <Card key={label} className={`stat stat-${index}`}>
            <span>{label}</span>
            <b>{value}</b>
          </Card>
        ))}
      </div>
      <div className="action-row">
        <Button onClick={() => go("submit")}>تقديم بلاغ جديد بالحي</Button>
        <Button onClick={() => go("track")}>تتبع بلاغ سابق برقم الطلب</Button>
        <Button variant="secondary" onClick={() => go("assistant")}>
          مساعد الحي الذكي
        </Button>
        <Button variant="secondary" onClick={() => go("offices")}>
          مكاتب خدمة الحي
        </Button>
      </div>
      <Card className="dashboard-reports">
        <SectionTitle
          title="أحدث بلاغاتي الميدانية بالحي"
          action={
            <button className="text-link" onClick={() => go("reports")}>
              عرض الكل
            </button>
          }
        />
        {complaints.map((report) => (
          <div className="report-list-item" key={report.id}>
            <div>
              <b>{report.title}</b>
              <span>
                {report.location} · <code>{report.id}</code>
              </span>
              <span>
                {report.category} · {report.date}
              </span>
            </div>
            <StatusBadge status={report.status} />
            <div className="report-actions">
              <Button
                variant="secondary"
                onClick={() => onOpenComplaint(report.id)}
              >
                التفاصيل
              </Button>
              <Button variant="ghost" onClick={() => go("track")}>
                تتبع
              </Button>
              {report.status === "قيد المراجعة" && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      toast("يمكنك إضافة معلومات أو صور من صفحة تفاصيل البلاغ")
                    }
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      showAlert({
                        type: "confirmation",
                        title: "هل أنت متأكد؟",
                        message: "لن تتمكن من التراجع عن هذا الإجراء.",
                        primaryLabel: "تأكيد",
                        secondaryLabel: "إلغاء",
                        onPrimary: () => {
                          onCancelComplaint(report.id)
                        },
                      })
                    }
                  >
                    إلغاء
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </Card>
      <div className="dashboard-lower">
        <Card>
          <SectionTitle
            title="الخدمات المفضلة"
            action={
              <button className="text-link" onClick={() => go("favorites")}>
                عرض المفضلة
              </button>
            }
          />
          <div className="mini-service">
            <span className="icon-box">
              <Icon name="office" />
            </span>
            <div>
              <b>المركز التكنولوجي الرئيسي للحي</b>
              <small>خدمات المواطنين والتصاريح</small>
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle title="آخر النشاطات" />
          <div className="activity-list">
            <span>
              <Icon name="check" /> تم تحديث حالة البلاغ KH-2026-00125
            </span>
            <span>
              <Icon name="bell" /> تم إسناد البلاغ إلى إدارة النظافة
            </span>
            <span>
              <Icon name="heart" /> تمت إضافة مكتب خدمة إلى المفضلة
            </span>
          </div>
        </Card>
      </div>
    </AccountLayout>
  )
}

export function FavoritesPage({
  go,
  favorites,
  toggleFavorite,
  currentUser,
  onLogout,
}: {
  go: (route: Route) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  currentUser: CurrentUser
  onLogout: () => void
}) {
  const [tab, setTab] = useState<"reports" | "services" | "offices">("reports")
  const favoriteReports = reportData.filter((report) =>
    favorites.has(report.id),
  )
  return (
    <AccountLayout
      route="favorites"
      go={go}
      currentUser={currentUser}
      onLogout={onLogout}
    >
      <SectionTitle title="المفضلة" />
      <div className="tabs">
        <button
          className={tab === "reports" ? "active" : ""}
          onClick={() => setTab("reports")}
        >
          البلاغات
        </button>
        <button
          className={tab === "services" ? "active" : ""}
          onClick={() => setTab("services")}
        >
          الخدمات
        </button>
        <button
          className={tab === "offices" ? "active" : ""}
          onClick={() => setTab("offices")}
        >
          المكاتب
        </button>
      </div>
      {tab === "reports" && favoriteReports.length ? (
        <div className="reports-grid">
          {favoriteReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              go={go}
              favorite
              onFavorite={() => toggleFavorite(report.id)}
            />
          ))}
        </div>
      ) : tab === "reports" ? (
        <EmptyState
          title="لم تضف أي عناصر إلى المفضلة بعد"
          text="احفظ البلاغات والخدمات والمكاتب التي تحتاج للعودة إليها سريعاً."
          action={
            <Button onClick={() => go("reports")}>
              استعراض البلاغات والخدمات
            </Button>
          }
        />
      ) : (
        <EmptyState
          title={
            tab === "services"
              ? "لا توجد خدمات محفوظة بعد"
              : "لا توجد مكاتب محفوظة بعد"
          }
          text="أضف العناصر إلى المفضلة من دليل الخدمات أو مكاتب خدمة الحي."
          action={
            <Button
              onClick={() => go(tab === "services" ? "reports" : "offices")}
            >
              {tab === "services" ? "استعراض الخدمات" : "استعراض المكاتب"}
            </Button>
          }
        />
      )}
    </AccountLayout>
  )
}
