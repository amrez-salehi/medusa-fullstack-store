"use client"

import { useEffect, useMemo, useState } from "react"
import AdminShell from "../../../modules/admin/components/admin-shell"
import { adminSdk, toman } from "../../../modules/admin/lib/sdk"

type Order = { id: string; display_id?: number; total?: number; payment_status?: string; created_at?: string; email?: string }

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { adminSdk.admin.order.list({ limit: 100, offset: 0 }).then((data) => setOrders((data.orders || []) as Order[])).finally(() => setLoading(false)) }, [])
  const revenue = useMemo(() => orders.reduce((total, order) => total + (order.total || 0), 0), [orders])
  const paid = orders.filter((order) => ["captured", "paid", "completed"].includes((order.payment_status || "").toLowerCase())).length
  return <AdminShell title="گزارشات" description="تصمیم‌های بهتر با داده‌های واقعی فروشگاه.">
    <div className="admin-grid admin-kpi-grid"><div className="admin-card admin-kpi"><div className="admin-stat-label">فروش ثبت‌شده</div><div className="admin-stat-value">{toman(revenue)}</div><small>جمع سفارش‌های دریافت‌شده</small></div><div className="admin-card admin-kpi"><div className="admin-stat-label">تعداد سفارش</div><div className="admin-stat-value">{orders.length.toLocaleString("fa-IR")}</div><small>در بازه اطلاعات فعلی</small></div><div className="admin-card admin-kpi"><div className="admin-stat-label">پرداخت موفق</div><div className="admin-stat-value">{paid.toLocaleString("fa-IR")}</div><small>سفارش با پرداخت تأییدشده</small></div><div className="admin-card admin-kpi"><div className="admin-stat-label">میانگین سفارش</div><div className="admin-stat-value">{toman(orders.length ? Math.round(revenue / orders.length) : 0)}</div><small>ارزش متوسط هر سفارش</small></div></div>
    <section className="admin-card"><div className="admin-section-head"><div><h2 className="admin-section-title">گزارش سفارش‌ها</h2><p className="admin-section-note">داده‌ها مستقیماً از API فروشگاه خوانده می‌شوند.</p></div></div>{loading ? <div className="admin-loading">در حال دریافت گزارش…</div> : orders.length === 0 ? <div className="admin-empty">برای ساخت گزارش، اولین سفارش را ثبت کنید.</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>سفارش</th><th>مشتری</th><th>مبلغ</th><th>پرداخت</th><th>تاریخ</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>#{order.display_id || "—"}</td><td>{order.email || "بدون ایمیل"}</td><td>{toman(order.total || 0)}</td><td><span className="admin-status">{order.payment_status || "در انتظار"}</span></td><td className="admin-muted">{order.created_at ? new Date(order.created_at).toLocaleDateString("fa-IR") : "—"}</td></tr>)}</tbody></table></div>}</section>
  </AdminShell>
}
