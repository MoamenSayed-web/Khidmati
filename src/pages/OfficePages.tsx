import { useState } from "react"
import { Hero, SectionTitle } from "../components/shared"
import { Button, Card, EmptyState, Icon } from "../components/ui"
import type { Route } from "../types"

export function OfficesPage({
  go,
  favorites,
  toggleFavorite,
}: {
  go: (route: Route) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
}) {
  const [search, setSearch] = useState("")
  const [nearby, setNearby] = useState(false)
  const offices = [
    [
      "المركز التكنولوجي الرئيسي — ديوان رئاسة الحي",
      "شارع ديوان عام الحي بجوار مكتب خدمة المواطنين",
      "0.8 كم",
    ],
    [
      "مكتب خدمة المواطنين — القطاع الشمالي للحي",
      "ميدان النصر بجوار مجمع المدارس",
      "2.3 كم",
    ],
    [
      "مكتب خدمة المواطنين — القطاع الغربي للحي",
      "شارع الثورة بجوار حديقة الحي",
      "1.9 كم",
    ],
    [
      "غرفة العمليات والطوارئ الميدانية برئاسة الحي",
      "مبنى إدارة الإشغالات والمرافق والطوارئ",
      "1.4 كم",
    ],
  ]
  const shownOffices = offices.filter(
    ([name, address]) => name.includes(search) || address.includes(search),
  )
  return (
    <>
      <Hero
        title="مكاتب ومنافذ خدمة المواطنين بالحي"
        text="اعثر على المركز التكنولوجي الرئيسي، ديوان عام الحي، أو أقرب مكتب لاستقبال شكواك في منطقتك"
        compact
      >
        <div className="hero-search">
          <Icon name="search" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم مكتب الحي أو المنطقة أو الشارع..."
          />
        </div>
      </Hero>
      <main className="page-shell narrow">
        <div className="office-tools">
          <span>المراكز المتاحة: 4</span>
          <Button
            variant="secondary"
            icon="pin"
            onClick={() => setNearby(!nearby)}
          >
            {nearby ? "تم تحديد موقعك" : "موقعي الحالي"}
          </Button>
        </div>
        <Card className="map-card">
          <div className="map-grid" />
          <span className="map-center">
            <Icon name="pin" size={36} />
            <b>الخريطة التفاعلية للمراكز</b>
            <small>اختر أحد المكاتب لعرض التفاصيل</small>
          </span>
          {[1, 2, 3, 4].map((item) => (
            <button className={`map-pin pin-${item}`} key={item}>
              {item}
            </button>
          ))}
        </Card>
        <div className="office-list">
          {shownOffices.map(([name, address, distance]) => (
            <Card
              className="office-item"
              key={name}
              onClick={() => go("office-details")}
            >
              <div className="office-main">
                <span className="icon-box">
                  <Icon name="office" />
                </span>
                <div>
                  <div className="card-title">{name}</div>
                  <p>
                    <Icon name="pin" size={14} />
                    {address}
                  </p>
                  <span>
                    <Icon name="clock" size={14} /> 8:30 — 15:00
                  </span>
                  <div className="office-services">
                    استقبال البلاغات · خدمات المواطنين · استخراج التصاريح
                  </div>
                </div>
              </div>
              <div className="office-actions">
                <span className="distance">{distance}</span>
                <button
                  className={`favorite ${
                    favorites.has(name) ? "is-favorite" : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleFavorite(name)
                  }}
                >
                  <Icon name="heart" />
                </button>
                <Button
                  variant="secondary"
                  onClick={() => go("office-details")}
                >
                  عرض التفاصيل
                </Button>
              </div>
            </Card>
          ))}
          {!shownOffices.length && (
            <EmptyState
              title="لم نجد مركزاً مطابقاً لبحثك"
              text="جرّب البحث باسم المنطقة أو الشارع، أو استخدم موقعك الحالي."
              action={
                <Button onClick={() => setSearch("")}>عرض جميع المراكز</Button>
              }
            />
          )}
        </div>
        <SectionTitle
          title="أرقام الطوارئ السريعة"
          text="للحالات الطارئة اتصل مباشرة بالجهة المختصة"
        />
        <div className="office-emergency-grid">
          {[
            ["الشرطة", "122"],
            ["الإسعاف", "123"],
            ["الكهرباء", "121"],
            ["الطوارئ الموحد", "16000"],
          ].map(([service, number]) => (
            <Card key={number} className="office-emergency-card">
              <Icon name="phone" />
              <span>{service}</span>
              <b>{number}</b>
              <Button
                variant="secondary"
                onClick={() => {
                  window.location.href = `tel:${number}`
                }}
              >
                اتصال
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}

export function OfficeDetailsPage({
  go,
  toast,
}: {
  go: (route: Route) => void
  toast: (text: string) => void
}) {
  return (
    <main className="page-shell office-detail">
      <Button variant="ghost" icon="arrow" onClick={() => go("offices")}>
        العودة للمكاتب
      </Button>
      <Card className="office-hero-card">
        <span className="icon-box large">
          <Icon name="office" size={30} />
        </span>
        <div>
          <div className="page-title">
            المركز التكنولوجي الرئيسي — ديوان رئاسة الحي
          </div>
          <p>
            <Icon name="pin" /> شارع ديوان عام الحي بجوار مكتب خدمة المواطنين
          </p>
        </div>
        <span className="distance">0.8 كم</span>
      </Card>
      <div className="details-layout">
        <Card className="map-card large-map">
          <div className="map-grid" />
          <span className="map-center">
            <Icon name="pin" size={42} />
          </span>
        </Card>
        <Card className="detail-card">
          <div className="card-title">معلومات المكتب</div>
          <div className="info-line">
            <Icon name="clock" />
            <span>
              مواعيد العمل<b>الأحد — الخميس، 8:30 ص — 3:00 م</b>
            </span>
          </div>
          <div className="info-line">
            <Icon name="phone" />
            <span>
              الهاتف<b>02 2345 6789</b>
            </span>
          </div>
          <div className="card-title">الخدمات المتاحة</div>
          <div className="chips">
            <span>استقبال البلاغات</span>
            <span>استخراج التصاريح</span>
            <span>طلبات الإشغالات</span>
            <span>خدمات المواطنين</span>
          </div>
          <Button
            className="full"
            icon="pin"
            onClick={() => toast("تم فتح الاتجاهات إلى المكتب")}
          >
            الحصول على الاتجاهات
          </Button>
        </Card>
      </div>
    </main>
  )
}
