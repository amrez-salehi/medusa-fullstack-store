import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const variantTitle = variant?.title
    ?.replace(/Signature/gi, "انتخاب ویژه")
    ?.replace(/Natural/gi, "طبیعی")
    ?.replace(/Ivory/gi, "عاجی")
    ?.replace(/Cream/gi, "کرم")
    ?.replace(/Oak/gi, "بلوط")
  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
    >
      {variantTitle}
    </Text>
  )
}

export default LineItemOptions
