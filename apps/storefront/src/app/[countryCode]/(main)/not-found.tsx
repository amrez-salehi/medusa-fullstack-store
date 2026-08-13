import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "404",
  description: "چیزی درست پیش نرفت.",
}

export default function NotFound() {
  return (
    <div className="content-container flex min-h-[68vh] flex-col items-center justify-center py-16 text-center">
      <span className="font-latin text-[90px] font-medium leading-none tracking-[-.08em] text-[var(--color-border)] small:text-[160px]">404</span>
      <p className="mt-8 text-xs font-medium text-[var(--color-accent-dark)]">صفحه پیدا نشد</p>
      <h1 className="hd-section-title mt-3">این گوشه از خانه هنوز چیده نشده.</h1>
      <p className="hd-body mt-4">آدرسی که دنبال آن بودید وجود ندارد یا جابه‌جا شده است.</p>
      <div className="mt-8 flex gap-3"><LocalizedClientLink href="/" className="hd-button">صفحه اصلی</LocalizedClientLink><LocalizedClientLink href="/store" className="hd-button-outline">فروشگاه</LocalizedClientLink></div>
    </div>
  )
}
