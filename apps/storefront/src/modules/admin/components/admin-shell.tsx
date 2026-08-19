"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { FormEvent, ReactNode, useEffect, useState } from "react"
import { adminSdk } from "../lib/sdk"
import AdminIcon from "./admin-icon"

const navGroups = [
  {
    label: "فروشگاه",
    items: [
      { icon: "home", label: "داشبورد", href: "/admin" },
      { icon: "orders", label: "سفارش‌ها", href: "/admin/orders" },
      { icon: "products", label: "محصولات", href: "/admin/products" },
      { icon: "categories", label: "دسته‌بندی‌ها" },
    ],
  },
  {
    label: "مدیریت",
    items: [
      { icon: "customers", label: "کاربران", href: "/admin/customers" },
      { icon: "feedback", label: "نظرات و بازخوردها" },
      { icon: "reports", label: "گزارشات", href: "/admin/reports" },
      { icon: "settings", label: "تنظیمات" },
    ],
  },
]

export function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  // Medusa's emailpass provider uses this value as an identity key, but does
  // not require RFC email formatting. Keep the field generic so phone-based
  // usernames (for example, 09107196292) can be used as admin identities.
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true)
    try {
      await adminSdk.client.fetch("/auth/user/emailpass", {
        method: "POST",
        body: { email: username.trim(), password },
      })
      onLoggedIn()
    } catch {
      setError("ورود انجام نشد. نام کاربری و رمز عبور پنل مدوسا را بررسی کنید.")
    } finally { setLoading(false) }
  }

  return <main className="admin-login" dir="rtl">
    <section className="admin-login-card" aria-labelledby="admin-login-title">
      <div className="admin-login-brand">
        <Image src="/brand/harmendecor-mark.png" alt="HARMENDECOR" width={48} height={48} priority />
        <span>پنل مدیریت فروشگاه</span>
      </div>
      <header className="admin-login-header">
        <h1 id="admin-login-title">خوش آمدید</h1>
        <p>برای مدیریت فروشگاه، اطلاعات حساب مدیر را وارد کنید.</p>
      </header>
      <form className="admin-login-form" onSubmit={submit} noValidate={false}>
        <div className="admin-field admin-login-field">
          <label htmlFor="admin-username">نام کاربری مدیر</label>
          <div className="admin-login-control">
            <span className="admin-control-icon"><AdminIcon name="mail" size={20} /></span>
            <input
              id="admin-username"
              className="admin-login-email"
              type="text"
              inputMode="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={username}
              onChange={(event) => { setUsername(event.target.value); if (error) setError("") }}
              placeholder="نام کاربری یا شماره موبایل"
              dir="ltr"
              aria-invalid={Boolean(error)}
            />
          </div>
        </div>
        <div className="admin-field admin-login-field">
          <label htmlFor="admin-password">رمز عبور</label>
          <div className="admin-login-control admin-password-control">
            <span className="admin-control-icon"><AdminIcon name="lock" size={20} /></span>
            <input
              id="admin-password"
              className="admin-login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => { setPassword(event.target.value); if (error) setError("") }}
              placeholder="رمز عبور خود را وارد کنید"
              dir="ltr"
              aria-invalid={Boolean(error)}
            />
            <button
              className="admin-password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
              aria-pressed={showPassword}
            >
              <AdminIcon name={showPassword ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
        </div>
        {error && <div className="admin-error admin-login-error" role="alert">{error}</div>}
        <button className="admin-btn admin-btn-primary admin-login-submit" disabled={loading} aria-busy={loading}>
          <span>{loading ? "در حال بررسی…" : "ورود به پنل"}</span>
          {!loading && <span aria-hidden="true">←</span>}
        </button>
      </form>
      <p className="admin-login-help">این بخش فقط برای مدیران مجاز فروشگاه است.</p>
    </section>
  </main>
}

export default function AdminShell({ children, title, description }: { children: ReactNode; title: string; description?: string; userEmail?: string }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  useEffect(() => { adminSdk.client.fetch("/admin/users/me").then(() => setLoggedIn(true)).catch(() => setLoggedIn(false)) }, [])
  if (loggedIn === null) return <div className="admin-root"><div className="admin-loading" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>در حال آماده‌سازی پنل…</div></div>
  if (!loggedIn) return <AdminLogin onLoggedIn={() => setLoggedIn(true)} />
  const logout = async () => { await adminSdk.client.fetch("/auth/logout", { method: "POST", body: {} }).catch(() => undefined); setLoggedIn(false); router.push("/admin") }
  return <div className="admin-root"><div className="admin-layout">
    <aside className={`admin-side ${open ? "open" : ""}`}>
      <div className="admin-logo"><span className="admin-logo-mark"><Image src="/brand/harmendecor-mark.png" alt="نشان هارمن دکور" width={48} height={48} /></span><span className="admin-logo-divider" aria-hidden="true" /><div className="admin-logo-copy"><strong>هارمن دکور</strong><small>مدیریت فروشگاه</small></div></div>
      <nav className="admin-nav" aria-label="منوی مدیریت">
        {navGroups.map((group) => <div className="admin-nav-group" key={group.label}>
          <span className="admin-nav-label">{group.label}</span>
          {group.items.map((item) => item.href ? (
            <Link key={item.label} href={item.href} className={pathname === item.href ? "active" : ""} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>
              <span className="nav-icon"><AdminIcon name={item.icon} /></span><span>{item.label}</span>
            </Link>
          ) : (
            <span className="admin-nav-disabled" key={item.label} aria-disabled="true">
              <span className="nav-icon"><AdminIcon name={item.icon} /></span><span>{item.label}</span><small>به‌زودی</small>
            </span>
          ))}
        </div>)}
      </nav>
      <button className="admin-logout" onClick={logout}><span className="nav-icon"><AdminIcon name="logout" /></span>خروج از حساب</button>
    </aside>
    <div style={{ minWidth: 0, direction: "rtl" }}><div className="admin-mobilebar"><span className="admin-mobile-brand"><Image src="/brand/harmendecor-mark.png" alt="" width={32} height={32} /><strong>مدیریت فروشگاه</strong></span><button onClick={() => setOpen(!open)} aria-label="باز کردن منو"><AdminIcon name="menu" size={18} /> منو</button></div><main className="admin-main"><header className="admin-topbar"><div className="admin-page-heading"><h1 className="admin-title">{title}</h1>{description && <p className="admin-subtitle">{description}</p>}</div><button className="admin-header-logout" onClick={logout}><AdminIcon name="logout" size={17} /><span>خروج از حساب</span></button></header>{children}</main></div>
  </div></div>
}
