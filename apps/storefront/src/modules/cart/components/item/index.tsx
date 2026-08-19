"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import { getPersianProductCopy } from "@lib/i18n/product-copy"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  locale?: string | null
}

const Item = ({ item, type = "full", currencyCode, locale }: ItemProps) => {
  const isPersian = locale?.toLowerCase().startsWith("fa")
  const displayTitle = isPersian
    ? getPersianProductCopy({ handle: item.product_handle || "", title: item.product_title || "", description: "" }).title
    : item.product_title
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // This is presentation-only; Medusa still validates inventory server-side.
  // Do not present an arbitrary client-side limit as available stock.
  const inventoryQuantity = Math.max(0, item.variant?.inventory_quantity ?? 0)
  const maxQuantity =
    item.variant?.manage_inventory && !item.variant.allow_backorder
      ? inventoryQuantity
      : 10

  if (type === "full") {
    return (
      <article className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-light-cream)] p-3.5 min-[360px]:grid-cols-[112px_minmax(0,1fr)] small:grid-cols-[144px_minmax(0,1fr)] small:gap-6 small:p-5" data-testid="product-row">
        <LocalizedClientLink href={`/products/${item.product_handle}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface)] min-[360px]:h-28 min-[360px]:w-28 small:h-36 small:w-36">
          <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" fit="contain" />
        </LocalizedClientLink>
        <div className="flex min-w-0 flex-col justify-between gap-4 py-0.5 small:py-1">
          <div className="min-w-0">
            <div className="min-w-0">
              <LocalizedClientLink href={`/products/${item.product_handle}`} className="block line-clamp-2 text-[15px] font-semibold leading-6 text-[#27231f] hover:text-[#9a6947] small:text-lg small:leading-7">
                {displayTitle}
              </LocalizedClientLink>
              <div className="mt-1 text-xs text-[#8a8177]">
                <LineItemOptions variant={item.variant} data-testid="product-variant" />
              </div>
            </div>
            <div className="mt-3 text-sm font-semibold text-[#27231f] small:mt-0 small:text-base">
              <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee7de] pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#756b61]">{isPersian ? "تعداد" : "Quantity"}</span>
              <div className="flex h-9 items-center overflow-hidden rounded-[6px] border border-[var(--color-border)] bg-[var(--color-background)]" role="group" aria-label={isPersian ? "تغییر تعداد" : "Change quantity"}>
                <button
                  type="button"
                  onClick={() => changeQuantity(Math.min(maxQuantity, item.quantity + 1))}
                  disabled={updating || item.quantity >= maxQuantity}
                  className="flex h-full w-9 items-center justify-center text-lg text-[#625a51] transition hover:bg-[#f1e8dd] hover:text-[#9a6947] disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={isPersian ? "افزایش تعداد" : "Increase quantity"}
                  data-testid="increase-quantity-button"
                >
                  +
                </button>
                <span className="min-w-8 px-1 text-center text-sm font-semibold text-[#27231f]" aria-live="polite">
                  {isPersian ? item.quantity.toLocaleString("fa-IR") : item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => changeQuantity(Math.max(1, item.quantity - 1))}
                  disabled={updating || item.quantity <= 1}
                  className="flex h-full w-9 items-center justify-center text-lg text-[#625a51] transition hover:bg-[#f1e8dd] hover:text-[#9a6947] disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={isPersian ? "کاهش تعداد" : "Decrease quantity"}
                  data-testid="decrease-quantity-button"
                >
                  −
                </button>
              </div>
              {updating && <Spinner className="animate-spin" />}
            </div>
            <DeleteButton id={item.id} className="text-xs font-medium text-[#9a6947] hover:text-[#7c4c2e]">
              {isPersian ? "حذف" : "Remove"}
            </DeleteButton>
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      </article>
    )
  }

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            fit="contain"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {displayTitle}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{isPersian ? `${item.quantity.toLocaleString("fa-IR")} ×` : `${item.quantity}x`} </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
