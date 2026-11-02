import { useEffect, useState } from "react"
import { defaultCitizen, initialComplaint } from "./data/mockData"
import { routeFromLocation, routePaths } from "./app/routing/routes"
import { translateInterface } from "./utils/translation"
import { Footer, Header, WorkspaceHeader } from "./components/shared"
import { Icon, ProtectedState, SweetAlert } from "./components/ui"
import { LoginPage, RegisterPage, ForgotPage } from "./features/auth"
import { DashboardPage, FavoritesPage } from "./features/citizen"
import { EmployeeDashboardPage, EmployeeComplaintsPage } from "./features/employee"
import {
  OperationalComplaintDetails,
  ReportDetailsPage,
  SubmitPage,
  SubmitSuccessPage,
  TrackPage,
} from "./features/complaints"
import { AdminDashboardPage, AdminManagementPage } from "./features/admin"
import { AccountLayout } from "./layouts"
import { ReportsPage } from "./pages/ReportsPage"
import {
  AboutPage,
  AssistantPage,
  EmergencyPage,
  FAQPage,
  HomePage,
  NotificationsPage,
  OfficesPage,
  OfficeDetailsPage,
  ProfilePage,
  SearchPage,
} from "./pages"
import type {
  AlertState,
  CitizenAccount,
  ComplaintRecord,
  ComplaintStatus,
  CurrentUser,
  Language,
  Role,
  Route,
  Theme,
  WorkspaceNotification,
} from "./types"

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
