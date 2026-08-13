import { getBaseURL } from "@lib/util/env"
import { getLocale } from "@lib/data/locale-actions"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "هارمن دکور | جزئیاتی برای خانه‌ای ماندگار",
    template: "%s | هارمن دکور",
  },
  description: "مجموعه‌ای گزیده از مبلمان، نورپردازی و اکسسوری‌های معاصر برای خانه‌هایی گرم، شخصی و ماندگار.",
  applicationName: "HARMENDECOR",
  keywords: ["هارمن دکور", "دکوراسیون داخلی", "دکور خانه", "مبلمان", "روشنایی", "اکسسوری خانه"],
  icons: { icon: "/brand/harmendecor-mark.png", apple: "/brand/harmendecor-mark.png" },
  openGraph: {
    siteName: "HARMENDECOR",
    title: "هارمن دکور | جزئیاتی برای خانه‌ای ماندگار",
    description: "مجموعه‌ای گزیده از مبلمان، نورپردازی و اکسسوری‌های معاصر برای خانه‌هایی گرم، شخصی و ماندگار.",
    type: "website",
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale()
  const isPersian = locale?.toLowerCase().startsWith("fa")

  return (
    <html lang={isPersian ? "fa" : "en"} dir={isPersian ? "rtl" : "ltr"} data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
