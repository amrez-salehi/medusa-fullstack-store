import { Badge } from "@modules/common/components/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">توجه:</span> این بخش فقط برای آزمایش است.
    </Badge>
  )
}

export default PaymentTest
