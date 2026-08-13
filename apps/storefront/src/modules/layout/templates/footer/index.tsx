import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const footerGroups = [
  {
    title: "خرید",
    links: [
      ["همه محصولات", "/store"],
      ["محصولات تازه", "/store?sortBy=created_at"],
      ["پیشنهادها", "/offers"],
      ["علاقه‌مندی‌ها", "/favorites"],
    ],
  },
  {
    title: "هارمن",
    links: [
      ["تماس و مشاوره", "/contact"],
      ["پرسش‌های متداول", "/faq"],
    ],
  },
  {
    title: "خدمات مشتریان",
    links: [
      ["پیگیری سفارش", "/account/orders"],
      ["ارسال و تحویل", "/faq#shipping"],
      ["بازگشت کالا", "/faq#returns"],
      ["حساب کاربری", "/account"],
    ],
  },
] as const

const assurances = [
  ["ارسال ایمن", "بسته‌بندی متناسب با محصول"],
  ["بازگشت کالا", "تا ۷ روز پس از تحویل"],
] as const

export default async function Footer() {
  const locale = await getLocale()
  const isPersian = !locale || locale.toLowerCase().startsWith("fa")
  const year = new Date()
    .getFullYear()
    .toLocaleString(isPersian ? "fa-IR" : "en-US", { useGrouping: false })

  return (
    <footer id="site-footer" className="border-t border-[var(--color-border)] bg-[#e9e3d8] pb-[calc(64px+env(safe-area-inset-bottom))] text-[var(--color-ink)] small:pb-0">
      <div className="content-container py-10 medium:hidden">
        <div className="footer-assurance-grid footer-assurance-grid-mobile">
          {assurances.map(([title, description]) => (
            <AssuranceItem key={title} title={title} description={description} />
          ))}
        </div>

        <div className="mt-7 border-y border-[var(--color-border)]">
          {footerGroups.map((group) => (
            <MobileFooterGroup key={group.title} {...group} />
          ))}
        </div>

        <SocialLinks className="footer-social-mobile" />
      </div>

      <div className="content-container footer-desktop hidden medium:block">
        <div className="footer-main-grid">
          {footerGroups.map((group) => (
            <FooterColumn key={group.title} {...group} />
          ))}
        </div>

        <div className="footer-utility-grid">
          {assurances.map(([title, description]) => (
            <AssuranceItem key={title} title={title} description={description} />
          ))}
          <SocialLinks />
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="content-container footer-legal flex flex-col gap-2 py-5 text-[10px] text-[var(--color-muted)] xsmall:flex-row xsmall:items-center xsmall:justify-between">
          <span>© {year} هارمن دکور</span>
          <span>پرداخت امن · بسته‌بندی تخصصی · پشتیبانی پاسخ‌گو</span>
        </div>
      </div>
    </footer>
  )
}

function AssuranceItem({ title, description }: { title: string; description: string }) {
  const isReturn = title === "بازگشت کالا"

  return (
    <div className="footer-assurance-item">
      <span className="footer-utility-icon">
        {isReturn ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 8.5A7.5 7.5 0 1 1 4.5 15" />
            <path d="M5 4v4.5h4.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 7.5 4.2v9.3L12 21l-7.5-4.5V7.2L12 3Z" />
            <path d="m5 7.5 7 4 7-4M12 11.5V21" />
          </svg>
        )}
      </span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </div>
  )
}

function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`footer-social ${className}`}>
      <span>
        <strong>ما را دنبال کنید</strong>
        <small>هارمن دکور در شبکه‌های اجتماعی</small>
      </span>
      <div className="footer-social-links">
        <a href="#" aria-label="اینستاگرام هارمن دکور">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.7" r=".8" className="fill-current stroke-none" />
          </svg>
        </a>
        <a href="#" aria-label="پینترست هارمن دکور">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.3 20.5c1.2-3.6 1.1-4.3 2-8.3-.8-1.6.1-4 1.8-4 1.4 0 2 1 2 2.2 0 1.4-.9 3.6-1.3 5.1-.3 1.1.6 2 1.7 2 2.1 0 3.6-2.6 3.6-5.6 0-3.4-2.8-6-6.6-6-4.7 0-7.5 3.5-7.5 7.1 0 1.3.4 2.7 1.4 3.5" />
          </svg>
        </a>
      </div>
    </div>
  )
}

function MobileFooterGroup({
  title,
  links,
}: {
  title: string
  links: ReadonlyArray<readonly [string, string]>
}) {
  return (
    <details className="group border-b border-[var(--color-border)] last:border-b-0">
      <summary className="flex min-h-[54px] cursor-pointer list-none items-center justify-between text-sm font-medium">
        <span>{title}</span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-none stroke-current transition-transform duration-200 group-open:rotate-180"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 pb-4">
        {links.map(([label, href]) => (
          <li key={href}>
            <LocalizedClientLink
              href={href}
              className="flex min-h-10 items-center text-xs text-[var(--color-text-secondary)]"
            >
              {label}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </details>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: ReadonlyArray<readonly [string, string]>
}) {
  return (
    <div>
      <h2 className="text-xs font-medium">{title}</h2>
      <ul className="mt-5 grid gap-3.5 text-sm text-[var(--color-text-secondary)]">
        {links.map(([label, href]) => (
          <li key={href}>
            <LocalizedClientLink
              href={href}
              className="transition hover:text-[var(--color-ink)]"
            >
              {label}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
