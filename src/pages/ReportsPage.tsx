import { useState } from "react"
import { reportData } from "../data/catalogs"
import { Hero, ReportCard } from "../components/shared"
import { Button, EmptyState, Icon, Select } from "../components/ui"
import type { Route } from "../types"

export function ReportsPage({
  go,
  favorites,
  toggleFavorite,
}: {
  go: (route: Route) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
}) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("الكل")
  const shown = reportData.filter(
    (report) =>
      (category === "الكل" || report.category.includes(category)) &&
      report.title.includes(search),
  )
  return (
    <>
      <Hero
        title="دليل البلاغات والخدمات"
        text="تصفح كافة أنواع البلاغات والخدمات الميدانية المتاحة لأهالي الحي وتعرف على خطوات الخدمة وتفاصيلها"
        compact
      >
        <div className="hero-search">
          <Icon name="search" />
          <input
            placeholder="ابحث في بلاغات وخدمات الحي..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </Hero>
      <main className="page-shell">
        <div className="filter-bar">
          <div className="chips">
            {[
              "الكل",
              "النظافة",
              "إنارة",
              "طرق",
              "إشغالات",
              "مياه",
              "حدائق",
              "مخالفات البناء",
            ].map((item) => (
              <button
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <Select label="ترتيب النتائج">
            <option>الأكثر استخداماً</option>
            <option>الأحدث</option>
            <option>الأكثر بلاغاً</option>
          </Select>
        </div>
        {shown.length ? (
          <>
            <div className="reports-grid">
              {shown.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  go={go}
                  favorite={favorites.has(report.id)}
                  onFavorite={() => toggleFavorite(report.id)}
                />
              ))}
            </div>
            <div className="load-more">
              <Button variant="secondary" disabled>
                تم عرض جميع الخدمات المتاحة
              </Button>
            </div>
          </>
        ) : (
          <EmptyState
            title="لم نجد نتائج مطابقة لبحثك"
            text="جرّب تغيير كلمات البحث أو إزالة أحد التصنيفات."
            action={
              <Button
                onClick={() => {
                  setSearch("")
                  setCategory("الكل")
                }}
              >
                إعادة ضبط البحث
              </Button>
            }
          />
        )}
      </main>
    </>
  )
}
