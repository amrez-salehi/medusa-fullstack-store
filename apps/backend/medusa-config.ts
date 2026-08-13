import { loadEnv, defineConfig, MedusaError } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const assertProductionSecret = (name: "JWT_SECRET" | "COOKIE_SECRET") => {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  const value = process.env[name]
  const knownPlaceholder = /^(supersecret|changeme|replace[-_ ]?me)$/i

  if (!value || value.length < 32 || knownPlaceholder.test(value)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${name} must be a randomly generated secret of at least 32 characters in production`
    )
  }
}

assertProductionSecret("JWT_SECRET")
assertProductionSecret("COOKIE_SECRET")

const assertProductionRequired = (name: string, minimumLength = 1) => {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  const value = process.env[name]?.trim()
  if (!value || value.length < minimumLength) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${name} must be configured for production`
    )
  }
}

const assertProductionHttpsOrigins = (name: string) => {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  const origins = process.env[name]?.split(",").map((origin) => origin.trim()).filter(Boolean) || []
  const invalid = origins.length === 0 || origins.some((origin) => {
    try {
      const url = new URL(origin)
      return url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash
    } catch {
      return true
    }
  })

  if (invalid) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${name} must contain only comma-separated HTTPS origins in production`
    )
  }
}

const assertProductionHttpsUrl = (name: string) => {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  let isValid = false
  try {
    const url = new URL(process.env[name] || "")
    isValid = url.protocol === "https:"
  } catch {
    isValid = false
  }

  if (!isValid) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${name} must be a valid HTTPS URL in production`
    )
  }
}

assertProductionRequired("DATABASE_URL")
assertProductionRequired("REDIS_URL")
assertProductionRequired("BACKEND_URL")
assertProductionRequired("AFFILIATE_API_URL")
assertProductionRequired("INTEGRATION_SECRET", 32)
assertProductionHttpsUrl("BACKEND_URL")
assertProductionHttpsUrl("AFFILIATE_API_URL")
assertProductionHttpsOrigins("STORE_CORS")
assertProductionHttpsOrigins("ADMIN_CORS")
assertProductionHttpsOrigins("AUTH_CORS")

module.exports = defineConfig({
  admin: {
    disable: true,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: { redisUrl: process.env.REDIS_URL },
      },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/wishlist",
    },
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "static/uploads",
              backend_url: process.env.BACKEND_URL || "http://localhost:9000/static/uploads",
            },
          },
        ],
      },
    },
  ],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  }
})
