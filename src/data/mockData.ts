import type { CitizenAccount, ComplaintRecord, CurrentUser } from "../types"

export const mockUser: CurrentUser = {
  name: "محمد أحمد",
  email: "mohamed@example.com",
  phone: "01000000000",
}

export const defaultCitizen: CitizenAccount = {
  ...mockUser,
  password: "12345678",
}

export const employeeUser: CurrentUser = {
  name: "أحمد محمد",
  email: "employee@khadmaty.com",
  phone: "01111111111",
}

export const adminUser: CurrentUser = {
  name: "مدير النظام",
  email: "admin@khadmaty.com",
  phone: "01222222222",
}

export const initialComplaint: ComplaintRecord = {
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
