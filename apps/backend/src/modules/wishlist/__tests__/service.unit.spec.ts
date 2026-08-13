import WishlistModuleService from "../service"

describe("WishlistModuleService", () => {
  function serviceWith(overrides: Record<string, jest.Mock>) {
    return Object.assign(
      Object.create(WishlistModuleService.prototype),
      overrides
    ) as WishlistModuleService
  }

  it("returns the existing favorite instead of creating a duplicate", async () => {
    const existing = {
      id: "fav_1",
      customer_id: "cus_1",
      product_id: "prod_1",
    }
    const service = serviceWith({
      listFavorites: jest.fn().mockResolvedValue([existing]),
      createFavorites: jest.fn(),
    })

    await expect(service.add("cus_1", "prod_1")).resolves.toEqual({
      favorite: existing,
      created: false,
    })
    expect(service.createFavorites).not.toHaveBeenCalled()
  })

  it("creates a favorite when it does not exist", async () => {
    const created = {
      id: "fav_1",
      customer_id: "cus_1",
      product_id: "prod_1",
    }
    const service = serviceWith({
      listFavorites: jest.fn().mockResolvedValue([]),
      createFavorites: jest.fn().mockResolvedValue(created),
    })

    await expect(service.add("cus_1", "prod_1")).resolves.toEqual({
      favorite: created,
      created: true,
    })
  })

  it("removes only the matching customer favorite", async () => {
    const service = serviceWith({
      listFavorites: jest.fn().mockResolvedValue([{ id: "fav_1" }]),
      deleteFavorites: jest.fn().mockResolvedValue(undefined),
    })

    await expect(service.remove("cus_1", "prod_1")).resolves.toBe(true)
    expect(service.listFavorites).toHaveBeenCalledWith({
      customer_id: "cus_1",
      product_id: "prod_1",
    })
    expect(service.deleteFavorites).toHaveBeenCalledWith("fav_1")
  })
})
