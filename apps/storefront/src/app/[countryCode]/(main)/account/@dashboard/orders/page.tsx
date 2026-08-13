import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "سفارش‌های من | هارمن دکور",
  description: "سوابق سفارش‌های خود را ببینید.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-7 border-b border-[var(--color-border)] pb-6 small:mb-9 small:flex small:items-end small:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-accent-dark)]">
            حساب کاربری
          </p>
          <h1 className="text-[26px] font-medium leading-[1.5] tracking-[-.035em] text-[var(--color-ink)] small:text-[32px]">
            سفارش‌های من
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
            جزئیات خرید، وضعیت ارسال و سوابق سفارش‌ها را اینجا ببینید.
          </p>
        </div>
        <span className="mt-4 inline-flex w-fit rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] small:mt-0">
          {orders.length.toLocaleString("fa-IR")} سفارش
        </span>
      </div>
      <div className="space-y-5">
        <OrderOverview orders={orders} />
        <TransferRequestForm />
      </div>
    </div>
  )
}
