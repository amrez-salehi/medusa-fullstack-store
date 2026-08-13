import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { getCatalogPriceRange } from "@lib/data/products"

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
  priceMin,
  priceMax,
  inStock,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  priceMin?: string
  priceMax?: string
  inStock?: boolean
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const priceRange = await getCatalogPriceRange({
    countryCode,
    collectionId: collection.id,
  })
  return (
    <main className="content-container py-6 small:py-10">
      <header className="border-b border-[var(--color-border)] pb-5 small:pb-6">
        <h1 className="text-[26px] font-medium leading-[1.5] tracking-[-.035em] text-[var(--color-ink)] small:text-[34px]">
          {collection.title}
        </h1>
      </header>
      <div className="mt-8 flex flex-col small:flex-row small:items-start">
        <RefinementList
          sortBy={sort}
          hideOptionsPicker
          priceRange={priceRange}
        />
        <div className="min-w-0 flex-1">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={collection.products?.length}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
              priceMin={priceMin}
              priceMax={priceMax}
              inStock={inStock}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
