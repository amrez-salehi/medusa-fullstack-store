"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import MapPin from "@modules/common/icons/map-pin"
import Modal from "@modules/common/components/modal"
import { Button, Heading, Text, clx } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useCallback, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region: _region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "flex h-full min-h-[230px] w-full flex-col justify-between rounded-[10px] border border-[var(--color-border)] bg-[var(--color-background)] p-5 transition-colors hover:border-[var(--color-accent-muted)]",
          {
            "border-gray-900": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-surface)] text-[var(--color-accent-dark)]">
                <MapPin size={19} />
              </span>
              <Heading
                className="text-base font-medium text-[var(--color-ink)]"
                data-testid="address-name"
              >
                {address.first_name} {address.last_name}
              </Heading>
            </div>
            {(address.is_default_shipping || address.is_default_billing) && (
              <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-accent-dark)]">
                آدرس پیش‌فرض
              </span>
            )}
          </div>
          {address.company && (
            <Text
              className="mt-3 text-xs text-[var(--color-muted)]"
              data-testid="address-company"
            >
              {address.company}
            </Text>
          )}
          <Text className="mt-4 flex flex-col gap-1 text-right text-sm leading-7 text-[var(--color-text-secondary)]">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>، {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.city}
              {address.province && `، ${address.province}`}
            </span>
            {address.postal_code && <span>کد پستی: {address.postal_code}</span>}
            {address.phone && <span>شماره تماس: {address.phone}</span>}
          </Text>
        </div>
        <div className="mt-5 flex items-center gap-x-2 border-t border-[var(--color-border-soft)] pt-4">
          <button
            className="flex min-h-10 items-center gap-x-2 rounded-[6px] px-3 text-xs font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-surface)]"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit />
            ویرایش
          </button>
          <button
            className="flex min-h-10 items-center gap-x-2 rounded-[6px] px-3 text-xs text-[var(--color-muted)] transition hover:bg-red-50 hover:text-[var(--color-error)]"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash />}
            حذف
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">ویرایش آدرس</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-1 gap-2 xsmall:grid-cols-2">
                <Input
                  label="نام"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="نام خانوادگی"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="شرکت"
                name="company"
                autoComplete="organization"
                defaultValue={address.company || undefined}
                data-testid="company-input"
              />
              <Input
                label="نشانی"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label="واحد، طبقه و..."
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address_2 || undefined}
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-1 gap-2 xsmall:grid-cols-[144px_1fr]">
                <Input
                  label="کد پستی"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  defaultValue={address.postal_code || undefined}
                  data-testid="postal-code-input"
                />
                <Input
                  label="شهر"
                  name="city"
                  required
                  autoComplete="locality"
                  defaultValue={address.city || undefined}
                  data-testid="city-input"
                />
              </div>
              <Input
                label="استان"
                name="province"
                autoComplete="address-level1"
                defaultValue={address.province || undefined}
                data-testid="state-input"
              />
              <input
                type="hidden"
                name="country_code"
                value={address.country_code || "dk"}
              />
              <Input
                label="شماره تماس"
                name="phone"
                autoComplete="phone"
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2">
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

export default EditAddress
