"use client"

import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

export default function HeaderLanguage({ locales, currentLocale }: { locales: Locale[] | null; currentLocale: string | null }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const current = currentLocale || "fa-IR"
  const availableLocales = locales || [{ code: "fa-IR", name: "فارسی" }, { code: "en-US", name: "English" }]
  const currentLabel = current.toLowerCase().startsWith("fa") ? "فارسی" : "English"

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])

  const changeLocale = (code: string) => {
    setOpen(false)
    startTransition(async () => {
      await updateLocale(code)
      router.refresh()
    })
  }

  return (
    <div ref={menuRef} className="relative">
      <span className="sr-only">زبان سایت</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="زبان سایت"
        className="header-utility-button"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5s-1 6.2-3.2 8.5c-2.2-2.3-3.2-5.1-3.2-8.5s1-6.2 3.2-8.5Z" />
        </svg>
        <span className="hidden small:inline">{currentLabel}</span>
        <span className={open ? "hidden rotate-180 transition-transform small:inline" : "hidden transition-transform small:inline"}>⌄</span>
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[100] min-w-[140px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-light-cream)] p-1.5 text-right shadow-[0_14px_35px_rgba(39,35,31,0.12)]">
          {availableLocales.map((locale) => {
            const label = locale.code.toLowerCase().startsWith("fa") ? "فارسی" : "English"
            const selected = locale.code === current
            return (
              <button
                key={locale.code}
                type="button"
                onClick={() => changeLocale(locale.code)}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-xs transition ${selected ? "bg-[var(--color-surface)] font-medium text-[var(--color-ink)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"}`}
              >
                <span>{label}</span>
                {selected && <span aria-hidden="true">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
