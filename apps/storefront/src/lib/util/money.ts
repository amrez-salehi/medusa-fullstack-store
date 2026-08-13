import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "fa-IR",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) return amount.toString()

  // Persian storefronts always present prices in تومان, even if an older
  // cached cart or price record still carries another ISO currency code.
  if (currency_code.toLowerCase() === "irr" || locale.toLowerCase().startsWith("fa")) {
    return `${new Intl.NumberFormat("fa-IR", {
      minimumFractionDigits: minimumFractionDigits ?? 0,
      maximumFractionDigits: maximumFractionDigits ?? 0,
    }).format(amount)} تومان`
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}
