"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type Locale = {
  code: string
  name: string
}

/**
 * Fetches available locales from the backend.
 * Returns null if the endpoint returns 404 (locales not configured).
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  const next = {
    ...(await getCacheOptions("locales")),
  }

  return sdk.client
    .fetch<{ locales: Locale[] }>(`/store/locales`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ locales }) => {
      const available = locales?.length ? locales : fallbackLocales
      const hasPersian = available.some((locale) => locale.code.toLowerCase().startsWith("fa"))
      return hasPersian ? available : [...available, fallbackLocales[1]]
    })
    .catch(() => fallbackLocales)
}

const fallbackLocales: Locale[] = [
  { code: "en-US", name: "English" },
  { code: "fa-IR", name: "فارسی" },
]
