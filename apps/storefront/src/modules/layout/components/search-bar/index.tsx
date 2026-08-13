"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchBar({
  placeholder = "جست‌وجوی محصول، متریال یا فضا",
  compact = false,
}: {
  placeholder?: string
  compact?: boolean
}) {
  const router = useRouter()
  const [value, setValue] = useState("")

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = value.trim()
    router.push(query ? `/store?q=${encodeURIComponent(query)}` : "/store")
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`relative z-0 w-full ${
        compact ? "max-w-none" : "max-w-[720px]"
      }`}
    >
      <label htmlFor="site-search" className="sr-only">
        {placeholder}
      </label>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className={`w-full border bg-transparent px-12 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] ${
          compact
            ? "h-10 border-[var(--color-border)]"
            : "h-14 border-[var(--color-border)] bg-[var(--color-surface)]"
        }`}
      />
      <button
        type="submit"
        aria-label="جست‌وجو"
        className={`search-submit absolute right-0 top-0 flex w-12 items-center justify-center text-[var(--color-muted)] transition hover:text-[var(--color-ink)] ${
          compact ? "h-10" : "h-14"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      </button>
    </form>
  )
}
