import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@modules/common/components/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="w-full border-t border-[var(--color-border)] bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(44,37,31,0.08)] backdrop-blur-sm"
            data-testid="mobile-actions"
          >
            <div className="mb-2 flex min-w-0 items-center justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-ui-fg-subtle" data-testid="mobile-title">
                {product.title}
              </span>
              {selectedPrice ? (
                <div className="flex shrink-0 items-end gap-x-2 font-semibold text-ui-fg-base">
                  {selectedPrice.price_type === "sale" && (
                    <p className="text-xs font-normal text-ui-fg-subtle">
                      <span className="line-through">
                        {selectedPrice.original_price}
                      </span>
                    </p>
                  )}
                  <span
                    className={clx({
                      "text-ui-fg-interactive":
                        selectedPrice.price_type === "sale",
                    })}
                  >
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div className={clx("grid w-full grid-cols-2 gap-2", {
              "!grid-cols-1": isSimple,
            })}>
              {!isSimple && <Button
                onClick={open}
                variant="secondary"
                className="!h-11 !min-h-0 w-full min-w-0 !rounded-[6px] px-3 text-sm"
                data-testid="mobile-actions-button"
              >
                <div className="flex w-full min-w-0 items-center justify-between gap-2">
                  <span className="truncate">
                    {variant ? "ویرایش مشخصات" : "انتخاب گزینه‌ها"}
                  </span>
                  <ChevronDown />
                </div>
              </Button>}
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || !variant}
                className="!h-11 !min-h-0 w-full !rounded-[6px] px-3 text-sm"
                isLoading={isAdding}
                data-testid="mobile-cart-button"
              >
                {!variant
                  ? "انتخاب گزینه"
                  : !inStock
                  ? "ناموجود"
                  : "افزودن به سبد خرید"}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-end justify-center p-0 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="max-h-[82vh] w-full transform overflow-y-auto rounded-t-3xl bg-white text-left shadow-2xl"
                  data-testid="mobile-actions-modal"
                >
                  <div className="flex w-full justify-between px-4 pt-4">
                    <div className="h-1.5 w-12 rounded-full bg-[var(--color-border)]" />
                    <button
                      onClick={close}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-ui-fg-base"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-white px-4 pb-8 pt-5">
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
