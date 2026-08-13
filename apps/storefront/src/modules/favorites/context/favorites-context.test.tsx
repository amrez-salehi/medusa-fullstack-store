import { act, render, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { FavoritesProvider, useFavorites } from "./favorites-context"
import type { FavoriteProduct } from "@lib/favorites/types"

vi.mock("next/navigation", () => ({
  useParams: () => ({ countryCode: "dk" }),
}))

const product = {
  id: "prod_test",
  title: "گلدان سفالی",
  handle: "clay-vase",
  variants: [],
} as unknown as FavoriteProduct

function Probe({ onReady }: { onReady?: (value: ReturnType<typeof useFavorites>) => void }) {
  const favorites = useFavorites()
  useEffect(() => onReady?.(favorites), [favorites, onReady])
  return (
    <div>
      <span data-testid="status">
        {favorites.isFavorite(product.id) ? "saved" : "not-saved"}
      </span>
      <span data-testid="loading">{favorites.isLoading ? "loading" : "ready"}</span>
      <span data-testid="error">{favorites.error || "none"}</span>
    </div>
  )
}

describe("FavoritesProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  it("loads guest favorites from local storage without an API status request", async () => {
    localStorage.setItem(
      "harmendecor.favorite-product-ids.v1",
      JSON.stringify([product.id])
    )
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ products: [product] }), { status: 200 })
    )

    render(
      <FavoritesProvider authenticated={false}>
        <Probe />
      </FavoritesProvider>
    )

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("ready"))
    expect(screen.getByTestId("status")).toHaveTextContent("saved")
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("optimistically updates and rolls back when the API fails", async () => {
    let context: ReturnType<typeof useFavorites> | undefined
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ favorites: [] }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "خطای ارتباط با سرور" }), {
          status: 500,
        })
      )

    render(
      <FavoritesProvider authenticated>
        <Probe
          onReady={(value) => {
            context = value
          }}
        />
      </FavoritesProvider>
    )

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("ready"))

    await act(async () => {
      await expect(context!.toggleFavorite(product)).rejects.toThrow(
        "خطای ارتباط با سرور"
      )
    })

    expect(screen.getByTestId("status")).toHaveTextContent("not-saved")
    expect(screen.getByRole("alert")).toHaveTextContent("خطای ارتباط با سرور")
  })

  it("exposes a retryable loading error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("شبکه در دسترس نیست"))

    render(
      <FavoritesProvider authenticated>
        <Probe />
      </FavoritesProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("شبکه در دسترس نیست")
    )
  })
})
