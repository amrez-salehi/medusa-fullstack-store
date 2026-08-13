import "./admin.css"

export const metadata = { title: "پنل مدیریت | HARMENDECOR", description: "پنل مدیریت فارسی فروشگاه هارمن دکور" }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div dir="rtl" lang="fa">{children}</div>
}
