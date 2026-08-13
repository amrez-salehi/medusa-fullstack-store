import { Suspense } from "react"

import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SearchBar from "@modules/layout/components/search-bar"
import BrandLogo from "@modules/common/components/brand-logo"
import MobileMenu from "@modules/layout/components/mobile-menu"

const Icon = ({
  name,
}: {
  name: "search" | "user" | "home" | "grid" | "menu" | "heart"
}) => {
  if (name === "search")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 4.3 4.3" />
      </svg>
    )
  if (name === "user")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5.4 20c.8-3.8 3-5.8 6.6-5.8s5.8 2 6.6 5.8" />
      </svg>
    )
  if (name === "home")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m4 10.8 8-6.5 8 6.5V20h-5.2v-5.7H9.2V20H4Z" />
      </svg>
    )
  if (name === "grid")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" />
        <rect x="14" y="4" width="6" height="6" />
        <rect x="4" y="14" width="6" height="6" />
        <rect x="14" y="14" width="6" height="6" />
      </svg>
    )
  if (name === "heart")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

const desktopLinks = [
  ["فروشگاه", "/store"],
  ["فضاها", "/store?view=room"],
  ["کالکشن‌ها", "/collections"],
  ["تازه‌ها", "/store?sortBy=created_at"],
]

export default async function Nav() {
  const currentLocale = await getLocale()
  const isPersian = currentLocale?.toLowerCase().startsWith("fa")

  return (
    <>
      <div className="sticky inset-x-0 top-0 z-40">
        <div className="brand-announcement">
          <span>ارسال رایگان سفارش‌های بالای ۳ میلیون تومان</span>
          <LocalizedClientLink href="/faq">جزئیات ارسال</LocalizedClientLink>
        </div>
        <header className="brand-header isolate">
          <nav
            className="content-container relative z-20 h-[72px] small:flex small:h-[84px] small:items-center small:justify-between small:gap-4"
            aria-label="ناوبری اصلی"
          >
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center small:hidden">
              <MobileMenu />
              <LocalizedClientLink
                href="/search"
                className="brand-icon-button"
                aria-label="جست‌وجو"
              >
                <Icon name="search" />
              </LocalizedClientLink>
            </div>

            <BrandLogo
              priority
              compact
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 small:hidden"
            />
            <BrandLogo priority className="hidden shrink-0 small:inline-flex" />

            <div className="hidden flex-1 items-center justify-center gap-7 small:flex medium:gap-9">
              {desktopLinks.map(([label, href]) => (
                <LocalizedClientLink
                  key={href}
                  href={href}
                  className="brand-nav-link"
                >
                  {label}
                </LocalizedClientLink>
              ))}
            </div>

            <div className="absolute left-2 top-1/2 flex -translate-y-1/2 shrink-0 items-center gap-1 small:static small:translate-y-0 small:gap-2">
              <LocalizedClientLink
                href="/search"
                className="brand-icon-button hidden small:inline-flex"
                aria-label={isPersian ? "جست‌وجو" : "Search"}
              >
                <Icon name="search" />
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/favorites"
                className="brand-icon-button hidden small:inline-flex"
                aria-label="علاقه‌مندی‌ها"
              >
                <Icon name="heart" />
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/account"
                className="brand-icon-button hidden small:inline-flex"
                aria-label={isPersian ? "حساب کاربری" : "Account"}
              >
                <Icon name="user" />
              </LocalizedClientLink>
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="header-cart-button"
                    href="/cart"
                    aria-label="سبد خرید"
                  >
                    <span className="text-lg">□</span>
                  </LocalizedClientLink>
                }
              >
                <CartButton locale={currentLocale} />
              </Suspense>
            </div>
          </nav>
          <div className="content-container relative z-0 hidden border-t border-[var(--color-border-soft)] py-3 small:block">
            <SearchBar
              placeholder={
                isPersian
                  ? "جست‌وجوی محصول، متریال یا فضای خانه…"
                  : "Search by product, material, or room…"
              }
              compact
            />
          </div>
        </header>
      </div>

      <nav className="mobile-bottom-nav" aria-label="دسترسی سریع موبایل">
        <LocalizedClientLink href="/">
          <Icon name="home" />
          <span>خانه</span>
        </LocalizedClientLink>
        <LocalizedClientLink href="/store">
          <Icon name="grid" />
          <span>فروشگاه</span>
        </LocalizedClientLink>
        <LocalizedClientLink href="/search">
          <Icon name="search" />
          <span>جست‌وجو</span>
        </LocalizedClientLink>
        <LocalizedClientLink href="/favorites">
          <Icon name="heart" />
          <span>علاقه‌مندی</span>
        </LocalizedClientLink>
        <LocalizedClientLink href="/account">
          <Icon name="user" />
          <span>حساب</span>
        </LocalizedClientLink>
      </nav>
    </>
  )
}
