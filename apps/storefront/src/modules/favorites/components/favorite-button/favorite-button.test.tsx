import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import FavoriteButton from "."
import type { FavoriteProduct } from "@lib/favorites/types"

const toggleFavorite = vi.fn()
const favoriteState = {
  active: false,
  pending: false,
}

vi.mock("@modules/favorites/context/favorites-context", () => ({
  useFavorites: () => ({
    isFavorite: () => favoriteState.active,
    isPending: () => favoriteState.pending,
    toggleFavorite,
  }),
}))

const product = {
  id: "prod_test",
  title: "گلدان سفالی",
  handle: "clay-vase",
} as unknown as FavoriteProduct

describe("FavoriteButton", () => {
  beforeEach(() => {
    favoriteState.active = false
    favoriteState.pending = false
    toggleFavorite.mockReset().mockResolvedValue(undefined)
  })

  it("adds an inactive product without navigating", () => {
    render(<FavoriteButton product={product} />)
    const button = screen.getByRole("button", { name: "افزودن به علاقه‌مندی‌ها" })

    fireEvent.click(button)

    expect(toggleFavorite).toHaveBeenCalledWith(product)
    expect(button).toHaveAttribute("aria-pressed", "false")
  })

  it("shows the remove state for a saved product", () => {
    favoriteState.active = true
    render(<FavoriteButton product={product} variant="detail" />)

    expect(
      screen.getByRole("button", { name: "حذف از علاقه‌مندی‌ها" })
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("disables interaction while the request is pending", () => {
    favoriteState.pending = true
    render(<FavoriteButton product={product} />)

    expect(screen.getByRole("button")).toBeDisabled()
    fireEvent.click(screen.getByRole("button"))
    expect(toggleFavorite).not.toHaveBeenCalled()
  })
})
