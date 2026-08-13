import { redirect } from "next/navigation"

export default async function TransferPage({
  params,
}: {
  params: { countryCode: string; id: string; token: string }
}) {
  const { countryCode, id, token } = params

  redirect(
    `/${encodeURIComponent(countryCode)}/order/${encodeURIComponent(
      id
    )}/transfer/${encodeURIComponent(token)}`
  )
}
