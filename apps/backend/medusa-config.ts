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
assertProductionRequired("PAYMENT_PROVIDER_ID")
assertProductionRequired("S3_FILE_URL")
assertProductionRequired("S3_REGION")
assertProductionRequired("S3_BUCKET")
assertProductionHttpsUrl("BACKEND_URL")
assertProductionHttpsUrl("AFFILIATE_API_URL")
assertProductionHttpsUrl("S3_FILE_URL")
assertProductionHttpsOrigins("STORE_CORS")
assertProductionHttpsOrigins("ADMIN_CORS")
assertProductionHttpsOrigins("AUTH_CORS")

if (
  process.env.NODE_ENV === "production" &&
  process.env.PAYMENT_PROVIDER_ID === "pp_system_default"
) {
  throw new MedusaError(
    MedusaError.Types.INVALID_DATA,
    "The manual system payment provider cannot be used in production"
  )
}

const s3AuthenticationMethod = process.env.S3_AUTHENTICATION_METHOD === "s3-iam-role"
  ? "s3-iam-role"
  : "access-key"

if (process.env.NODE_ENV === "production" && s3AuthenticationMethod === "access-key") {
  assertProductionRequired("S3_ACCESS_KEY_ID")
  assertProductionRequired("S3_SECRET_ACCESS_KEY")
}

const fileProviders = process.env.NODE_ENV === "production"
  ? [
      {
        resolve: "@medusajs/file-s3",
        id: "s3",
        options: {
          fileUrl: process.env.S3_FILE_URL,
          region: process.env.S3_REGION,
          bucket: process.env.S3_BUCKET,
          endpoint: process.env.S3_ENDPOINT,
          prefix: process.env.S3_PREFIX,
          authenticationMethod: s3AuthenticationMethod,
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          // Public delivery should be configured at the bucket/CDN layer.
          // Omitting object ACLs supports BucketOwnerEnforced and Block Public Access.
          acl: false,
        },
      },
    ]
  : [
      {
        resolve: "@medusajs/file-local",
        id: "local",
        options: {
          upload_dir: "static/uploads",
          backend_url: process.env.BACKEND_URL || "http://localhost:9000/static/uploads",
        },
      },
    ]

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
        jobOptions: {
          attempts: 10,
          backoff: { type: "exponential", delay: 1000 },
          removeOnComplete: { age: 24 * 60 * 60, count: 10000 },
          removeOnFail: { age: 7 * 24 * 60 * 60, count: 50000 },
        },
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
        providers: fileProviders,
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
