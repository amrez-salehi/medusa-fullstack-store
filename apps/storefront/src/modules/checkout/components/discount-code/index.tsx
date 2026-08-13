"use client"

import { Input } from "@modules/common/components/ui"
import React from "react"

import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
  locale?: string | null
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart, locale }) => {
  const isPersian = locale?.toLowerCase().startsWith("fa")
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  // Medusa can return a null promotion while an old/removed promotion is
  // being recalculated. Never let that malformed entry crash the cart page.
  const promotions = (cart.promotions ?? []).filter(
    (promotion): promotion is NonNullable<typeof promotion> => Boolean(promotion)
  )
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code !== undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    setErrorMessage("")

    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    try {
      await applyPromotions(codes)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }

    if (input) {
      input.value = ""
    }
  }

  return (
    <section className="checkout-promo" aria-label={isPersian ? "کد تخفیف" : "Promotion code"}>
      <button
        onClick={() => setIsOpen((value) => !value)}
        type="button"
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-right"
        data-testid="add-discount-button"
      >
        <span className="flex items-center gap-2.5">
          <span className="checkout-promo-icon" aria-hidden="true">٪</span>
          <span>
            <strong>{isPersian ? "کد تخفیف" : "Promotion code"}</strong>
            <small>{isPersian ? "کد خود را وارد و اعمال کنید" : "Enter a code to apply it"}</small>
          </span>
        </span>
        <span className={`text-lg text-[var(--color-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
      </button>

      {isOpen && (
        <form action={(formData) => addPromotionCode(formData)} className="mt-4">
          <div className="flex gap-2">
            <Input
              className="checkout-promo-input"
              id="promotion-input"
              name="code"
              type="text"
              placeholder={isPersian ? "مثلاً OFF20" : "e.g. OFF20"}
              data-testid="discount-input"
            />
            <SubmitButton className="!h-11 !shrink-0 !rounded-[6px] !bg-[var(--color-ink)] !px-5 !text-sm !font-medium !text-white hover:!bg-[var(--color-accent-dark)]" data-testid="discount-apply-button">
              {isPersian ? "اعمال" : "Apply"}
            </SubmitButton>
          </div>
          <ErrorMessage error={errorMessage} data-testid="discount-error-message" />
        </form>
      )}

      {promotions.length > 0 && (
        <div className="mt-4 border-t border-[var(--color-border)] pt-3">
          <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">{isPersian ? "کدهای اعمال‌شده" : "Applied codes"}</p>
          <div className="flex flex-wrap gap-2">
            {promotions.map((promotion) => {
              const value = promotion.application_method?.value
              const currencyCode = promotion.application_method?.currency_code
              const label = value !== undefined && currencyCode !== undefined
                ? promotion.application_method?.type === "percentage"
                  ? `${value}%`
                  : convertToLocale({ amount: +value, currency_code: currencyCode })
                : ""

              return (
                <div key={promotion.id} className="checkout-promo-chip" data-testid="discount-row">
                  <span data-testid="discount-code">{promotion.code} {label && <em>({label})</em>}</span>
                  {!promotion.is_automatic && promotion.code && (
                    <button
                      type="button"
                      onClick={() => removePromotionCode(promotion.code!)}
                      className="rounded-[5px] p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-light-cream)] hover:text-[var(--color-error)]"
                      data-testid="remove-discount-button"
                      aria-label={isPersian ? "حذف کد تخفیف" : "Remove discount code"}
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export default DiscountCode
