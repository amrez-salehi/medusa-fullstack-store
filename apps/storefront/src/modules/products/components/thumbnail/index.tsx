import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  productTitle?: string
  fit?: "cover" | "contain"
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured: _isFeatured,
  className,
  productTitle = "محصول هارمن دکور",
  fit = "cover",
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <div
      className={clx(
        "relative aspect-[4/5] w-full overflow-hidden rounded-[10px] bg-[var(--color-surface)] shadow-none",
        className,
        {
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder
        image={initialImage}
        size={size}
        productTitle={productTitle}
        fit={fit}
      />
    </div>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  productTitle,
  fit,
}: Pick<ThumbnailProps, "size" | "productTitle" | "fit"> & { image?: string }) => {
  return image ? (
    <Image
        src={image}
        alt={productTitle || "محصول هارمن دکور"}
        className={`absolute inset-0 object-center transition duration-700 ${
          fit === "contain"
            ? "object-contain p-1.5"
            : "object-cover group-hover:scale-[1.025]"
        }`}
        draggable={false}
        quality={76}
        sizes="(max-width: 511px) 72vw, (max-width: 1023px) 40vw, 25vw"
        fill
      />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
