import { Button } from "@modules/common/components/ui"
import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <article
      className="flex flex-col rounded-[14px] border border-[var(--color-border)] bg-[var(--color-background)] p-5"
      data-testid="order-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-soft)] pb-4">
        <div>
          <p className="text-xs text-[var(--color-muted)]">شماره سفارش</p>
          <div className="mt-1 font-medium text-[var(--color-ink)]">
            <span data-testid="order-display-id">{order.display_id}</span>
          </div>
        </div>
        <div className="text-left">
          <span
            className="block text-xs text-[var(--color-muted)]"
            data-testid="order-created-at"
          >
            {new Date(order.created_at).toLocaleDateString("fa-IR")}
          </span>
          <span
            className="mt-1 block text-sm font-medium"
            data-testid="order-amount"
          >
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
        </div>
      </div>
      <div className="my-4 grid grid-cols-2 gap-3 small:grid-cols-4">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div
              key={i.id}
              className="flex flex-col gap-y-2 overflow-hidden rounded-[8px]"
              data-testid="order-item"
            >
              <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              <div className="flex items-center text-xs text-[var(--color-text-secondary)]">
                <span
                  className="text-ui-fg-base font-semibold"
                  data-testid="item-title"
                >
                  {i.title}
                </span>
                <span className="mx-1">×</span>
                <span data-testid="item-quantity">{i.quantity}</span>
              </div>
            </div>
          )
        })}
        {numberOfProducts > 3 && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-small-regular text-ui-fg-base">
              + {numberOfProducts - 3}
            </span>
            <span className="text-small-regular text-ui-fg-base">بیشتر</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--color-border-soft)] pt-4">
        <span className="text-xs text-[var(--color-muted)]">
          {numberOfLines.toLocaleString("fa-IR")} کالا
        </span>
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button
            size="small"
            data-testid="order-details-link"
            variant="secondary"
          >
            مشاهده جزئیات
          </Button>
        </LocalizedClientLink>
      </div>
    </article>
  )
}

export default OrderCard
