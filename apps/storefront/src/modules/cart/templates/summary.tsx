"use client"

import { Button, Heading } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
  locale?: string | null
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, locale }: SummaryProps) => {
  const isPersian = locale?.toLowerCase().startsWith("fa")
  const step = getCheckoutStep(cart)

  return (
    <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-light-cream)] p-6 small:p-7">
      <div className="mb-7 flex items-center justify-between">
        <Heading level="h2" className="text-xl font-bold tracking-[-0.03em]">
          {isPersian ? "خلاصه سفارش" : "Order summary"}
        </Heading>
        <span className="text-xl text-[var(--color-accent-dark)]" aria-hidden="true">✦</span>
      </div>
      <DiscountCode cart={cart} locale={locale} />
      <Divider className="my-6" />
      <CartTotals totals={cart} locale={locale} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="digikala-red-button mt-5 h-14 w-full text-base font-bold">{isPersian ? "ادامه ثبت سفارش" : "Continue to checkout"} <span aria-hidden="true">←</span></Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
