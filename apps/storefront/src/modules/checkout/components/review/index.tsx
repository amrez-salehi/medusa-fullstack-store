"use client"

import { Heading, clx } from "@modules/common/components/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <section className="digikala-review-card">
      <div className="flex flex-row items-start justify-between gap-4">
        <div>
          <span className="digikala-kicker">مرحله آخر</span>
        <Heading
          level="h2"
          className={clx(
            "mt-2 flex flex-row items-center gap-x-2 text-2xl font-bold text-[#3f4146]",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          بررسی نهایی
        </Heading>
          <p className="mt-2 text-sm text-[var(--color-muted)]">اطلاعات سفارش را مرور کنید و خرید را با خیال راحت نهایی کنید.</p>
        </div>
        <span className="digikala-review-check" aria-hidden="true">✓</span>
      </div>
      {isOpen && previousStepsCompleted && (
        <div className="mt-7 border-t border-[var(--color-border)] pt-6">
          <div className="grid gap-3 small:grid-cols-3">
            <div className="digikala-reassurance"><span>🔒</span><div><strong>پرداخت امن</strong><small>تراکنش رمزنگاری‌شده</small></div></div>
            <div className="digikala-reassurance"><span>↺</span><div><strong>بازگشت آسان</strong><small>طبق شرایط بازگشت کالا</small></div></div>
            <div className="digikala-reassurance"><span>✓</span><div><strong>ثبت مطمئن سفارش</strong><small>پیگیری از حساب کاربری</small></div></div>
          </div>
          <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]">
            با انتخاب «ثبت سفارش»، شرایط استفاده، شرایط فروش و قوانین بازگشت کالا را می‌پذیرید.
          </div>
          <div className="mt-5 flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
            <span className="text-xs leading-6 text-[var(--color-muted)]">پس از ثبت سفارش، جزئیات و فاکتور در حساب کاربری شما قرار می‌گیرد.</span>
            <PaymentButton cart={cart} data-testid="submit-order-button" />
          </div>
        </div>
      )}
    </section>
  )
}

export default Review
