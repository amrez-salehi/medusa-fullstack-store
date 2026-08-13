import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import RelatedProductsCarousel from "./carousel"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="content-container">
      <div className="mb-8 flex items-end justify-between border-b border-[var(--color-border)] pb-6">
        <div>
          <p className="text-xs font-medium text-[var(--color-accent-dark)]">پیشنهادهای هماهنگ</p>
          <h2 className="mt-3 text-2xl font-medium text-[var(--color-ink)] small:text-3xl">چیدمان را کامل کنید</h2>
          <p className="mt-2 text-xs text-[var(--color-muted)]">قطعاتی با فرم و متریال هماهنگ برای کنار هم نشستن.</p>
        </div>
        <LocalizedClientLink href="/store" className="hd-link hidden small:inline-flex">مشاهده محصولات بیشتر</LocalizedClientLink>
      </div>

      <RelatedProductsCarousel>
        <ul className="flex snap-x gap-3 pb-2 small:gap-4">
          {products.map((product) => (
            <li key={product.id} className="box-border w-[72vw] max-w-[280px] shrink-0 snap-start small:w-[260px]">
              <Product region={region} product={product} isRelated countryCode={countryCode} />
            </li>
          ))}
        </ul>
      </RelatedProductsCarousel>
      <div className="mt-6 flex justify-center gap-2" aria-label="صفحه‌های کالاهای مشابه">
        {Array.from({ length: Math.min(4, Math.max(1, Math.ceil(products.length / 5))) }).map((_, index) => (
          <span key={index} className={`h-1.5 ${index === 0 ? "w-6 bg-[var(--color-accent-dark)]" : "w-1.5 bg-[var(--color-border)]"}`} />
        ))}
      </div>
    </div>
  )
}
