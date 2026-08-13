import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "تماس با هارمن",
  description: "پشتیبانی سفارش و مشاوره انتخاب محصولات هارمن دکور.",
}

export default function ContactPage() {
  return (
    <main className="content-container py-8 small:py-14 medium:py-16">
      <header className="grid gap-7 border-b border-[var(--color-border)] pb-9 small:grid-cols-[1.2fr_.8fr] small:items-end small:gap-16 small:pb-12">
        <div>
          <p className="text-xs font-medium text-[var(--color-accent-dark)]">
            تماس با هارمن
          </p>
          <h1 className="mt-3 max-w-2xl text-[34px] font-medium leading-[1.45] tracking-[-.045em] text-[var(--color-ink)] small:text-[46px]">
            چطور می‌توانیم کمکتان کنیم؟
          </h1>
        </div>
        <p className="max-w-lg text-sm leading-8 text-[var(--color-text-secondary)] small:text-[15px]">
          برای راهنمایی محصول، ارسال یا پیگیری سفارش پیام بگذارید. پاسخ تیم
          هارمن در ساعات کاری برایتان ارسال می‌شود.
        </p>
      </header>

      <section className="grid gap-5 py-8 small:grid-cols-[minmax(270px,.72fr)_minmax(0,1.45fr)] small:gap-6 small:py-12">
        <aside className="flex flex-col overflow-hidden rounded-[14px] bg-[var(--color-ink)] p-6 text-white xsmall:p-7 small:min-h-[570px] small:p-8">
          <div>
            <p className="text-xs font-medium text-white/50">راه‌های ارتباطی</p>
            <h2 className="mt-3 text-[25px] font-medium leading-[1.5]">
              مستقیم با تیم هارمن در ارتباط باشید
            </h2>
          </div>

          <div className="mt-8 divide-y divide-white/15 border-y border-white/15">
            <ContactItem icon={<MailIcon />} title="ایمیل پشتیبانی">
              <a
                dir="ltr"
                className="font-latin inline-block text-sm text-white transition hover:text-white/70"
                href="mailto:hello@harmendecor.com"
              >
                hello@harmendecor.com
              </a>
            </ContactItem>
            <ContactItem icon={<ClockIcon />} title="ساعات پاسخ‌گویی">
              <p className="text-sm leading-7 text-white/70">
                شنبه تا چهارشنبه، ۹ تا ۱۸
                <br />
                پنجشنبه، ۹ تا ۱۴
              </p>
            </ContactItem>
            <ContactItem icon={<OrderIcon />} title="پیگیری سفارش">
              <LocalizedClientLink
                href="/account/orders"
                className="inline-flex min-h-10 items-center border-b border-white/50 text-sm transition hover:border-white"
              >
                مشاهده سفارش‌های من ←
              </LocalizedClientLink>
            </ContactItem>
          </div>

          <p className="mt-auto pt-8 text-xs leading-6 text-white/45">
            برای پیگیری سریع‌تر، شماره سفارش را در متن پیام وارد کنید.
          </p>
        </aside>

        <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-light-cream)] p-5 xsmall:p-7 small:p-8 medium:p-10">
          <div className="mb-7 border-b border-[var(--color-border)] pb-5">
            <h2 className="text-xl font-medium text-[var(--color-ink)]">
              ارسال پیام
            </h2>
            <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
              بخش‌های ستاره‌دار را کامل کنید تا بتوانیم دقیق‌تر پاسخ دهیم.
            </p>
          </div>

          <form
            action="mailto:hello@harmendecor.com"
            method="post"
            encType="text/plain"
            className="grid gap-5 xsmall:grid-cols-2"
          >
            <Field label="نام و نام خانوادگی" name="name" autoComplete="name" />
            <Field
              label="شماره تماس"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
            />
            <Field
              label="ایمیل"
              name="email"
              type="email"
              autoComplete="email"
              direction="ltr"
            />
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[var(--color-text-secondary)]">
                موضوع پیام <RequiredMark />
              </span>
              <span className="relative block">
                <select
                  name="subject"
                  required
                  defaultValue=""
                  className="h-12 w-full appearance-none rounded-[6px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-sm text-[var(--color-ink)] outline-none transition hover:border-[var(--color-accent-muted)] focus:border-[var(--color-accent)]"
                >
                  <option value="" disabled>
                    انتخاب موضوع
                  </option>
                  <option value="راهنمایی محصول">راهنمایی محصول</option>
                  <option value="پیگیری سفارش">پیگیری سفارش</option>
                  <option value="ارسال و تحویل">ارسال و تحویل</option>
                  <option value="بازگشت کالا">بازگشت کالا</option>
                  <option value="سایر">سایر</option>
                </select>
                <ChevronIcon />
              </span>
            </label>

            <label className="xsmall:col-span-2">
              <span className="mb-2 block text-xs font-medium text-[var(--color-text-secondary)]">
                متن پیام <RequiredMark />
              </span>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="پرسش یا درخواستتان را بنویسید…"
                className="w-full resize-y rounded-[6px] border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm leading-7 outline-none transition placeholder:text-[var(--color-muted)] hover:border-[var(--color-accent-muted)] focus:border-[var(--color-accent)]"
              />
            </label>

            <div className="flex flex-col-reverse gap-4 border-t border-[var(--color-border)] pt-5 xsmall:col-span-2 xsmall:flex-row xsmall:items-center xsmall:justify-between">
              <p className="text-[11px] leading-6 text-[var(--color-muted)]">
                پاسخ به ایمیل واردشده ارسال می‌شود.
              </p>
              <button className="hd-button w-full xsmall:w-auto" type="submit">
                ارسال پیام
                <ArrowIcon />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

function Field({
  label,
  name,
  type = "text",
  direction = "rtl",
  ...props
}: {
  label: string
  name: string
  type?: string
  direction?: "rtl" | "ltr"
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-[var(--color-text-secondary)]">
        {label} <RequiredMark />
      </span>
      <input
        {...props}
        dir={direction}
        name={name}
        type={type}
        required
        className="h-12 w-full rounded-[6px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-sm outline-none transition hover:border-[var(--color-accent-muted)] focus:border-[var(--color-accent)]"
      />
    </label>
  )
}

function ContactItem({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4 py-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-white/10 text-white/75">
        {icon}
      </span>
      <div>
        <p className="mb-2 text-xs text-white/45">{title}</p>
        {children}
      </div>
    </div>
  )
}

function RequiredMark() {
  return <span className="text-[var(--color-clay)]">*</span>
}

function MailIcon() {
  return <IconShell path="M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6" />
}

function ClockIcon() {
  return <IconShell path="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2" />
}

function OrderIcon() {
  return <IconShell path="M6.5 8.5h11l1 11h-13l1-11ZM9 9V6.8a3 3 0 0 1 6 0V9" />
}

function IconShell({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-[var(--color-muted)]"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  )
}
