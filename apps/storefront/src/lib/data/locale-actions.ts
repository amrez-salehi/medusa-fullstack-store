"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { cookies as nextCookies } from "next/headers"
import { getAuthHeaders, getCacheTag, getCartId } from "./cookies"

const LOCALE_COOKIE_NAME = "_medusa_locale"
const SUPPORTED_LOCALES = new Set(["fa-IR", "en-US"])

/**
 * Gets the current locale from cookies
 */
export const getLocale = async (): Promise<string | null> => {
  try {
    const cookies = await nextCookies()
    return cookies.get(LOCALE_COOKIE_NAME)?.value || "fa-IR"
  } catch {
    return "fa-IR"
  }
}

/**
 * Sets the locale cookie
 */
export const setLocaleCookie = async (locale: string) => {
  const cookies = await nextCookies()
  cookies.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Allow client-side access
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

/**
 * Updates the locale preference via SDK and stores in cookie.
 * Also updates the cart with the new locale if one exists.
 */
export const updateLocale = async (localeCode: string): Promise<string> => {
  if (!SUPPORTED_LOCALES.has(localeCode)) {
    throw new Error("Unsupported locale")
  }

  await setLocaleCookie(localeCode)

  // The cookie is the source of truth for the storefront language. Cart
  // synchronization is best-effort because older Medusa carts may not expose
  // the locale field and must not prevent the language switch from completing.
  try {
    const cartId = await getCartId()
    if (cartId) {
      const headers = { ...(await getAuthHeaders()) }
      await sdk.store.cart.update(cartId, { locale: localeCode }, {}, headers)

      const cartCacheTag = await getCacheTag("carts")
      if (cartCacheTag) {
        try {
          revalidateTag(cartCacheTag)
        } catch {
          // Cache invalidation should never break a language change.
        }
      }
    }
  } catch {
    // Keep the selected locale even if cart synchronization is unavailable.
  }

  // Revalidate relevant caches to refresh content
  for (const tag of ["products", "categories", "collections"]) {
    try {
      const cacheTag = await getCacheTag(tag)
      if (cacheTag) {
        revalidateTag(cacheTag)
      }
    } catch {
      // Cache invalidation is optional; the next refresh will fetch fresh data.
    }
  }

  return localeCode
}
