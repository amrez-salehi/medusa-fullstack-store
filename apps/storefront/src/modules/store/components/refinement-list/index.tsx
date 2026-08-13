"use client"

import clsx from "clsx"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
} from "@lib/util/product-option-filters"
import OptionsPicker from "./options-picker"
import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  priceRange?: { min: number; max: number }
  search?: boolean
  hideOptionsPicker?: boolean
  "data-testid"?: string
}

export default function RefinementList({
  sortBy: _sortBy,
  priceRange = { min: 0, max: 0 },
  hideOptionsPicker = false,
  "data-testid": dataTestId,
}: RefinementListProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateQueryParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)
      params.delete("page")
      const queryString = params.toString()
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname
      const currentQuery = searchParams.toString()
      const currentPath = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname
      if (nextPath !== currentPath) router.push(nextPath)
    },
    [pathname, router, searchParams]
  )

  const selectedOptionValueIds = useMemo(
    () => parseOptionValueIds(searchParams),
    [searchParams]
  )
  const minPrice = searchParams.get("priceMin") || ""
  const maxPrice = searchParams.get("priceMax") || ""
  const inStock = searchParams.get("inStock") === "true"
  const activeCount =
    selectedOptionValueIds.length +
    [minPrice, maxPrice, inStock ? "true" : ""].filter(Boolean).length

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const setOptionValueIds = (valueIds: string[]) =>
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      valueIds.forEach((valueId) =>
        params.append(OPTION_VALUE_QUERY_KEY, valueId)
      )
    })

  const clearAll = () =>
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      params.delete("priceMin")
      params.delete("priceMax")
      params.delete("inStock")
    })

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="mb-4 flex min-h-12 w-full items-center justify-between rounded-[8px] border border-[var(--color-border)] bg-[var(--color-light-cream)] px-4 text-sm font-medium text-[var(--color-ink)] small:hidden"
      >
        <span className="flex items-center gap-2">
          <FilterIcon />
          فیلتر محصولات
        </span>
        {activeCount > 0 ? (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-ink)] px-1.5 text-[10px] text-white">
            {activeCount.toLocaleString("fa-IR")}
          </span>
        ) : (
          <span className="text-[var(--color-muted)]">←</span>
        )}
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="بستن فیلترها"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-[2px] small:hidden"
        />
      )}

      <aside
        data-testid={dataTestId}
        aria-label="فیلتر محصولات"
        className={clsx(
          "catalog-refinement flex flex-col bg-[var(--color-light-cream)] small:ml-7 small:w-[280px] small:shrink-0 small:rounded-[14px] small:border small:border-[var(--color-border)]",
          mobileOpen
            ? "fixed inset-x-0 bottom-0 z-[80] max-h-[88dvh] rounded-t-[20px] small:static small:max-h-none"
            : "hidden small:flex"
        )}
      >
        <div className="flex min-h-[68px] shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5">
          <div className="flex items-center gap-2">
            <FilterIcon />
            <h2 className="text-base font-medium text-[var(--color-ink)]">
              فیلترها
            </h2>
            {activeCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-ink)] px-1.5 text-[10px] text-white">
                {activeCount.toLocaleString("fa-IR")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="min-h-10 text-xs text-[var(--color-accent-dark)]"
              >
                پاک کردن
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[var(--color-border)] small:hidden"
              aria-label="بستن فیلترها"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 small:overflow-visible">
          <PriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceRange={priceRange}
            onApply={(minimum, maximum) =>
              updateQueryParams((params) => {
                if (minimum) params.set("priceMin", minimum)
                else params.delete("priceMin")
                if (maximum) params.set("priceMax", maximum)
                else params.delete("priceMax")
              })
            }
          />

          <div className="flex min-h-[58px] items-center justify-between border-t border-[var(--color-border-soft)] text-sm text-[var(--color-text-secondary)]">
            <span>فقط کالاهای موجود</span>
            <button
              type="button"
              role="switch"
              aria-checked={inStock}
              onClick={() =>
                updateQueryParams((params) => {
                  if (inStock) params.delete("inStock")
                  else params.set("inStock", "true")
                })
              }
              className={clsx(
                "relative h-6 w-11 rounded-full border transition",
                inStock
                  ? "border-[var(--color-accent-dark)] bg-[var(--color-accent-dark)]"
                  : "border-[var(--color-border)] bg-[var(--color-background)]"
              )}
            >
              <span
                className={clsx(
                  "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all",
                  inStock ? "right-6" : "right-1"
                )}
              />
            </button>
          </div>

          {!hideOptionsPicker && (
            <OptionsPicker
              selectedValueIds={selectedOptionValueIds}
              setOptionValueIds={setOptionValueIds}
            />
          )}
        </div>

        <div className="sticky bottom-0 mt-auto border-t border-[var(--color-border)] bg-[var(--color-light-cream)] p-4 small:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="min-h-12 w-full rounded-[6px] bg-[var(--color-ink)] px-5 text-sm font-medium text-white"
          >
            مشاهده محصولات
          </button>
        </div>
      </aside>
    </>
  )
}

function PriceFilter({
  minPrice,
  maxPrice,
  priceRange,
  onApply,
}: {
  minPrice: string
  maxPrice: string
  priceRange: { min: number; max: number }
  onApply: (minimum: string, maximum: string) => void
}) {
  const rangeStart = Math.max(0, priceRange.min)
  const rangeEnd = Math.max(rangeStart + 1, priceRange.max)
  const step = 1
  const parsePrice = useCallback(
    (value: string, fallback: number) => {
      if (!value.trim()) return fallback
      const parsed = Number(value)
      return Number.isFinite(parsed)
        ? Math.min(rangeEnd, Math.max(rangeStart, parsed))
        : fallback
    },
    [rangeEnd, rangeStart]
  )
  const [minimum, setMinimum] = useState(() => parsePrice(minPrice, rangeStart))
  const [maximum, setMaximum] = useState(() => parsePrice(maxPrice, rangeEnd))

  useEffect(
    () => setMinimum(parsePrice(minPrice, rangeStart)),
    [minPrice, parsePrice, rangeStart]
  )
  useEffect(
    () => setMaximum(parsePrice(maxPrice, rangeEnd)),
    [maxPrice, parsePrice, rangeEnd]
  )

  const applyRange = (nextMinimum = minimum, nextMaximum = maximum) =>
    onApply(
      nextMinimum === rangeStart ? "" : String(nextMinimum),
      nextMaximum === rangeEnd ? "" : String(nextMaximum)
    )

  const minimumPosition =
    ((minimum - rangeStart) / (rangeEnd - rangeStart)) * 100
  const maximumPosition =
    ((maximum - rangeStart) / (rangeEnd - rangeStart)) * 100

  return (
    <details open className="group">
      <summary className="flex min-h-[58px] cursor-pointer list-none items-center justify-between text-sm font-medium text-[var(--color-ink)]">
        <span>محدوده قیمت</span>
        <ChevronIcon />
      </summary>
      <div className="pb-7 pt-1">
        <div className="space-y-1">
          <PriceValue
            label="از"
            value={minimum}
            onChange={(value) =>
              setMinimum(Math.min(Math.max(value, rangeStart), maximum - step))
            }
            onCommit={() => applyRange()}
          />
          <PriceValue
            label="تا"
            value={maximum}
            onChange={(value) =>
              setMaximum(Math.max(Math.min(value, rangeEnd), minimum + step))
            }
            onCommit={() => applyRange()}
          />
        </div>

        <div className="relative mx-2 mt-7 h-7" dir="ltr">
          <div className="absolute inset-x-0 top-3 h-1 rounded-full bg-[var(--color-border)]" />
          <div
            className="absolute top-3 h-1 rounded-full bg-[var(--color-accent-dark)]"
            style={{
              left: `${minimumPosition}%`,
              right: `${100 - maximumPosition}%`,
            }}
          />
          <input
            type="range"
            aria-label="کمترین قیمت"
            min={rangeStart}
            max={rangeEnd}
            step={step}
            value={minimum}
            onChange={(event) =>
              setMinimum(Math.min(Number(event.target.value), maximum - step))
            }
            onPointerUp={() => applyRange()}
            onKeyUp={() => applyRange()}
            className="price-range-input"
          />
          <input
            type="range"
            aria-label="بیشترین قیمت"
            min={rangeStart}
            max={rangeEnd}
            step={step}
            value={maximum}
            onChange={(event) =>
              setMaximum(Math.max(Number(event.target.value), minimum + step))
            }
            onPointerUp={() => applyRange()}
            onKeyUp={() => applyRange()}
            className="price-range-input"
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--color-muted)]">
          <span>کمترین</span>
          <span>بیشترین</span>
        </div>
      </div>
    </details>
  )
}

function PriceValue({
  label,
  value,
  onChange,
  onCommit,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  onCommit: () => void
}) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)_36px] items-baseline gap-2 border-b border-[var(--color-border-soft)] py-3">
      <span className="text-xs text-[var(--color-muted)]">{label}</span>
      <input
        dir="ltr"
        type="text"
        inputMode="numeric"
        aria-label={`قیمت ${label}`}
        value={value.toLocaleString("fa-IR")}
        onChange={(event) => {
          const normalized = normalizePersianNumber(event.target.value)
          if (normalized) onChange(Number(normalized))
        }}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
        }}
        className="font-latin min-w-0 bg-transparent text-left text-[21px] font-medium tracking-[-.03em] text-[var(--color-ink)] outline-none"
      />
      <small className="text-[10px] text-[var(--color-muted)]">تومان</small>
    </div>
  )
}

function normalizePersianNumber(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[^0-9]/g, "")
}

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M4 7h16M7 12h10M10 17h4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-[var(--color-muted)] transition-transform group-open:rotate-180"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
