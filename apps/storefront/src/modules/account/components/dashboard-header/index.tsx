import { HttpTypes } from "@medusajs/types"

type DashboardHeaderProps = {
  customer: HttpTypes.StoreCustomer | null
  orderCount: number
  isPersian?: boolean
}

const DashboardHeader = ({
  customer,
  orderCount,
  isPersian = false,
}: DashboardHeaderProps) => {
  const firstName = customer?.first_name?.trim() || (isPersian ? "دوست عزیز" : "there")
  const joinedYear = getJoinedYear(customer?.created_at, isPersian)
  const numberLocale = isPersian ? "fa-IR" : "en-US"

  const chips = [
    `${orderCount.toLocaleString(numberLocale)} ${isPersian ? "سفارش" : "orders"}`,
    `${isPersian ? "عضویت از" : "Member since"} ${joinedYear}`,
  ]

  return (
    <header
      dir={isPersian ? "rtl" : "ltr"}
      className="account-dashboard-header"
      data-testid="dashboard-header"
    >
      <div className="account-dashboard-copy">
        <p>{isPersian ? "نمای کلی حساب" : "Account overview"}</p>
        <h1>{isPersian ? `سلام ${firstName}` : `Welcome back, ${firstName}`}</h1>
        <span>{isPersian ? "سفارش‌ها، علاقه‌مندی‌ها و اطلاعات حساب شما در یک نگاه." : "Your orders, favorites, and account details at a glance."}</span>
      </div>
      <div className="account-dashboard-chips" aria-label={isPersian ? "خلاصه حساب" : "Account summary"}>
        {chips.map((chip) => <span key={chip}>{chip}</span>)}
      </div>
    </header>
  )
}

export const DashboardHeaderSkeleton = () => (
  <header className="border-b border-[#EFE7DE] pb-8 pt-2 small:px-2 small:pt-2" aria-hidden="true">
    <div className="flex w-full justify-end">
      <div className="w-full space-y-3 text-right">
          <div className="ml-auto h-10 w-72 animate-pulse bg-[var(--color-surface)]" />
          <div className="ml-auto h-5 w-96 max-w-full animate-pulse bg-[var(--color-light-cream)]" />
          <div className="ml-auto h-8 w-64 animate-pulse bg-[var(--color-light-cream)]" />
        </div>
      </div>
  </header>
)

const getJoinedYear = (createdAt: string | Date | undefined, isPersian: boolean) => {
  if (!createdAt) return "—"
  return new Date(createdAt).toLocaleDateString(isPersian ? "fa-IR" : "en-US", { year: "numeric" })
}

export default DashboardHeader
