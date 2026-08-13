import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { getPersianCategoryName } from "@lib/i18n/category-copy"
import { getCatalogPriceRange } from "@lib/data/products"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
  priceMin,
  priceMax,
  inStock,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  priceMin?: string
  priceMax?: string
  inStock?: boolean
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  if (!category || !countryCode) notFound()
  const title = getPersianCategoryName(category.handle, category.name)
  const priceRange = await getCatalogPriceRange({
    countryCode,
    categoryId: category.id,
  })

  return (
    <main
      className="content-container py-6 small:py-10"
      data-testid="category-container"
    >
      <nav className="mb-6 flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
        <LocalizedClientLink href="/">خانه</LocalizedClientLink>
        <span>/</span>
        <LocalizedClientLink href="/store">فروشگاه</LocalizedClientLink>
        <span>/</span>
        <span>{title}</span>
      </nav>
      <header className="border-b border-[var(--color-border)] pb-5 small:pb-6">
        <h1
          className="text-[26px] font-medium leading-[1.5] tracking-[-.035em] text-[var(--color-ink)] small:text-[34px]"
          data-testid="category-page-title"
        >
          {title}
        </h1>
        {category.description && (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
            {category.description}
          </p>
        )}
      </header>
      {!!category.category_children?.length && (
        <div className="no-scrollbar my-7 flex gap-2 overflow-x-auto">
          {category.category_children.map((child) => (
            <LocalizedClientLink
              key={child.id}
              href={`/categories/${child.handle}`}
              className="shrink-0 border border-[var(--color-border)] px-4 py-2.5 text-xs hover:border-[var(--color-ink)]"
            >
              {getPersianCategoryName(child.handle, child.name)}
            </LocalizedClientLink>
          ))}
        </div>
      )}
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
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
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
