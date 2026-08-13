import { retrieveCustomer } from "@lib/data/customer"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"
import { getLocale } from "@lib/data/locale-actions"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const [customer, locale] = await Promise.all([
    retrieveCustomer().catch(() => null),
    getLocale(),
  ])
  const isPersian = locale?.toLowerCase().startsWith("fa")

  return (
    <AccountLayout customer={customer} isPersian={isPersian}>
      {customer ? dashboard : login}
      {/* TODO: Re-add Toaster component when needed */}
    </AccountLayout>
  )
}
