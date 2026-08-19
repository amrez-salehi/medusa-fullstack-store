"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading, clx } from "@modules/common/components/ui"
import { useActionState, useCallback, useEffect, useState } from "react"

import { addCustomerAddress } from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import MapPin from "@modules/common/icons/map-pin"
import Modal from "@modules/common/components/modal"

const AddAddress = ({
  region: _region,
  variant = "card",
}: {
  region: HttpTypes.StoreRegion
  variant?: "empty" | "card"
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = useCallback(() => {
    setSuccessState(false)
    closeModal()
  }, [closeModal])

  useEffect(() => {
    if (successState) {
      close()
    }
  }, [close, successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      <button
        type="button"
        className={clx(
          "group w-full rounded-[14px] border border-dashed border-[var(--color-border)] bg-[var(--color-background)] text-right transition duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
          variant === "empty"
            ? "flex min-h-[190px] flex-col items-start justify-center gap-6 p-6 small:min-h-[210px] small:flex-row small:items-center small:justify-between small:p-8"
            : "flex min-h-[230px] flex-col items-start justify-between p-5"
        )}
        onClick={open}
        data-testid="add-address-button"
      >
        <span
          className={clx(
            "flex items-center",
            variant === "empty" ? "gap-4" : "flex-col items-start gap-4"
          )}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-surface)] text-[var(--color-accent-dark)] transition group-hover:bg-[var(--color-light-cream)]">
            <MapPin size={22} />
          </span>
          <span>
            <strong className="block text-base font-medium text-[var(--color-ink)] small:text-lg">
              {variant === "empty"
                ? "اولین آدرس را ثبت کنید"
                : "آدرس دیگری اضافه کنید"}
            </strong>
            <span className="mt-1.5 block max-w-md text-xs leading-6 text-[var(--color-muted)] small:text-sm">
              {variant === "empty"
                ? "برای تحویل سریع‌تر سفارش، مشخصات گیرنده و نشانی دقیق را وارد کنید."
                : "یک نشانی تازه برای تحویل سفارش ثبت کنید."}
            </span>
          </span>
        </span>
        <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-[var(--color-ink)] px-5 text-sm font-medium text-white transition group-hover:bg-[var(--color-accent-dark)]">
          افزودن آدرس
          <Plus />
        </span>
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2">افزودن آدرس</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-1 gap-2 xsmall:grid-cols-2">
                <Input
                  label="نام"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                />
                <Input
                  label="نام خانوادگی"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="شرکت"
                name="company"
                autoComplete="organization"
                data-testid="company-input"
              />
              <Input
                label="نشانی"
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
              />
              <Input
                label="واحد، طبقه و..."
                name="address_2"
                autoComplete="address-line2"
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-1 gap-2 xsmall:grid-cols-[144px_1fr]">
                <Input
                  label="کد پستی"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  data-testid="postal-code-input"
                />
                <Input
                  label="شهر"
                  name="city"
                  required
                  autoComplete="locality"
                  data-testid="city-input"
                />
              </div>
              <Input
                label="استان"
                name="province"
                autoComplete="address-level1"
                data-testid="state-input"
              />
              <input type="hidden" name="country_code" value="dk" />
              <Input
                label="شماره تماس"
                name="phone"
                autoComplete="phone"
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div
                className="text-rose-500 text-small-regular py-2"
                data-testid="address-error"
              >
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                لغو
              </Button>
              <SubmitButton data-testid="save-button">ذخیره آدرس</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
