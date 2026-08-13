import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi mb-6">خوش آمدید</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        برای ادامه خرید وارد حساب کاربری‌تان شوید.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="mb-6 w-full border border-[var(--color-error)] bg-transparent p-4 text-center text-base-regular text-[var(--color-error)]"
          data-testid="login-verification-message"
        >
          لینک تأیید به <strong>{message.email}</strong> ارسال شد. ایمیل‌تان را تأیید کنید و دوباره وارد شوید.
        </div>
      )}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="ایمیل"
            name="email"
            type="email"
            title="یک ایمیل معتبر وارد کنید."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="رمز عبور"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          ورود
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        حساب کاربری ندارید؟{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          ثبت‌نام کنید
        </button>
        .
      </span>
    </div>
  )
}

export default Login
