import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { buildPaymentPayload, postAffiliateEvent } from "../lib/affiliate-integration"

export default async function affiliatePaymentCaptured({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const payment = await buildPaymentPayload(container, data.id)
  await postAffiliateEvent({
    eventId: `payment.captured:${data.id}:${payment.capturedAmount}`,
    type: "payment.captured",
    payment,
  })
}

export const config: SubscriberConfig = { event: "payment.captured" }
