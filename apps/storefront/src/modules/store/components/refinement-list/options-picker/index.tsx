"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { useEffect, useMemo, useState } from "react"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import clsx from "clsx"

type OptionsPickerProps = {
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
  className?: string
}

const optionNames: Record<string, string> = {
  Material: "جنس و متریال",
  Color: "رنگ",
  "Home Color": "رنگ",
  Room: "فضای مناسب",
  "Decor Style": "سبک دکوراسیون",
  Dimensions: "ابعاد",
}

const valueNames: Record<string, string> = {
  White: "سفید",
  Black: "مشکی",
  Brown: "قهوه‌ای",
  Beige: "بژ",
  Cream: "کرم",
  Gray: "خاکستری",
  Grey: "خاکستری",
  Green: "سبز",
  Blue: "آبی",
  Red: "قرمز",
}

type FilterGroup = {
  id: string
  title: string
  values: { id: string; label: string }[]
}

export default function OptionsPicker({
  selectedValueIds,
  setOptionValueIds,
  className,
}: OptionsPickerProps) {
  const [options, setOptions] = useState<HttpTypes.StoreProductOption[]>([])
  const [openItems, setOpenItems] = useState<string[]>([])
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await sdk.client.fetch<{
          product_options?: HttpTypes.StoreProductOption[]
        }>("/store/product-options", {
          method: "GET",
          query: { is_exclusive: false, fields: "*values" },
        })

        if (response?.product_options) setOptions(response.product_options)
      } catch (error) {
        console.error("Failed to fetch product options", error)
      }
    }

    fetchOptions()
  }, [])

  const groups = useMemo(() => {
    const groupMap = new Map<string, FilterGroup>()

    options.forEach((option) => {
      const title = optionNames[option.title || ""]
      if (!title) return

      const group = groupMap.get(title) || {
        id: title,
        title,
        values: [],
      }
      const existingIds = new Set(group.values.map((value) => value.id))

      option.values?.forEach((value) => {
        if (!value.id || !value.value || existingIds.has(value.id)) return
        group.values.push({
          id: value.id,
          label: valueNames[value.value] || value.value,
        })
        existingIds.add(value.id)
      })

      groupMap.set(title, group)
    })

    return Array.from(groupMap.values()).filter((group) => group.values.length)
  }, [options])

  useEffect(() => {
    const selectedGroups = groups
      .filter((group) =>
        group.values.some((value) => selectedValueIds.includes(value.id))
      )
      .map((group) => group.id)

    setOpenItems((current) =>
      Array.from(new Set([...current, ...selectedGroups]))
    )
  }, [groups, selectedValueIds])

  if (!groups.length) return null

  const toggleValue = (valueId: string) => {
    const nextSelections = selectedValueIds.includes(valueId)
      ? selectedValueIds.filter((id) => id !== valueId)
      : [...selectedValueIds, valueId]

    setOptionValueIds(Array.from(new Set(nextSelections)))
  }

  return (
    <Accordion.Root
      type="multiple"
      value={openItems}
      onValueChange={setOpenItems}
      className={clsx("border-t border-[var(--color-border)]", className)}
    >
      {groups.map((group) => {
        const selectedCount = group.values.filter((value) =>
          selectedValueIds.includes(value.id)
        ).length
        const expanded = expandedGroups.includes(group.id)
        const displayedValues = expanded
          ? group.values
          : group.values.slice(0, 8)

        return (
          <Accordion.Item
            key={group.id}
            value={group.id}
            className="border-b border-[var(--color-border-soft)]"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex min-h-[58px] w-full items-center justify-between gap-3 text-right">
                <span className="text-sm font-medium text-[var(--color-ink)]">
                  {group.title}
                </span>
                <span className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-ink)] px-1.5 text-[10px] text-white">
                      {selectedCount.toLocaleString("fa-IR")}
                    </span>
                  )}
                  <ChevronIcon />
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden pb-5 data-[state=closed]:animate-accordion-close data-[state=open]:animate-accordion-open">
              <div className="grid grid-cols-2 gap-2">
                {displayedValues.map((value) => {
                  const selected = selectedValueIds.includes(value.id)

                  return (
                    <button
                      type="button"
                      key={value.id}
                      onClick={() => toggleValue(value.id)}
                      className={clsx(
                        "flex min-h-10 min-w-0 items-center justify-between gap-2 rounded-[6px] border px-3 text-right text-xs transition",
                        selected
                          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                          : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
                      )}
                      aria-pressed={selected}
                    >
                      <span className="min-w-0 truncate">{value.label}</span>
                      {selected && <span aria-hidden="true">✓</span>}
                    </button>
                  )
                })}
              </div>
              {group.values.length > 8 && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedGroups((current) =>
                      current.includes(group.id)
                        ? current.filter((id) => id !== group.id)
                        : [...current, group.id]
                    )
                  }
                  className="mt-3 min-h-9 text-xs font-medium text-[var(--color-accent-dark)]"
                >
                  {expanded
                    ? "نمایش کمتر"
                    : `${(group.values.length - 8).toLocaleString(
                        "fa-IR"
                      )} گزینه دیگر`}
                </button>
              )}
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion.Root>
  )
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-[var(--color-muted)] transition-transform duration-200 group-data-[state=open]:rotate-180"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
