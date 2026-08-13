import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { getLocale } from "@lib/data/locale-actions"

export const metadata: Metadata = {
  title: "حساب کاربری | هارمن دکور",
  description: "مدیریت سفارش‌ها، پروفایل و آدرس‌های شما.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null
  const isPersian = (await getLocale())?.toLowerCase().startsWith("fa")

  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders} isPersian={isPersian} />
}
