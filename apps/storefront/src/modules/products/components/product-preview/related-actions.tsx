"use client"

import { addToCart } from "@lib/data/cart"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RelatedActions({
  variantId,
  countryCode,
  isPersian,
}: {
  variantId?: string
  countryCode: string
  isPersian?: boolean
}) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    if (!variantId || adding) return
    setAdding(true)
    setAddError(false)
    try {
      await addToCart({ variantId, quantity: 1, countryCode })
      setAdded(true)
      router.refresh()
      window.setTimeout(() => setAdded(false), 1800)
    } catch {
      setAddError(true)
    } finally {
      setAdding(false)
    }
  }

  const label = addError
    ? isPersian
      ? "خطا؛ دوباره تلاش کنید"
      : "Could not add"
    : added
      ? isPersian
        ? "به سبد اضافه شد"
        : "Added to cart"
      : adding
        ? isPersian
          ? "در حال افزودن…"
          : "Adding…"
        : isPersian
          ? "افزودن به سبد"
          : "Add to cart"

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!variantId || adding}
      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--color-ink)] text-xs font-medium text-white transition hover:bg-[var(--color-accent-dark)] disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="M4 5h2l1.5 10.2a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 1.9-1.5L21 8H7" />
        <circle cx="10" cy="20" r="1" fill="currentColor" />
        <circle cx="18" cy="20" r="1" fill="currentColor" />
      </svg>
      {label}
    </button>
  )
}
