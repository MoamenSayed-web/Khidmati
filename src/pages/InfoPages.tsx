import { useState } from "react"
import { Hero, SectionTitle } from "../components/shared"
import { Button, Card, EmptyState, Icon } from "../components/ui"
import type { AlertState, Route } from "../types"

export function AssistantPage({
  go,
  setCategory,
}: {
  go: (route: Route) => void
  setCategory: (category: string) => void
}) {
  const [messages, setMessages] = useState<Array<{
    from: "bot" | "user"
    text: string
  }>>([
    {
      from: "bot",
      text: "مرحباً بك! أنا مساعدك الذكي. أخبرني بأي مشكلة في شارعك وسأساعدك في تسجيل البلاغ وتوجيهه لإدارة الحي فوراً.",
    },
  ])
  const [value, setValue] = useState("")
  const send = (text = value) => {
    if (!text.trim()) return
    if (text.includes("قمامة")) setCategory("النظافة وتراكم القمامة")
    else if (text.includes("إنارة") || text.includes("كابل"))
      setCategory("إنارة الشوارع والكهرباء")
    else if (text.includes("ماسورة") || text.includes("صرف"))
      setCategory("المياه والصرف الصحي بالحي")
    else if (text.includes("حفرة")) setCategory("صيانة الطرق ورصف الحفر")
    else if (text.includes("بناء")) setCategory("مخالفات البناء والهدد")
    setMessages((items) => [
      ...items,
      { from: "user", text },
      {
        from: "bot",
        text: "فهمت أن هناك مشكلة ميدانية. من فضلك اذكر الموقع بالتفصيل، وأضف وصفاً أو صورة إن توفرت، ثم يمكنك تقديم البلاغ مباشرة.",
      },
    ])
    setValue("")
  }
  const submit = () => {
    go("submit")
  }
  return (
    <>
      <Hero
        title="استكشاف خدمات الحي المختلفة من خلال واجهة سهلة الاستخدام."
        text="تابع تقدم طلباتك واستفساراتك عن طريق التطبيق للحصول على تحديثات فورية."
        compact
      />
      <main className="page-shell chat-shell">
        <Card className="chat-card">
          <div className="chat-head">
            <span className="icon-box">
              <Icon name="bot" />
            </span>
            <div>
              <b>مساعد صوت الحي الذكي</b>
              <span className="online">متصل الآن وجاهز للمساعدة</span>
            </div>
            <button
              className="session"
              onClick={() =>
                setMessages([
                  {
                    from: "bot",
                    text: "مرحباً بك! أنا مساعدك الذكي. أخبرني بأي مشكلة في شارعك وسأساعدك في تسجيل البلاغ وتوجيهه لإدارة الحي فوراً.",
                  },
                ])
              }
            >
              محادثة جديدة
            </button>
          </div>
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message message-${message.from}`}>
                {message.text}
              </div>
            ))}
          </div>
          <div className="suggestions">
            {[
              "تراكم قمامة في الشارع",
              "عمود إنارة مطفأ وكابل مكشوف",
              "كسر ماسورة مياه أو طفح صرف",
              "حفرة في الطريق",
              "مخالفة بناء",
            ].map((prompt) => (
              <button key={prompt} onClick={() => send(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          {messages.length > 1 && <Button onClick={submit}>تقديم بلاغ</Button>}
          <div className="chat-input">
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && send()}
              placeholder="اكتب استفسارك أو اسم الخدمة..."
            />
            <Button onClick={() => send()} icon="send">
              إرسال
            </Button>
          </div>
        </Card>
      </main>
    </>
  )
}

export function AboutPage({ go }: { go: (route: Route) => void }) {
  return (
    <>
      <Hero
        title="عن خدمَتي"
        text="منصة رقمية متكاملة تهدف إلى تسهيل وصول المواطنين لجميع الخدمات والمعاملات والشكاوى والبلاغات في مكان واحد بأعلى معايير الجودة والسرعة."
        compact
      />
      <main className="page-shell">
        <div className="about-grid">
          {[
            [
              "رؤيتنا",
              "مصر رقمية تتيح لكل مواطن الحصول على خدماته وحل شكواه بسهولة وفاعلية وموثوقية فائقة.",
            ],
            [
              "رسالتنا",
              "نوفر منصة إلكترونية آمنة وموثوقة تربط المواطن بجميع الجهات الحكومية والخدمية.",
            ],
            [
              "قيمنا",
              "الشفافية، الكفاءة، الأمان، وسهولة الوصول لكافة فئات المجتمع دون تعقيد.",
            ],
          ].map(([title, text]) => (
            <Card key={title}>
              <div className="card-title blue">{title}</div>
              <p>{text}</p>
            </Card>
          ))}
        </div>
        <div className="blue-cta">
          <div className="cta-title">جاهز لبدء رحلتك الرقمية؟</div>
          <p>سجل الآن واستمتع بجميع الخدمات والمعاملات الحكومية بأمان وسرعة</p>
          <Button variant="secondary" onClick={() => go("register")}>
            إنشاء حساب مجاني
          </Button>
        </div>
      </main>
    </>
  )
}

export function FAQPage() {
  const [active, setActive] = useState(0)
  const questions = [
    [
      "كيف أقدم بلاغاً؟",
      "اختر تقديم بلاغ من الصفحة الرئيسية، ثم حدّد القسم والموقع وأضف تفاصيل المشكلة وبيانات التواصل.",
    ],
    [
      "كيف أتابع حالة البلاغ؟",
      "استخدم رقم البلاغ ورقم الهاتف أو البريد الإلكتروني في صفحة متابعة البلاغات.",
    ],
    [
      "هل يمكنني إرفاق صورة؟",
      "نعم، يمكنك رفع صورة واضحة عند تقديم البلاغ أو إضافتها لاحقاً من صفحة التفاصيل.",
    ],
    [
      "هل أحتاج إلى إنشاء حساب؟",
      "يمكنك تصفح الخدمات كزائر، بينما يساعدك الحساب في إدارة بلاغاتك وإشعاراتك ومفضلاتك.",
    ],
    [
      "كيف أتواصل مع خدمة المواطنين؟",
      "يمكنك العثور على أقرب مكتب من دليل مكاتب خدمة الحي أو الاتصال بغرفة عمليات الحي على 114.",
    ],
  ]
  return (
    <main className="page-shell faq-page">
      <SectionTitle
        title="الأسئلة الشائعة للحي"
        text="إجابات سريعة عن الحساب والبلاغات والخدمات والمكاتب والمساعد الذكي"
      />
      <div className="chips centered">
        {[
          "الحساب",
          "البلاغات",
          "متابعة البلاغ",
          "الخدمات",
          "المكاتب",
          "المساعد الذكي",
        ].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="accordion">
        {questions.map(([question, answer], index) => (
          <Card
            key={question}
            className={active === index ? "open" : ""}
            onClick={() => setActive(active === index ? -1 : index)}
          >
            <div className="accordion-title">
              <b>{question}</b>
              <span>{active === index ? "−" : "+"}</span>
            </div>
            {active === index && <p>{answer}</p>}
          </Card>
        ))}
      </div>
    </main>
  )
}

export function SearchPage({
  go,
  showAlert,
}: {
  go: (route: Route) => void
  showAlert: (alert: AlertState) => void
}) {
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLowerCase()
  const hasResults =
    !!normalizedQuery &&
    [
      "قمامة",
      "نظافة",
      "بلاغ",
      "خدمة",
      "مكتب",
      "مركز",
      "garbage",
      "service",
      "report",
      "office",
    ].some((term) => normalizedQuery.includes(term))
  return (
    <main className="page-shell search-page">
      <SectionTitle
        title="البحث في خدمَتي"
        text="ابحث في البلاغات والخدمات والمكاتب والأسئلة الشائعة"
      />
      <div className="global-search">
        <Icon name="search" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="اكتب كلمة البحث..."
        />
        <Button
          onClick={() => {
            if (!query.trim())
              showAlert({
                type: "info",
                title: "اكتب كلمة للبحث أولاً",
                message: "ابدأ البحث عن خدمة أو بلاغ...",
              })
          }}
        >
          بحث
        </Button>
      </div>
      {!query && (
        <EmptyState
          title="ابدأ البحث عن خدمة أو بلاغ..."
          text="يمكنك البحث باسم الخدمة أو رقم البلاغ أو المكتب أو السؤال."
        />
      )}
      {query && !hasResults && (
        <EmptyState
          title="لم نجد نتائج مطابقة لبحثك"
          text="جرّب استخدام كلمات أخرى أو تصفح دليل الخدمات."
        />
      )}
      {hasResults && (
        <div className="search-results">
          {[
            [
              "نتائج البلاغات",
              "تراكم قمامة ومخلفات بشارع الجمهورية",
              "report-details",
            ],
            ["نتائج الخدمات", "بلاغات النظافة وتراكم القمامة", "reports"],
            [
              "نتائج المكاتب",
              "المركز التكنولوجي الرئيسي للحي",
              "office-details",
            ],
            ["نتائج الأسئلة الشائعة", "كيف أقدم بلاغاً؟", "faq"],
          ].map(([group, title, route]) => (
            <Card key={group} onClick={() => go(route as Route)}>
              <span>{group}</span>
              <b>{title}</b>
              <Icon name="arrow" />
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}

export function EmergencyPage() {
  const services = [
    ["الشرطة", "122"],
    ["الإسعاف", "123"],
    ["الكهرباء", "121"],
    ["طوارئ المياه والصرف", "125"],
    ["غرفة طوارئ الحي", "114"],
  ]
  return (
    <main className="emergency-page page-shell">
      <SectionTitle
        title="أرقام الطوارئ السريعة"
        text="اتصل مباشرة بالجهة المختصة في الحالات الطارئة"
      />
      <div className="emergency-grid">
        {services.map(([service, number]) => (
          <Card key={number}>
            <span className="emergency-icon">
              <Icon name="phone" size={28} />
            </span>
            <div className="card-title">{service}</div>
            <b className="emergency-number">{number}</b>
            <Button
              onClick={() => {
                window.location.href = `tel:${number}`
              }}
            >
              اتصال الآن
            </Button>
          </Card>
        ))}
      </div>
    </main>
  )
}
