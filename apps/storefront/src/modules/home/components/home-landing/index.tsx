import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import HomeHeroSlider from "@modules/home/components/home-hero-slider"

const roomEdits = [
  { title: "نشیمن", image: "/images/harmendecor/hero-living-room.webp", href: "/store?q=نشیمن" },
  { title: "غذاخوری", image: "/images/harmendecor/editorial-dining.webp", href: "/store?q=میز" },
  { title: "فضای مطالعه", image: "/images/harmendecor/editorial-reading.webp", href: "/store?q=صندلی" },
]

const benefits = [
  { title: "انتخاب دقیق", description: "محصولات گزیده و ماندگار", icon: "select" },
  { title: "متریال اصیل", description: "کیفیتی که دیده و لمس می‌شود", icon: "material" },
  { title: "ارسال مطمئن", description: "بسته‌بندی ویژه‌ی محصولات دکور", icon: "delivery" },
  { title: "۷ روز بازگشت", description: "برای یک انتخاب آسوده", icon: "return" },
] as const

function BenefitIcon({ name }: { name: (typeof benefits)[number]["icon"] }) {
  if (name === "select") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5 9.2 17 19 6.5" />
      </svg>
    )
  }

  if (name === "material") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
        <path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5" />
      </svg>
    )
  }

  if (name === "delivery") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 6.5h11v10h-11zM14.5 10h3l3 3v3.5h-6z" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 8.5A7.5 7.5 0 1 1 5 15" />
      <path d="M5.5 4v4.5H10" />
    </svg>
  )
}

export default function HomeLanding({
  products,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  locale?: string | null
}) {
  return (
    <main className="overflow-hidden bg-[var(--color-background)] text-[var(--color-text)]">
      <section className="content-container pt-4 small:pt-7" aria-labelledby="home-hero-title">
        <HomeHeroSlider />
      </section>

      <section className="content-container" aria-label="مزیت‌های هارمن دکور">
        <div className="home-benefits">
          {benefits.map((item) => (
            <div key={item.title} className="home-benefit">
              <span className="home-benefit-icon"><BenefitIcon name={item.icon} /></span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-container scroll-mt-[190px] py-16 small:py-24" aria-labelledby="rooms-title">
        <div className="mb-8 max-w-2xl small:mb-12">
          <h2 id="rooms-title" className="hd-section-title">خرید بر اساس فضا</h2>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 small:mx-0 small:grid small:grid-cols-3 small:gap-5 small:px-0">
          {roomEdits.map((room) => (
            <LocalizedClientLink key={room.title} href={room.href} className="group block w-[78vw] max-w-[360px] shrink-0 snap-center small:w-auto small:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-[var(--color-surface)]">
                <Image src={room.image} alt={room.title} fill sizes="(max-width: 1023px) 78vw, 33vw" className="hd-image group-hover:scale-[1.02]" />
              </div>
              <div className="border-b border-[var(--color-border)] py-4 small:py-5">
                <h3 className="text-lg font-medium text-[var(--color-ink)] small:text-xl">{room.title}</h3>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
        <LocalizedClientLink href="/store" className="hd-link mt-7">مشاهده همه محصولات</LocalizedClientLink>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[#eee9df] py-16 small:py-24" aria-labelledby="new-title">
        <div className="content-container">
          <div className="mb-9 flex items-end justify-between gap-5 small:mb-12">
            <div><h2 id="new-title" className="hd-section-title">محصولات تازه</h2><p className="hd-body mt-3 max-w-xl">جدیدترین محصولات اضافه‌شده به مجموعه.</p></div>
            <LocalizedClientLink href="/store?sortBy=created_at" className="hd-link hidden xsmall:inline-flex">مشاهده همه</LocalizedClientLink>
          </div>
          <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 small:mx-0 small:grid small:grid-cols-4 small:gap-5 small:px-0">
            {products.slice(0, 8).map((product) => <li key={product.id} className="w-[72vw] max-w-[310px] shrink-0 snap-start small:w-auto small:max-w-none"><ProductPreview product={product} region={region} isFeatured /></li>)}
          </ul>
          <LocalizedClientLink href="/store?sortBy=created_at" className="hd-button-outline mt-8 w-full xsmall:hidden">همه تازه‌ها</LocalizedClientLink>
        </div>
      </section>

      <section className="content-container py-16 small:py-28" aria-labelledby="best-title">
        <div className="mb-9 text-right small:mb-14"><h2 id="best-title" className="hd-section-title">محبوب‌ترین‌ها</h2></div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-10 small:grid-cols-4 small:gap-x-5">{products.slice(8, 16).map((product) => <li key={product.id}><ProductPreview product={product} region={region} /></li>)}</ul>
      </section>
    </main>
  )
}
