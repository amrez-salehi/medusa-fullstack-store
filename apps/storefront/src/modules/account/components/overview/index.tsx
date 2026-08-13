import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { CheckCircleSolid, Clock, ShoppingBag } from "@medusajs/icons"
import DashboardHeader from "@modules/account/components/dashboard-header"
import AccountFavoritesPreview from "@modules/account/components/favorites-preview"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  isPersian?: boolean
}

const Overview = ({ customer, orders, isPersian = false }: OverviewProps) => {
  const customerOrders = orders || []
  const activeOrders = customerOrders.filter(
    (order) => !["delivered", "canceled", "archived"].includes(order.fulfillment_status || "")
  ).length
  const deliveredOrders = customerOrders.filter(
    (order) => order.fulfillment_status === "delivered"
  ).length

  const stats = [
    { value: customerOrders.length, label: isPersian ? "همه سفارش‌ها" : "All orders", icon: ShoppingBag },
    { value: activeOrders, label: isPersian ? "در حال پیگیری" : "In progress", icon: Clock },
    { value: deliveredOrders, label: isPersian ? "تحویل‌شده" : "Delivered", icon: CheckCircleSolid },
  ]

  return (
    <div data-testid="overview-page-wrapper" className="account-overview">
      <DashboardHeader
        customer={customer}
        orderCount={customerOrders.length}
        isPersian={isPersian}
      />

      <section className="account-stat-grid" aria-label="Order summary">
        {stats.map((stat) => (
          <div key={stat.label} className="account-stat-card">
            <div>
              <p>{stat.label}</p>
              <strong>{stat.value.toLocaleString(isPersian ? "fa-IR" : "en-US")}</strong>
            </div>
            <span>
              <stat.icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
        ))}
      </section>

      <section className="account-panel account-orders-panel">
        <div className="account-panel-head">
          <div>
            <p>{isPersian ? "آخرین خریدهای شما" : "Your latest purchases"}</p>
            <h2>{isPersian ? "سفارش‌های اخیر" : "Recent orders"}</h2>
          </div>
          <div className="account-panel-head-action"><LocalizedClientLink href="/account/orders">{isPersian ? "مشاهده همه" : "View all"}</LocalizedClientLink></div>
        </div>
        {customerOrders.length ? (
          <div className="account-order-list">
            {customerOrders.slice(0, 4).map((order) => (
              <LocalizedClientLink key={order.id} href={`/account/orders/details/${order.id}`} className="account-order-row">
                <div className="account-order-primary">
                  <span>
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{isPersian ? "سفارش" : "Order"} #{order.display_id}</strong>
                    <small>{new Date(order.created_at).toLocaleDateString(isPersian ? "fa-IR" : "en-US")}</small>
                  </div>
                </div>
                <div className="account-order-meta">
                  <strong>{convertToLocale({ amount: order.total, currency_code: order.currency_code })}</strong>
                  <span>{isPersian ? "جزئیات سفارش" : "Order details"}</span>
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        ) : (
          <div className="account-orders-empty">
            <span><ShoppingBag className="h-6 w-6" aria-hidden="true" /></span>
            <div>
              <strong>{isPersian ? "هنوز سفارشی ثبت نکرده‌اید" : "No orders yet"}</strong>
              <p>{isPersian ? "برای خانه‌تان چیزی زیبا انتخاب کنید." : "Find something beautiful for your home."}</p>
            </div>
            <LocalizedClientLink href="/store">{isPersian ? "مشاهده محصولات" : "Browse products"}</LocalizedClientLink>
          </div>
        )}
      </section>

      <AccountFavoritesPreview isPersian={isPersian} />

      <section className="account-quick-grid">
        <LocalizedClientLink href="/account/profile" className="account-quick-card">
          <span className="account-quick-icon"><ProfileIcon /></span>
          <div><p>{isPersian ? "اطلاعات حساب" : "Account details"}</p><h2>{isPersian ? "پروفایل خود را کامل کنید" : "Complete your profile"}</h2></div>
          <strong>{getProfileCompletion(customer)}{isPersian ? "٪ تکمیل" : "% complete"}</strong>
        </LocalizedClientLink>
        <LocalizedClientLink href="/account/addresses" className="account-quick-card">
          <span className="account-quick-icon"><AddressIcon /></span>
          <div><p>{isPersian ? "ارسال سفارش" : "Order delivery"}</p><h2>{isPersian ? "آدرس‌های ذخیره‌شده" : "Saved addresses"}</h2></div>
          <strong>{(customer?.addresses?.length || 0).toLocaleString(isPersian ? "fa-IR" : "en-US")} {isPersian ? "آدرس" : "addresses"}</strong>
        </LocalizedClientLink>
      </section>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  if (!customer) return 0
  let count = 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  if (customer.addresses?.some((address) => address.is_default_billing)) count++
  return Math.round((count / 4) * 100)
}

export default Overview

function ProfileIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.7 3-5.5 7-5.5s6.3 1.8 7 5.5" /></svg>
}

function AddressIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
}
