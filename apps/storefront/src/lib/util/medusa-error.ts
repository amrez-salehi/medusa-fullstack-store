type MedusaError = {
  response?: {
    data: { message?: string } | string
    status: number
    headers: unknown
  }
  request?: unknown
  message?: string
  config?: { url: string; baseURL: string }
}

export default function medusaError(error: unknown): never {
  const err = error as MedusaError
  if (err.response) {
    let path = "unknown"
    try {
      path = new URL(err.config?.url ?? "", err.config?.baseURL ?? "").pathname
    } catch {
      // Never include the raw URL because it may contain tokens or identifiers.
    }

    console.error("Medusa request failed", {
      path,
      status: err.response.status,
    })

    const data = err.response.data
    const message =
      typeof data === "object" && data !== null
        ? data.message || String(data)
        : data

    if (err.response.status >= 500) {
      throw new Error("The service could not complete the request.")
    }

    const safeMessage = String(message || "Request failed")
    throw new Error(
      safeMessage.charAt(0).toUpperCase() + safeMessage.slice(1) + "."
    )
  } else if (err.request) {
    throw new Error("The service did not respond to the request.")
  } else {
    console.error("Medusa request setup failed")
    throw new Error("The request could not be completed.")
  }
}
