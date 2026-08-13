import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "آدرس‌های من | هارمن دکور",
  description: "آدرس‌های ارسال خود را مدیریت کنید.",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-7 border-b border-[var(--color-border)] pb-6 small:mb-9 small:flex small:items-end small:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-accent-dark)]">
            حساب کاربری
          </p>
          <h1 className="text-[26px] font-medium leading-[1.5] tracking-[-.035em] text-[var(--color-ink)] small:text-[32px]">
            آدرس‌های ارسال
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
            آدرس‌های مورد استفاده برای تحویل سفارش را اینجا ثبت و ویرایش کنید.
          </p>
        </div>
        <span className="mt-4 inline-flex w-fit rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] small:mt-0">
          {(customer.addresses?.length || 0).toLocaleString("fa-IR")} آدرس
          ثبت‌شده
        </span>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
