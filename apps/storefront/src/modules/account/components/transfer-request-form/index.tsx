"use client"
import { createTransferRequest } from "@lib/data/orders"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { Heading, IconButton, Input, Text } from "@modules/common/components/ui"
import { useActionState } from "react"
// TODO: Re-add Toaster component when needed
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <section className="w-full rounded-[14px] border border-[var(--color-border)] bg-[var(--color-background)] p-5 small:p-6">
      <div className="grid w-full items-center gap-5 small:grid-cols-[minmax(0,1fr)_minmax(260px,.8fr)] small:gap-8">
        <div className="flex flex-col gap-y-1">
          <Heading
            level="h3"
            className="!text-base font-medium text-[var(--color-ink)]"
          >
            سفارشی در این فهرست نیست؟
          </Heading>
          <p className="mt-1 text-xs leading-6 text-[var(--color-muted)]">
            اگر خرید را با ایمیل دیگری انجام داده‌اید، شناسه سفارش را وارد کنید.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-2 xsmall:flex-row"
        >
          <div className="flex w-full flex-col gap-2 xsmall:flex-row">
            <Input
              className="w-full"
              name="order_id"
              placeholder="شناسه سفارش"
              aria-label="شناسه سفارش"
            />
            <SubmitButton
              variant="secondary"
              size="small"
              className="min-h-12 w-full shrink-0 whitespace-nowrap xsmall:w-auto"
            >
              افزودن سفارش
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text className="mt-4 text-right text-sm text-rose-500">
          {state.error}
        </Text>
      )}
      {showSuccess && (
        <div className="mt-4 flex w-full items-center justify-between rounded-[10px] bg-emerald-50 p-4">
          <div className="flex gap-x-2 items-center">
            <CheckCircleMiniSolid className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col gap-y-1">
              <Text className="text-medim-pl text-neutral-950">
                درخواست انتقال سفارش {state.order?.id} ثبت شد.
              </Text>
              <Text className="text-base-regular text-neutral-600">
                ایمیل درخواست انتقال به {state.order?.email} ارسال شد.
              </Text>
            </div>
          </div>
          <IconButton className="h-fit" onClick={() => setShowSuccess(false)}>
            <XCircleSolid className="w-4 h-4 text-neutral-500" />
          </IconButton>
        </div>
      )}
    </section>
  )
}
