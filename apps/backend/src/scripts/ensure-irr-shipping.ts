import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { updateShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function ensureIrrShipping({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  const irrRegion = regions.find((region: any) => region.currency_code === "irr")
  if (!irrRegion) {
	throw new MedusaError(MedusaError.Types.NOT_FOUND, "No IRR region was found")
  }

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "price_type"],
  })
  if (!shippingOptions.length) {
	throw new MedusaError(MedusaError.Types.NOT_FOUND, "No shipping option was found")
  }

  await updateShippingOptionsWorkflow(container).run({
    input: shippingOptions.map((option: any) => ({
      id: option.id,
      price_type: "flat" as const,
      prices: [
        {
          region_id: irrRegion.id,
          amount: option.name?.toLowerCase().includes("express")
            ? 350000
            : 200000,
        },
      ],
    })),
  })
  logger.info(`IRR prices configured for ${shippingOptions.length} shipping options`)
}
