import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getCatalogPriceRange } from "@lib/data/products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  q,
  priceMin,
  priceMax,
  inStock,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  q?: string
  priceMin?: string
  priceMax?: string
  inStock?: boolean
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const priceRange = await getCatalogPriceRange({ countryCode })

  return (
    <div
      className="catalog-page content-container min-w-0 overflow-x-hidden py-6 small:py-10"
      data-testid="category-container"
    >
      <header className="mb-6 border-b border-[var(--color-border)] pb-5 small:mb-8 small:pb-6">
        <h1
          className="text-[26px] font-medium leading-[1.5] tracking-[-.035em] text-[var(--color-ink)] small:text-[34px]"
          data-testid="store-page-title"
        >
          {q ? `نتایج برای «${q}»` : "همه محصولات"}
        </h1>
      </header>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1 small:mb-8">
        {[
          "همه",
          "مبلمان",
          "روشنایی",
          "آینه و دیوار",
          "اکسسوری",
          "منسوجات",
          "فضای غذاخوری",
        ].map((label, index) => (
          <a
            key={label}
            href={index ? `?q=${encodeURIComponent(label)}` : "?"}
            className={`shrink-0 border px-4 py-2.5 text-xs transition ${
              index === 0 && !q
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-ink)]"
            }`}
          >
            {label}
          </a>
        ))}
      </div>
      <div className="flex min-w-0 flex-col small:flex-row small:items-start">
        <RefinementList sortBy={sort} priceRange={priceRange} />
        <div className="min-w-0 flex-1">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
              q={q}
              priceMin={priceMin}
              priceMax={priceMax}
              inStock={inStock}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
