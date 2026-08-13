import { Metadata } from "next"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "کالکشن‌ها",
  description: "مجموعه‌های هماهنگ و قابل ترکیب هارمن دکور.",
}

const collections = [
  {
    title: "گوشه‌های دنج",
    description:
      "چراغ، میز کنارمبلی و اکسسوری برای ساختن یک گوشه آرام و کاربردی.",
    image: "/images/harmendecor/editorial-reading.webp",
  },
  {
    title: "میز و پذیرایی",
    description: "ترکیبی از چوب، سرامیک و نور ملایم برای دورهمی‌های گرم‌تر.",
    image: "/images/harmendecor/editorial-dining.webp",
  },
  {
    title: "نشیمن روشن",
    description: "رنگ‌های خنثی و بافت‌های نرم برای نشیمنی آرام، روشن و هماهنگ.",
    image: "/images/harmendecor/hero-living-room.webp",
  },
] as const

export default function CollectionsPage() {
  return (
    <main>
      <header className="content-container py-5 small:py-8">
        <div className="relative min-h-[430px] overflow-hidden rounded-[14px] small:min-h-[540px]">
          <Image
            src="/images/harmendecor/hero-living-room.webp"
            alt="نشیمن روشن با مجموعه هماهنگ هارمن"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white xsmall:p-8 small:p-12">
            <p className="text-xs font-medium text-white/75">
              مجموعه‌های هارمن
            </p>
            <h1 className="mt-3 max-w-3xl text-[32px] font-medium leading-[1.45] tracking-[-.04em] small:text-[48px]">
              انتخاب‌هایی که کنار هم کامل می‌شوند
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 small:text-base small:leading-8">
              هر مجموعه، ترکیبی آماده از رنگ، بافت و فرم است تا انتخاب برای خانه
              ساده‌تر و نتیجه هماهنگ‌تر باشد.
            </p>
          </div>
        </div>
      </header>

      <section className="content-container pb-20 pt-8 small:pb-28 small:pt-14">
        <div className="mb-8 border-b border-[var(--color-border)] pb-5 small:mb-10">
          <div>
            <p className="text-xs font-medium text-[var(--color-accent-dark)]">
              برای هر فضا
            </p>
            <h2 className="mt-2 text-[26px] font-medium small:text-[34px]">
              مجموعه موردنظر را انتخاب کنید
            </h2>
          </div>
        </div>
        <div className="grid gap-8 xsmall:grid-cols-2 small:grid-cols-3 small:gap-5">
          {collections.map(({ title, description, image }) => (
            <LocalizedClientLink
              href="/store"
              key={title}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-[var(--color-surface)]">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="hd-image group-hover:scale-[1.025]"
                />
              </div>
              <h2 className="mt-5 text-xl font-medium small:text-2xl">
                {title}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-[var(--color-muted)]">
                {description}
              </p>
              <span className="hd-link mt-3">مشاهده مجموعه</span>
            </LocalizedClientLink>
          ))}
        </div>
      </section>
    </main>
  )
}
