import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { OptionValueIds } from "@lib/util/product-option-filters"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CatalogToolbar from "@modules/store/components/catalog-toolbar"

// Show the full current catalog on the store landing page. Pagination remains
// enabled automatically when the catalog grows beyond this page size.
const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  q?: string
  price_min?: string
  price_max?: string
  in_stock?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  optionValueIds,
  q,
  priceMin,
  priceMax,
  inStock,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  optionValueIds?: OptionValueIds
  q?: string
  priceMin?: string
  priceMax?: string
  inStock?: boolean
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  if (q) {
    queryParams.q = q
  }

  if (priceMin) queryParams.price_min = priceMin
  if (priceMax) queryParams.price_max = priceMax
  if (inStock) queryParams.in_stock = "true"

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    optionValueIds,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <CatalogToolbar sortBy={sortBy || "created_at"} count={count} />
      <ul
        className="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-10 xsmall:gap-x-4 small:grid-cols-3 small:gap-x-5 small:gap-y-14"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id} className="catalog-product-cell min-w-0">
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
