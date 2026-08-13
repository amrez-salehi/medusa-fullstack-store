"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FavoriteButton from "@modules/favorites/components/favorite-button"
import { useFavorites } from "@modules/favorites/context/favorites-context"
import Thumbnail from "@modules/products/components/thumbnail"

export default function FavoritesPage() {
  const { favorites, isLoading, error, refresh } = useFavorites()

  return (
    <main className="min-h-[70vh] bg-[var(--color-background)] pb-16 pt-7 small:pb-24 small:pt-12">
      <div className="content-container">
        <header className="flex flex-col gap-5 border-b border-[var(--color-border)] pb-7 small:flex-row small:items-end small:justify-between small:pb-10">
          <div>
            <p className="text-xs font-medium text-[var(--color-accent-dark)]">
              انتخاب‌های ذخیره‌شده
            </p>
            <h1 className="mt-2 text-[30px] font-medium leading-[1.45] tracking-[-.035em] text-[var(--color-ink)] small:text-[44px]">
              علاقه‌مندی‌های شما
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
              محصولاتی که برای مقایسه یا خرید بعدی کنار گذاشته‌اید، اینجا در دسترس‌اند.
            </p>
          </div>
          {!isLoading && !error && favorites.length > 0 && (
            <span className="text-xs text-[var(--color-muted)]">
              {favorites.length.toLocaleString("fa-IR")} محصول
            </span>
          )}
        </header>

        {isLoading ? (
          <FavoritesSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : favorites.length === 0 ? (
          <EmptyState />
        ) : (
          <section
            className="grid grid-cols-2 gap-x-3 gap-y-9 py-8 small:grid-cols-3 small:gap-x-5 small:py-12 large:grid-cols-4"
            aria-label="محصولات مورد علاقه"
          >
            {favorites.map((favorite) => (
              <FavoriteProductCard key={favorite.product_id} favorite={favorite} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

function FavoriteProductCard({
  favorite,
}: {
  favorite: ReturnType<typeof useFavorites>["favorites"][number]
}) {
  const { product } = favorite
  const { cheapestPrice } = getProductPrice({ product })
  const inStock = product.variants?.some(
    (variant) =>
      !variant.manage_inventory ||
      variant.allow_backorder ||
      (variant.inventory_quantity ?? 0) > 0
  )
  const ratingValue = Number(product.metadata?.rating)
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-[10px] bg-[var(--color-surface)]">
        <LocalizedClientLink href={`/products/${product.handle}`} className="block">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            productTitle={product.title}
          />
        </LocalizedClientLink>
        <FavoriteButton
          product={product}
          className="absolute right-2.5 top-2.5 small:right-3 small:top-3"
        />
        {!inStock && (
          <span className="absolute bottom-3 right-3 rounded-[5px] bg-[var(--color-ink)] px-2.5 py-1 text-[10px] text-white">
            ناموجود
          </span>
        )}
      </div>
      <div className="mt-4">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="line-clamp-2 min-h-[48px] text-sm font-medium leading-6 transition hover:text-[var(--color-accent-dark)]"
        >
          {product.title}
        </LocalizedClientLink>
        <div className="mt-2 flex min-h-6 items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
          <span>{hasRating ? `★ ${ratingValue.toLocaleString("fa-IR")}` : "بدون امتیاز"}</span>
          <span className={inStock ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}>
            {inStock ? "موجود" : "ناموجود"}
          </span>
        </div>
        <div className="mt-3 border-t border-[var(--color-border)] pt-3 text-sm font-bold text-[var(--color-ink)]">
          {cheapestPrice?.calculated_price || "برای اطلاع از قیمت، محصول را ببینید"}
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center py-20 text-center small:py-28">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-light-cream)] text-[var(--color-accent-dark)]">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.5" aria-hidden="true">
          <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      </span>
      <h2 className="mt-6 text-xl font-medium">هنوز محصولی ذخیره نکرده‌اید</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
        با انتخاب قلب کنار هر محصول، آن را برای مراجعه بعدی نگه دارید.
      </p>
      <LocalizedClientLink
        href="/store"
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[7px] bg-[var(--color-ink)] px-7 text-sm font-medium text-white transition hover:bg-[var(--color-accent-dark)]"
      >
        دیدن محصولات
      </LocalizedClientLink>
    </section>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => Promise<void> }) {
  return (
    <section className="mx-auto max-w-lg py-20 text-center" role="alert">
      <h2 className="text-xl font-medium">علاقه‌مندی‌ها بارگذاری نشد</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-6 min-h-11 rounded-[7px] border border-[var(--color-ink)] px-6 text-sm font-medium transition hover:bg-[var(--color-ink)] hover:text-white"
      >
        تلاش دوباره
      </button>
    </section>
  )
}

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-9 py-8 small:grid-cols-3 small:gap-x-5 small:py-12 large:grid-cols-4" aria-label="در حال بارگذاری" aria-busy="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/5] rounded-[10px] bg-[var(--color-surface)]" />
          <div className="mt-4 h-4 w-4/5 rounded bg-[var(--color-surface)]" />
          <div className="mt-3 h-3 w-2/5 rounded bg-[var(--color-surface)]" />
          <div className="mt-4 h-4 w-1/2 rounded bg-[var(--color-surface)]" />
        </div>
      ))}
    </div>
  )
}
