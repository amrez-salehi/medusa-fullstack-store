"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { getPersianProductCopy } from "@lib/i18n/product-copy"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
  locale,
}: {
  cart?: HttpTypes.StoreCart | null
  locale?: string | null
}) => {
  const isPersian = locale?.toLowerCase().startsWith("fa")
  const copy = isPersian
    ? {
        cart: "سبد خرید",
        quantity: "تعداد",
        remove: "حذف",
        subtotal: "جمع کالاها",
        taxes: "پیش از هزینه ارسال",
        go: "مشاهده سبد خرید",
        empty: "سبد خرید شما خالی است",
        explore: "مشاهده محصولات",
      }
    : {
        cart: "Cart",
        quantity: "Quantity",
        remove: "Remove",
        subtotal: "Subtotal",
        taxes: "excl. taxes",
        go: "Go to cart",
        empty: "Your shopping bag is empty.",
        explore: "Explore products",
      }
  const [activeTimer, setActiveTimer] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="relative z-50 h-full"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative z-50 h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="header-cart-button"
            href="/cart"
            data-testid="nav-cart-link"
            aria-label={`${copy.cart} (${totalItems})`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M6.5 8.5h11l1 11h-13l1-11Z" />
              <path d="M9 9V6.8a3 3 0 0 1 6 0V9" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-[var(--color-clay)] px-1 text-[10px] font-medium text-white">
                {totalItems.toLocaleString(isPersian ? "fa-IR" : "en-US")}
              </span>
            )}
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="cart-dropdown-panel isolate absolute right-0 top-[calc(100%+10px)] z-[100] hidden w-[min(430px,calc(100vw-2rem))] overflow-hidden rounded-[14px] border border-[var(--color-border)] !bg-[#f5f2eb] text-ui-fg-base opacity-100 shadow-[0_24px_70px_rgba(32,32,29,0.2)] medium:block"
            data-testid="nav-cart-dropdown"
          >
            <div className="relative z-10 flex items-center justify-between border-b border-[var(--color-border)] !bg-[#f5f2eb] px-5 py-4 opacity-100">
              <div>
                <h3 className="text-base font-medium text-[var(--color-ink)]">
                  {copy.cart}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {totalItems > 0
                    ? `${totalItems.toLocaleString(
                        isPersian ? "fa-IR" : "en-US"
                      )} ${isPersian ? "کالا" : "items"}`
                    : isPersian
                    ? "هنوز کالایی انتخاب نکرده‌اید"
                    : "No items selected yet"}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--color-surface)] text-[var(--color-accent-dark)]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M6.5 8.5h11l1 11h-13l1-11Z" />
                  <path d="M9 9V6.8a3 3 0 0 1 6 0V9" />
                </svg>
              </span>
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="grid max-h-[390px] grid-cols-1 gap-3 overflow-y-auto !bg-[#f5f2eb] px-5 py-4 no-scrollbar">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-background)] p-3"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="block w-[88px] overflow-hidden rounded-[8px] bg-[var(--color-surface)]"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex min-w-0 flex-col justify-between">
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex min-w-0 items-start justify-between gap-3">
                              <div className="flex min-w-0 flex-col">
                                <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-[#27231f]">
                                  <LocalizedClientLink
                                    href={`/products/${item.product_handle}`}
                                    data-testid="product-link"
                                  >
                                    {isPersian
                                      ? getPersianProductCopy({
                                          handle: item.product_handle || "",
                                          title: item.title,
                                          description: "",
                                        }).title
                                      : item.title}
                                  </LocalizedClientLink>
                                </h3>
                                <LineItemOptions
                                  variant={item.variant}
                                  data-testid="cart-item-variant"
                                  data-value={item.variant}
                                />
                                <span
                                  className="mt-1 text-xs text-[#8a8177]"
                                  data-testid="cart-item-quantity"
                                  data-value={item.quantity}
                                >
                                  {copy.quantity}: {item.quantity}
                                </span>
                              </div>
                              <div className="shrink-0 text-left text-sm font-semibold text-[#27231f]">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={cartState.currency_code}
                                />
                              </div>
                            </div>
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="mt-2 self-start !text-xs !text-[#9a6947] hover:!text-[#6f4328]"
                            data-testid="cart-item-remove-button"
                          >
                            {copy.remove}
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="border-t border-[#eee7de] bg-[#fbf7f1] px-5 py-4 text-small-regular">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-semibold text-[#27231f]">
                      {copy.subtotal}{" "}
                      <span className="font-normal">({copy.taxes})</span>
                    </span>
                    <span
                      className="text-base font-bold text-[#27231f]"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref>
                    <Button
                      className="w-full !rounded-[6px] !bg-[var(--color-ink)] py-3 text-sm font-medium !text-white hover:!bg-[var(--color-accent-dark)]"
                      size="large"
                      data-testid="go-to-cart-button"
                    >
                      {copy.go}
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="!bg-[#f5f2eb] px-6 py-10 opacity-100">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-[var(--color-surface)] text-[var(--color-accent-dark)]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M6.5 8.5h11l1 11h-13l1-11Z" />
                      <path d="M9 9V6.8a3 3 0 0 1 6 0V9" />
                    </svg>
                  </div>
                  <strong className="mt-5 text-base font-medium text-[var(--color-ink)]">
                    {copy.empty}
                  </strong>
                  <span className="mt-2 max-w-[280px] text-xs leading-6 text-[var(--color-muted)]">
                    {isPersian
                      ? "محصولات مورد علاقه‌تان را انتخاب کنید؛ اینجا همیشه در دسترس شما هستند."
                      : "Choose the pieces you love and find them here."}
                  </span>
                  <div className="mt-6">
                    <LocalizedClientLink href="/store">
                      <>
                        <span className="sr-only">{copy.explore}</span>
                        <Button
                          className="!rounded-[6px] !bg-[var(--color-ink)] !text-white"
                          onClick={close}
                        >
                          {copy.explore}
                        </Button>
                      </>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
