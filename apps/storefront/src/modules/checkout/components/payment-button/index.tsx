"use client"

import { isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useRef, useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      if (process.env.NODE_ENV === "production") {
        return <Button disabled>روش پرداخت پیکربندی نشده است</Button>
      }
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>یک روش پرداخت انتخاب کنید</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const submitLock = useRef(false)

  const onPaymentCompleted = async () => {
    await placeOrder()
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    if (submitLock.current) return
    submitLock.current = true
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      submitLock.current = false
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        session?.data.client_secret as string,
        {
          payment_method: {
            card: card,
            billing_details: {
              name:
                cart.billing_address?.first_name +
                " " +
                cart.billing_address?.last_name,
              address: {
                city: cart.billing_address?.city ?? undefined,
                country: cart.billing_address?.country_code ?? undefined,
                line1: cart.billing_address?.address_1 ?? undefined,
                line2: cart.billing_address?.address_2 ?? undefined,
                postal_code: cart.billing_address?.postal_code ?? undefined,
                state: cart.billing_address?.province ?? undefined,
              },
              email: cart.email,
              phone: cart.billing_address?.phone ?? undefined,
            },
          },
        }
      )

      if (error) {
        setErrorMessage(error.message || "پرداخت انجام نشد.")
        return
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded")
      ) {
        await onPaymentCompleted()
        return
      }

      setErrorMessage("وضعیت پرداخت نامشخص است. لطفاً سفارش‌های خود را بررسی کنید.")
    } catch {
      setErrorMessage("ارتباط با درگاه پرداخت برقرار نشد. مبلغی دوباره کسر نمی‌شود؛ وضعیت سفارش را بررسی کنید.")
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        className="digikala-red-button min-w-[180px]"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        ثبت سفارش
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const submitLock = useRef(false)

  const onPaymentCompleted = async () => {
    await placeOrder()
  }

  const handlePayment = async () => {
    if (process.env.NODE_ENV === "production" || submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    try {
      await onPaymentCompleted()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ثبت سفارش انجام نشد.")
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        className="digikala-red-button min-w-[180px]"
        data-testid="submit-order-button"
      >
        ثبت سفارش
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
