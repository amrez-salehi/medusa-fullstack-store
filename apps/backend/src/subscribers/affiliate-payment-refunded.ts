import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { buildPaymentPayload, postAffiliateEvent } from "../lib/affiliate-integration"

export default async function affiliatePaymentRefunded({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const payment = await buildPaymentPayload(container, data.id)
  await postAffiliateEvent({
    eventId: `payment.refunded:${data.id}:${payment.refundedAmount}`,
    type: "payment.refunded",
    payment,
  })
}

export const config: SubscriberConfig = { event: "payment.refunded" }
