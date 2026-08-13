import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"
import { getLocale } from "@lib/data/locale-actions"

const CartTemplate = async ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const locale = await getLocale()
  const isPersian = !locale || locale.toLowerCase().startsWith("fa")
  const freeShippingThreshold = 3000000
  const cartSubtotal = cart?.subtotal ?? 0
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100))
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal)

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--color-background)] py-8 small:py-14">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 gap-7 small:grid-cols-[minmax(0,1fr)_380px] small:gap-12">
            <div className="min-w-0">
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#e5e5e5] pb-5 small:mb-6 small:pb-6">
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--color-accent-dark)]">خلاصه خرید</p>
                  <h1 className="text-3xl font-semibold tracking-[-0.04em] small:text-4xl">{isPersian ? "سبد خرید" : "Shopping cart"}</h1>
                </div>
                <span className="rounded-full border border-[var(--color-border)] px-3.5 py-2 text-xs font-medium text-[var(--color-muted)]">{isPersian ? cart.items.length.toLocaleString("fa-IR") : cart.items.length} {isPersian ? "محصول" : cart.items.length === 1 ? "piece" : "pieces"}</span>
              </div>
              {!customer && (
                <SignInPrompt locale={locale} />
              )}
              <ItemsTemplate cart={cart} locale={locale} />
            </div>
            <div className="relative">
              <div className="sticky top-24 flex flex-col gap-y-8">
                <div className="digikala-benefit-card">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#3f4146]"><span>{isPersian ? "ارسال رایگان" : "Free delivery"}</span><span className="text-[#19a974]">{freeShippingProgress >= 100 ? "✓" : `${freeShippingProgress}٪`}</span></div>
                  <p className="mt-2 text-xs leading-6 text-[#81858b]">{freeShippingProgress >= 100 ? (isPersian ? "این سفارش شامل ارسال رایگان است" : "This order qualifies for free delivery") : (isPersian ? `${freeShippingRemaining.toLocaleString("fa-IR")} تومان تا ارسال رایگان` : `${freeShippingRemaining.toLocaleString()} toman to free delivery`)}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf0f2]"><div className="h-full rounded-full bg-[#19a974] transition-all" style={{ width: `${freeShippingProgress}%` }} /></div>
                </div>
                {cart && cart.region && (
                  <Summary cart={cart} locale={locale} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage locale={locale} />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
