/* eslint-disable @medusajs/prices-in-major-units -- IRR has zero decimal places; these are major-unit Rial prices. */
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createInventoryLevelsWorkflow,
  createProductOptionsWorkflow,
  updateProductOptionsWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  updateRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

const storefrontImageBase = "http://localhost:8000/images/home-decor"

const products = [
  {
    title: "چراغ سرامیکی مجسمه‌ای",
    handle: "sculptural-ceramic-lamp",
    description: "A softly textured ceramic lamp that brings a warm, calm glow to bedside tables and reading corners.",
    price: 2890000,
    image: "ceramic-lamp.png",
    sku: "HOME-LAMP-001",
    material: "سرامیک",
    color: "کرم",
    room: "اتاق خواب",
    style: "مینیمال",
    dimensions: "ارتفاع ۳۵ سانتی‌متر",
  },
  {
    title: "گلدان سفالی شیاردار",
    handle: "ribbed-terracotta-vase",
    description: "A hand-finished terracotta vase with a tactile ribbed silhouette for shelves, consoles, and dining tables.",
    price: 1490000,
    image: "terracotta-vase.png",
    sku: "HOME-VASE-001",
    material: "سفال",
    color: "آجری",
    room: "پذیرایی",
    style: "روستیک",
    dimensions: "ارتفاع ۲۸ سانتی‌متر",
  },
  {
    title: "آینه گرد چوب گردو",
    handle: "walnut-round-mirror",
    description: "A timeless round mirror framed in rich walnut wood to add depth and light to any room.",
    price: 4290000,
    image: "walnut-mirror.png",
    sku: "HOME-MIRROR-001",
    material: "چوب گردو",
    color: "قهوه‌ای",
    room: "ورودی خانه",
    style: "مدرن",
    dimensions: "قطر ۷۰ سانتی‌متر",
  },
  {
    title: "فرش هندسی پشمی",
    handle: "wool-geometric-area-rug",
    description: "A cozy handwoven wool rug in cream, rust, and charcoal for a grounded modern interior.",
    price: 6290000,
    image: "wool-rug.png",
    sku: "HOME-RUG-001",
    material: "پشم",
    color: "خنثی",
    room: "پذیرایی",
    style: "معاصر",
    dimensions: "۲۰۰ در ۱۴۰ سانتی‌متر",
  },
  {
    title: "صندلی تک‌نفره بوکله",
    handle: "boucle-accent-chair",
    description: "A rounded boucle chair with light oak legs, designed for quiet reading corners and slow mornings.",
    price: 8490000,
    image: "boucle-chair.png",
    sku: "HOME-CHAIR-001",
    material: "پارچه بوکله",
    color: "شیری",
    room: "گوشه مطالعه",
    style: "مدرن",
    dimensions: "۷۵ در ۷۰ سانتی‌متر",
  },
  {
    title: "جفت شمع مجسمه‌ای",
    handle: "sculptural-candle-pair",
    description: "Two hand-poured ivory candles with architectural forms that look beautiful lit or styled on a tray.",
    price: 890000,
    image: "sculptural-candles.png",
    sku: "HOME-CANDLE-001",
    material: "موم سویا",
    color: "عاجی",
    room: "اتاق خواب",
    style: "مینیمال",
    dimensions: "ارتفاع ۱۲ سانتی‌متر",
  },
  {
    title: "تابلو چاپی هنر خطی انتزاعی",
    handle: "abstract-line-art-print",
    description: "A framed archival print with expressive black and ochre lines for an easy gallery-wall update.",
    price: 1790000,
    image: "line-art-print.png",
    sku: "HOME-ART-001",
    material: "کاغذ هنری",
    color: "اخرایی",
    room: "دیوار گالری",
    style: "هنری",
    dimensions: "۵۰ در ۷۰ سانتی‌متر",
  },
  {
    title: "سبد راتان طبیعی",
    handle: "natural-rattan-basket",
    description: "A generous handwoven basket for blankets, toys, laundry, or simply adding natural texture.",
    price: 2190000,
    image: "rattan-basket.png",
    sku: "HOME-BASKET-001",
    material: "راتان طبیعی",
    color: "طبیعی",
    room: "اتاق خواب",
    style: "بوهو",
    dimensions: "قطر ۴۰، ارتفاع ۴۵ سانتی‌متر",
  },
  {
    title: "شال مبل بافت درشت",
    handle: "chunky-knit-throw",
    description: "A soft oatmeal throw with a chunky cotton knit that adds instant warmth to sofas and beds.",
    price: 2490000,
    image: "knit-throw.png",
    sku: "HOME-THROW-001",
    material: "پنبه",
    color: "جو دوسری",
    room: "پذیرایی",
    style: "اسکاندیناوی",
    dimensions: "۱۳۰ در ۱۸۰ سانتی‌متر",
  },
  {
    title: "گلدان سنگی درخت زیتون",
    handle: "stoneware-olive-planter",
    description: "A matte stoneware planter paired with a leafy olive tree for a fresh, serene finishing touch.",
    price: 3290000,
    image: "stoneware-planter.png",
    sku: "HOME-PLANTER-001",
    material: "سنگ‌نما",
    color: "سبز زیتونی",
    room: "بالکن و تراس",
    style: "طبیعی",
    dimensions: "قطر ۲۲، ارتفاع ۲۵ سانتی‌متر",
  },
  {
    title: "چراغ ایستاده کتان",
    handle: "linen-floor-lamp",
    description: "A tall linen floor lamp with a brushed brass stem and a calm, diffused glow.",
    price: 5190000,
    image: "generated/linen-floor-lamp.png",
    sku: "HOME-LAMP-002",
    material: "کتان و برنج",
    color: "بژ",
    room: "پذیرایی",
    style: "معاصر",
    dimensions: "ارتفاع ۱۵۰ سانتی‌متر",
  },
  {
    title: "میز جلو مبلی تراورتن",
    handle: "travertine-coffee-table",
    description: "A low, rounded travertine coffee table with a softly sculptural silhouette.",
    price: 7890000,
    image: "generated/travertine-coffee-table.png",
    sku: "HOME-TABLE-001",
    material: "تراورتن",
    color: "کرم",
    room: "پذیرایی",
    style: "مدرن",
    dimensions: "۱۰۰ در ۶۰، ارتفاع ۳۵ سانتی‌متر",
  },
  {
    title: "پاف بوکله",
    handle: "boucle-ottoman",
    description: "A compact rounded boucle ottoman that works as a footrest, seat, or accent piece.",
    price: 3690000,
    image: "generated/boucle-ottoman.png",
    sku: "HOME-SEAT-001",
    material: "پارچه بوکله",
    color: "شیری",
    room: "گوشه مطالعه",
    style: "مینیمال",
    dimensions: "قطر ۵۵، ارتفاع ۴۲ سانتی‌متر",
  },
  {
    title: "گلدان شیشه‌ای دودی",
    handle: "smoked-glass-vase",
    description: "A handblown smoked-glass vase with a warm amber tone and elegant narrow neck.",
    price: 1690000,
    image: "generated/smoked-glass-vase.png",
    sku: "HOME-VASE-002",
    material: "شیشه دست‌ساز",
    color: "کهربایی",
    room: "میز ناهارخوری",
    style: "مدرن",
    dimensions: "ارتفاع ۳۲ سانتی‌متر",
  },
  {
    title: "کتابخانه قوسی چوب بلوط",
    handle: "arched-oak-bookshelf",
    description: "A light oak bookshelf with an arched top and three generous display shelves.",
    price: 11900000,
    image: "generated/arched-bookshelf.png",
    sku: "HOME-SHELF-001",
    material: "چوب بلوط",
    color: "بلوط روشن",
    room: "اتاق نشیمن",
    style: "اسکاندیناوی",
    dimensions: "عرض ۸۰، ارتفاع ۱۸۰ سانتی‌متر",
  },
  {
    title: "چراغ دیواری سرامیکی",
    handle: "ceramic-wall-sconce",
    description: "A matte ivory ceramic wall sconce with a soft organic folded form.",
    price: 2790000,
    image: "generated/ceramic-wall-sconce.png",
    sku: "HOME-LIGHT-001",
    material: "سرامیک",
    color: "عاجی",
    room: "راهرو",
    style: "مینیمال",
    dimensions: "عرض ۲۰، ارتفاع ۲۸ سانتی‌متر",
  },
  {
    title: "ست کوسن پنبه‌ای بافت‌دار",
    handle: "woven-cotton-cushion-set",
    description: "A pair of textured woven cotton cushions in sand and muted rust tones.",
    price: 1290000,
    image: "generated/cotton-cushion-set.png",
    sku: "HOME-CUSHION-001",
    material: "پنبه بافت‌دار",
    color: "شن و آجری",
    room: "پذیرایی",
    style: "بوهو",
    dimensions: "۴۵ در ۴۵ سانتی‌متر",
  },
  {
    title: "جاشمعی مرمر سبز",
    handle: "green-marble-candle-holder",
    description: "A polished forest-green marble candle holder made for styled tables and shelves.",
    price: 990000,
    image: "generated/marble-candle-holder.png",
    sku: "HOME-CANDLE-002",
    material: "مرمر",
    color: "سبز جنگلی",
    room: "میز کنسول",
    style: "لوکس",
    dimensions: "قطر ۸، ارتفاع ۱۰ سانتی‌متر",
  },
  {
    title: "چراغ آویز بافت جوت",
    handle: "jute-woven-pendant",
    description: "A softly rounded natural jute pendant light that adds warmth and texture overhead.",
    price: 4490000,
    image: "generated/woven-pendant-light.png",
    sku: "HOME-LAMP-003",
    material: "جوت طبیعی",
    color: "طبیعی",
    room: "آشپزخانه",
    style: "روستیک",
    dimensions: "قطر ۴۵، ارتفاع ۳۰ سانتی‌متر",
  },
  {
    title: "کنسول مدرن چوب بلوط",
    handle: "modern-oak-sideboard",
    description: "A low light-oak sideboard with rounded corners, four doors, and slim legs.",
    price: 13900000,
    image: "generated/oak-sideboard.png",
    sku: "HOME-STORAGE-001",
    material: "چوب بلوط",
    color: "بلوط طبیعی",
    room: "اتاق غذاخوری",
    style: "معاصر",
    dimensions: "عرض ۱۸۰، عمق ۴۵، ارتفاع ۷۵ سانتی‌متر",
  },
]

export default async function seedHomeDecor({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
    filters: { name: "Home Decoration" },
  })

  const category = existingCategories[0] ?? (
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [{ name: "Home Decoration", is_active: true }],
      },
    })
  ).result[0]

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfileId = shippingProfiles[0]?.id

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
    filters: { name: "Default Sales Channel" },
  })
  const salesChannelId = salesChannels[0]?.id

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  if (regions[0] && regions[0].currency_code !== "irr") {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: regions[0].id },
        update: { name: "ایران", currency_code: "irr" },
      },
    })
  }

  const { data: existingOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title", "values"],
  })
  const getOrCreateOption = async (title: string, values: string[]) => {
    const existing = existingOptions.find((option: any) => option.title === title)
    if (existing) {
      const currentValues = Array.isArray(existing.values) ? existing.values : []
      const mergedValues = Array.from(new Set([...currentValues, ...values]))
      if (mergedValues.length !== currentValues.length) {
        const { result } = await updateProductOptionsWorkflow(container).run({
          input: {
            selector: { id: existing.id },
            update: { values: mergedValues },
          },
        })
        return result[0]
      }
      return existing
    }
    return (
      await createProductOptionsWorkflow(container).run({
        input: { product_options: [{ title, values }] },
      })
    ).result[0]
  }
  const materialOption = await getOrCreateOption("Material", Array.from(new Set(products.map((product) => product.material))))
  // Keep the decoration catalog separate from any legacy apparel options.
  const colorOption = await getOrCreateOption("Home Color", Array.from(new Set(products.map((product) => product.color))))
  const roomOption = await getOrCreateOption("Room", Array.from(new Set(products.map((product) => product.room))))
  const styleOption = await getOrCreateOption("Decor Style", Array.from(new Set(products.map((product) => product.style))))
  const dimensionsOption = await getOrCreateOption("Dimensions", Array.from(new Set(products.map((product) => product.dimensions))))

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "status"],
  })

  const existingHomeProducts = existingProducts.filter((product: any) =>
    products.some((item) => item.handle === product.handle)
  )
  if (existingHomeProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: existingHomeProducts.map((product: any) => product.id) },
    })
  }

  const oldProducts = existingProducts.filter((product: any) =>
    !products.some((item) => item.handle === product.handle)
  )
  if (oldProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: oldProducts.map((product: any) => product.id) },
    })
  }

  const existingHandles = new Set(
    existingProducts
      .filter((product: any) => !existingHomeProducts.includes(product))
      .map((product: any) => product.handle)
  )
  const productsToCreate = products
    .filter((product) => !existingHandles.has(product.handle))
    .map((product) => ({
      title: product.title,
      handle: product.handle,
      description: product.description,
      category_ids: [category.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      sales_channels: salesChannelId ? [{ id: salesChannelId }] : undefined,
      images: [{ url: `${storefrontImageBase}/${product.image}` }],
      options: [
        { id: materialOption.id },
        { id: colorOption.id },
        { id: roomOption.id },
        { id: styleOption.id },
        { id: dimensionsOption.id },
      ],
      variants: [{
        title: `${product.material} / ${product.color}`,
        sku: product.sku,
        manage_inventory: true,
        options: {
          Material: product.material,
          "Home Color": product.color,
          Room: product.room,
          "Decor Style": product.style,
          Dimensions: product.dimensions,
        },
        prices: [
          { amount: product.price, currency_code: "irr" },
        ],
      }],
      metadata: {
        material: product.material,
        color: product.color,
        room: product.room,
        style: product.style,
        dimensions: product.dimensions,
        catalog_group: "home-decor",
      },
    }))

  if (productsToCreate.length) {
    await createProductsWorkflow(container).run({ input: { products: productsToCreate } })
  }

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })
  if (inventoryItems.length && stockLocations[0]?.id) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item: any) => ({
          location_id: stockLocations[0].id,
          stocked_quantity: 100,
          inventory_item_id: item.id,
        })),
      },
    })
  }

  logger.info(`Home-decoration catalog ready: ${products.length} products.`)
}
