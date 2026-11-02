import type { Route } from "../../types"

export function Footer({ go }: { go: (route: Route) => void }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand brand-light">خدمَتي</div>
          <p>
            المنصة الإلكترونية لتلقي ومتابعة شكاوى وبلاغات أهالي الحي الميدانية
            لحظة بلحظة
          </p>
          <div className="socials" aria-label="منصات خدمتي الاجتماعية">
            <span aria-label="فيسبوك">f</span>
            <span aria-label="إكس">𝕏</span>
            <span aria-label="يوتيوب">▶</span>
          </div>
        </div>
        <div>
          <div className="footer-title">أقسام البلاغات</div>
          <button onClick={() => go("reports")}>بلاغات النظافة والقمامة</button>
          <button onClick={() => go("reports")}>إنارة الشوارع والكهرباء</button>
          <button onClick={() => go("reports")}>إشغالات الطريق والأرصفة</button>
          <button onClick={() => go("reports")}>كسور المياه والصرف</button>
          <button onClick={() => go("reports")}>مخالفات البناء والتعلية</button>
        </div>
        <div>
          <div className="footer-title">خدمات ومكاتب الحي</div>
          <button onClick={() => go("offices")}>
            مراكز خدمة المواطنين بالحي
          </button>
          <button onClick={() => go("assistant")}>مساعد الحي الذكي</button>
          <button onClick={() => go("track")}>تتبع حالة البلاغ</button>
          <button onClick={() => go("about")}>عن بوابة صوت الحي</button>
          <button onClick={() => go("faq")}>الأسئلة الشائعة للحي</button>
        </div>
        <div>
          <div className="footer-title">طوارئ وعمليات الحي</div>
          {[
            ["114", "غرفة طوارئ الحي"],
            ["125", "طوارئ مياه الشرب والصرف"],
            ["121", "طوارئ كهرباء الحي"],
            ["122", "شرطة المرافق والنجدة"],
          ].map(([number, label]) => (
            <button
              className="emergency-link"
              key={number}
              onClick={() => go("emergency")}
            >
              <b>{number}</b>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="copyright">
        © 2026 خدمَتي — المنصة الإلكترونية لتلقي ومتابعة شكاوى وبلاغات أهالي الحي
        — جميع الحقوق محفوظة
      </div>
    </footer>
  )
}
