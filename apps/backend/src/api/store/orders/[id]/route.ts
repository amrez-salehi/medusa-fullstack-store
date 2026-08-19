import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { getOrderDetailWorkflow } from "@medusajs/medusa/core-flows"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Authentication required"
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: {
      id: req.params.id,
      customer_id: customerId,
      is_draft_order: false,
    },
  })

  // Return the same response for an unknown order and another customer's
  // order so this endpoint cannot be used for order-ID enumeration.
  if (!data.length) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found")
  }

  const { result } = await getOrderDetailWorkflow(req.scope).run({
    input: {
      fields: req.queryConfig.fields,
      order_id: req.params.id,
      filters: { is_draft_order: false },
    },
  })

  res.status(200).json({ order: result })
}
