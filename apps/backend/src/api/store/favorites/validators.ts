import { z } from "@medusajs/framework/zod"

export const ProductIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^prod_[A-Za-z0-9_-]+$/, "Invalid product ID")

export const AddFavoriteSchema = z
  .object({ productId: ProductIdSchema })
  .strict()

export const MergeFavoritesSchema = z
  .object({
    productIds: z.array(ProductIdSchema).max(200),
  })
  .strict()

export type AddFavoriteBody = z.infer<typeof AddFavoriteSchema>
export type MergeFavoritesBody = z.infer<typeof MergeFavoritesSchema>
