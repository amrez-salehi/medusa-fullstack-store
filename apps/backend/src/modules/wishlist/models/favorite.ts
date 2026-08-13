import { model } from "@medusajs/framework/utils"

const Favorite = model
  .define("favorite", {
    id: model.id({ prefix: "fav" }).primaryKey(),
    customer_id: model.text(),
    product_id: model.text(),
  })
  .indexes([
    {
      name: "IDX_favorite_customer_id",
      on: ["customer_id"],
    },
    {
      name: "IDX_favorite_product_id",
      on: ["product_id"],
    },
    {
      name: "IDX_favorite_customer_product_unique",
      on: ["customer_id", "product_id"],
      unique: true,
    },
  ])

export default Favorite
