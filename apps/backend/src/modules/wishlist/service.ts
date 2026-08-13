import { MedusaError, MedusaService } from "@medusajs/framework/utils"

import Favorite from "./models/favorite"

class WishlistModuleService extends MedusaService({ Favorite }) {
  async add(customerId: string, productId: string) {
    const [existing] = await this.listFavorites({
      customer_id: customerId,
      product_id: productId,
    })

    if (existing) {
      return { favorite: existing, created: false }
    }

    try {
      const favorite = await this.createFavorites({
        customer_id: customerId,
        product_id: productId,
      })

      return { favorite, created: true }
    } catch (error) {
      const [concurrentFavorite] = await this.listFavorites({
        customer_id: customerId,
        product_id: productId,
      })

      if (concurrentFavorite) {
        return { favorite: concurrentFavorite, created: false }
      }

      throw error
    }
  }

  async remove(customerId: string, productId: string) {
    const [favorite] = await this.listFavorites({
      customer_id: customerId,
      product_id: productId,
    })

    if (!favorite) {
      return false
    }

    await this.deleteFavorites(favorite.id)
    return true
  }

  async merge(customerId: string, productIds: string[]) {
    const uniqueIds = [...new Set(productIds)]
    if (!uniqueIds.length) {
      return []
    }

    const existing = await this.listFavorites({ customer_id: customerId })
    const existingIds = new Set(existing.map((favorite) => favorite.product_id))
    const missing = uniqueIds.filter((productId) => !existingIds.has(productId))

    if (missing.length) {
      try {
        await this.createFavorites(
          missing.map((productId) => ({
            customer_id: customerId,
            product_id: productId,
          }))
        )
      } catch (error) {
        const reconciled = await this.listFavorites({ customer_id: customerId })
        const reconciledIds = new Set(
          reconciled.map((favorite) => favorite.product_id)
        )

        if (!missing.every((productId) => reconciledIds.has(productId))) {
          throw new MedusaError(
            MedusaError.Types.DB_ERROR,
            error instanceof Error
              ? error.message
              : "Could not merge favorites"
          )
        }
      }
    }

    return this.listFavorites(
      { customer_id: customerId },
      { order: { created_at: "DESC" } }
    )
  }
}

export default WishlistModuleService
