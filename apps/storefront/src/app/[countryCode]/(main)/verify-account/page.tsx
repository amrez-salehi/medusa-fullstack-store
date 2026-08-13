import { Metadata } from "next"
import { Suspense } from "react"

import VerifyAccount from "@modules/account/components/verify-account"

export const metadata: Metadata = {
  title: "تأیید ایمیل | هارمن دکور",
  description: "برای تکمیل ثبت‌نام، ایمیل خود را تأیید کنید.",
}

export default function VerifyAccountPage() {
  return (
    <div className="w-full flex justify-center px-8 py-12">
      <Suspense
        fallback={
          <p className="text-base-regular text-ui-fg-base">
            در حال بررسی ایمیل...
          </p>
        }
      >
        <VerifyAccount />
      </Suspense>
    </div>
  )
}
