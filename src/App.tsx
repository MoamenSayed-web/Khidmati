import { FormEvent, ReactNode, useEffect, useRef, useState } from "react"

type Route = "home" | "login" | "register" | "forgot" | "dashboard" | "employee-dashboard" | "employee-complaints" | "employee-new" | "employee-review" | "employee-progress" | "employee-clarification" | "employee-resolved" | "employee-complaint" | "employee-notifications" | "employee-profile" | "admin-dashboard" | "admin-complaints" | "admin-citizens" | "admin-employees" | "admin-departments" | "admin-offices" | "admin-analytics" | "admin-map" | "admin-notifications" | "admin-settings" | "admin-profile" | "admin-complaint" | "reports" | "report-details" | "submit" | "submit-success" | "track" | "offices" | "office-details" | "assistant" | "about" | "profile" | "notifications" | "favorites" | "faq" | "search" | "emergency"

type Language = "ar" | "en"
type Theme = "light" | "dark"
type AlertType = "success" | "error" | "warning" | "info" | "confirmation"
type Role = "citizen" | "employee" | "admin"

type CurrentUser = {
  name: string
  email: string
  phone: string
}

type CitizenAccount = CurrentUser & {
  password: string
}

type ComplaintStatus = "جديد" | "تم استلام البلاغ" | "قيد المراجعة" | "تم تعيين البلاغ" | "جاري التنفيذ" | "يحتاج إلى توضيح" | "تم الحل" | "مغلق" | "مرفوض" | "ملغي" | "أعيد فتحه"

type ComplaintTimelineEntry = {
  label: string
  date: string
  note?: string
}

type ComplaintRecord = {
  id: string
  title: string
  category: string
  description: string
  location: string
  date: string
  priority: "عالية" | "متوسطة" | "منخفضة"
  status: ComplaintStatus
  department: string
  assignedEmployee: string
  citizen: CurrentUser
  image?: string
  timeline: ComplaintTimelineEntry[]
}

type WorkspaceNotification = {
  id: string
  title: string
  message: string
  complaintId: string
  read: boolean
}

type AlertState = {
  type: AlertType
  title: string
  message: string
  primaryLabel?: string
  secondaryLabel?: string
  onPrimary?: () => void
  onSecondary?: () => void
}

const mockUser: CurrentUser = {
  name: "محمد أحمد",
  email: "mohamed@example.com",
  phone: "01000000000",
}

const defaultCitizen: CitizenAccount = {
  ...mockUser,
  password: "12345678",
}

const employeeUser: CurrentUser = {
  name: "أحمد محمد",
  email: "employee@khadmaty.com",
  phone: "01111111111",
}

const adminUser: CurrentUser = {
  name: "مدير النظام",
  email: "admin@khadmaty.com",
  phone: "01222222222",
}

const initialComplaint: ComplaintRecord = {
  id: "KH-2026-00125",
  title: "تراكم القمامة في الشارع",
  category: "النظافة وتراكم القمامة",
  description:
    "تراكم كمية كبيرة من القمامة ومخلفات الهدم بجوار الرصيف، مما يعيق حركة المواطنين.",
  location: "أسيوط — شارع الجمهورية أمام صيدلية الأمل",
  date: "2026/09/30 — 09:30",
  priority: "عالية",
  status: "تم استلام البلاغ",
  department: "إدارة النظافة والإشغالات",
  assignedEmployee: "أحمد محمد",
  citizen: mockUser,
  image: "/assets/656f8.png",
  timeline: [
    { label: "تم إرسال البلاغ", date: "09:30" },
    { label: "تمت مراجعة البلاغ", date: "10:15" },
    {
      label: "تم تعيين البلاغ للموظف المختص",
      date: "11:00",
      note: "أحمد محمد — إدارة النظافة",
    },
  ],
}

const englishText: Record<string, string> = {
  خدمَتي: "Khadmaty",
  الرئيسية: "Home",
  "بلاغات وخدمات الحي": "Neighborhood Services",
  "تسجيل ومتابعة شكوى": "Submit & Track",
  "مكاتب خدمة الحي": "Service Centers",
  "مساعد الحي الذكي": "Smart Assistant",
  "عن المنصة": "About",
  "تسجيل الدخول": "Sign in",
  "لوحة التحكم": "Dashboard",
  بلاغاتي: "My reports",
  "الملف الشخصي": "Profile",
  الإشعارات: "Notifications",
  "تسجيل الخروج": "Sign out",
  مواطن: "Citizen",
  "موظف الحي": "Neighborhood employee",
  "مدير النظام": "System administrator",
  "لوحة الموظف": "Employee dashboard",
  "لوحة العمل": "Workspace",
  "لوحة الإدارة": "Admin dashboard",
  "إدارة البلاغات": "Complaint management",
  "جميع البلاغات": "All complaints",
  "خريطة البلاغات": "Reports map",
  "البلاغات الجديدة": "New complaints",
  "قيد التنفيذ": "In progress",
  "البلاغات المحلولة": "Resolved complaints",
  "إدارة المواطنين": "Citizen management",
  "إدارة الموظفين": "Employee management",
  "الإدارات والمكاتب": "Departments and service centers",
  المواطنون: "Citizens",
  الموظفون: "Employees",
  الأقسام: "Departments",
  "مكاتب الخدمة": "Service offices",
  "التقارير والإحصائيات": "Reports and analytics",
  الخريطة: "Map",
  "التحليلات والتقارير": "Analytics and reports",
  "إعدادات النظام": "System settings",
  "غير مصرح بالدخول": "Access denied",
  "لا يملك هذا الحساب صلاحية الوصول إلى هذه الصفحة.":
    "This account does not have permission to access this page.",
  "العودة للوحة التحكم": "Back to dashboard",
  "تم إنشاء الحساب بنجاح": "Account created successfully",
  "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.":
    "Your account was created successfully. You can now sign in.",
  "إنشاء الحساب متاح للمواطنين فقط. حسابات الموظفين والإدارة محددة مسبقاً.":
    "Registration is available to citizens only. Employee and admin accounts are predefined.",
  "مساحة عمل موظف الحي": "Authority employee workspace",
  "مساحة إدارة المنصة": "Platform administration workspace",
  "تشغيل البلاغات": "Complaint operations",
  "إدارة ومراقبة النظام": "System management and monitoring",
  "بلاغات جديدة": "New complaints",
  "تحتاج إلى توضيح": "Needs clarification",
  "البلاغات الواردة": "Incoming complaints",
  "عرض البلاغ": "View complaint",
  "معلومات البلاغ": "Complaint information",
  "إجراءات البلاغ": "Complaint actions",
  "قبول البلاغ": "Accept complaint",
  "تعيين البلاغ": "Assign complaint",
  "بدء التنفيذ": "Start work",
  "طلب توضيح": "Request clarification",
  "طلب معلومات إضافية": "Request additional information",
  "إرسال الطلب": "Send request",
  "إغلاق البلاغ": "Close complaint",
  "إعادة فتح البلاغ": "Reopen complaint",
  "مراجعة البلاغ": "Review complaint",
  "بيانات التواصل اللازمة للبلاغ": "Required citizen contact information",
  "اتصال بالمواطن": "Call citizen",
  "إرسال بريد إلكتروني": "Send email",
  "السجل الزمني للبلاغ": "Complaint timeline",
  "الجهة المختصة تحتاج إلى معلومات إضافية":
    "The responsible authority needs additional information",
  "إرسال المعلومات": "Send information",
  "آخر البلاغات": "Latest complaints",
  "نشاط الموظفين": "Employee activity",
  "إحصائيات النظام": "System statistics",
  "أداء البلاغات هذا الشهر": "Complaint performance this month",
  "منظومة الشكاوى والبلاغات": "Neighborhood Complaints & Reports",
  "المنصة الإلكترونية لأهالي الحي لمتابعة شكاوى وبلاغاتكم الميدانية بلحظة بلحظة":
    "The digital platform for residents to submit and track neighborhood reports.",
  "تقديم بلاغ للحي": "Submit a report",
  "متابعة البلاغات": "Track reports",
  "دليل خدمات وبلاغات الحي": "Services directory",
  "استفسر ووجه بلاغك فوراً": "Ask and route your report instantly",
  "تصفح كافة بلاغات وطلبات الحي": "Browse neighborhood reports and requests",
  "اعرف حالة معاينة ونزول فريق الحي": "Check inspection and field-team status",
  "بلغ عن مشكلة بالشارع وتابع حلها":
    "Report a street issue and track its resolution",
  "ابدأ الآن": "Start now",
  "أقسام وبلاغات الحي الميدانية": "Neighborhood report categories",
  "اختر القسم التابع لمشكلتك لتوجيه البلاغ للإدارة المختصة برئاسة الحي فوراً":
    "Choose the relevant category to route your report to the responsible department.",
  "النظافة وتراكم القمامة": "Waste & cleanliness",
  "إنارة الشوارع والكهرباء": "Street lighting & electricity",
  "صيانة الطرق ورصف الحفر": "Road maintenance & potholes",
  "إشغالات الطريق والتعديات": "Road obstructions",
  "مخالفات البناء والهدد": "Building violations",
  "المياه والصرف الصحي بالحي": "Water & sanitation",
  "المحلات المخالفة والإزعاج": "Commercial violations",
  "الحدائق وتقليم الأشجار": "Parks & tree trimming",
  "عرض البلاغات": "View reports",
  "أبرز بلاغات وخدمات الحي": "Featured reports and services",
  "كيف تستخدم خدمتي؟": "How do you use Khadmaty?",
  "أربع خطوات بسيطة لتقديم بلاغك ومتابعته حتى الوصول إلى الحل":
    "Four simple steps to submit and follow your report through resolution",
  "أنشئ حسابك": "Create your account",
  "أنشئ حسابك كمواطن للوصول إلى خدمات خدمتي.":
    "Create a citizen account to access Khadmaty services.",
  "قدّم بلاغك": "Submit your report",
  "اختر نوع المشكلة وأدخل تفاصيل البلاغ والموقع والمعلومات المطلوبة.":
    "Choose the issue type and enter the report details, location, and required information.",
  "تابع حالة بلاغك ومعرفة آخر التحديثات والإجراءات المتخذة.":
    "Track your report status and view the latest updates and actions.",
  "احصل على الحل": "Get a resolution",
  "تتم متابعة البلاغ مع الجهة المختصة حتى الوصول إلى الحل.":
    "The report is followed up with the responsible authority through resolution.",
  "ابدأ الآن": "Get started",
  "انتقل إلى لوحة التحكم لمتابعة خدماتك وبلاغاتك.":
    "Go to the dashboard to manage your services and reports.",
  "أنشئ حسابك وابدأ في استخدام خدمات خدمتي.":
    "Create your account and start using Khadmaty services.",
  "لوحة التحكم": "Dashboard",
  "إنشاء حساب": "Create account",
  "رأيت مشكلة في شارعك اليوم؟": "Did you notice a problem on your street?",
  "تحدث مع مساعد الحي الذكي": "Talk to the smart assistant",
  "دليل البلاغات والخدمات": "Reports & services directory",
  "الأكثر استخداماً": "Most used",
  الأحدث: "Newest",
  "الأكثر بلاغاً": "Most reported",
  "عرض المزيد من الخدمات": "Load more services",
  "تفاصيل وبدء الخدمة": "Details & start service",
  "العودة للبلاغات": "Back to reports",
  "تفاصيل البلاغ": "Report details",
  "تاريخ البلاغ": "Report date",
  الموقع: "Location",
  "الإدارة المسؤولة": "Responsible department",
  القسم: "Category",
  الأولوية: "Priority",
  عالية: "High",
  "وصف المشكلة": "Problem description",
  "صورة مرفقة بالبلاغ": "Attached report image",
  "متابعة البلاغ": "Track report",
  "تقديم بلاغ مشابه": "Submit a similar report",
  "إضافة تعليق": "Add comment",
  "إضافة صورة": "Add image",
  "بلاغات مرتبطة": "Related reports",
  "تقديم بلاغ بالحي": "Submit neighborhood report",
  "متابعة بلاغ سابق": "Track previous report",
  "قسم البلاغ بالحي": "Report category",
  "إدارة الحي المختصة": "Responsible administration",
  "عنوان المشكلة بالحي بالتفصيل": "Complaint title",
  "الموقع التفصيلي للمشكلة": "Detailed location",
  "تفاصيل المشكلة والملاحظات الميدانية": "Problem details and field notes",
  "رقم الهاتف": "Phone number",
  "البريد الإلكتروني": "Email address",
  "إرسال الشكوى": "Submit complaint",
  "تم إرسال البلاغ بنجاح": "Report submitted successfully",
  "متابعة حالة البلاغ": "Track report status",
  "العودة للرئيسية": "Back to home",
  "تتبع حالة ومسار بلاغ الحي": "Track neighborhood report",
  "رقم البلاغ": "Report ID",
  "رقم الهاتف أو البريد الإلكتروني": "Phone number or email",
  البحث: "Search",
  "سجل ومسار الشكوى": "Report timeline",
  "تم الاستلام": "Received",
  "قيد المراجعة": "Under review",
  "تم تحويله للجهة المختصة": "Assigned to department",
  "جاري التنفيذ": "In progress",
  "تم الحل": "Resolved",
  مغلق: "Closed",
  "مكاتب ومنافذ خدمة المواطنين بالحي": "Citizen service centers",
  "موقعي الحالي": "Use my location",
  "عرض التفاصيل": "View details",
  "أرقام الطوارئ السريعة": "Quick emergency numbers",
  الشرطة: "Police",
  الإسعاف: "Ambulance",
  الكهرباء: "Electricity",
  "الطوارئ الموحد": "Unified emergency",
  اتصال: "Call",
  "مساعد صوت الحي الذكي": "Khadmaty Smart Assistant",
  "متصل الآن وجاهز للمساعدة": "Online and ready to help",
  "محادثة جديدة": "New conversation",
  "تراكم قمامة في الشارع": "Garbage accumulation on the street",
  "عمود إنارة مطفأ وكابل مكشوف": "Broken streetlight or exposed cable",
  "كسر ماسورة مياه أو طفح صرف": "Burst water pipe or sewage overflow",
  "حفرة في الطريق": "Road pothole",
  "مخالفة بناء": "Building violation",
  إرسال: "Send",
  "عن خدمَتي": "About Khadmaty",
  رؤيتنا: "Our vision",
  رسالتنا: "Our mission",
  قيمنا: "Our values",
  "جاهز لبدء رحلتك الرقمية؟": "Ready to start your digital journey?",
  "إنشاء حساب مجاني": "Create a free account",
  "إنشاء حساب جديد": "Create a new account",
  "الاسم الكامل": "Full name",
  "كلمة المرور": "Password",
  "تأكيد كلمة المرور": "Confirm password",
  "نسيت كلمة المرور؟": "Forgot password?",
  "المتابعة كزائر": "Continue as guest",
  "أهلاً بك، م. سامح إبراهيم": "Welcome, Mohamed Ahmed",
  "مرحباً، محمد أحمد": "Welcome, Mohamed Ahmed",
  "إجمالي البلاغات": "Total reports",
  "البلاغات قيد التنفيذ": "Reports in progress",
  "البلاغات المحلولة": "Resolved reports",
  "البلاغات المغلقة": "Closed reports",
  "أحدث بلاغاتي الميدانية بالحي": "My recent reports",
  "الخدمات المفضلة": "Favorite services",
  "آخر النشاطات": "Recent activity",
  حسابي: "My account",
  "المعلومات الشخصية": "Personal information",
  "رقم الهاتف المحمول": "Mobile number",
  اللغة: "Language",
  "حفظ التغييرات": "Save changes",
  "تغيير كلمة المرور": "Change password",
  المفضلة: "Favorites",
  "الأسئلة الشائعة للحي": "Frequently asked questions",
  "البحث في خدمَتي": "Search Khadmaty",
  "ابحث برقم البلاغ، اسم الشارع، أو نوع المشكلة في الحي...":
    "Search by report ID, street, or issue type...",
  "ابحث في بلاغات وخدمات الحي...":
    "Search neighborhood reports and services...",
  "ابحث باسم مكتب الحي أو المنطقة أو الشارع...":
    "Search by center, district, or street...",
  "اكتب استفسارك أو اسم الخدمة...": "Type your question or service name...",
  "اكتب كلمة البحث...": "Enter a search term...",
  "اسم الشارع وأقرب علامة مميزة": "Street name and nearest landmark",
  "مثال: تراكم قمامة أمام مدرسة النصر":
    "Example: garbage accumulation near Al-Nasr School",
  "اشرح تفاصيل المشكلة وما يحتاجه فريق الحي للمعاينة...":
    "Describe the issue and what the field team needs to inspect...",
  "اكتب كلمة للبحث أولاً": "Enter a search term first",
  "ابدأ البحث عن خدمة أو بلاغ...": "Start searching for a service or report...",
  "لم نجد نتائج مطابقة لبحثك": "No matching results found",
  "تسجيل الدخول مطلوب": "Sign in required",
  "يجب تسجيل الدخول أولاً حتى تتمكن من تقديم بلاغ.":
    "You must sign in before submitting a report.",
  "يجب تسجيل الدخول للوصول إلى لوحة التحكم.":
    "You must sign in to access the dashboard.",
  "سجل الدخول لحفظ الخدمات والبلاغات في المفضلة.":
    "Sign in to save services and reports to favorites.",
  "بيانات ناقصة": "Missing information",
  "من فضلك أدخل جميع البيانات المطلوبة.":
    "Please enter all required information.",
  "بيانات غير صحيحة": "Invalid information",
  "يرجى التأكد من رقم البلاغ وبيانات التواصل.":
    "Please verify the report ID and contact information.",
  "لم يتم العثور على البلاغ": "Report not found",
  "تأكد من رقم البلاغ وبيانات التواصل ثم حاول مرة أخرى.":
    "Check the report ID and contact information, then try again.",
  "فشل تسجيل الدخول": "Sign-in failed",
  "من فضلك أدخل البريد الإلكتروني أو رقم الهاتف.":
    "Please enter your email or phone number.",
  "من فضلك أدخل كلمة المرور.": "Please enter your password.",
  "البريد الإلكتروني أو كلمة المرور غير صحيحة.":
    "The email or password is incorrect.",
  "تم تسجيل الدخول بنجاح": "Signed in successfully",
  "مرحباً بك في خدمَتي.": "Welcome to Khadmaty.",
  "تم تسجيل الخروج بنجاح.": "Signed out successfully.",
  "يرجى استكمال البيانات المطلوبة قبل إرسال البلاغ.":
    "Complete all required information before submitting the report.",
  "تسجيل الخروج؟": "Sign out?",
  "هل أنت متأكد أنك تريد تسجيل الخروج؟": "Are you sure you want to sign out?",
  إلغاء: "Cancel",
  حسناً: "OK",
  "تأكيد إرسال البلاغ": "Confirm report submission",
  "هل أنت متأكد من إرسال البلاغ؟":
    "Are you sure you want to submit this report?",
  "مراجعة البيانات": "Review information",
  "تم حفظ التغييرات": "Changes saved",
  "تم تحديث بيانات حسابك بنجاح.":
    "Your account information was updated successfully.",
  "أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل إليك رمز التحقق.":
    "Enter your email or phone number and we will send a verification code.",
  "أرسلنا رمزاً مكوناً من 6 أرقام. أدخله للمتابعة.":
    "We sent a six-digit code. Enter it to continue.",
  "أقسام البلاغات": "Report categories",
  "خدمات ومكاتب الحي": "Neighborhood services and centers",
  "طوارئ وعمليات الحي": "Emergency operations",
  "عن بوابة صوت الحي": "About Khadmaty",
  أو: "or",
  الإعدادات: "Settings",
  البلاغات: "Reports",
  الخدمات: "Services",
  المكاتب: "Centers",
  العربية: "Arabic",
  "بيانات الدخول التجريبية": "Demo credentials",
  تعديل: "Edit",
  "تقديم بلاغ": "Submit report",
  "تقديم بلاغ جديد بالحي": "Submit a new report",
  "تتبع بلاغ سابق برقم الطلب": "Track a report by request ID",
  "عرض جميع المراكز": "View all centers",
  "إدارة الطرق والإنارة": "Roads and lighting administration",
  "إدارة النظافة والإشغالات": "Cleanliness and occupancy administration",
  "إشغالات الطريق والأرصفة": "Road and sidewalk obstructions",
  "اختر إدارة الحي المعنية": "Select the responsible administration",
  "اختر القسم المختص": "Select a category",
  "اضغط لرفع الملفات الداعمة للشكوى": "Click to upload supporting files",
  "صورة بصيغة JPG أو PNG — بحد أقصى 5MB": "JPG or PNG image — maximum 5MB",
  "الخدمات المتاحة": "Available services",
  "معلومات المكتب": "Center information",
  "استقبال البلاغات": "Report intake",
  "استخراج التصاريح": "Permit services",
  "طلبات الإشغالات": "Occupancy requests",
  "خدمات المواطنين": "Citizen services",
  "الخريطة التفاعلية للمراكز": "Interactive centers map",
  "اختر أحد المكاتب لعرض التفاصيل": "Select a center to view details",
  "المراكز المتاحة: 4": "4 centers available",
  "سجل الآن واستمتع بجميع الخدمات والمعاملات الحكومية بأمان وسرعة":
    "Create an account and access government services securely and quickly.",
  "تم تسجيل بلاغك وإرساله إلى الإدارة المختصة للمعاينة.":
    "Your report was registered and sent to the responsible department.",
  "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.":
    "You can now sign in with your new password.",
  "عرض جميع البلاغات والخدمات": "View all reports and services",
  "تتبع حالة البلاغ": "Track report status",
  "اليوم، 11:30 ص": "Today, 11:30 AM",
  "الأحد — الخميس، 8:30 ص — 3:00 م": "Sunday — Thursday, 8:30 AM — 3:00 PM",
  "ابدأ الآن ←": "Start now",
}

const originalTextNodes = new WeakMap<Text, string>()

function translateInterface(root: HTMLElement, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode() as Text | null
  while (node) {
    if (!originalTextNodes.has(node))
      originalTextNodes.set(node, node.nodeValue ?? "")
    const original = originalTextNodes.get(node) ?? ""
    const trimmed = original.trim()
    if (trimmed && englishText[trimmed]) {
      const leading = original.match(/^\s*/)?.[0] ?? ""
      const trailing = original.match(/\s*$/)?.[0] ?? ""
      const translated =
        language === "en"
          ? `${leading}${englishText[trimmed]}${trailing}`
          : original
      if (node.nodeValue !== translated) node.nodeValue = translated
    }
    node = (walker.nextNode() as Text | null)
  }
  root.querySelectorAll<HTMLElement>("[placeholder]").forEach((element) => {
    const input = element as HTMLInputElement | HTMLTextAreaElement
    if (!element.dataset.arPlaceholder)
      element.dataset.arPlaceholder = input.placeholder
    const original = element.dataset.arPlaceholder
    input.placeholder =
      language === "en" && englishText[original]
        ? englishText[original]
        : original
  })
}

type IconName = "search" | "moon" | "user" | "bell" | "heart" | "file" | "pin" | "clock" | "phone" | "mail" | "lock" | "eye" | "upload" | "send" | "menu" | "check" | "arrow" | "office" | "bot" | "home" | "settings" | "logout" | "plus" | "mic"

const iconPaths: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  moon: <path d="M20 15.2A8 8 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6" />
    </>
  ),
  bell: (
    <>
      <path d="M6 17h12l-1.5-2v-4a4.5 4.5 0 0 0-9 0v4L6 17Z" />
      <path d="M10 20h4" />
    </>
  ),
  heart: (
    <path d="M12 20S4 15.6 4 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.6 12 20 12 20Z" />
  ),
  file: (
    <>
      <path d="M7 3h7l4 4v14H7Z" />
      <path d="M14 3v5h4M10 12h5M10 16h5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </>
  ),
  phone: <path d="M7 3 4 5c1 8 7 14 15 15l2-3-5-3-2 2c-3-1-5-3-6-6l2-2-3-5Z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m-4 4 4-4 4 4" />
      <path d="M4 15v5h16v-5" />
    </>
  ),
  send: (
    <>
      <path d="m3 4 18 8-18 8 3-8-3-8Z" />
      <path d="M6 12h15" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="m5 12 4 4L19 6" />,
  arrow: <path d="m9 5 7 7-7 7" />,
  office: (
    <>
      <path d="M5 21V5h10v16M15 9h4v12M8 9h4M8 13h4M8 17h4" />
    </>
  ),
  bot: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="4" />
      <path d="M12 3v4M8 12h.01M16 12h.01M8 16h8" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M6 10v11h12V10M10 21v-6h4v6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </>
  ),
}

function Icon({ name, size = 20 }: { name: IconName size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  loading,
  icon,
  className = "",
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  type?: "button" | "submit"
  disabled?: boolean
  loading?: boolean
  icon?: IconName
  className?: string
}) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="spinner" />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      <span>{children}</span>
    </button>
  )
}

function Input({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
  error,
  success,
  required,
  disabled,
  technical,
}: {
  label?: string
  placeholder?: string
  type?: string
  icon?: IconName
  value?: string
  onChange?: (value: string) => void
  error?: string
  success?: boolean
  required?: boolean
  disabled?: boolean
  technical?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const password = type === "password"
  return (
    <label
      className={`field ${error ? "field-error" : ""} ${
        success ? "field-success" : ""
      }`}
    >
      {label && (
        <span className="field-label">
          {label}
          {required && " *"}
        </span>
      )}
      <span className="input-wrap">
        {icon && <Icon name={icon} size={18} />}
        <input
          className={
            technical || icon === "mail" || icon === "phone"
              ? "technical-input"
              : undefined
          }
          dir={
            technical || icon === "mail" || icon === "phone" ? "ltr" : undefined
          }
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          type={password && visible ? "text" : type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {password && (
          <button
            className="input-action"
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label="إظهار أو إخفاء كلمة المرور"
          >
            <Icon name="eye" size={18} />
          </button>
        )}
        {success && <Icon name="check" size={18} />}
      </span>
      {error && <span className="field-message">{error}</span>}
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  children,
  error,
}: {
  label: string
  value?: string
  onChange?: (value: string) => void
  children: ReactNode
  error?: string
}) {
  return (
    <label className={`field ${error ? "field-error" : ""}`}>
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        <select
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {children}
        </select>
      </span>
      {error && <span className="field-message">{error}</span>}
    </label>
  )
}

function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string
  placeholder: string
  value?: string
  onChange?: (value: string) => void
  error?: string
}) {
  return (
    <label className={`field ${error ? "field-error" : ""}`}>
      <span className="field-label">{label}</span>
      <span className="input-wrap textarea-wrap">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </span>
      {error && <span className="field-message">{error}</span>}
    </label>
  )
}

function VerificationCode({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "")

  const updateDigit = (index: number, digit: string) => {
    const next = [...digits]
    next[index] = digit.replace(/\D/g, "").slice(-1)
    onChange(next.join(""))
    if (next[index] && index < 5) inputs.current[index + 1]?.focus()
  }

  return (
    <div className="otp-field">
      <span className="field-label">رمز التحقق</span>
      <div
        className="otp-grid"
        dir="ltr"
        onPaste={(event) => {
          const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6)
          if (!pasted) return
          event.preventDefault()
          onChange(pasted)
          inputs.current[Math.min(pasted.length, 6) - 1]?.focus()
        }}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element
            }}
            className="otp-cell"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`الرقم ${index + 1} من رمز التحقق`}
            maxLength={1}
            value={digit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digit && index > 0) {
                inputs.current[index - 1]?.focus()
              }
              if (event.key === "ArrowLeft" && index > 0) {
                inputs.current[index - 1]?.focus()
              }
              if (event.key === "ArrowRight" && index < 5) {
                inputs.current[index + 1]?.focus()
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}

function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      className={`card ${onClick ? "card-clickable" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div className="card-title">{title}</div>
          <button onClick={onClose} aria-label="إغلاق النافذة">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SweetAlert({
  alert,
  onClose,
  language,
}: {
  alert: AlertState | null
  onClose: () => void
  language: Language
}) {
  if (!alert) return null
  const run = (action?: () => void) => {
    onClose()
    action?.()
  }
  return (
    <div className="alert-backdrop" role="presentation">
      <div
        className={`sweet-alert sweet-alert-${alert.type}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <span className="alert-icon">
          {alert.type === "success" ? (
            <Icon name="check" size={34} />
          ) : alert.type === "error" ? (
            <b>×</b>
          ) : alert.type === "warning" || alert.type === "confirmation" ? (
            <b>!</b>
          ) : (
            <b>i</b>
          )}
        </span>
        <div id="alert-title" className="alert-title">
          {alert.title}
        </div>
        <p id="alert-message">{alert.message}</p>
        <div className="alert-actions">
          <Button onClick={() => run(alert.onPrimary)}>
            {alert.primaryLabel ?? (language === "ar" ? "حسناً" : "OK")}
          </Button>
          {alert.secondaryLabel && (
            <Button variant="secondary" onClick={() => run(alert.onSecondary)}>
              {alert.secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusClass = status.includes("حل")
    ? "resolved"
    : status.includes("تنفيذ")
      ? "processing"
      : status.includes("مراجعة")
        ? "review"
        : status.includes("مغلق")
          ? "closed"
          : "new"
  return <span className={`status status-${statusClass}`}>{status}</span>
}

const navItems: Array<[string, Route]> = [
  ["الرئيسية", "home"],
  ["بلاغات وخدمات الحي", "reports"],
  ["تسجيل ومتابعة شكوى", "submit"],
  ["مكاتب خدمة الحي", "offices"],
  ["مساعد الحي الذكي", "assistant"],
  ["عن المنصة", "about"],
]

const routePaths: Record<Route, string> = {
  home: "/",
  login: "/login",
  register: "/register",
  forgot: "/forgot-password",
  dashboard: "/dashboard",
  "employee-dashboard": "/employee/dashboard",
  "employee-complaints": "/employee/complaints",
  "employee-new": "/employee/complaints/new",
  "employee-review": "/employee/complaints/review",
  "employee-progress": "/employee/complaints/in-progress",
  "employee-clarification": "/employee/complaints/clarification",
  "employee-resolved": "/employee/complaints/resolved",
  "employee-complaint": "/employee/complaints/KH-2026-00125",
  "employee-notifications": "/employee/notifications",
  "employee-profile": "/employee/profile",
  "admin-dashboard": "/admin/dashboard",
  "admin-complaints": "/admin/complaints",
  "admin-citizens": "/admin/citizens",
  "admin-employees": "/admin/employees",
  "admin-departments": "/admin/departments",
  "admin-offices": "/admin/offices",
  "admin-analytics": "/admin/analytics",
  "admin-map": "/admin/map",
  "admin-notifications": "/admin/notifications",
  "admin-settings": "/admin/settings",
  "admin-profile": "/admin/profile",
  "admin-complaint": "/admin/complaints/KH-2026-00125",
  reports: "/services",
  "report-details": "/services/KH-2026-00125",
  submit: "/report",
  "submit-success": "/report/success",
  track: "/track",
  offices: "/offices",
  "office-details": "/offices/main-center",
  assistant: "/assistant",
  about: "/about",
  profile: "/profile",
  notifications: "/notifications",
  favorites: "/favorites",
  faq: "/faq",
  search: "/search",
  emergency: "/emergency",
}

function routeFromLocation(): Route {
  const legacyHash = window.location.hash.replace("#/", "")
  if (legacyHash && legacyHash in routePaths) return legacyHash as Route
  const path = window.location.pathname.replace(/\/+$/, "") || "/"
  const exactMatch = Object.entries(routePaths).find(
    ([, routePath]) => routePath === path,
  )
  if (exactMatch) return exactMatch[0] as Route
  if (/^\/employee\/complaints\/[^/]+$/.test(path)) return "employee-complaint"
  if (/^\/admin\/complaints\/[^/]+$/.test(path)) return "admin-complaint"
  if (/^\/services\/[^/]+$/.test(path)) return "report-details"
  if (/^\/offices\/[^/]+$/.test(path)) return "office-details"
  return "home"
}

function Header({
  route,
  go,
  language,
  theme,
  isLoggedIn,
  currentUser,
  role,
  onToggleLanguage,
  onToggleTheme,
  onLogout,
}: {
  route: Route
  go: (route: Route) => void
  language: Language
  theme: Theme
  isLoggedIn: boolean
  currentUser: CurrentUser | null
  role: Role | null
  onToggleLanguage: () => void
  onToggleTheme: () => void
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dashboardRoute: Route =
    role === "employee"
      ? "employee-dashboard"
      : role === "admin"
        ? "admin-dashboard"
        : "dashboard"
  const roleLabel =
    role === "employee"
      ? "موظف الحي"
      : role === "admin"
        ? "مدير النظام"
        : "مواطن"
  return (
    <header className="main-header" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="header-inner">
        <button className="brand" onClick={() => go("home")}>
          خدمَتي
        </button>
        <nav className={`main-nav ${open ? "nav-open" : ""}`}>
          {navItems.map(([label, target]) => (
            <button
              key={target}
              className={route === target ? "active" : ""}
              onClick={() => {
                go(target)
                setOpen(false)
              }}
            >
              {label}
            </button>
          ))}
          {!isLoggedIn && (
            <button
              className="mobile-login-link"
              onClick={() => {
                go("login")
                setOpen(false)
              }}
            >
              <Icon name="lock" size={18} />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </nav>
        <div className="header-tools">
          <button
            className="icon-button"
            onClick={() => go("search")}
            aria-label="البحث"
          >
            <Icon name="search" size={18} />
          </button>
          <button className="language" onClick={onToggleLanguage}>
            {language === "ar" ? "EN" : "ع"}
          </button>
          <button
            className={`icon-button ${theme === "dark" ? "active" : ""}`}
            aria-label="الوضع الليلي"
            onClick={onToggleTheme}
          >
            <Icon name="moon" size={18} />
          </button>
          {!isLoggedIn ? (
            <Button onClick={() => go("login")}>تسجيل الدخول</Button>
          ) : (
            <div className="header-user">
              <button
                className="user-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="user-avatar">
                  <Icon name="user" size={17} />
                </span>
                <span className="user-copy">
                  <span>
                    {language === "ar"
                      ? `مرحباً، ${currentUser?.name}`
                      : `Welcome, ${currentUser?.name}`}
                  </span>
                  <small>{roleLabel}</small>
                </span>
              </button>
              {userMenuOpen && (
                <div className="user-menu">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go(dashboardRoute)
                    }}
                  >
                    لوحة التحكم
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go("reports")
                    }}
                  >
                    {role === "citizen"
                      ? "بلاغاتي"
                      : role === "employee"
                        ? "إدارة البلاغات"
                        : "جميع البلاغات"}
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go("profile")
                    }}
                  >
                    الملف الشخصي
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go("notifications")
                    }}
                  >
                    الإشعارات
                  </button>
                  <button
                    className="logout"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout()
                    }}
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label="القائمة"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </header>
  )
}

function WorkspaceHeader({
  role,
  currentUser,
  language,
  theme,
  go,
  onToggleLanguage,
  onToggleTheme,
  onLogout,
}: {
  role: "employee" | "admin"
  currentUser: CurrentUser
  language: Language
  theme: Theme
  go: (route: Route) => void
  onToggleLanguage: () => void
  onToggleTheme: () => void
  onLogout: () => void
}) {
  const dashboard =
    role === "employee" ? "employee-dashboard" : "admin-dashboard"
  const notifications =
    role === "employee" ? "employee-notifications" : "admin-notifications"
  const profile = role === "employee" ? "employee-profile" : "admin-profile"
  return (
    <header className="main-header workspace-header">
      <div className="header-inner">
        <button className="brand" onClick={() => go(dashboard)}>
          خدمَتي
        </button>
        <div className="workspace-name">
          <b>
            {role === "employee" ? "مساحة عمل موظف الحي" : "مساحة إدارة المنصة"}
          </b>
          <span>
            {role === "employee" ? "تشغيل البلاغات" : "إدارة ومراقبة النظام"}
          </span>
        </div>
        <nav className="workspace-nav">
          <button onClick={() => go(dashboard)}>لوحة التحكم</button>
          {role === "employee" && (
            <button onClick={() => go("employee-dashboard")}>بلاغاتي</button>
          )}
          {role === "admin" && (
            <button onClick={() => go("admin-dashboard")}>إدارة المنصة</button>
          )}
          <button onClick={() => go(notifications)}>الإشعارات</button>
          <button onClick={() => go(profile)}>الملف الشخصي</button>
        </nav>
        <div className="header-tools">
          <button className="language" onClick={onToggleLanguage}>
            {language === "ar" ? "EN" : "ع"}
          </button>
          <button
            className={`icon-button ${theme === "dark" ? "active" : ""}`}
            onClick={onToggleTheme}
          >
            <Icon name="moon" size={18} />
          </button>
          <button className="workspace-user" onClick={() => go(profile)}>
            <span className="user-avatar">
              <Icon name="user" size={17} />
            </span>
            <span>
              <b>{currentUser.name}</b>
              <small>{role === "employee" ? "موظف الحي" : "مدير النظام"}</small>
            </span>
          </button>
          <button className="icon-button workspace-logout" onClick={onLogout}>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer({ go }: { go: (route: Route) => void }) {
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

function Hero({
  title,
  text,
  children,
  compact = false,
}: {
  title: string
  text: string
  children?: ReactNode
  compact?: boolean
}) {
  return (
    <section className={`hero ${compact ? "hero-compact" : ""}`}>
      <div className="hero-content">
        <div className="hero-title">{title}</div>
        <p>{text}</p>
        {children}
      </div>
      <div className="hero-waves" aria-hidden="true">
        {[
          {
            className: "wave-back",
            path: "M0 74C180 28 360 120 540 78C720 36 900 118 1080 78C1260 38 1350 56 1440 74C1620 28 1800 120 1980 78C2160 36 2340 118 2520 78C2700 38 2790 56 2880 74V180H0Z",
          },
          {
            className: "wave-middle",
            path: "M0 92C240 135 420 35 720 88C1020 141 1200 42 1440 92C1680 135 1860 35 2160 88C2460 141 2640 42 2880 92V180H0Z",
          },
          {
            className: "wave-front",
            path: "M0 88C210 48 420 128 720 92C1020 56 1230 122 1440 88C1650 48 1860 128 2160 92C2460 56 2670 122 2880 88V180H0Z",
          },
        ].map(({ className, path }) => (
          <svg
            key={className}
            className={`hero-wave-layer ${className}`}
            viewBox="0 0 2880 180"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path d={path} />
          </svg>
        ))}
      </div>
    </section>
  )
}

const categoryData = [
  ["النظافة وتراكم القمامة", "24 بلاغ وخدمة", "/assets/442a3.svg"],
  ["إنارة الشوارع والكهرباء", "18 بلاغ وخدمة", "/assets/92c8f.svg"],
  ["صيانة الطرق ورصف الحفر", "15 بلاغ وخدمة", "/assets/12dfe.svg"],
  ["إشغالات الطريق والتعديات", "22 بلاغ وخدمة", "/assets/3d974.svg"],
  ["مخالفات البناء والهدد", "12 بلاغ وخدمة", "/assets/94284.svg"],
  ["المياه والصرف الصحي بالحي", "16 بلاغ وخدمة", "/assets/774f3.svg"],
  ["المحلات المخالفة والإزعاج", "14 بلاغ وخدمة", "/assets/f41ce.svg"],
  ["الحدائق وتقليم الأشجار", "9 بلاغ وخدمة", "/assets/19381.svg"],
]

const reportData = [
  {
    id: "KH-2026-00125",
    title: "تراكم مخلفات هدم وقمامة بشارع الجمهورية",
    category: "النظافة وتراكم القمامة",
    location: "أسيوط — شارع الجمهورية أمام صيدلية الأمل",
    date: "2026/09/30",
    status: "قيد المراجعة",
  },
  {
    id: "KH-2026-00126",
    title: "افتراش مقهى لكامل الرصيف ووضع سلاسل حديد بالشارع",
    category: "إشغالات الطريق والتعديات",
    location: "شارع السلام تقاطع شارع الأهرام",
    date: "2026/09/28",
    status: "جاري التنفيذ",
  },
  {
    id: "KH-2026-00127",
    title: "كسر ماسورة مياه وغرق جانب الطريق",
    category: "المياه والصرف الصحي",
    location: "شارع التحرير بجوار المستشفى",
    date: "2026/09/25",
    status: "تم الحل",
  },
]

const citizenReviews = [
  {
    text: "طريقة تقديم البلاغ بسيطة، ووصلتني تحديثات واضحة حتى تم حل المشكلة.",
    name: "مواطن من الحي",
    service: "خدمات الحي",
  },
  {
    text: "عرضت حالة البلاغ وآخر تحديث بسهولة من خلال رقم الطلب.",
    name: "مواطنة من الحي",
    service: "متابعة البلاغات",
  },
  {
    text: "خدمة مفيدة وفريق المتابعة تجاوب بسرعة مع بلاغ إنارة الشارع.",
    name: "مواطن من الحي",
    service: "الإنارة والكهرباء",
  },
  {
    text: "وجدت مكتب الخدمة الأقرب ومواعيد العمل من مكان واحد.",
    name: "مواطنة من الحي",
    service: "مكاتب الخدمة",
  },
]

function HomePage({
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

function SectionTitle({
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

function ReportCard({
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

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <div className="auth-container">{children}</div>
    </main>
  )
}

function LoginPage({
  go,
  onLogin,
  showAlert,
  citizenAccount,
}: {
  go: (route: Route) => void
  onLogin: (role: Role, user: CurrentUser) => void
  showAlert: (alert: AlertState) => void
  citizenAccount: CitizenAccount
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!email) {
      showAlert({
        type: "warning",
        title: "بيانات ناقصة",
        message: "من فضلك أدخل البريد الإلكتروني أو رقم الهاتف.",
      })
      return
    }
    if (!password) {
      showAlert({
        type: "warning",
        title: "بيانات ناقصة",
        message: "من فضلك أدخل كلمة المرور.",
      })
      return
    }
    const identity = email.trim().toLowerCase()
    let loginResult: { role: Role user: CurrentUser } | null = null
    if (identity === "employee@khadmaty.com" && password === "Employee@123") {
      loginResult = { role: "employee", user: employeeUser }
    } else if (identity === "admin@khadmaty.com" && password === "Admin@123") {
      loginResult = { role: "admin", user: adminUser }
    } else if (
      (identity === citizenAccount.email.toLowerCase() ||
        identity === citizenAccount.phone) &&
      password === citizenAccount.password
    ) {
      loginResult = { role: "citizen", user: citizenAccount }
    }
    if (!loginResult) {
      showAlert({
        type: "error",
        title: "فشل تسجيل الدخول",
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      })
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      onLogin(loginResult.role, loginResult.user)
    }, 700)
  }
  return (
    <AuthLayout>
      <div className="auth-title">تسجيل الدخول</div>
      <form className="auth-card card" onSubmit={submit}>
        <Input
          label="البريد الإلكتروني أو رقم الهاتف"
          icon="mail"
          value={email}
          onChange={setEmail}
          error={
            submitted && !email
              ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف"
              : undefined
          }
        />
        <Input
          label="كلمة المرور"
          type="password"
          icon="lock"
          value={password}
          onChange={setPassword}
          error={submitted && !password ? "يرجى إدخال كلمة المرور" : undefined}
        />
        <div className="form-between">
          <label className="check-label">
            <input type="checkbox" /> تذكرني على هذا الجهاز
          </label>
          <button
            className="text-link"
            type="button"
            onClick={() => go("forgot")}
          >
            نسيت كلمة المرور؟
          </button>
        </div>
        <Button type="submit" loading={loading} className="full">
          تسجيل الدخول
        </Button>
        <div className="login-hint">
          <b>بيانات الدخول التجريبية</b>
          <span>مواطن</span>
          <span className="technical-value">{citizenAccount.email}</span>
          <span className="technical-value">{citizenAccount.password}</span>
          <span>موظف الحي</span>
          <span className="technical-value">employee@khadmaty.com</span>
          <span className="technical-value">Employee@123</span>
          <span>مدير النظام</span>
          <span className="technical-value">admin@khadmaty.com</span>
          <span className="technical-value">Admin@123</span>
        </div>
      </form>
      <div className="auth-links">
        ليس لديك حساب بعد؟{" "}
        <button onClick={() => go("register")}>إنشاء حساب جديد</button>
        <span>أو</span>
        <button onClick={() => go("home")}>المتابعة كزائر</button>
      </div>
      <div className="citizen-only-note">
        إنشاء الحساب متاح للمواطنين فقط. حسابات الموظفين والإدارة محددة مسبقاً.
      </div>
    </AuthLayout>
  )
}

function RegisterPage({
  go,
  onRegister,
}: {
  go: (route: Route) => void
  onRegister: (user: CitizenAccount) => void
}) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (key: keyof typeof values) => (value: string) =>
    setValues({ ...values, [key]: value })
  const invalidEmail =
    !!values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
  const invalidPhone = !!values.phone && !/^01\d{9}$/.test(values.phone)
  const mismatch = !!values.confirm && values.password !== values.confirm
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (
      Object.values(values).some((value) => !value) ||
      invalidEmail ||
      invalidPhone ||
      mismatch
    )
      return
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      onRegister({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })
    }, 700)
  }
  return (
    <AuthLayout>
      <div className="auth-title small">إنشاء حساب جديد</div>
      <p className="auth-subtitle">
        انضم إلى خدمَتي — كل خدماتك الحكومية في مكان واحد
      </p>
      <form className="auth-card card register-card" onSubmit={submit}>
        <Input
          label="الاسم الكامل"
          icon="user"
          value={values.name}
          onChange={set("name")}
          error={submitted && !values.name ? "الاسم الكامل مطلوب" : undefined}
        />
        <Input
          label="البريد الإلكتروني"
          icon="mail"
          value={values.email}
          onChange={set("email")}
          error={
            invalidEmail
              ? "يرجى إدخال بريد إلكتروني صحيح"
              : submitted && !values.email
                ? "البريد الإلكتروني مطلوب"
                : undefined
          }
        />
        <Input
          label="رقم الهاتف"
          icon="phone"
          placeholder="01XXXXXXXXX"
          value={values.phone}
          onChange={set("phone")}
          error={invalidPhone ? "رقم الهاتف غير صحيح" : undefined}
        />
        <Input
          label="كلمة المرور"
          type="password"
          icon="lock"
          value={values.password}
          onChange={set("password")}
          error={
            submitted && values.password.length < 8
              ? "يجب ألا تقل كلمة المرور عن 8 أحرف"
              : undefined
          }
        />
        <Input
          label="تأكيد كلمة المرور"
          type="password"
          icon="lock"
          value={values.confirm}
          onChange={set("confirm")}
          error={mismatch ? "كلمتا المرور غير متطابقتين" : undefined}
        />
        <Button type="submit" loading={loading} className="full">
          إنشاء حساب جديد
        </Button>
        <div className="center-text">
          لديك حساب بالفعل؟{" "}
          <button
            className="text-link"
            type="button"
            onClick={() => go("login")}
          >
            تسجيل الدخول
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}

function ForgotPage({
  go,
  showAlert,
}: {
  go: (route: Route) => void
  showAlert: (alert: AlertState) => void
}) {
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const titles = [
    "نسيت كلمة المرور؟",
    "أدخل رمز التحقق",
    "أنشئ كلمة مرور جديدة",
    "تم تغيير كلمة المرور بنجاح",
  ]
  return (
    <AuthLayout>
      <div className="auth-title small">{titles[step - 1]}</div>
      <Card className="auth-card forgot-card">
        {step === 1 && (
          <>
            <p>أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل إليك رمز التحقق.</p>
            <Input
              label="البريد الإلكتروني أو رقم الهاتف"
              icon="mail"
              value={identifier}
              onChange={setIdentifier}
            />
            <Button
              className="full"
              onClick={() => {
                if (!identifier) {
                  showAlert({
                    type: "warning",
                    title: "بيانات ناقصة",
                    message: "من فضلك أدخل البريد الإلكتروني أو رقم الهاتف.",
                  })
                  return
                }
                setStep(2)
              }}
            >
              إرسال رمز التحقق
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <p>أرسلنا رمزاً مكوناً من 6 أرقام. أدخله للمتابعة.</p>
            <VerificationCode value={code} onChange={setCode} />
            <Button
              className="full"
              onClick={() => {
                if (!/^\d{6}$/.test(code)) {
                  showAlert({
                    type: "error",
                    title: "بيانات غير صحيحة",
                    message: "يرجى إدخال رمز تحقق صحيح مكون من 6 أرقام.",
                  })
                  return
                }
                setStep(3)
              }}
            >
              تحقق من الرمز
            </Button>
          </>
        )}
        {step === 3 && (
          <>
            <Input
              label="كلمة المرور الجديدة"
              type="password"
              icon="lock"
              value={password}
              onChange={setPassword}
            />
            <Input
              label="تأكيد كلمة المرور"
              type="password"
              icon="lock"
              value={confirm}
              onChange={setConfirm}
              error={
                confirm && password !== confirm
                  ? "كلمتا المرور غير متطابقتين."
                  : undefined
              }
            />
            <Button
              className="full"
              onClick={() => {
                if (password.length < 8 || password !== confirm) {
                  showAlert({
                    type: "error",
                    title: "بيانات غير صحيحة",
                    message:
                      password !== confirm
                        ? "كلمتا المرور غير متطابقتين."
                        : "يجب ألا تقل كلمة المرور عن 8 أحرف.",
                  })
                  return
                }
                setStep(4)
              }}
            >
              حفظ كلمة المرور
            </Button>
          </>
        )}
        {step === 4 && (
          <div className="success-state">
            <span className="success-icon">
              <Icon name="check" size={34} />
            </span>
            <p>يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>
            <Button onClick={() => go("login")}>تسجيل الدخول</Button>
          </div>
        )}
      </Card>
      {step < 4 && (
        <div className="steps">
          {[1, 2, 3, 4].map((item) => (
            <span key={item} className={item <= step ? "done" : ""} />
          ))}
        </div>
      )}
    </AuthLayout>
  )
}

const sideItems: Array<[string, IconName, Route]> = [
  ["لوحة التحكم", "home", "dashboard"],
  ["ملفي الشخصي", "user", "profile"],
  ["بلاغاتي وشكاواي", "clock", "reports"],
  ["طلبات الخدمات", "file", "reports"],
  ["المفضلة", "heart", "favorites"],
  ["الإشعارات", "bell", "notifications"],
]

type WorkspaceSidebarItem = {
  label: string
  icon: IconName
  route: Route
  child?: boolean
  section?: "complaints"
}

const employeeSidebarItems: WorkspaceSidebarItem[] = [
  { label: "لوحة العمل", icon: "home", route: "employee-dashboard" },
  {
    label: "البلاغات",
    icon: "file",
    route: "employee-complaints",
    section: "complaints",
  },
  {
    label: "البلاغات الجديدة",
    icon: "mail",
    route: "employee-new",
    child: true,
    section: "complaints",
  },
  {
    label: "قيد المراجعة",
    icon: "search",
    route: "employee-review",
    child: true,
    section: "complaints",
  },
  {
    label: "قيد التنفيذ",
    icon: "clock",
    route: "employee-progress",
    child: true,
    section: "complaints",
  },
  {
    label: "تحتاج إلى توضيح",
    icon: "bot",
    route: "employee-clarification",
    child: true,
    section: "complaints",
  },
  {
    label: "البلاغات المحلولة",
    icon: "check",
    route: "employee-resolved",
    child: true,
    section: "complaints",
  },
  {
    label: "الإشعارات",
    icon: "bell",
    route: "employee-notifications",
  },
  {
    label: "الملف الشخصي",
    icon: "user",
    route: "employee-profile",
  },
]

const adminSidebarItems: WorkspaceSidebarItem[] = [
  { label: "لوحة التحكم", icon: "home", route: "admin-dashboard" },
  { label: "البلاغات", icon: "file", route: "admin-complaints" },
  { label: "المواطنون", icon: "user", route: "admin-citizens" },
  { label: "الموظفون", icon: "user", route: "admin-employees" },
  { label: "الأقسام", icon: "menu", route: "admin-departments" },
  { label: "مكاتب الخدمة", icon: "office", route: "admin-offices" },
  {
    label: "التقارير والإحصائيات",
    icon: "search",
    route: "admin-analytics",
  },
  { label: "الخريطة", icon: "pin", route: "admin-map" },
  { label: "الإشعارات", icon: "bell", route: "admin-notifications" },
  { label: "إعدادات النظام", icon: "settings", route: "admin-settings" },
  { label: "الملف الشخصي", icon: "user", route: "admin-profile" },
]

function AccountLayout({
  route,
  go,
  children,
  currentUser = mockUser,
  onLogout,
  role = "citizen",
}: {
  route: Route
  go: (route: Route) => void
  children: ReactNode
  currentUser?: CurrentUser
  onLogout?: () => void
  role?: Role
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const workspaceItems =
    role === "employee"
      ? employeeSidebarItems
      : role === "admin"
        ? adminSidebarItems
        : null
  const employeeComplaintRoutes: Route[] = [
    "employee-complaints",
    "employee-new",
    "employee-review",
    "employee-progress",
    "employee-clarification",
    "employee-resolved",
    "employee-complaint",
  ]
  return (
    <main className="account-page page-shell">
      <button
        className="workspace-sidebar-toggle"
        onClick={() => setDrawerOpen(true)}
      >
        <Icon name="menu" />
        <span>القائمة</span>
      </button>
      {drawerOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="إغلاق القائمة"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside className={`side-nav card ${drawerOpen ? "drawer-open" : ""}`}>
        <div className="side-user">
          {currentUser.name}
          <small>
            {role === "employee"
              ? "موظف الحي"
              : role === "admin"
                ? "مدير النظام"
                : "مواطن"}
          </small>
        </div>
        {workspaceItems
          ? workspaceItems.map((item) => {
              const active = route === item.route
              const related =
                (item.route === "employee-complaints" &&
                  employeeComplaintRoutes.includes(route)) ||
                (item.route === "admin-complaints" &&
                  route === "admin-complaint")
              return (
                <button
                  key={item.label}
                  className={`${active ? "active" : ""} ${
                    related && !active ? "section-related" : ""
                  } ${item.child ? "sidebar-child" : ""}`}
                  onClick={() => {
                    go(item.route)
                    setDrawerOpen(false)
                  }}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.label === "الإشعارات" && <b className="counter">2</b>}
                </button>
              )
            })
          : sideItems.map(([label, icon, target]) => (
              <button
                key={label}
                className={route === target ? "active" : ""}
                onClick={() => {
                  go(target)
                  setDrawerOpen(false)
                }}
              >
                <Icon name={icon} />
                <span>{label}</span>
                {label === "الإشعارات" && <b className="counter">2</b>}
              </button>
            ))}
        {!workspaceItems && (
          <button onClick={() => go("profile")}>
            <Icon name="settings" />
            <span>الإعدادات</span>
          </button>
        )}
        <button
          className="logout"
          onClick={() => {
            setDrawerOpen(false)
            if (onLogout) onLogout()
            else go("login")
          }}
        >
          <Icon name="logout" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>
      <section className="account-content">{children}</section>
    </main>
  )
}

function DashboardPage({
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

function RoleDashboardLayout({
  role,
  currentUser,
  go,
  onLogout,
  children,
}: {
  role: "employee" | "admin"
  currentUser: CurrentUser
  go: (route: Route) => void
  onLogout: () => void
  children: ReactNode
}) {
  return (
    <AccountLayout
      route={role === "employee" ? "employee-dashboard" : "admin-dashboard"}
      go={go}
      currentUser={currentUser}
      onLogout={onLogout}
      role={role}
    >
      {children}
    </AccountLayout>
  )
}

function EmployeeDashboardPage({
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

function EmployeeComplaintsPage({
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

function OperationalComplaintDetails({
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

function AdminDashboardPage({
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

function AdminManagementPage({
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

function ReportsPage({
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

function ComplaintSwitcher({
  active,
  go,
}: {
  active: "submit" | "track"
  go: (route: Route) => void
}) {
  return (
    <div className="segmented" role="tablist" aria-label="التقديم والمتابعة">
      <button
        className={active === "submit" ? "active" : ""}
        aria-selected={active === "submit"}
        role="tab"
        onClick={() => go("submit")}
      >
        تقديم بلاغ للحي
      </button>
      <button
        className={active === "track" ? "active" : ""}
        aria-selected={active === "track"}
        role="tab"
        onClick={() => go("track")}
      >
        متابعة بلاغ سابق
      </button>
    </div>
  )
}

function SubmitPage({
  go,
  selectedCategory,
  showAlert,
  onSubmitted,
  currentUser,
}: {
  go: (route: Route) => void
  selectedCategory: string
  showAlert: (alert: AlertState) => void
  onSubmitted: (complaint: ComplaintRecord) => void
  currentUser: CurrentUser
}) {
  const [category, setCategory] = useState(selectedCategory)
  const [department, setDepartment] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [recordingError, setRecordingError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const invalidPhone = !!phone && !/^01\d{9}$/.test(phone)
  const invalidEmail = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  useEffect(() => {
    return () => {
      audioStreamRef.current?.getTracks().forEach((track) => track.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError("التسجيل الصوتي غير مدعوم في هذا المتصفح.")
      return
    }
    try {
      setRecordingError("")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioStreamRef.current = stream
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size) audioChunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        setAudioUrl(URL.createObjectURL(audioBlob))
        stream.getTracks().forEach((track) => track.stop())
        audioStreamRef.current = null
      }
      recorder.start()
      setIsRecording(true)
    } catch {
      setRecordingError(
        "تعذر الوصول إلى الميكروفون. اسمح باستخدامه ثم حاول مرة أخرى.",
      )
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    const invalid =
      !category ||
      !department ||
      !title ||
      !location ||
      !description ||
      !phone ||
      invalidPhone ||
      invalidEmail ||
      !!uploadError
    if (invalid) {
      showAlert({
        type: "warning",
        title: "بيانات ناقصة",
        message: "يرجى استكمال البيانات المطلوبة قبل إرسال البلاغ.",
      })
      return
    }
    showAlert({
      type: "confirmation",
      title: "تأكيد إرسال البلاغ",
      message: "هل أنت متأكد من إرسال البلاغ؟",
      primaryLabel: "إرسال البلاغ",
      secondaryLabel: "مراجعة البيانات",
      onPrimary: () => {
        setLoading(true)
        window.setTimeout(() => {
          setLoading(false)
          const generatedId = `KH-2026-${String(Date.now()).slice(-5)}`
          onSubmitted({
            id: generatedId,
            title,
            category,
            description,
            location,
            date: "2026/10/01 — 09:30",
            priority: "متوسطة",
            status: "تم استلام البلاغ",
            department,
            assignedEmployee: "أحمد محمد",
            citizen: currentUser,
            timeline: [{ label: "تم إرسال البلاغ", date: "09:30" }],
          })
          go("submit-success")
        }, 850)
      },
    })
  }
  return (
    <main className="form-page page-shell">
      <ComplaintSwitcher active="submit" go={go} />
      <form className="card complaint-form" onSubmit={submit}>
        <div className="form-grid">
          <Select
            label="قسم البلاغ بالحي"
            value={category}
            onChange={setCategory}
            error={
              submitted && !category ? "يرجى اختيار قسم البلاغ" : undefined
            }
          >
            <option value="">اختر القسم المختص</option>
            {categoryData.map(([title]) => (
              <option key={title}>{title}</option>
            ))}
          </Select>
          <Select
            label="إدارة الحي المختصة"
            value={department}
            onChange={setDepartment}
            error={
              submitted && !department ? "يرجى اختيار إدارة الحي" : undefined
            }
          >
            <option value="">اختر إدارة الحي المعنية</option>
            <option>إدارة النظافة والإشغالات</option>
            <option>إدارة الطرق والإنارة</option>
          </Select>
        </div>
        <Input
          label="عنوان المشكلة بالحي بالتفصيل"
          placeholder="مثال: تراكم قمامة أمام مدرسة النصر"
          value={title}
          onChange={setTitle}
          error={submitted && !title ? "عنوان المشكلة مطلوب" : undefined}
        />
        <Input
          label="الموقع التفصيلي للمشكلة"
          icon="pin"
          placeholder="اسم الشارع وأقرب علامة مميزة"
          value={location}
          onChange={setLocation}
          error={submitted && !location ? "موقع المشكلة مطلوب" : undefined}
        />
        <TextArea
          label="تفاصيل المشكلة والملاحظات الميدانية"
          placeholder="اشرح تفاصيل المشكلة وما يحتاجه فريق الحي للمعاينة..."
          value={description}
          onChange={setDescription}
          error={
            submitted && !description
              ? "يرجى كتابة وصف واضح للمشكلة"
              : undefined
          }
        />
        <div className={`voice-recorder ${isRecording ? "is-recording" : ""}`}>
          <span className="voice-recorder-icon">
            <Icon name="mic" size={20} />
          </span>
          <div className="voice-recorder-copy">
            <b>اضغط لتسجيل صوت المشكلة</b>
            <span>
              {isRecording
                ? "جارٍ التسجيل الآن، اضغط إيقاف عند الانتهاء."
                : "سجّل وصفاً مختصراً للمشكلة ليساعد فريق الحي."}
            </span>
          </div>
          <Button
            type="button"
            variant={isRecording ? "danger" : "primary"}
            icon="mic"
            onClick={toggleRecording}
          >
            {isRecording ? "إيقاف التسجيل" : "ابدأ التسجيل"}
          </Button>
        </div>
        {recordingError && (
          <span className="field-message voice-message">{recordingError}</span>
        )}
        {audioUrl && (
          <div className="recording-preview">
            <span>تم حفظ التسجيل الصوتي</span>
            <audio controls src={audioUrl}>
              متصفحك لا يدعم تشغيل التسجيل الصوتي.
            </audio>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                URL.revokeObjectURL(audioUrl)
                setAudioUrl("")
              }}
            >
              حذف التسجيل
            </button>
          </div>
        )}
        <label className={`upload-area ${uploadError ? "upload-error" : ""}`}>
          <span className="icon-box">
            <Icon name="upload" />
          </span>
          <b>اضغط لرفع الملفات الداعمة للشكوى</b>
          <span>صورة بصيغة JPG أو PNG — بحد أقصى 5MB</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return setUploadError("")
              if (!file.type.startsWith("image/"))
                return setUploadError("الملف المرفوع يجب أن يكون صورة")
              if (file.size > 5 * 1024 * 1024)
                return setUploadError("حجم الصورة يتجاوز 5MB")
              setUploadError("")
            }}
          />
          {uploadError && <span className="field-message">{uploadError}</span>}
        </label>
        <div className="form-grid">
          <Input
            label="رقم الهاتف"
            icon="phone"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={setPhone}
            error={
              invalidPhone
                ? "يرجى إدخال رقم هاتف مصري صحيح"
                : submitted && !phone
                  ? "رقم الهاتف مطلوب"
                  : undefined
            }
          />
          <Input
            label="البريد الإلكتروني"
            icon="mail"
            placeholder="name@example.com"
            value={email}
            onChange={setEmail}
            error={invalidEmail ? "يرجى إدخال بريد إلكتروني صحيح" : undefined}
          />
        </div>
        <Button type="submit" loading={loading} className="full">
          إرسال الشكوى
        </Button>
      </form>
    </main>
  )
}

function SubmitSuccessPage({
  go,
  complaintId,
}: {
  go: (route: Route) => void
  complaintId: string
}) {
  return (
    <main className="state-page page-shell">
      <Card className="success-panel">
        <span className="success-icon">
          <Icon name="check" size={38} />
        </span>
        <div className="auth-title small">تم إرسال البلاغ بنجاح</div>
        <p>تم استلام بلاغك وسيتم مراجعته من الجهة المختصة.</p>
        <div className="success-details">
          <span>
            رقم البلاغ<b className="technical-value">{complaintId}</b>
          </span>
          <span>
            القسم<b>النظافة وتراكم القمامة</b>
          </span>
          <span>
            الموقع<b>شارع الجمهورية</b>
          </span>
          <span>
            تاريخ التقديم<b>اليوم، 11:30 ص</b>
          </span>
          <span>
            الحالة الحالية
            <StatusBadge status="تم استلام البلاغ" />
          </span>
        </div>
        <div className="action-row centered">
          <Button onClick={() => go("track")}>متابعة حالة البلاغ</Button>
          <Button variant="secondary" onClick={() => go("home")}>
            العودة للرئيسية
          </Button>
        </div>
      </Card>
    </main>
  )
}

function TrackPage({
  go,
  showAlert,
  complaints,
}: {
  go: (route: Route) => void
  showAlert: (alert: AlertState) => void
  complaints: ComplaintRecord[]
}) {
  const [number, setNumber] = useState("")
  const [contact, setContact] = useState("")
  const [searched, setSearched] = useState(false)
  const resultComplaint = complaints.find(
    (complaint) =>
      complaint.id === number.trim().toUpperCase() &&
      [complaint.citizen.phone, complaint.citizen.email].includes(
        contact.trim(),
      ),
  )
  const searchReport = () => {
    if (!number.trim() || !contact.trim()) {
      showAlert({
        type: "warning",
        title: "بيانات ناقصة",
        message: "من فضلك أدخل جميع البيانات المطلوبة.",
      })
      return
    }
    const normalizedId = number.trim().toUpperCase()
    const validIdFormat = /^KH-\d{4}-\d{5}$/.test(normalizedId)
    const validContactFormat =
      /^01\d{9}$/.test(contact.trim()) ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())
    if (!validIdFormat || !validContactFormat) {
      setSearched(false)
      showAlert({
        type: "error",
        title: "بيانات غير صحيحة",
        message: "يرجى التأكد من رقم البلاغ وبيانات التواصل.",
      })
      return
    }
    const match = complaints.find(
      (complaint) =>
        complaint.id === normalizedId &&
        [complaint.citizen.phone, complaint.citizen.email].includes(
          contact.trim(),
        ),
    )
    if (!match) {
      setSearched(false)
      showAlert({
        type: "error",
        title: "لم يتم العثور على البلاغ",
        message: "تأكد من رقم البلاغ وبيانات التواصل ثم حاول مرة أخرى.",
      })
      return
    }
    setSearched(true)
  }
  return (
    <>
      <Hero
        title="تتبع حالة ومسار بلاغ الحي"
        text="أدخل رقم البلاغ وبيانات التواصل لمتابعة مراحل المعاينة والإجراءات والتأكد من الحل ضمن مهلة 72 ساعة"
        compact
      />
      <main className="page-shell narrow">
        <ComplaintSwitcher active="track" go={go} />
        {!searched && (
          <Card className="track-entry">
            <Input
              label="رقم البلاغ"
              value={number}
              onChange={setNumber}
              placeholder="KH-2026-00125"
              technical
            />
            <Input
              label="رقم الهاتف أو البريد الإلكتروني"
              value={contact}
              onChange={setContact}
            />
            <Button className="full" onClick={searchReport}>
              متابعة البلاغ
            </Button>
          </Card>
        )}
        {searched && resultComplaint && (
          <>
            <Card className="summary-strip">
              <StatusBadge status={resultComplaint.status} />
              <span>
                رقم البلاغ<b className="technical-value">{number}</b>
              </span>
            </Card>
            <Card className="detail-card">
              <div className="card-title">{resultComplaint.title}</div>
              <p>{resultComplaint.description}</p>
              <div className="details-grid">
                <span>
                  القسم<b>{resultComplaint.category}</b>
                </span>
                <span>
                  الموقع<b>{resultComplaint.location}</b>
                </span>
                <span>
                  تاريخ التقديم
                  <b className="technical-value">{resultComplaint.date}</b>
                </span>
                <span>
                  الإدارة المسؤولة<b>{resultComplaint.department}</b>
                </span>
              </div>
              <Button variant="secondary" onClick={() => go("report-details")}>
                عرض تفاصيل البلاغ
              </Button>
            </Card>
            <SharedComplaintTimeline complaint={resultComplaint} />
          </>
        )}
      </main>
    </>
  )
}

function Timeline() {
  const steps = [
    ["تم الاستلام", true],
    ["قيد المراجعة", true],
    ["تم تحويله للجهة المختصة", true],
    ["جاري التنفيذ", false],
    ["تم الحل", false],
    ["مغلق", false],
  ]
  return (
    <Card className="timeline">
      <div className="card-title">سجل ومسار الشكوى</div>
      {steps.map(([label, done]) => (
        <div
          className={`timeline-step ${done ? "done" : ""}`}
          key={String(label)}
        >
          <span>{done ? <Icon name="check" size={15} /> : ""}</span>
          <div>
            <b>{label}</b>
            <small>{done ? "تم تحديث الحالة" : "في انتظار الإجراء"}</small>
          </div>
        </div>
      ))}
    </Card>
  )
}

function SharedComplaintTimeline({
  complaint,
}: {
  complaint: ComplaintRecord
}) {
  return (
    <Card className="timeline">
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
  )
}

function ReportDetailsPage({
  go,
  complaint = initialComplaint,
  canClarify = false,
  onClarification,
  toast,
}: {
  go: (route: Route) => void
  complaint?: ComplaintRecord
  canClarify?: boolean
  onClarification?: (text: string) => void
  toast: (text: string) => void
}) {
  const [clarification, setClarification] = useState("")
  return (
    <main className="page-shell report-detail-page">
      <Button variant="ghost" icon="arrow" onClick={() => go("reports")}>
        العودة للبلاغات
      </Button>
      <Card className="report-summary">
        <div>
          <span className="category-label">{complaint.category}</span>
          <div className="page-title">{complaint.title}</div>
          <code>{complaint.id}</code>
        </div>
        <StatusBadge status={complaint.status} />
      </Card>
      <div className="details-layout">
        <Card className="detail-card">
          <div className="card-title">تفاصيل البلاغ</div>
          <div className="details-grid">
            <span>
              تاريخ البلاغ<b>{complaint.date}</b>
            </span>
            <span>
              الموقع<b>{complaint.location}</b>
            </span>
            <span>
              الإدارة المسؤولة<b>{complaint.department}</b>
            </span>
            <span>
              القسم<b>{complaint.category}</b>
            </span>
            <span>
              الأولوية<b className="priority-high">{complaint.priority}</b>
            </span>
          </div>
          <div className="description">
            <b>وصف المشكلة</b>
            <p>{complaint.description}</p>
          </div>
          <div className="uploaded-image">
            {complaint.image ? (
              <img src={complaint.image} alt="صورة مرفقة توضح موقع البلاغ" />
            ) : (
              <span>لا توجد صورة مرفقة</span>
            )}
          </div>
        </Card>
        <SharedComplaintTimeline complaint={complaint} />
      </div>
      {canClarify && complaint.status === "يحتاج إلى توضيح" && (
        <Card className="clarification-reply">
          <div className="card-title">
            الجهة المختصة تحتاج إلى معلومات إضافية
          </div>
          <p>
            أضف المعلومات المطلوبة حتى يتمكن الموظف المختص من استكمال مراجعة
            البلاغ.
          </p>
          <TextArea
            label="المعلومات الإضافية"
            placeholder="اكتب ردك والمعلومات الإضافية هنا..."
            value={clarification}
            onChange={setClarification}
          />
          <Button
            onClick={() => {
              if (!clarification.trim()) return
              onClarification?.(clarification)
              setClarification("")
            }}
          >
            إرسال المعلومات
          </Button>
        </Card>
      )}
      <div className="action-row">
        <Button onClick={() => go("track")}>متابعة البلاغ</Button>
        <Button onClick={() => go("submit")}>تقديم بلاغ مشابه</Button>
        <Button
          variant="secondary"
          icon="plus"
          onClick={() =>
            toast("إضافة التعليقات غير متاحة لهذا النوع من البلاغات حالياً")
          }
        >
          إضافة تعليق
        </Button>
        <Button
          variant="secondary"
          icon="upload"
          onClick={() =>
            toast("يمكن إضافة الصور عند تقديم بلاغ جديد أو طلب توضيح")
          }
        >
          إضافة صورة
        </Button>
      </div>
      <SectionTitle
        title="بلاغات مرتبطة"
        text="بلاغات قريبة من نفس الموقع أو التصنيف"
      />
      <div className="reports-preview related-reports">
        {reportData.slice(1).map((report) => (
          <ReportCard key={report.id} report={report} go={go} />
        ))}
      </div>
    </main>
  )
}

function OfficesPage({
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

function OfficeDetailsPage({
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

function AssistantPage({
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

function AboutPage({ go }: { go: (route: Route) => void }) {
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

function ProfilePage({
  go,
  toast,
  currentUser,
  onUpdateUser,
  onLogout,
  showAlert,
  role,
  activeRoute = "profile",
}: {
  go: (route: Route) => void
  toast: (text: string) => void
  currentUser: CurrentUser
  onUpdateUser: (user: CurrentUser) => void
  onLogout: () => void
  showAlert: (alert: AlertState) => void
  role: Role
  activeRoute?: Route
}) {
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [profile, setProfile] = useState(currentUser)
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  })
  const profileEmailInvalid =
    !profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
  const profilePhoneInvalid = !profile.phone || !/^01\d{9}$/.test(profile.phone)
  return (
    <>
      <AccountLayout
        route={activeRoute}
        go={go}
        currentUser={currentUser}
        onLogout={onLogout}
        role={role}
      >
        <div className="page-title">حسابي</div>
        <Card className="profile-card">
          <span className="profile-avatar">
            <Icon name="user" size={34} />
          </span>
          <SectionTitle title="المعلومات الشخصية" />
          <Input
            label="الاسم الكامل"
            value={profile.name}
            onChange={(name) => setProfile({ ...profile, name })}
            error={!profile.name ? "هذا الحقل مطلوب." : undefined}
          />
          <Input
            label="البريد الإلكتروني"
            value={profile.email}
            onChange={(email) => setProfile({ ...profile, email })}
            error={
              profileEmailInvalid ? "يرجى إدخال بريد إلكتروني صحيح." : undefined
            }
          />
          <Input
            label="رقم الهاتف المحمول"
            value={profile.phone}
            onChange={(phone) => setProfile({ ...profile, phone })}
            error={
              profilePhoneInvalid ? "يرجى إدخال رقم هاتف صحيح." : undefined
            }
          />
          <Select label="اللغة">
            <option>العربية</option>
            <option>English</option>
          </Select>
          <div className="settings-row">
            <span>الإشعارات</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span />
            </label>
          </div>
          <Button variant="secondary" onClick={() => setPasswordOpen(true)}>
            تغيير كلمة المرور
          </Button>
          <Button
            className="full"
            onClick={() => {
              if (!profile.name || profileEmailInvalid || profilePhoneInvalid) {
                showAlert({
                  type: "warning",
                  title: "بيانات ناقصة",
                  message: "من فضلك أدخل جميع البيانات المطلوبة.",
                })
                return
              }
              onUpdateUser(profile)
              showAlert({
                type: "success",
                title: "تم حفظ التغييرات",
                message: "تم تحديث بيانات حسابك بنجاح.",
              })
            }}
          >
            حفظ التغييرات
          </Button>
          <Button variant="danger" onClick={onLogout}>
            تسجيل الخروج
          </Button>
        </Card>
      </AccountLayout>
      <Modal
        open={passwordOpen}
        title="تغيير كلمة المرور"
        onClose={() => setPasswordOpen(false)}
      >
        <div className="modal-form">
          <Input
            label="كلمة المرور الحالية"
            type="password"
            icon="lock"
            value={passwords.current}
            onChange={(current) => setPasswords({ ...passwords, current })}
          />
          <Input
            label="كلمة المرور الجديدة"
            type="password"
            icon="lock"
            value={passwords.next}
            onChange={(next) => setPasswords({ ...passwords, next })}
          />
          <Input
            label="تأكيد كلمة المرور"
            type="password"
            icon="lock"
            value={passwords.confirm}
            onChange={(confirm) => setPasswords({ ...passwords, confirm })}
            error={
              passwords.confirm && passwords.next !== passwords.confirm
                ? "كلمتا المرور غير متطابقتين."
                : undefined
            }
          />
          <div className="action-row">
            <Button
              onClick={() => {
                if (
                  !passwords.current ||
                  !passwords.next ||
                  !passwords.confirm
                ) {
                  showAlert({
                    type: "warning",
                    title: "بيانات ناقصة",
                    message: "من فضلك أدخل جميع البيانات المطلوبة.",
                  })
                  return
                }
                if (passwords.next !== passwords.confirm) {
                  showAlert({
                    type: "error",
                    title: "بيانات غير صحيحة",
                    message: "كلمتا المرور غير متطابقتين.",
                  })
                  return
                }
                setPasswordOpen(false)
                setPasswords({ current: "", next: "", confirm: "" })
                toast("تم تغيير كلمة المرور بنجاح")
              }}
            >
              حفظ كلمة المرور
            </Button>
            <Button variant="ghost" onClick={() => setPasswordOpen(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function NotificationsPage({
  go,
  currentUser,
  onLogout,
  role,
  notices,
  onMarkAll,
  onOpenComplaint,
  activeRoute = "notifications",
}: {
  go: (route: Route) => void
  currentUser: CurrentUser
  onLogout: () => void
  role: Role
  notices: WorkspaceNotification[]
  onMarkAll: () => void
  onOpenComplaint: (id: string) => void
  activeRoute?: Route
}) {
  return (
    <AccountLayout
      route={activeRoute}
      go={go}
      currentUser={currentUser}
      onLogout={onLogout}
      role={role}
    >
      <SectionTitle
        title="الإشعارات والتنبيهات"
        action={
          <Button variant="secondary" onClick={onMarkAll}>
            تحديد الكل كمقروء
          </Button>
        }
      />
      <div className="notification-list">
        {notices.map((notice, index) => (
          <Card
            key={notice.id}
            className={`notification notification-clickable ${
              notice.read ? "read" : "unread"
            }`}
            onClick={() => onOpenComplaint(notice.complaintId)}
          >
            <span className="icon-box">
              <Icon name="bell" />
            </span>
            <div>
              <div className="card-title">{notice.title}</div>
              <p>{notice.message}</p>
              <small>اليوم، {11 + index}:30</small>
            </div>
          </Card>
        ))}
      </div>
    </AccountLayout>
  )
}

function FavoritesPage({
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

function FAQPage() {
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

function SearchPage({
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

function EmergencyPage() {
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

function EmptyState({
  title,
  text,
  action,
}: {
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <Card className="empty-state">
      <span className="empty-icon">
        <Icon name="search" size={30} />
      </span>
      <div className="card-title">{title}</div>
      <p>{text}</p>
      {action}
    </Card>
  )
}

function ProtectedState({
  go,
  title = "تسجيل الدخول مطلوب",
  message = "يجب تسجيل الدخول للوصول إلى لوحة التحكم.",
  target = "login",
}: {
  go: (route: Route) => void
  title?: string
  message?: string
  target?: Route
}) {
  return (
    <main className="state-page page-shell">
      <Card className="success-panel protected-panel">
        <span className="empty-icon">
          <Icon name="lock" size={30} />
        </span>
        <div className="auth-title small">{title}</div>
        <p>{message}</p>
        <Button onClick={() => go(target)}>
          {target === "login" ? "تسجيل الدخول" : "العودة للوحة التحكم"}
        </Button>
      </Card>
    </main>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromLocation)
  const [toastText, setToastText] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState("")
  const [complaintId, setComplaintId] = useState("KH-2026-00126")
  const [selectedComplaintId, setSelectedComplaintId] = useState(
    initialComplaint.id,
  )
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([
    initialComplaint,
  ])
  const [employeeNotifications, setEmployeeNotifications] =
    useState<WorkspaceNotification[]>([
      {
        id: "employee-1",
        title: "بلاغ جديد من مواطن",
        message: "تم استلام بلاغ جديد يحتاج إلى المراجعة.",
        complaintId: initialComplaint.id,
        read: false,
      },
    ])
  const [citizenNotifications, setCitizenNotifications] =
    useState<WorkspaceNotification[]>([
      {
        id: "citizen-1",
        title: "تم تحديث حالة البلاغ",
        message: `تم استلام البلاغ ${initialComplaint.id} وسيتم مراجعته من الجهة المختصة.`,
        complaintId: initialComplaint.id,
        read: false,
      },
    ])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [citizenAccount, setCitizenAccount] =
    useState<CitizenAccount>(defaultCitizen)
  const [alert, setAlert] = useState<AlertState | null>(null)
  const [theme, setTheme] = useState<Theme>(() => {
    return localStorage.getItem("khadmaty-theme") === "dark" ? "dark" : "light"
  })
  const [language, setLanguage] = useState<Language>(() => {
    return localStorage.getItem("khadmaty-language") === "en" ? "en" : "ar"
  })

  useEffect(() => {
    const onNavigation = () => setRoute(routeFromLocation())
    window.addEventListener("popstate", onNavigation)
    window.addEventListener("hashchange", onNavigation)
    return () => {
      window.removeEventListener("popstate", onNavigation)
      window.removeEventListener("hashchange", onNavigation)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("khadmaty-theme", theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    localStorage.setItem("khadmaty-language", language)
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  useEffect(() => {
    const root = document.getElementById("app-root")
    if (!root) return
    translateInterface(root, language)
    const observer = new MutationObserver(() =>
      translateInterface(root, language),
    )
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    return () => observer.disconnect()
  }, [language, route, alert, isLoggedIn, currentUser, role])

  const navigate = (target: Route) => {
    if (target === route) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const updateRoute = () => {
      window.history.pushState({}, "", routePaths[target])
      setRoute(target)
      window.scrollTo({ top: 0, behavior: "auto" })
    }
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => void
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (transitionDocument.startViewTransition && !reduceMotion) {
      transitionDocument.startViewTransition(updateRoute)
    } else {
      updateRoute()
    }
  }

  const showLoginRequired = (
    message = "يجب تسجيل الدخول أولاً حتى تتمكن من تقديم بلاغ.",
  ) => {
    setAlert({
      type: "warning",
      title: "تسجيل الدخول مطلوب",
      message,
      primaryLabel: "تسجيل الدخول",
      secondaryLabel: "إلغاء",
      onPrimary: () => navigate("login"),
    })
  }

  const authenticatedRoutes: Route[] = [
    "dashboard",
    "employee-dashboard",
    "employee-complaints",
    "employee-new",
    "employee-review",
    "employee-progress",
    "employee-clarification",
    "employee-resolved",
    "employee-complaint",
    "employee-notifications",
    "employee-profile",
    "admin-dashboard",
    "admin-complaints",
    "admin-citizens",
    "admin-employees",
    "admin-departments",
    "admin-offices",
    "admin-analytics",
    "admin-map",
    "admin-notifications",
    "admin-settings",
    "admin-profile",
    "admin-complaint",
    "profile",
    "notifications",
    "favorites",
    "submit",
    "submit-success",
  ]

  const roleDashboard = (activeRole = role): Route =>
    activeRole === "employee"
      ? "employee-dashboard"
      : activeRole === "admin"
        ? "admin-dashboard"
        : "dashboard"

  const canAccess = (target: Route) => {
    if (!authenticatedRoutes.includes(target)) return true
    if (!isLoggedIn || !role) return false
    if (
      [
        "dashboard",
        "profile",
        "notifications",
        "favorites",
        "submit",
        "submit-success",
      ].includes(target)
    )
      return role === "citizen"
    if (target.startsWith("employee-")) return role === "employee"
    if (target.startsWith("admin-")) return role === "admin"
    return false
  }

  const go = (target: Route) => {
    if (!isLoggedIn && authenticatedRoutes.includes(target)) {
      showLoginRequired(
        target === "dashboard"
          ? "يجب تسجيل الدخول للوصول إلى لوحة التحكم."
          : "يجب تسجيل الدخول أولاً حتى تتمكن من تقديم بلاغ.",
      )
      return
    }
    if (isLoggedIn && !canAccess(target)) {
      setAlert({
        type: "warning",
        title: "غير مصرح بالدخول",
        message: "لا يملك هذا الحساب صلاحية الوصول إلى هذه الصفحة.",
        primaryLabel: "العودة للوحة التحكم",
        onPrimary: () => navigate(roleDashboard()),
      })
      return
    }
    navigate(target)
  }

  const toast = (text: string) => {
    setToastText(text)
    window.setTimeout(() => setToastText(""), 2200)
  }

  const openWorkspaceComplaint = (
    complaintIdToOpen: string,
    workspaceRole = role,
  ) => {
    setSelectedComplaintId(complaintIdToOpen)
    navigate(
      workspaceRole === "admin" ? "admin-complaint" : "employee-complaint",
    )
  }

  const handleNewComplaint = (complaint: ComplaintRecord) => {
    setComplaintId(complaint.id)
    setSelectedComplaintId(complaint.id)
    setComplaints((current) => [complaint, ...current])
    setEmployeeNotifications((current) => [
      {
        id: `employee-${complaint.id}`,
        title: "بلاغ جديد",
        message: "تم استلام بلاغ جديد يحتاج إلى المراجعة.",
        complaintId: complaint.id,
        read: false,
      },
      ...current,
    ])
    setCitizenNotifications((current) => [
      {
        id: `citizen-${complaint.id}`,
        title: "تم إرسال البلاغ بنجاح",
        message: `تم استلام البلاغ ${complaint.id} وسيتم مراجعته من الجهة المختصة.`,
        complaintId: complaint.id,
        read: false,
      },
      ...current,
    ])
  }

  const updateComplaintStatus = (
    id: string,
    status: ComplaintStatus,
    timelineLabel: string,
    note?: string,
  ) => {
    const isContact = timelineLabel.includes("التواصل مع المواطن")
    const time = new Date().toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    })
    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === id
          ? {
              ...complaint,
              status,
              timeline: [
                ...complaint.timeline,
                { label: timelineLabel, date: time, note },
              ],
            }
          : complaint,
      ),
    )
    setCitizenNotifications((current) => [
      {
        id: `citizen-status-${id}-${Date.now()}`,
        title:
          status === "يحتاج إلى توضيح"
            ? "الجهة المختصة تحتاج إلى معلومات إضافية"
            : isContact
              ? "تم التواصل معك بخصوص البلاغ"
              : "تم تحديث حالة البلاغ",
        message:
          status === "يحتاج إلى توضيح"
            ? `الجهة المختصة تحتاج إلى معلومات إضافية بخصوص بلاغك ${id}.`
            : isContact
              ? `تواصل الموظف المختص معك بخصوص البلاغ ${id}.`
              : `تم تغيير حالة البلاغ ${id} إلى ${status}.`,
        complaintId: id,
        read: false,
      },
      ...current,
    ])
    toast("تم تحديث حالة البلاغ")
  }

  const cancelCitizenComplaint = (id: string) => {
    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === id
          ? {
              ...complaint,
              status: "ملغي",
              timeline: [
                ...complaint.timeline,
                {
                  label: "ألغى المواطن البلاغ",
                  date: new Date().toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ],
            }
          : complaint,
      ),
    )
    toast("تم إلغاء البلاغ بنجاح")
  }

  const provideCitizenClarification = (id: string, clarification: string) => {
    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === id
          ? {
              ...complaint,
              status: "قيد المراجعة",
              timeline: [
                ...complaint.timeline,
                {
                  label: "أضاف المواطن معلومات جديدة",
                  date: new Date().toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  note: clarification,
                },
              ],
            }
          : complaint,
      ),
    )
    setEmployeeNotifications((current) => [
      {
        id: `employee-reply-${id}-${Date.now()}`,
        title: "أضاف المواطن معلومات جديدة",
        message: `المواطن ${currentUser?.name ?? "صاحب البلاغ"} أضاف معلومات جديدة إلى البلاغ ${id}.`,
        complaintId: id,
        read: false,
      },
      ...current,
    ])
    toast("تم إرسال المعلومات الإضافية")
  }

  const handleLogin = (loginRole: Role, user: CurrentUser) => {
    setIsLoggedIn(true)
    setCurrentUser(user)
    setRole(loginRole)
    navigate(roleDashboard(loginRole))
    window.setTimeout(() => toast("تم تسجيل الدخول بنجاح"), 50)
  }

  const handleRegister = (user: CitizenAccount) => {
    setCitizenAccount(user)
    setIsLoggedIn(false)
    setCurrentUser(null)
    setRole(null)
    setAlert({
      type: "success",
      title: "تم إنشاء الحساب بنجاح",
      message: "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.",
      primaryLabel: "تسجيل الدخول",
      onPrimary: () => navigate("login"),
    })
  }

  const handleLogout = () => {
    setAlert({
      type: "confirmation",
      title: "تسجيل الخروج؟",
      message: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
      primaryLabel: "تسجيل الخروج",
      secondaryLabel: "إلغاء",
      onPrimary: () => {
        setIsLoggedIn(false)
        setCurrentUser(null)
        setRole(null)
        setFavorites(new Set())
        navigate("home")
        window.setTimeout(() => toast("تم تسجيل الخروج بنجاح."), 50)
      },
    })
  }

  const toggleFavorite = (id: string) => {
    if (!isLoggedIn) {
      showLoginRequired("سجل الدخول لحفظ الخدمات والبلاغات في المفضلة.")
      return
    }
    if (role !== "citizen") {
      setAlert({
        type: "warning",
        title: "غير مصرح بالدخول",
        message: "المفضلة متاحة لحسابات المواطنين فقط.",
      })
      return
    }
    setFavorites((current) => {
      const next = new Set(current)
      const removing = next.has(id)
      removing ? next.delete(id) : next.add(id)
      toast(
        removing ? "تمت إزالة العنصر من المفضلة" : "تمت الإضافة إلى المفضلة",
      )
      return next
    })
  }

  const footerRoutes: Route[] = [
    "home",
    "reports",
    "report-details",
    "submit",
    "submit-success",
    "track",
    "offices",
    "office-details",
    "assistant",
    "about",
    "faq",
    "search",
    "emergency",
  ]

  const selectedComplaint =
    complaints.find((item) => item.id === selectedComplaintId) ?? complaints[0]
  const citizenComplaints =
    role === "citizen" && currentUser
      ? complaints.filter((item) => item.citizen.email === currentUser.email)
      : []

  const openCitizenComplaint = (id: string) => {
    setSelectedComplaintId(id)
    navigate("report-details")
  }

  const renderPage = () => {
    if (!isLoggedIn && authenticatedRoutes.includes(route))
      return <ProtectedState go={navigate} />
    if (isLoggedIn && !canAccess(route))
      return (
        <ProtectedState
          go={navigate}
          title="غير مصرح بالدخول"
          message="لا يملك هذا الحساب صلاحية الوصول إلى هذه الصفحة."
          target={roleDashboard()}
        />
      )

    switch (route) {
      case "login":
        return (
          <LoginPage
            go={go}
            onLogin={handleLogin}
            showAlert={setAlert}
            citizenAccount={citizenAccount}
          />
        )
      case "register":
        return <RegisterPage go={go} onRegister={handleRegister} />
      case "forgot":
        return <ForgotPage go={go} showAlert={setAlert} />
      case "dashboard":
        return (
          <DashboardPage
            go={go}
            currentUser={currentUser!}
            onLogout={handleLogout}
            showAlert={setAlert}
            toast={toast}
            complaints={citizenComplaints}
            onOpenComplaint={openCitizenComplaint}
            onCancelComplaint={cancelCitizenComplaint}
          />
        )
      case "employee-dashboard":
        return (
          <EmployeeDashboardPage
            go={go}
            currentUser={currentUser!}
            onLogout={handleLogout}
            complaints={complaints}
            onOpenComplaint={(id) => openWorkspaceComplaint(id, "employee")}
            toast={toast}
          />
        )
      case "employee-complaints":
      case "employee-new":
      case "employee-review":
      case "employee-progress":
      case "employee-clarification":
      case "employee-resolved": {
        const employeePageConfig: Record<"employee-complaints" | "employee-new" | "employee-review" | "employee-progress" | "employee-clarification" | "employee-resolved", [string, string, ComplaintStatus[]?]> =
          {
            "employee-complaints": [
              "البلاغات",
              "جميع البلاغات المسندة إلى مساحة عملك.",
            ],
            "employee-new": [
              "البلاغات الجديدة",
              "بلاغات تم استلامها وتحتاج إلى بدء المراجعة.",
              ["جديد", "تم استلام البلاغ"],
            ],
            "employee-review": [
              "قيد المراجعة",
              "بلاغات قيد التحقق أو تم تعيينها للموظف المختص.",
              ["قيد المراجعة", "تم تعيين البلاغ"],
            ],
            "employee-progress": [
              "قيد التنفيذ",
              "بلاغات تعمل الفرق المختصة على تنفيذها.",
              ["جاري التنفيذ", "أعيد فتحه"],
            ],
            "employee-clarification": [
              "تحتاج إلى توضيح",
              "بلاغات بانتظار معلومات إضافية من المواطن.",
              ["يحتاج إلى توضيح"],
            ],
            "employee-resolved": [
              "البلاغات المحلولة",
              "بلاغات تم حلها أو إغلاقها.",
              ["تم الحل", "مغلق"],
            ],
          }
        const [title, text, statuses] = employeePageConfig[route]
        return (
          <EmployeeComplaintsPage
            route={route}
            title={title}
            text={text}
            statuses={statuses}
            complaints={complaints}
            currentUser={currentUser!}
            go={go}
            onLogout={handleLogout}
            onOpenComplaint={(id) => openWorkspaceComplaint(id, "employee")}
          />
        )
      }
      case "employee-complaint":
        return (
          <AccountLayout
            route="employee-complaint"
            go={go}
            currentUser={currentUser!}
            onLogout={handleLogout}
            role="employee"
          >
            <OperationalComplaintDetails
              complaint={selectedComplaint}
              mode="employee"
              go={go}
              toast={toast}
              onStatusChange={(status, label, note) =>
                updateComplaintStatus(selectedComplaint.id, status, label, note)
              }
            />
          </AccountLayout>
        )
      case "admin-dashboard":
        return (
          <AdminDashboardPage
            go={go}
            currentUser={currentUser!}
            onLogout={handleLogout}
            complaints={complaints}
            onOpenComplaint={(id) => openWorkspaceComplaint(id, "admin")}
          />
        )
      case "admin-complaint":
        return (
          <AccountLayout
            route="admin-complaint"
            go={go}
            currentUser={currentUser!}
            onLogout={handleLogout}
            role="admin"
          >
            <OperationalComplaintDetails
              complaint={selectedComplaint}
              mode="admin"
              go={go}
              toast={toast}
            />
          </AccountLayout>
        )
      case "admin-complaints":
      case "admin-citizens":
      case "admin-employees":
      case "admin-departments":
      case "admin-offices":
      case "admin-analytics":
      case "admin-map":
      case "admin-settings":
        return (
          <AdminManagementPage
            route={route}
            currentUser={currentUser!}
            go={go}
            onLogout={handleLogout}
            complaints={complaints}
            onOpenComplaint={(id) => openWorkspaceComplaint(id, "admin")}
            toast={toast}
          />
        )
      case "reports":
        return (
          <ReportsPage
            go={go}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )
      case "report-details":
        return (
          <ReportDetailsPage
            go={go}
            complaint={selectedComplaint}
            canClarify={role === "citizen" && isLoggedIn}
            toast={toast}
            onClarification={(text) =>
              provideCitizenClarification(selectedComplaint.id, text)
            }
          />
        )
      case "submit":
        return (
          <SubmitPage
            go={go}
            selectedCategory={selectedCategory}
            showAlert={setAlert}
            onSubmitted={handleNewComplaint}
            currentUser={currentUser!}
          />
        )
      case "submit-success":
        return <SubmitSuccessPage go={go} complaintId={complaintId} />
      case "track":
        return (
          <TrackPage go={go} showAlert={setAlert} complaints={complaints} />
        )
      case "offices":
        return (
          <OfficesPage
            go={go}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )
      case "office-details":
        return <OfficeDetailsPage go={go} toast={toast} />
      case "assistant":
        return <AssistantPage go={go} setCategory={setSelectedCategory} />
      case "about":
        return <AboutPage go={go} />
      case "employee-profile":
      case "admin-profile":
        return (
          <ProfilePage
            go={go}
            toast={toast}
            currentUser={currentUser!}
            onUpdateUser={setCurrentUser}
            onLogout={handleLogout}
            showAlert={setAlert}
            role={role!}
            activeRoute={route}
          />
        )
      case "employee-notifications":
      case "admin-notifications":
        return (
          <NotificationsPage
            go={go}
            currentUser={currentUser!}
            onLogout={handleLogout}
            role={role!}
            activeRoute={route}
            notices={employeeNotifications}
            onMarkAll={() =>
              setEmployeeNotifications((current) =>
                current.map((item) => ({ ...item, read: true })),
              )
            }
            onOpenComplaint={(id) => openWorkspaceComplaint(id, role)}
          />
        )
      case "profile":
        return (
          <ProfilePage
            go={go}
            toast={toast}
            currentUser={currentUser!}
            onUpdateUser={(user) => {
              setCurrentUser(user)
              if (role === "citizen")
                setCitizenAccount({
                  ...user,
                  password: citizenAccount.password,
                })
            }}
            onLogout={handleLogout}
            showAlert={setAlert}
            role={role!}
          />
        )
      case "notifications":
        return (
          <NotificationsPage
            go={go}
            currentUser={currentUser!}
            onLogout={handleLogout}
            role={role!}
            notices={
              role === "citizen" ? citizenNotifications : employeeNotifications
            }
            onMarkAll={() => {
              if (role === "citizen")
                setCitizenNotifications((current) =>
                  current.map((item) => ({ ...item, read: true })),
                )
              else
                setEmployeeNotifications((current) =>
                  current.map((item) => ({ ...item, read: true })),
                )
            }}
            onOpenComplaint={(id) => {
              if (role === "citizen") openCitizenComplaint(id)
              else openWorkspaceComplaint(id, role)
            }}
          />
        )
      case "favorites":
        return (
          <FavoritesPage
            go={go}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currentUser={currentUser!}
            onLogout={handleLogout}
          />
        )
      case "faq":
        return <FAQPage />
      case "search":
        return <SearchPage go={go} showAlert={setAlert} />
      case "emergency":
        return <EmergencyPage />
      default:
        return <HomePage go={go} isLoggedIn={isLoggedIn} role={role} />
    }
  }

  const page = renderPage()
  return (
    <div
      id="app-root"
      className={`app theme-${theme}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {isLoggedIn &&
      currentUser &&
      (role === "employee" || role === "admin") ? (
        <WorkspaceHeader
          role={role}
          currentUser={currentUser}
          language={language}
          theme={theme}
          go={go}
          onToggleLanguage={() =>
            setLanguage((current) => (current === "ar" ? "en" : "ar"))
          }
          onToggleTheme={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
          onLogout={handleLogout}
        />
      ) : (
        <Header
          route={route}
          go={go}
          language={language}
          theme={theme}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          role={role}
          onToggleLanguage={() =>
            setLanguage((current) => (current === "ar" ? "en" : "ar"))
          }
          onToggleTheme={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
          onLogout={handleLogout}
        />
      )}
      <div className="route-transition" key={route}>
        {page}
      </div>
      {footerRoutes.includes(route) && (!isLoggedIn || role === "citizen") && (
        <Footer go={go} />
      )}
      {toastText && (
        <div className="toast">
          <Icon name="check" />
          <span>{toastText}</span>
        </div>
      )}
      <SweetAlert
        alert={alert}
        onClose={() => setAlert(null)}
        language={language}
      />
    </div>
  )
}
