import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = ({ locale }: { locale?: string | null }) => {
  const isPersian = locale?.toLowerCase().startsWith("fa")
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-3xl items-center justify-center py-16" data-testid="empty-cart-message">
      <div className="w-full rounded-[14px] border-y border-[var(--color-border)] px-6 py-16 text-center small:border small:bg-[var(--color-light-cream)] small:px-16">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border)] text-3xl text-[var(--color-accent-dark)]" aria-hidden="true">✦</div>
        <Heading level="h1" className="text-3xl font-medium tracking-[-0.04em] small:text-5xl">
          {isPersian ? "سبد خرید شما خالی است" : "Your bag is waiting"}
        </Heading>
        <Text className="mx-auto mt-5 max-w-md text-base leading-8 text-[#756b61]">
          {isPersian ? "چیزی را که برای خانه‌تان دوست دارید پیدا کنید؛ انتخاب‌های زیبا از همین‌جا شروع می‌شوند." : "Find something beautiful for your home. Thoughtful pieces are waiting to find their place."}
        </Text>
        <LocalizedClientLink href="/store" className="hd-button mt-9">
          {isPersian ? "دیدن محصولات" : "Explore the collection"} <span aria-hidden="true">←</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
