"use client"

import Medusa from "@medusajs/js-sdk"

export const adminSdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  debug: process.env.NODE_ENV === "development",
  // Limit persistence to the current browser tab. This reduces the exposure
  // window compared with localStorage; an HttpOnly BFF session remains the
  // preferred production design for privileged administration.
  auth: {
    type: "jwt",
    jwtTokenStorageMethod: "session",
    jwtTokenStorageKey: "armes_home_admin_token",
  },
})

export type AdminProduct = {
  id: string
  title: string
  handle?: string
  description?: string | null
  thumbnail?: string | null
  images?: Array<{ id?: string; url: string }>
  status?: string
  variants?: Array<{
    id?: string
    prices?: Array<{ id?: string; amount?: number; currency_code?: string }>
    inventory_quantity?: number
    inventory_items?: Array<{ inventory_item_id?: string; inventory_item?: { id?: string } }>
  }>
}

export const toman = (amount = 0) => `${Math.round(amount).toLocaleString("fa-IR")} تومان`
