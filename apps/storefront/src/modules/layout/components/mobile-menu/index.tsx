"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import BrandLogo from "@modules/common/components/brand-logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const menuLinks = [
  ["فروشگاه", "همه محصولات", "/store"],
  ["خرید بر اساس فضا", "نشیمن، غذاخوری و فضای مطالعه", "/store?view=room"],
  ["کالکشن‌ها", "مجموعه‌های هماهنگ هارمن", "/collections"],
  ["محصولات تازه", "جدیدترین محصولات فروشگاه", "/store?sortBy=created_at"],
  ["علاقه‌مندی‌ها", "انتخاب‌های ذخیره‌شده شما", "/favorites"],
] as const

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        className="brand-icon-button"
        aria-label="باز کردن منو"
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] small:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(25,24,21,.48)] backdrop-blur-[2px]"
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
          />

          <aside
            id="mobile-navigation-panel"
            className="absolute inset-y-0 right-0 flex w-[min(92vw,390px)] flex-col overflow-y-auto rounded-l-[18px] bg-[var(--color-background)] shadow-[-24px_0_70px_rgba(25,24,21,.22)]"
            aria-label="منوی اصلی موبایل"
          >
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5">
              <BrandLogo compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-[var(--color-border)] text-[var(--color-ink)]"
                aria-label="بستن منو"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="px-5 pb-5 pt-6">
              <p className="text-xs font-medium text-[var(--color-accent-dark)]">
                چه چیزی برای خانه می‌خواهید؟
              </p>
              <LocalizedClientLink
                href="/search"
                className="mt-3 flex min-h-12 items-center justify-between rounded-[8px] border border-[var(--color-border)] bg-[var(--color-light-cream)] px-4 text-sm text-[var(--color-text-secondary)]"
              >
                <span>جست‌وجوی محصول یا متریال</span>
                <SearchIcon />
              </LocalizedClientLink>
            </div>

            <nav className="grid border-t border-[var(--color-border-soft)] px-5 py-2">
              {menuLinks.map(([label, description, href]) => (
                <LocalizedClientLink
                  key={href}
                  href={href}
                  className="group flex min-h-[66px] items-center justify-between gap-4 border-b border-[var(--color-border-soft)] py-3"
                >
                  <span>
                    <strong className="block text-[15px] font-medium text-[var(--color-ink)]">
                      {label}
                    </strong>
                    <small className="mt-0.5 block text-[11px] text-[var(--color-muted)]">
                      {description}
                    </small>
                  </span>
                  <ArrowIcon />
                </LocalizedClientLink>
              ))}
            </nav>

            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[var(--color-border)] bg-[var(--color-light-cream)] p-5">
              <LocalizedClientLink
                href="/account"
                className="flex min-h-12 items-center justify-center rounded-[6px] border border-[var(--color-border)] bg-[var(--color-background)] text-sm font-medium"
              >
                حساب کاربری
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/contact"
                className="flex min-h-12 items-center justify-center rounded-[6px] bg-[var(--color-ink)] text-sm font-medium text-white"
              >
                تماس با ما
              </LocalizedClientLink>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

function MenuIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 4.3 4.3" /></svg>
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-[var(--color-accent-dark)] transition group-hover:-translate-x-1" strokeWidth="1.5" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
}
