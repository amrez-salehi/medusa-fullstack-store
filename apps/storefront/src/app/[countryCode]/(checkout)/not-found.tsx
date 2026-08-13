import InteractiveLink from "@modules/common/components/interactive-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404",
  description: "چیزی درست پیش نرفت.",
}

export default async function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">صفحه پیدا نشد</h1>
      <p className="text-small-regular text-ui-fg-base">
        صفحه‌ای که می‌خواستید باز کنید وجود ندارد.
      </p>
      <InteractiveLink href="/">بازگشت به صفحه اصلی</InteractiveLink>
    </div>
  )
}
