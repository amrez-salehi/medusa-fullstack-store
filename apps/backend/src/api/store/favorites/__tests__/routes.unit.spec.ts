import { MedusaError } from "@medusajs/framework/utils"

import { GET, POST } from "../route"
import { DELETE } from "../[productId]/route"

function responseMock() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any
}

describe("favorites API routes", () => {
  it("rejects unauthenticated access", async () => {
    const request = { auth_context: undefined, scope: { resolve: jest.fn() } } as any

    await expect(GET(request, responseMock())).rejects.toMatchObject({
      type: MedusaError.Types.UNAUTHORIZED,
    })
  })

  it("returns all favorites for the authenticated customer", async () => {
    const listFavorites = jest.fn().mockResolvedValue([])
    const request = {
      auth_context: { actor_id: "cus_1" },
      scope: {
        resolve: jest.fn((key: string) =>
          key === "wishlist" ? { listFavorites } : { graph: jest.fn() }
        ),
      },
    } as any
    const response = responseMock()

    await GET(request, response)

    expect(listFavorites).toHaveBeenCalledWith(
      { customer_id: "cus_1" },
      { order: { created_at: "DESC" } }
    )
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith({ favorites: [] })
  })

  it("adds a valid product and returns 201", async () => {
    const add = jest.fn().mockResolvedValue({
      favorite: { id: "fav_1", product_id: "prod_1" },
      created: true,
    })
    const request = {
      auth_context: { actor_id: "cus_1" },
      validatedBody: { productId: "prod_1" },
      scope: {
        resolve: jest.fn((key: string) =>
          key === "wishlist"
            ? { add }
            : { graph: jest.fn().mockResolvedValue({ data: [{ id: "prod_1" }] }) }
        ),
      },
    } as any
    const response = responseMock()

    await POST(request, response)

    expect(add).toHaveBeenCalledWith("cus_1", "prod_1")
    expect(response.status).toHaveBeenCalledWith(201)
  })

  it("removes a product only from the current customer", async () => {
    const remove = jest.fn().mockResolvedValue(true)
    const request = {
      auth_context: { actor_id: "cus_1" },
      params: { productId: "prod_1" },
      scope: { resolve: jest.fn(() => ({ remove })) },
    } as any
    const response = responseMock()

    await DELETE(request, response)

    expect(remove).toHaveBeenCalledWith("cus_1", "prod_1")
    expect(response.status).toHaveBeenCalledWith(200)
  })
})
