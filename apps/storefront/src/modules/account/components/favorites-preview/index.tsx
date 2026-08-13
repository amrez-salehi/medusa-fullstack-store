"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FavoriteButton from "@modules/favorites/components/favorite-button"
import { useFavorites } from "@modules/favorites/context/favorites-context"
import Thumbnail from "@modules/products/components/thumbnail"

export default function AccountFavoritesPreview({ isPersian = false }: { isPersian?: boolean }) {
  const { favorites, isLoading, error, refresh } = useFavorites()
  const numberLocale = isPersian ? "fa-IR" : "en-US"

  return (
    <section className="account-panel account-favorites-panel" aria-labelledby="account-favorites-title">
      <header className="account-panel-head">
        <div>
          <p>{isPersian ? "انتخاب‌های ذخیره‌شده" : "Saved selection"}</p>
          <h2 id="account-favorites-title">{isPersian ? "علاقه‌مندی‌های شما" : "Your favorites"}</h2>
        </div>
        <div className="account-panel-head-action">
          {!isLoading && !error && (
            <span>{favorites.length.toLocaleString(numberLocale)} {isPersian ? "محصول" : "products"}</span>
          )}
          <LocalizedClientLink href="/favorites">
            {isPersian ? "مشاهده همه" : "View all"}
          </LocalizedClientLink>
        </div>
      </header>

      {isLoading ? (
        <div className="account-favorite-grid" aria-label={isPersian ? "در حال بارگذاری علاقه‌مندی‌ها" : "Loading favorites"} aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="account-favorite-skeleton" key={index}>
              <span />
              <i />
              <b />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="account-favorites-state" role="alert">
          <strong>{isPersian ? "علاقه‌مندی‌ها بارگذاری نشد" : "Favorites could not be loaded"}</strong>
          <button type="button" onClick={() => void refresh()}>{isPersian ? "تلاش دوباره" : "Try again"}</button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="account-favorites-empty">
          <span className="account-favorites-empty-icon"><HeartIcon /></span>
          <div>
            <strong>{isPersian ? "هنوز محصولی ذخیره نکرده‌اید" : "No saved products yet"}</strong>
            <p>{isPersian ? "با انتخاب قلب کنار محصولات، انتخاب‌های محبوبتان اینجا نمایش داده می‌شوند." : "Save products with the heart button to see them here."}</p>
          </div>
          <LocalizedClientLink href="/store">{isPersian ? "دیدن محصولات" : "Browse products"}</LocalizedClientLink>
        </div>
      ) : (
        <div className="account-favorite-grid" aria-label={isPersian ? "محصولات مورد علاقه" : "Favorite products"}>
          {favorites.slice(0, 4).map(({ product, product_id }) => {
            const { cheapestPrice } = getProductPrice({ product })

            return (
              <article className="account-favorite-card" key={product_id}>
                <div className="account-favorite-media">
                  <LocalizedClientLink href={`/products/${product.handle}`}>
                    <Thumbnail
                      thumbnail={product.thumbnail}
                      images={product.images}
                      size="full"
                      productTitle={product.title}
                    />
                  </LocalizedClientLink>
                  <FavoriteButton product={product} className="absolute left-2 top-2" />
                </div>
                <LocalizedClientLink href={`/products/${product.handle}`} className="account-favorite-title">
                  {product.title}
                </LocalizedClientLink>
                <span className="account-favorite-price">
                  {cheapestPrice?.calculated_price || (isPersian ? "مشاهده قیمت" : "View price")}
                </span>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  )
}
