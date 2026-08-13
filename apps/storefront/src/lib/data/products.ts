"use server"

import { sdk } from "@lib/config"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
  price_min?: string
  price_max?: string
  in_stock?: string
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        // Product prices and inventory are editable from the custom admin
        // panel. Do not serve an old Next.js fetch cache after an admin edit.
        cache: "no-store",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const { price_min, price_max, in_stock, ...apiQueryParams } =
    queryParams || {}
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...apiQueryParams,
      ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
      limit: 100,
    },
    countryCode,
  })

  const filteredProducts = products.filter((product) => {
    const amount = Math.min(
      ...(product.variants || []).map(
        (variant) =>
          variant.calculated_price?.calculated_amount ??
          Number.POSITIVE_INFINITY
      )
    )
    const hasStock = (product.variants || []).some(
      (variant) => (variant.inventory_quantity ?? 0) > 0
    )
    const min = price_min ? Number(price_min) : null
    const max = price_max ? Number(price_max) : null

    return (
      (!min || amount >= min) &&
      (!max || amount <= max) &&
      (in_stock !== "true" || hasStock)
    )
  })

  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const pageParam = (page - 1) * limit

  const filteredCount = filteredProducts.length

  const nextPage = filteredCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}

export const getCatalogPriceRange = async ({
  countryCode,
  categoryId,
  collectionId,
}: {
  countryCode: string
  categoryId?: string
  collectionId?: string
}): Promise<{ min: number; max: number }> => {
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 100,
      ...(categoryId ? { category_id: [categoryId] } : {}),
      ...(collectionId ? { collection_id: [collectionId] } : {}),
    },
  })

  const productPrices = products
    .map((product) =>
      Math.min(
        ...(product.variants || [])
          .map((variant) => variant.calculated_price?.calculated_amount)
          .filter((amount): amount is number => Number.isFinite(amount))
      )
    )
    .filter((amount) => Number.isFinite(amount))

  if (!productPrices.length) return { min: 0, max: 0 }

  return {
    min: Math.min(...productPrices),
    max: Math.max(...productPrices),
  }
}
