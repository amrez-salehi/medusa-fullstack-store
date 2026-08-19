"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import AdminShell from "@modules/admin/components/admin-shell"
import { adminSdk, toman } from "@modules/admin/lib/sdk"
import AdminIcon from "@modules/admin/components/admin-icon"

type AdminOrder = {
  id: string
  display_id?: number
  email?: string
  total?: number
  currency_code?: string
  payment_status?: string
  fulfillment_status?: string
  created_at?: string
}

type DashboardData = {
  products: number
  orders: AdminOrder[]
  customers: number
}

const fallbackSales = [42, 58, 35, 24, 31, 52, 45]
const chartLabels = ["۱۸ خرداد", "۱۹ خرداد", "۲۰ خرداد", "۲۱ خرداد", "۲۲ خرداد", "۲۳ خرداد", "۲۴ خرداد"]

function SalesChart({ values }: { values: number[] }) {
  const points = values.map((value, index) => `${index * 16.66},${88 - value * 1.25}`).join(" ")
  const area = `0,88 ${points} 100,88`
  return (
    <div className="admin-chart" aria-label="نمودار فروش هفت روز گذشته">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#b4936c" stopOpacity=".22" />
            <stop offset="1" stopColor="#b4936c" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 42, 64, 86].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className="admin-chart-grid" />)}
        <polygon points={area} fill="url(#sales-fill)" />
        <polyline points={points} fill="none" stroke="#9a6947" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <polyline points="0,62 16.66,50 33.32,54 49.98,40 66.64,55 83.3,48 100,35" fill="none" stroke="#c8b8a5" strokeDasharray="3 3" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="admin-chart-axis">{chartLabels.map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      adminSdk.admin.product.list({ limit: 1, offset: 0 }),
      adminSdk.admin.order.list({ limit: 100, offset: 0 }),
      adminSdk.admin.customer.list({ limit: 1, offset: 0 }),
    ]).then(([products, orders, customers]) => {
      setData({ products: products.count || 0, orders: (orders.orders || []) as AdminOrder[], customers: customers.count || 0 })
    }).catch(() => setError("اطلاعات داشبورد دریافت نشد."))
  }, [])

  const revenue = useMemo(() => data?.orders.reduce((total, order) => total + (order.total || 0), 0) || 0, [data])
  const pending = data?.orders.filter((order) => !["captured", "paid", "completed"].includes((order.payment_status || "").toLowerCase())).length || 0
  const chartValues = data?.orders.length ? data.orders.slice(0, 7).map((order) => Math.max(18, Math.min(68, Math.round((order.total || 0) / 100000)))) : fallbackSales
  const recentOrders = data?.orders.slice(0, 5) || []

  return (
    <AdminShell title="داشبورد" description="نمایی روشن از وضعیت فروشگاه و کارهای امروز.">
      <div className="admin-dashboard-head">
        <div><span className="admin-live-dot" /> داده‌های فروشگاه</div>
        <span>{data ? "از API به‌روزرسانی شد" : "در حال دریافت داده"}</span>
      </div>

      <section className="admin-grid admin-kpi-grid">
        <div className="admin-card admin-kpi admin-kpi-revenue"><span className="admin-stat-icon"><AdminIcon name="wallet" /></span><div className="admin-stat-label">کل فروش</div><div className="admin-stat-value">{toman(revenue)}</div><small>بر اساس سفارش‌های ثبت‌شده</small></div>
        <div className="admin-card admin-kpi admin-kpi-orders"><span className="admin-stat-icon"><AdminIcon name="orders" /></span><div className="admin-stat-label">تعداد سفارش‌ها</div><div className="admin-stat-value">{(data?.orders.length || 0).toLocaleString("fa-IR")}</div><small>{pending.toLocaleString("fa-IR")} سفارش در انتظار بررسی</small></div>
        <div className="admin-card admin-kpi admin-kpi-customers"><span className="admin-stat-icon"><AdminIcon name="customers" /></span><div className="admin-stat-label">مشتریان جدید</div><div className="admin-stat-value">{(data?.customers || 0).toLocaleString("fa-IR")}</div><small>مشتری ثبت‌شده در فروشگاه</small></div>
        <div className="admin-card admin-kpi admin-kpi-products"><span className="admin-stat-icon"><AdminIcon name="products" /></span><div className="admin-stat-label">محصولات</div><div className="admin-stat-value">{(data?.products || 0).toLocaleString("fa-IR")}</div><small>محصول منتشرشده</small></div>
      </section>

      <section className="admin-dashboard-columns">
        <div className="admin-card admin-chart-card">
          <div className="admin-section-head"><div><h2 className="admin-section-title">نمودار فروش</h2><p className="admin-section-note">عملکرد هفت روز گذشته</p></div><button className="admin-filter">⌄ &nbsp; ۷ روز گذشته</button></div>
          <div className="admin-chart-legend"><span><i className="legend-line" /> تعداد سفارش</span><span><i className="legend-dash" /> فروش (تومان)</span></div>
          <SalesChart values={chartValues} />
          <div className="admin-chart-summary"><div><small>میانگین فروش روزانه</small><strong>{toman(Math.round(revenue / 7))}</strong><span>تومان</span></div><div><small>بیشترین فروش روز</small><strong>{toman(Math.max(...chartValues) * 100000)}</strong><span>برآورد نمودار</span></div></div>
        </div>

        <div className="admin-card admin-health-card"><div className="admin-section-head"><div><h2 className="admin-section-title">وضعیت عملیاتی</h2><p className="admin-section-note">وضعیت درگاه، پشتیبان‌گیری، فضای ذخیره‌سازی و هشدارها باید از سامانه مانیتورینگ متصل خوانده شود.</p></div></div><div className="admin-health-list"><div><span>بررسی readiness</span><strong>از مسیر استقرار</strong></div><div><span>پشتیبان‌گیری و بازیابی</span><strong>نیازمند تأیید عملیاتی</strong></div><div><span>هشدارهای زیرساخت</span><strong>نیازمند اتصال مانیتورینگ</strong></div></div></div>
      </section>

      <section className="admin-lower-grid">
        <div className="admin-card"><div className="admin-section-head"><div><h2 className="admin-section-title">سفارش‌های اخیر</h2><p className="admin-section-note">آخرین فعالیت مشتریان</p></div><Link href="/admin/orders" className="admin-btn admin-btn-light admin-btn-small">مشاهده همه</Link></div>{error ? <div className="admin-error">{error}</div> : recentOrders.length === 0 ? <div className="admin-empty">هنوز سفارشی ثبت نشده است.</div> : <div className="admin-table-wrap"><table className="admin-table admin-dashboard-table"><thead><tr><th>سفارش</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id}><td><strong>#{order.display_id || "—"}</strong></td><td>{order.email || "بدون ایمیل"}</td><td>{toman(order.total || 0)}</td><td><span className={`admin-status ${order.payment_status === "captured" ? "" : "pending"}`}>{order.payment_status || "در انتظار پرداخت"}</span></td></tr>)}</tbody></table></div>}</div>
        <div className="admin-card"><div className="admin-section-head"><div><h2 className="admin-section-title">هشدارها و اطلاعیه‌ها</h2><p className="admin-section-note">مواردی که نیاز به توجه دارند</p></div><span className="admin-notification-count">{pending.toLocaleString("fa-IR")}</span></div><div className="admin-alerts">{pending > 0 ? <div className="admin-alert warning"><b><AdminIcon name="orders" size={15} /></b><span>{pending.toLocaleString("fa-IR")} سفارش در انتظار پرداخت می‌باشد.</span><small>بر پایه دادهٔ فعلی API</small></div> : <div className="admin-alert info"><b><AdminIcon name="sparkles" size={15} /></b><span>هشدار عملیاتیِ قابل‌نمایش وجود ندارد.</span><small>مانیتورینگ زیرساخت از این صفحه خوانده نمی‌شود.</small></div>}</div></div>
      </section>

      <section className="admin-card admin-quick-card"><div className="admin-section-head"><div><h2 className="admin-section-title">دسترسی سریع</h2><p className="admin-section-note">ابزارهای پرکاربرد مدیریت فروشگاه</p></div></div><div className="admin-quick-actions"><Link href="/admin/products"><span><AdminIcon name="products" /></span>مدیریت محصولات</Link><Link href="/admin/orders"><span><AdminIcon name="orders" /></span>مدیریت سفارش‌ها</Link><Link href="/admin/customers"><span><AdminIcon name="customers" /></span>مدیریت کاربران</Link><Link href="/admin/reports"><span><AdminIcon name="reports" /></span>گزارش‌های فروش</Link><Link href="/admin/products"><span><AdminIcon name="settings" /></span>تنظیمات فروشگاه</Link></div></section>
    </AdminShell>
  )
}
