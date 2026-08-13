import { HttpTypes } from "@medusajs/types"
import { getLocale } from "@lib/data/locale-actions"
import { getPersianProductCopy } from "@lib/i18n/product-copy"
import FavoriteButton from "@modules/favorites/components/favorite-button"

type ProductInfoProps = { product: HttpTypes.StoreProduct }

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const locale = await getLocale()
  const isPersian = !locale || locale.toLowerCase().startsWith("fa")
  const localized = getPersianProductCopy(product)
  const title = product.title
  const description = isPersian ? localized.description : product.description

  return (
    <div id="product-info">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-[28px] font-medium leading-[1.45] tracking-[-0.04em] text-[var(--color-text)] small:text-[2.5rem]" data-testid="product-title">
            {title}
          </h1>
          <FavoriteButton product={product} variant="detail" className="mt-1 shrink-0" />
        </div>
        {description && (
          <p className="max-w-[30rem] whitespace-pre-line text-sm leading-7 text-[var(--color-text-secondary)] small:text-base small:leading-8" data-testid="product-description">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
