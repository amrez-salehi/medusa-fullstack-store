import { HttpTypes } from "@medusajs/types"
import { getLocale } from "@lib/data/locale-actions"
import { getPersianProductCopy } from "@lib/i18n/product-copy"

type ProductTabsProps = { product: HttpTypes.StoreProduct }

const ProductTabs = async ({ product }: ProductTabsProps) => {
  const locale = await getLocale()
  const isPersian = !locale || locale.toLowerCase().startsWith("fa")
  const localized = getPersianProductCopy(product)
  const metadata = (product.metadata || {}) as Record<string, unknown>
  const value = (key: string, fallback: string) =>
    typeof metadata[key] === "string" && metadata[key] ? String(metadata[key]) : fallback

  const specs = [
    ["ابعاد", value("dimensions", "ابعاد دقیق در بسته‌بندی محصول درج شده است"), <RulerIcon key="dimensions" />],
    ["متریال", value("material", "متریال ممتاز و مناسب استفاده روزمره"), <MaterialIcon key="material" />],
    ["رنگ و پرداخت", value("color", "رنگ طبیعی؛ تفاوت جزئی در بافت طبیعی است"), <ColorIcon key="color" />],
    ["فضای پیشنهادی", value("room", "نشیمن، اتاق خواب و فضاهای داخلی"), <HomeIcon key="room" />],
  ] as const

  return (
    <section className="border-y border-[var(--color-border)] py-10 small:py-14" aria-labelledby="product-details-title">
      <div className="grid gap-10 small:grid-cols-[.65fr_1.35fr] small:gap-16">
        <div>
          <p className="text-xs font-medium text-[var(--color-accent-dark)]">مشخصات محصول</p>
          <h2 id="product-details-title" className="hd-section-title mt-3">اطلاعات کامل محصول</h2>
          <p className="hd-body mt-5 max-w-lg">{isPersian ? localized.description || product.description : product.description}</p>
        </div>
        <div>
          <dl className="grid grid-cols-2 border-l border-t border-[var(--color-border)]">
            {specs.map(([label, specValue, icon]) => (
              <div key={label} className="min-h-[150px] border-b border-r border-[var(--color-border)] p-4 xsmall:p-6">
                <span className="text-[var(--color-accent-dark)]">{icon}</span>
                <dt className="mt-5 text-xs font-medium text-[var(--color-ink)]">{label}</dt>
                <dd className="mt-2 text-[11px] leading-6 text-[var(--color-muted)] small:text-xs">{specValue}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 border-t border-[var(--color-border)]">
            {[
              ["نگهداری و مراقبت", value("care", "با پارچه نرم و خشک تمیز شود. از مواد شوینده قوی و تماس طولانی با رطوبت دور نگه دارید.")],
              ["ارسال و تحویل", "بسته‌بندی تخصصی دکور، پیگیری مرحله‌به‌مرحله و تحویل معمولاً طی ۲ تا ۴ روز کاری."],
              ["بازگشت کالا", "تا ۷ روز پس از تحویل، در صورت حفظ شرایط اولیه و بسته‌بندی، امکان درخواست بازگشت وجود دارد."],
            ].map(([title, content]) => (
              <details key={title} className="group border-b border-[var(--color-border)] py-1">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between py-3 text-sm font-medium"><span>{title}</span><span className="font-latin text-xl font-light transition group-open:rotate-45">+</span></summary>
                <p className="max-w-2xl pb-5 text-xs leading-7 text-[var(--color-muted)] small:text-sm">{content}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const Icon = ({ children }: { children: React.ReactNode }) => <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.35" aria-hidden="true">{children}</svg>
const HomeIcon = () => <Icon><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-5h6v5" /></Icon>
const MaterialIcon = () => <Icon><path d="M5 8h14l-2 11H7L5 8Z" /><path d="M8 8c0-2 1.3-3 4-3s4 1 4 3M3 8h18" /></Icon>
const ColorIcon = () => <Icon><circle cx="12" cy="12" r="8" /><path d="M8 9h.01M12 7h.01M16 9h.01M9 14c1.7 1.8 4.3 1.8 6 0" /></Icon>
const RulerIcon = () => <Icon><path d="m4 17 13-13 3 3L7 20H4v-3Z" /><path d="m10 8 2 2m1-5 2 2m-9 5 2 2" /></Icon>

export default ProductTabs
