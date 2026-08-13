"use client"

import { Button } from "@modules/common/components/ui"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex w-full flex-col gap-4">
        {orders.map((o) => (
          <OrderCard order={o} key={o.id} />
        ))}
      </div>
    )
  }

  return (
    <section
      className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-[14px] border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-10 text-center small:min-h-[300px]"
      data-testid="no-orders-container"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-[var(--color-surface)] text-[var(--color-accent-dark)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M6.5 8.5h11l1 11h-13l1-11Z" />
          <path d="M9 9V6.8a3 3 0 0 1 6 0V9" />
        </svg>
      </span>
      <h2 className="mt-5 text-lg font-medium text-[var(--color-ink)]">
        هنوز سفارشی ثبت نشده است
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--color-muted)]">
        پس از اولین خرید، وضعیت آماده‌سازی و ارسال سفارش در این بخش نمایش داده
        می‌شود.
      </p>
      <div className="mt-6">
        <LocalizedClientLink href="/" passHref>
          <Button
            className="!bg-[var(--color-ink)] !text-white hover:!bg-[var(--color-accent-dark)]"
            data-testid="continue-shopping-button"
          >
            مشاهده محصولات
          </Button>
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default OrderOverview
