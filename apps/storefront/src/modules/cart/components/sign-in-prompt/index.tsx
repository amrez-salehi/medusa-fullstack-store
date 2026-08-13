import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = ({ locale }: { locale?: string | null }) => {
  const isPersian = locale?.toLowerCase().startsWith("fa")
  return (
    <div className="mb-8 flex items-center justify-between gap-4 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-light-cream)] px-5 py-4">
      <div>
        <Heading level="h2" className="text-base font-medium">
          {isPersian ? "حساب کاربری دارید؟" : "Already have an account?"}
        </Heading>
        <Text className="mt-1 text-sm text-[#756b61]">
          {isPersian ? "برای خرید سریع‌تر وارد شوید." : "Sign in for a faster checkout."}
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10 rounded-[6px] border-[var(--color-border)] px-4" data-testid="sign-in-button">
            {isPersian ? "ورود" : "Sign in"}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
