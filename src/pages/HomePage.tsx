import { categoryData, citizenReviews } from "../data/catalogs"
import { Hero, SectionTitle } from "../components/shared"
import { Button, Card, Icon } from "../components/ui"
import type { IconName, Role, Route } from "../types"

export function HomePage({
  go,
  isLoggedIn,
  role,
}: {
  go: (route: Route) => void
  isLoggedIn: boolean
  role: Role | null
}) {
  const dashboardRoute: Route =
    role === "employee"
      ? "employee-dashboard"
      : role === "admin"
        ? "admin-dashboard"
        : "dashboard"

  const howItWorksSteps: Array<{
    title: string
    text: string
    icon: IconName
  }> = [
    {
      title: "أنشئ حسابك",
      text: "أنشئ حسابك كمواطن للوصول إلى خدمات خدمتي.",
      icon: "user",
    },
    {
      title: "قدّم بلاغك",
      text: "اختر نوع المشكلة وأدخل تفاصيل البلاغ والموقع والمعلومات المطلوبة.",
      icon: "file",
    },
    {
      title: "تابع حالة البلاغ",
      text: "تابع حالة بلاغك ومعرفة آخر التحديثات والإجراءات المتخذة.",
      icon: "clock",
    },
    {
      title: "احصل على الحل",
      text: "تتم متابعة البلاغ مع الجهة المختصة حتى الوصول إلى الحل.",
      icon: "check",
    },
  ]

  return (
    <>
      <Hero
        title="منظومة الشكاوى والبلاغات"
        text="المنصة الإلكترونية لأهالي الحي لمتابعة شكاوى وبلاغاتكم الميدانية بلحظة بلحظة"
      >
        <div className="hero-search" onClick={() => go("search")}>
          <Icon name="search" />
          <span>ابحث برقم البلاغ، اسم الشارع، أو نوع المشكلة في الحي...</span>
        </div>
        <div className="hero-chips">
          {[
            "تقديم بلاغ عاجل",
            "متابعة بلاغ برقم الطلب",
            "تراكم قمامة ومخلفات",
            "أعمدة إنارة وكهرباء",
            "كسر ماسورة وطفح صرف",
          ].map((item) => (
            <button
              key={item}
              onClick={() => go(item.includes("متابعة") ? "track" : "submit")}
            >
              {item}
            </button>
          ))}
        </div>
      </Hero>
      <main className="page-shell">
        <div className="quick-services-heading">
          <div className="section-title">خدمات الحي بين إيديك</div>
          <p>قدّم بلاغك، تابع حالته، واستكشف خدمات الحي من مكان واحد.</p>
        </div>
        <div className="quick-grid">
          {[
            [
              "تقديم بلاغ للحي",
              "بلغ عن مشكلة بالشارع وتابع حلها",
              "file",
              "submit",
            ],
            [
              "متابعة البلاغات",
              "اعرف حالة معاينة ونزول فريق الحي",
              "clock",
              "track",
            ],
            [
              "دليل خدمات وبلاغات الحي",
              "تصفح كافة بلاغات وطلبات الحي",
              "search",
              "reports",
            ],
            ["مساعد الحي الذكي", "استفسر ووجه بلاغك فوراً", "bot", "assistant"],
          ].map(([title, text, icon, route]) => (
            <Card
              key={title}
              className="quick-card"
              onClick={() => go(route as Route)}
            >
              <span className="icon-box">
                <Icon name={icon as IconName} />
              </span>
              <div className="card-title">{title}</div>
              <p>{text}</p>
              <span className="text-link">ابدأ الآن ←</span>
            </Card>
          ))}
        </div>
        <SectionTitle
          title="أقسام وبلاغات الحي الميدانية"
          text="اختر القسم التابع لمشكلتك لتوجيه البلاغ للإدارة المختصة برئاسة الحي فوراً"
        />
        <div className="category-grid">
          {categoryData.map(([title, count, asset]) => (
            <Card
              key={title}
              className="category-card"
              onClick={() => go("reports")}
            >
              <span className="icon-box large">
                <img src={asset} alt="" />
              </span>
              <div className="card-title">{title}</div>
              <p>{count}</p>
              <span className="text-link">عرض البلاغات</span>
            </Card>
          ))}
        </div>
        <section className="how-it-works" aria-labelledby="how-it-works-title">
          <div className="section-heading">
            <div>
              <div className="section-title" id="how-it-works-title">
                كيف تستخدم خدمتي؟
              </div>
              <p>أربع خطوات بسيطة لتقديم بلاغك ومتابعته حتى الوصول إلى الحل</p>
            </div>
          </div>
          <div className="how-steps">
            {howItWorksSteps.map((step, index) => (
              <Card className="how-step" key={step.title}>
                <div className="step-head">
                  <span className="icon-box">
                    <Icon name={step.icon} />
                  </span>
                  <span className="step-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="card-title">{step.title}</div>
                <p>{step.text}</p>
              </Card>
            ))}
          </div>
          <div className="how-cta">
            <div>
              <div className="card-title">ابدأ الآن</div>
              <p>
                {isLoggedIn
                  ? "انتقل إلى لوحة التحكم لمتابعة خدماتك وبلاغاتك."
                  : "أنشئ حسابك وابدأ في استخدام خدمات خدمتي."}
              </p>
            </div>
            <Button
              onClick={() => go(isLoggedIn ? dashboardRoute : "register")}
            >
              {isLoggedIn ? "لوحة التحكم" : "إنشاء حساب"}
            </Button>
          </div>
        </section>
        <section className="reviews-section" aria-labelledby="reviews-title">
          <div className="section-heading reviews-heading">
            <div>
              <div className="section-title" id="reviews-title">
                آراء المواطنين
              </div>
              <p>نماذج من تجارب المواطنين بعد متابعة بلاغاتهم وخدماتهم.</p>
            </div>
          </div>
          <div className="reviews-viewport">
            <div className="reviews-track">
              {[0, 1].map((group) => (
                <div
                  className="reviews-group"
                  key={group}
                  aria-hidden={group === 1}
                >
                  {citizenReviews.map((review) => (
                    <Card
                      className="review-card"
                      key={`${group}-${review.text}`}
                    >
                      <div className="review-stars" aria-label="تقييم 5 من 5">
                        ★★★★★
                      </div>
                      <p>“{review.text}”</p>
                      <div className="review-author">
                        <span className="review-avatar">
                          <Icon name="user" size={18} />
                        </span>
                        <span>
                          <b>{review.name}</b>
                          <small>{review.service}</small>
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="blue-cta">
          <div className="cta-title">رأيت مشكلة في شارعك اليوم؟</div>
          <p>
            المساعد الذكي سيساعدك في تحديد نوع المشكلة وتوجيه بلاغك للجهة
            المختصة فوراً
          </p>
          <Button variant="secondary" onClick={() => go("assistant")}>
            تحدث مع مساعد الحي الذكي
          </Button>
        </div>
      </main>
    </>
  )
}
