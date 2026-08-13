import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { buildOrderPayload, postAffiliateEvent } from "../lib/affiliate-integration"

export default async function affiliateOrderPlaced({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const order = await buildOrderPayload(container, data.id)
  await postAffiliateEvent({
    eventId: `order.placed:${data.id}`,
    type: "order.placed",
    order,
  })
}

export const config: SubscriberConfig = { event: "order.placed" }
