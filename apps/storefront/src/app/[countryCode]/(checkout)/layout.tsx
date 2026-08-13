import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import BrandLogo from "@modules/common/components/brand-logo"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full bg-[var(--color-background)] small:min-h-screen">
      <div className="h-20 border-b border-[var(--color-border)] bg-[var(--color-light-cream)]">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
              بازگشت به سبد خرید
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              بازگشت
            </span>
          </LocalizedClientLink>
          <BrandLogo className="w-[150px]" imageClassName="max-h-12" />
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="digikala-stepper" aria-label="مراحل ثبت سفارش">
        <span className="step active"><span className="dot">۱</span>اطلاعات ارسال</span><span aria-hidden="true">←</span>
        <span className="step"><span className="dot">۲</span>انتخاب روش ارسال</span><span aria-hidden="true">←</span>
        <span className="step"><span className="dot">۳</span>پرداخت</span>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
    </div>
  )
}
