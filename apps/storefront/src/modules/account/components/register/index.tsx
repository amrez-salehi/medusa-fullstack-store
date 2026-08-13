"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        ساخت حساب کاربری
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        حساب کاربری‌تان را بسازید و خریدی سریع‌تر و راحت‌تر داشته باشید.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="mb-4 w-full border border-[var(--color-error)] bg-transparent p-4 text-center text-base-regular text-[var(--color-error)]"
          data-testid="register-verification-message"
        >
          لینک تأیید به <strong>{message.email}</strong> ارسال شد. برای فعال‌سازی حساب، ایمیل‌تان را بررسی کنید.
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
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
          <Input
            label="ایمیل"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="شماره تماس"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="رمز عبور"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          با ساخت حساب، با{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            حریم خصوصی
          </LocalizedClientLink>{" "}
          و{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            شرایط استفاده
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          ثبت‌نام
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        قبلاً ثبت‌نام کرده‌اید؟{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          ورود
        </button>
        .
      </span>
    </div>
  )
}

export default Register
