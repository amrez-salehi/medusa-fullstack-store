"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { SortOptions } from "../refinement-list/sort-products"

const options: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
]

export default function CatalogToolbar({ sortBy, count }: { sortBy: SortOptions; count: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sortBy", value)
    params.delete("page")
    setOpen(false)
    router.push(`${pathname}?${params.toString()}`)
  }

  const currentLabel = options.find((option) => option.value === sortBy)?.label || "جدیدترین"

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
      <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
        <span className="font-medium text-[var(--color-ink)]">مرتب‌سازی</span>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="مرتب‌سازی محصولات"
            className="flex h-10 min-w-[140px] items-center justify-between gap-4 rounded-[6px] border border-[var(--color-border)] bg-transparent px-4 text-xs text-[var(--color-text-secondary)] transition hover:border-[var(--color-ink)]"
          >
            <span>{currentLabel}</span>
            <span className={open ? "rotate-180 transition-transform" : "transition-transform"}>⌄</span>
          </button>
          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[100] min-w-full overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-[var(--color-background)] p-1 shadow-[0_14px_35px_rgba(39,35,31,0.16)]">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  className={`flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-sm transition ${option.value === sortBy ? "bg-[var(--color-surface)] font-medium text-[var(--color-ink)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-light-cream)] hover:text-[var(--color-ink)]"}`}
                >
                  <span>{option.label}</span>
                  {option.value === sortBy && <span aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <span className="text-xs text-[var(--color-muted)]">{count.toLocaleString("fa-IR")} محصول</span>
    </div>
  )
}
