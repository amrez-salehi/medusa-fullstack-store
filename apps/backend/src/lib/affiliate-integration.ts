import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer, IPaymentModuleService } from "@medusajs/framework/types"
import { signIntegrationRequest, stableStringify } from "./integration-signature"

const affiliateApiUrl = () =>
  (process.env.AFFILIATE_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, "")

export async function postAffiliateEvent(payload: Record<string, unknown>) {
  const secret = process.env.INTEGRATION_SECRET
  if (!secret) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "INTEGRATION_SECRET is not configured")
  const path = "/api/v1/integrations/medusa/events"
  const body = stableStringify(payload)
  const response = await fetch(`${affiliateApiUrl()}/integrations/medusa/events`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...signIntegrationRequest(secret, "POST", path, body),
    },
    body,
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Affiliate event delivery failed (${response.status})`)
  }
}

const asNumber = (value: any) => {
  if (value && typeof value === "object" && "value" in value) {
    return Number(value.value ?? 0)
  }
  return Number(value ?? 0)
}

export async function buildOrderPayload(container: MedusaContainer, orderId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "customer_id",
      "email",
      "currency_code",
      "subtotal",
      "discount_total",
      "total",
      "metadata",
      "items.product_id",
      "items.quantity",
      "items.raw_quantity",
      "items.unit_price",
      "items.raw_unit_price",
      "items.adjustments.code",
      "items.adjustments.amount",
      "items.adjustments.raw_amount",
      "shipping_methods.adjustments.code",
      "payment_collections.payments.id",
      "payment_collections.payments.provider_id",
      "payment_collections.payments.amount",
      "payment_collections.payments.raw_amount",
    ],
    filters: { id: orderId },
  })
  const order = data[0] as any
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order ${orderId} was not found`)

  const itemAdjustments = (order.items || []).flatMap((item: any) => item.adjustments || [])
  const shippingAdjustments = (order.shipping_methods || []).flatMap((method: any) => method.adjustments || [])
  const promotionCode = [...itemAdjustments, ...shippingAdjustments]
    .map((adjustment: any) => adjustment.code)
    .find(Boolean) || order.metadata?.affiliate_code || ""

  const items = (order.items || []).map((item: any) => ({
    productId: item.product_id,
    quantity: asNumber(item.raw_quantity ?? item.quantity),
    unitPrice: asNumber(item.raw_unit_price ?? item.unit_price),
  }))
  const payments = (order.payment_collections || []).flatMap((collection: any) =>
    (collection.payments || []).map((payment: any) => ({
      id: payment.id,
      providerId: payment.provider_id,
      amount: asNumber(payment.raw_amount ?? payment.amount),
    }))
  )
  const merchandiseSubtotal = items.reduce(
    (total: number, item: any) => total + item.unitPrice * item.quantity,
    0
  )
  const appliedDiscount = itemAdjustments.reduce(
    (total: number, adjustment: any) =>
      total + asNumber(adjustment.raw_amount ?? adjustment.amount),
    0
  )
  if (promotionCode && (payments.length !== 1 || payments[0].amount <= 0)) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Affiliate orders require exactly one positive payment"
    )
  }

  return {
    id: order.id,
    customerId: order.customer_id || "",
    email: order.email || "",
    currencyCode: order.currency_code,
    promotionCode,
    subtotal: merchandiseSubtotal,
    discountTotal: appliedDiscount,
    total: payments[0]?.amount ?? merchandiseSubtotal - appliedDiscount,
    items,
    payments,
  }
}

export async function buildPaymentPayload(container: MedusaContainer, paymentId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "payment",
    fields: [
      "id",
      "payment_collection.order.id",
      "payment_collection.order.metadata",
      "payment_collection.order.items.adjustments.code",
      "payment_collection.order.shipping_methods.adjustments.code",
    ],
    filters: { id: paymentId },
  })
  const linkedPayment = data[0] as any
  const order = linkedPayment?.payment_collection?.order
  if (!order) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order for payment ${paymentId} was not found`
    )
  }
  const adjustmentCode = [
    ...(order.items || []).flatMap((item: any) => item.adjustments || []),
    ...(order.shipping_methods || []).flatMap(
      (method: any) => method.adjustments || []
    ),
  ].some((adjustment: any) => Boolean(adjustment.code))
  const paymentService = container.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const payment = await paymentService.retrievePayment(paymentId, { relations: ["refunds"] })
  return {
    shouldNotify: Boolean(order.metadata?.affiliate_code || adjustmentCode),
    payment: {
      id: payment.id,
      capturedAmount: asNumber(payment.captured_amount ?? payment.amount),
      refundedAmount: asNumber(payment.refunded_amount),
    },
  }
}
