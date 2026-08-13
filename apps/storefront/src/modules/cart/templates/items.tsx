import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
  locale?: string | null
}

const ItemsTemplate = ({ cart, locale }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div className="flex flex-col gap-4">
      {items
        ? items
            .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
            .map((item) => (
              <Item key={item.id} item={item} currencyCode={cart?.currency_code} locale={locale} />
            ))
        : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
    </div>
  )
}

export default ItemsTemplate
