"use client"

import { clx } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  'data-testid': dataTestid
}: {
  page: number
  totalPages: number
  'data-testid'?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper function to generate an array of numbers within a range
  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Function to render a page button
  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      key={p}
      className={clx(
        "grid h-10 min-w-10 place-items-center border px-3 text-sm font-medium transition-colors",
        {
          "border-[var(--color-ink)] bg-[var(--color-ink)] text-white": isCurrent,
          "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]": !isCurrent,
        }
      )}
      disabled={isCurrent}
      aria-current={isCurrent ? "page" : undefined}
      onClick={() => handlePageChange(p)}
    >
      {label}
    </button>
  )

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="grid h-10 min-w-6 place-items-center text-sm text-[#a69b90]"
    >
      ...
    </span>
  )

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      // Show all pages
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      // Handle different cases for displaying pages and ellipses
      if (page <= 4) {
        // Show 1, 2, 3, 4, 5, ..., lastpage
        buttons.push(
          ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (page >= totalPages - 3) {
        // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...arrayRange(totalPages - 4, totalPages).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        // Show 1, ..., page - 1, page, page + 1, ..., lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))
        buttons.push(
          ...arrayRange(page - 1, page + 1).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    return buttons
  }

  return (
    <nav className="mt-14 flex w-full justify-center" aria-label="صفحه‌بندی محصولات">
      <div className="flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-light-cream)] p-2" data-testid={dataTestid}>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1 border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
          aria-label="صفحه قبل"
        >
          <span aria-hidden="true">›</span>
          <span>قبلی</span>
        </button>
        <div className="flex items-center gap-1">
          {renderPageButtons()}
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1 border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
          aria-label="صفحه بعد"
        >
          <span>بعدی</span>
          <span aria-hidden="true">‹</span>
        </button>
      </div>
    </nav>
  )
}
