"use client"

import { resetOnboardingState } from "@lib/data/onboarding"
import { Button, Container, Text } from "@modules/common/components/ui"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full">
      <div className="flex flex-col gap-y-4 center p-4 md:items-center">
        <Text className="text-ui-fg-base text-xl">
          سفارش آزمایشی شما با موفقیت ثبت شد! 🎉
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          حالا می‌توانید راه‌اندازی فروشگاه را در پنل مدیریت کامل کنید.
        </Text>
        <Button
          className="w-fit"
          size="large"
          onClick={() => resetOnboardingState(orderId)}
        >
          تکمیل راه‌اندازی در پنل مدیریت
        </Button>
      </div>
    </Container>
  )
}

export default OnboardingCta
