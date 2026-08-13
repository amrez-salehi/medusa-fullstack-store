import { Metadata } from "next"

import HomeLanding from "@modules/home/components/home-landing"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getLocale } from "@lib/data/locale-actions"

export const metadata: Metadata = {
  title: "جزئیاتی برای خانه‌ای ماندگار",
  description: "مبلمان، نورپردازی و اکسسوری‌های معاصر، انتخاب‌شده برای ساختن خانه‌ای آرام و شخصی.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { response } = await listProducts({
    countryCode,
    queryParams: {
      limit: 20,
      fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options",
    },
  })
  const locale = await getLocale()

  if (!region) {
    return null
  }

  return <HomeLanding products={response.products} region={region} locale={locale} />
}
