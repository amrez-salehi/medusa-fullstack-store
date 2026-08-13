"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useMemo, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle?: string
}

const ImageGallery = ({ images, productTitle = "محصول" }: ImageGalleryProps) => {
  const visibleImages = useMemo(
    () =>
      images
        .filter((image) => Boolean(image.url))
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
    [images]
  )
  const [activeId, setActiveId] = useState<string | number | undefined>(
    visibleImages[0]?.id
  )
  const [broken, setBroken] = useState<Record<string | number, boolean>>({})
  const activeImage = visibleImages.find((image) => image.id === activeId) ?? visibleImages[0]

  if (!visibleImages.length) {
    return (
      <div className="flex aspect-square items-center justify-center bg-[var(--color-surface)] px-6 text-center text-sm text-[var(--color-text-muted)]">
        تصویری برای این محصول ثبت نشده است
      </div>
    )
  }

  const imageFallback = (image: HttpTypes.StoreProductImage) => broken[image.id]

  return (
    <div className={`flex flex-col gap-3 ${visibleImages.length > 1 ? "small:flex-row-reverse small:gap-4" : ""}`}>
      <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[10px] bg-[var(--color-light-cream)]">
        {activeImage && imageFallback(activeImage) ? (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm text-[var(--color-text-muted)]">
            تصویر محصول در دسترس نیست
          </div>
        ) : activeImage ? (
          <Image
            key={activeImage.id}
            src={activeImage.url!}
            alt={productTitle}
            fill
            priority
            sizes="(max-width: 640px) 92vw, 62vw"
            className="object-contain p-2 transition duration-500 small:p-4"
            onError={() => setBroken((current) => ({ ...current, [activeImage.id]: true }))}
          />
        ) : null}
        <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/[0.04]" />
      </div>

      {visibleImages.length > 1 && (
      <div className="order-2 flex shrink-0 gap-2 overflow-x-auto small:order-1 small:w-[84px] small:flex-col small:overflow-visible">
        {visibleImages.map((image, index) => {
          const selected = image.id === activeImage?.id
          return (
            <button
              key={image.id}
              type="button"
              aria-label={`نمایش تصویر ${index + 1}`}
              aria-pressed={selected}
              onClick={() => setActiveId(image.id)}
              className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] small:h-[84px] small:w-[84px] ${
                selected ? "ring-2 ring-[var(--color-accent)] ring-offset-2" : "opacity-75 hover:opacity-100"
              }`}
            >
              {imageFallback(image) ? (
                <span className="flex h-full items-center justify-center px-2 text-[10px] text-[var(--color-text-muted)]">بدون تصویر</span>
              ) : (
                <Image
                  src={image.url!}
                  alt={`${productTitle}، تصویر ${index + 1}`}
                  fill
                  sizes="84px"
                  className="object-contain p-1"
                  onError={() => setBroken((current) => ({ ...current, [image.id]: true }))}
                />
              )}
            </button>
          )
        })}
      </div>
      )}
    </div>
  )
}

export default ImageGallery
