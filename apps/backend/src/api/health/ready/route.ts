import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import type { IPaymentModuleService } from "@medusajs/framework/types"

type DatabaseConnection = {
  raw: (query: string) => Promise<unknown>
}

type RedisConnection = {
  ping: () => Promise<string>
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const database = req.scope.resolve<DatabaseConnection>(
      ContainerRegistrationKeys.PG_CONNECTION
    )
    const redis = req.scope.resolve<RedisConnection>("eventBusRedisConnection")
    const payment = req.scope.resolve<IPaymentModuleService>(Modules.PAYMENT)
    const providerId = process.env.PAYMENT_PROVIDER_ID || "pp_system_default"
    const [, pong, providers] = await Promise.all([
      database.raw("select 1"),
      redis.ping(),
      payment.listPaymentProviders({ id: [providerId] }),
    ])
    if (pong !== "PONG") {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Redis did not respond"
      )
    }
    if (providers.length !== 1 || providers[0].id !== providerId) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Configured payment provider is unavailable"
      )
    }
    res.status(200).json({ status: "ready" })
  } catch {
    res.status(503).json({ status: "not_ready" })
  }
}
