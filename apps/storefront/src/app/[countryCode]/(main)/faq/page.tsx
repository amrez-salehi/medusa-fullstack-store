import { Metadata } from "next"
import PageHero from "@modules/content/components/page-hero"

export const metadata: Metadata = { title: "سوالات متداول", description: "پاسخ پرسش‌های متداول خرید، ارسال و بازگشت هارمن دکور." }
const groups = [
  ["سفارش و پرداخت", [["چطور از موجودی محصول مطمئن شوم؟","وضعیت موجودی در صفحه هر محصول به‌روز نمایش داده می‌شود. افزودن به سبد به‌تنهایی رزرو محسوب نمی‌شود."],["پرداخت سفارش چگونه انجام می‌شود؟","پرداخت از مسیر امن درگاه بانکی انجام می‌شود و تایید سفارش بلافاصله برای شما نمایش داده خواهد شد."]]],
  ["ارسال و تحویل", [["زمان تحویل چقدر است؟","سفارش‌های آماده معمولاً طی ۲ تا ۴ روز کاری تحویل می‌شوند. برای قطعات بزرگ، زمان هماهنگی جداگانه اعلام می‌شود."],["محصولات حساس چطور بسته‌بندی می‌شوند؟","سرامیک، شیشه و آینه با بسته‌بندی چندلایه و متناسب با ابعاد محصول آماده ارسال می‌شوند."]]],
  ["بازگشت و مراقبت", [["شرایط بازگشت چیست؟","تا ۷ روز پس از تحویل می‌توانید درخواست بازگشت ثبت کنید؛ محصول باید استفاده‌نشده و در بسته‌بندی اصلی باشد."],["راهنمای نگهداری کجاست؟","در صفحه هر محصول، بخش جزئیات شامل متریال، روش تمیزکردن و نکات مراقبتی درج شده است."]]],
] as const

export default function FaqPage(){return <main><PageHero eyebrow="راهنمای خرید" title="پرسش‌های متداول" description="پاسخ پرسش‌های رایج درباره موجودی، پرداخت، ارسال و بازگشت کالا را اینجا ببینید." compact/><section className="content-container grid gap-12 pb-20 small:pb-28">{groups.map(([group,items],gi)=><div key={group} id={gi===1?"shipping":gi===2?"returns":undefined} className="grid gap-5 border-t border-[var(--color-border)] pt-7 small:grid-cols-[.45fr_1.55fr]"><h2 className="text-lg font-medium">{group}</h2><div>{items.map(([q,a])=><details key={q} className="group border-b border-[var(--color-border)]"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-sm font-medium small:text-base"><span>{q}</span><span className="font-latin text-xl transition group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-6 text-sm leading-8 text-[var(--color-muted)]">{a}</p></details>)}</div></div>)}</section></main>}
