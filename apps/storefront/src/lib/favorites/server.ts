import "server-only"

import { getAuthHeaders } from "@lib/data/cookies"

const backendUrl = (
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
).replace(/\/$/, "")

function backendHeaders(extra?: HeadersInit) {
  const headers = new Headers(extra)
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (publishableKey) {
    headers.set("x-publishable-api-key", publishableKey)
  }

  return headers
}

export async function forwardAuthenticatedFavorites(
  path: string,
  init: RequestInit = {}
) {
  const auth = await getAuthHeaders()

  if (!("authorization" in auth)) {
    return Response.json(
      { message: "برای استفاده از علاقه‌مندی‌ها وارد حساب شوید." },
      { status: 401 }
    )
  }

  const headers = backendHeaders(init.headers)
  headers.set("authorization", auth.authorization)
  if (init.body) headers.set("content-type", "application/json")

  const response = await fetch(`${backendUrl}/store/favorites${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })
  const body = await response.text()

  return new Response(body || null, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  })
}

export async function fetchFavoriteProducts(
  ids: string[],
  countryCode: string
) {
  if (!ids.length) {
    return Response.json({ products: [] })
  }

  const regionResponse = await fetch(`${backendUrl}/store/regions`, {
    headers: backendHeaders(),
    next: { revalidate: 3600 },
  })
  const regionPayload = (await regionResponse
    .json()
    .catch(() => ({ regions: [] }))) as {
    regions?: Array<{
      id: string
      countries?: Array<{ iso_2?: string }>
    }>
  }
  const regionId = regionPayload.regions?.find((region) =>
    region.countries?.some(
      (country) => country.iso_2?.toLowerCase() === countryCode.toLowerCase()
    )
  )?.id

  if (!regionId) {
    return Response.json(
      { message: "منطقه فروش برای نمایش قیمت پیدا نشد." },
      { status: 422 }
    )
  }

  const params = new URLSearchParams({
    region_id: regionId,
    limit: String(Math.min(ids.length, 200)),
    fields:
      "id,title,handle,thumbnail,status,metadata,*images,*variants,*variants.calculated_price",
  })
  ids.forEach((id) => params.append("id[]", id))

  const response = await fetch(`${backendUrl}/store/products?${params}`, {
    headers: backendHeaders(),
    cache: "no-store",
  })
  const body = await response.text()

  return new Response(body || null, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  })
}
