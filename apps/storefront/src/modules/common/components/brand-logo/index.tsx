import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  priority?: boolean
  markOnly?: boolean
  compact?: boolean
}

export default function BrandLogo({
  className = "",
  imageClassName = "",
  priority: _priority = false,
  markOnly = false,
  compact = false,
}: BrandLogoProps) {
  if (markOnly) {
    return (
      <LocalizedClientLink
        href="/"
        aria-label="Harmendecor"
        className={`inline-flex h-12 w-9 shrink-0 items-center justify-center ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/harmendecor-mark.png" alt="" width="31" height="48" className="h-12 w-auto object-contain" />
      </LocalizedClientLink>
    )
  }

  return (
    <LocalizedClientLink
      href="/"
      aria-label="Harmendecor"
      className={`inline-flex shrink-0 items-center ${compact ? "gap-2.5" : "gap-3"} ${className}`}
    >
      {/* The supplied monogram remains the primary mark; the wordmark is typeset for clarity at navigation sizes. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/harmendecor-mark.png" alt="" width="31" height="48" className={`${compact ? "h-10" : "h-12"} w-auto object-contain ${imageClassName}`} />
      <span className="flex flex-col items-start leading-none" aria-hidden="true">
        <strong className={`font-latin font-medium tracking-[0.18em] text-[var(--color-ink)] ${compact ? "text-[13px]" : "text-[15px]"}`}>HARMEN</strong>
        <span className={`font-latin mt-1 tracking-[0.42em] text-[var(--color-muted)] ${compact ? "text-[7px]" : "text-[9px]"}`}>DECOR</span>
      </span>
    </LocalizedClientLink>
  )
}
