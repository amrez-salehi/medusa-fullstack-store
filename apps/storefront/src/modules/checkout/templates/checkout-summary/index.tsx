import { Heading } from "@modules/common/components/ui"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { getLocale } from "@lib/data/locale-actions"
import { convertToLocale } from "@lib/util/money"
import { getPersianProductCopy } from "@lib/i18n/product-copy"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const CheckoutSummary = async ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const locale = await getLocale()
  const items = [...(cart.items || [])].sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))

  return (
    <aside className="sticky top-6 flex flex-col gap-y-4" aria-label="خلاصه سبد خرید">
      <section className="checkout-summary-card">
        <header className="flex items-center justify-between">
          <div>
            <Heading level="h2" className="text-lg font-medium text-[var(--color-ink)]">جزئیات پرداخت</Heading>
            <p className="mt-1 text-xs text-[var(--color-muted)]">خلاصه سفارش شما</p>
          </div>
          <span className="checkout-item-count">{items.length.toLocaleString("fa-IR")} کالا</span>
        </header>

        <Divider className="my-5" />
        <CartTotals totals={cart} locale={locale} />

        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <p className="mb-3 text-xs font-medium text-[var(--color-text-secondary)]">اقلام سبد خرید</p>
          <ul className="space-y-3">
            {items.map((item) => {
              const title = getPersianProductCopy({
                handle: item.product_handle || "",
                title: item.product_title || "",
                description: "",
              }).title
              const price = item.total ?? (item.unit_price || 0) * item.quantity

              return (
                <li key={item.id} className="checkout-summary-item">
                  <LocalizedClientLink href={`/products/${item.product_handle}`} className="checkout-summary-thumb">
                    <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" />
                  </LocalizedClientLink>
                  <div className="min-w-0 flex-1">
                    <LocalizedClientLink href={`/products/${item.product_handle}`} className="line-clamp-2 text-sm font-medium leading-6 text-[var(--color-text)] hover:text-[var(--color-accent-dark)]">
                      {title}
                    </LocalizedClientLink>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{item.quantity.toLocaleString("fa-IR")} عدد</p>
                    <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">{convertToLocale({ amount: price, currency_code: cart.currency_code })}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-5 border-t border-[var(--color-border)] pt-4">
          <DiscountCode cart={cart} locale={locale} />
        </div>
      </section>
      <p className="checkout-secure-note"><span>✓</span> پرداخت شما امن است و اطلاعات سفارش پس از ثبت در حساب کاربری قابل پیگیری خواهد بود.</p>
    </aside>
  )
}

export default CheckoutSummary
