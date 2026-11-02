import type { ReactNode } from "react"
import { reportData } from "../../data/catalogs"
import { Button, Card, Icon, StatusBadge } from "../ui"
import type { Route } from "../../types"

export function SectionTitle({
  title,
  text,
  action,
}: {
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="section-title">{title}</div>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  )
}

export function ReportCard({
  report,
  go,
  favorite,
  onFavorite,
}: {
  report: typeof reportData[number]
  go: (route: Route) => void
  favorite?: boolean
  onFavorite?: () => void
}) {
  return (
    <Card className="report-card">
      <div className="report-card-head">
        <span className="icon-box">
          <Icon name="file" />
        </span>
        {onFavorite && (
          <button
            className={`favorite ${favorite ? "is-favorite" : ""}`}
            onClick={onFavorite}
          >
            <Icon name="heart" />
          </button>
        )}
      </div>
      <div className="card-title">{report.title}</div>
      <span className="category-label">{report.category}</span>
      <p>
        بلاغ ميداني مسجل لدى إدارة الحي، ويتم تحديث حالته فور نزول الفريق
        المختص.
      </p>
      <div className="meta-row">
        <span>
          <Icon name="pin" size={15} />
          {report.location}
        </span>
        <StatusBadge status={report.status} />
      </div>
      <Button onClick={() => go("report-details")}>تفاصيل وبدء الخدمة</Button>
    </Card>
  )
}
