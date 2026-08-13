import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getLocale } from "@lib/data/locale-actions"
import RelatedActions from "./related-actions"
import FavoriteButton from "@modules/favorites/components/favorite-button"

export default async function ProductPreview({
  product,
  isFeatured,
  isRelated,
  region: _region,
  countryCode = "dk",
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  isRelated?: boolean
  region: HttpTypes.StoreRegion
  countryCode?: string
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const locale = await getLocale()
  const isPersian = !locale || locale.toLowerCase().startsWith("fa")
  const inStock = product.variants?.some(
    (variant) =>
      !variant.manage_inventory ||
      variant.allow_backorder ||
      (variant.inventory_quantity ?? 0) > 0
  )

  return (
    <article data-testid="product-wrapper" className="product-card group relative box-border h-full w-full min-w-0">
      <div className="product-card-media relative overflow-hidden rounded-[10px] bg-[var(--color-surface)]">
        <LocalizedClientLink href={`/products/${product.handle}`} className="block">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            productTitle={product.title}
          />
        </LocalizedClientLink>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {cheapestPrice?.price_type === "sale" && <span className="rounded-[5px] bg-[var(--color-clay)] px-2.5 py-1 text-[10px] font-medium text-white">پیشنهاد هارمن</span>}
          {!inStock && <span className="rounded-[5px] bg-[var(--color-ink)] px-2.5 py-1 text-[10px] text-white">ناموجود</span>}
        </div>
        <FavoriteButton
          product={product}
          className="absolute right-2.5 top-2.5 small:right-3 small:top-3"
        />
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="absolute inset-x-3 bottom-3 hidden min-h-10 translate-y-3 items-center justify-center rounded-[6px] bg-[rgba(250,248,243,.94)] text-xs font-medium text-[var(--color-ink)] opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 small:flex"
        >
          مشاهده جزئیات
        </LocalizedClientLink>
      </div>

      <div className="mt-4 flex min-h-[96px] flex-col justify-between">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="line-clamp-2 min-h-[46px] text-sm font-medium leading-6 text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent-dark)] small:text-[15px]"
          data-testid="product-title"
        >
          {product.title}
        </LocalizedClientLink>
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-[var(--color-border)] pt-3 text-sm font-medium text-[var(--color-text)]">
          <span className="text-[10px] font-normal tracking-[.08em] text-[var(--color-muted)]">{isPersian ? "قیمت" : "PRICE"}</span>
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </div>
      {isRelated && (
        <RelatedActions
          isPersian={isPersian}
          variantId={product.variants?.[0]?.id}
          countryCode={countryCode}
        />
      )}
    </article>
  )
}
