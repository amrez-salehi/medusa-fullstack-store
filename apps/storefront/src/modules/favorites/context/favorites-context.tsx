"use client"

import type { FavoriteProduct, FavoriteRecord, FavoritesResponse } from "@lib/favorites/types"
import { useParams } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

const STORAGE_KEY = "harmendecor.favorite-product-ids.v1"

type Toast = { id: number; message: string; tone: "success" | "error" }

type FavoritesContextValue = {
  favorites: FavoriteRecord[]
  favoriteIds: ReadonlySet<string>
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  isPending: (productId: string) => boolean
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: FavoriteProduct) => Promise<void>
  refresh: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function readGuestIds() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    return Array.isArray(value)
      ? Array.from(
          new Set(value.filter((id): id is string => typeof id === "string"))
        ).slice(0, 200)
      : []
  } catch {
    return []
  }
}

function writeGuestIds(ids: string[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(Array.from(new Set(ids)).slice(0, 200))
  )
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || "امکان به‌روزرسانی علاقه‌مندی‌ها وجود ندارد.")
  }
  return payload as T
}

export function FavoritesProvider({
  authenticated,
  children,
}: {
  authenticated: boolean
  children: React.ReactNode
}) {
  const params = useParams<{ countryCode?: string }>()
  const countryCode = params?.countryCode || "dk"
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([])
  const [ids, setIds] = useState<string[]>([])
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const initializedFor = useRef<string | null>(null)

  const notify = useCallback((message: string, tone: Toast["tone"]) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, tone }].slice(-3))
    window.setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      3200
    )
  }, [])

  const hydrateRecords = useCallback(
    async (records: FavoriteRecord[]) => {
      if (!records.length) return records

      const response = await fetch(
        `/api/favorites/products?ids=${encodeURIComponent(
          records.map((record) => record.product_id).join(",")
        )}&countryCode=${encodeURIComponent(countryCode)}`,
        { cache: "no-store" }
      )
      const payload = await parseResponse<{ products: FavoriteProduct[] }>(
        response
      )
      const productsById = new Map(
        payload.products.map((product) => [product.id, product])
      )

      return records.flatMap((record) => {
        const product = productsById.get(record.product_id) || record.product
        return product ? [{ ...record, product }] : []
      })
    },
    [countryCode]
  )

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const guestIds = readGuestIds()

      if (authenticated) {
        const response = guestIds.length
          ? await fetch("/api/favorites/merge", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ productIds: guestIds }),
            })
          : await fetch("/api/favorites", { cache: "no-store" })
        const payload = await parseResponse<FavoritesResponse>(response)
        setFavorites(await hydrateRecords(payload.favorites))
        setIds(payload.favorites.map((favorite) => favorite.product_id))
        if (guestIds.length) localStorage.removeItem(STORAGE_KEY)
      } else {
        setIds(guestIds)
        if (guestIds.length) {
          const response = await fetch(
            `/api/favorites/products?ids=${encodeURIComponent(
              guestIds.join(",")
            )}&countryCode=${encodeURIComponent(countryCode)}`,
            { cache: "no-store" }
          )
          const payload = await parseResponse<{ products: FavoriteProduct[] }>(response)
          const productsById = new Map(
            payload.products.map((product) => [product.id, product])
          )
          setFavorites(
            guestIds.flatMap((productId, index) => {
              const product = productsById.get(productId)
              return product
                ? [{
                    id: `guest_${productId}`,
                    product_id: productId,
                    created_at: new Date(Date.now() - index).toISOString(),
                    product,
                  }]
                : []
            })
          )
        } else {
          setFavorites([])
        }
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "بارگذاری علاقه‌مندی‌ها ناموفق بود."
      )
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [authenticated, countryCode, hydrateRecords])

  useEffect(() => {
    const identity = `${authenticated ? "account" : "guest"}:${countryCode}`
    if (initializedFor.current === identity) return
    initializedFor.current = identity
    void load()
  }, [authenticated, countryCode, load])

  const toggleFavorite = useCallback(
    async (product: FavoriteProduct) => {
      const productId = product.id
      if (!productId || pendingIds.includes(productId)) return

      const wasFavorite = ids.includes(productId)
      const previousIds = ids
      const previousFavorites = favorites
      const nextIds = wasFavorite
        ? ids.filter((id) => id !== productId)
        : [productId, ...ids]

      setPendingIds((current) => [...current, productId])
      setIds(nextIds)
      setFavorites((current) =>
        wasFavorite
          ? current.filter((favorite) => favorite.product_id !== productId)
          : [
              {
                id: `optimistic_${productId}`,
                product_id: productId,
                created_at: new Date().toISOString(),
                product,
              },
              ...current,
            ]
      )

      try {
        if (authenticated) {
          const response = await fetch(
            wasFavorite
              ? `/api/favorites/${encodeURIComponent(productId)}`
              : "/api/favorites",
            {
              method: wasFavorite ? "DELETE" : "POST",
              headers: wasFavorite ? undefined : { "content-type": "application/json" },
              body: wasFavorite ? undefined : JSON.stringify({ productId }),
            }
          )
          await parseResponse(response)
        } else {
          writeGuestIds(nextIds)
        }

        notify(
          wasFavorite
            ? "از علاقه‌مندی‌ها حذف شد."
            : "به علاقه‌مندی‌ها اضافه شد.",
          "success"
        )
      } catch (reason) {
        setIds(previousIds)
        setFavorites(previousFavorites)
        notify(
          reason instanceof Error
            ? reason.message
            : "تغییر ذخیره نشد؛ دوباره تلاش کنید.",
          "error"
        )
        throw reason
      } finally {
        setPendingIds((current) => current.filter((id) => id !== productId))
      }
    },
    [authenticated, favorites, ids, notify, pendingIds]
  )

  const favoriteIds = useMemo(() => new Set(ids), [ids])
  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      favoriteIds,
      isInitialized,
      isLoading,
      error,
      isPending: (productId) =>
        !isInitialized || pendingIds.includes(productId),
      isFavorite: (productId) => favoriteIds.has(productId),
      toggleFavorite,
      refresh: load,
    }),
    [error, favoriteIds, favorites, isInitialized, isLoading, load, pendingIds, toggleFavorite]
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[120] flex flex-col items-center gap-2 small:bottom-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={`rounded-[8px] px-4 py-2.5 text-xs font-medium text-white shadow-[0_12px_35px_rgba(25,24,21,.2)] ${
              toast.tone === "error"
                ? "bg-[var(--color-error)]"
                : "bg-[var(--color-ink)]"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error("useFavorites must be used within FavoritesProvider")
  return value
}
