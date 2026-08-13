import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import ShieldCheck from "@modules/common/icons/shield-check"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] py-4 small:py-12">
      <div className="content-container">
        <nav className="mb-4 flex items-center gap-1.5 overflow-hidden text-[11px] text-[var(--color-text-muted)] small:mb-7 small:gap-2 small:text-xs" aria-label="مسیر صفحه">
          <LocalizedClientLink href="/" className="shrink-0 transition hover:text-[var(--color-accent-muted)]">خانه</LocalizedClientLink><span>/</span>
          <LocalizedClientLink href="/categories/home-decoration" className="shrink-0 transition hover:text-[var(--color-accent-muted)]">دکوراسیون خانه</LocalizedClientLink><span>/</span>
          <span className="truncate text-[var(--color-text-secondary)]">{product.title}</span>
        </nav>
        <div className="grid grid-cols-1 items-start gap-7 small:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)] small:gap-12" data-testid="product-container">
          <div className="order-1 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-light-cream)] p-2 small:p-4">
            <ImageGallery images={images} productTitle={product.title} />
          </div>
          <div className="order-2 flex flex-col gap-5 small:sticky small:top-40">
            <div className="border-y border-[var(--color-border)] py-5 small:border small:bg-[var(--color-light-cream)] small:p-8">
              <ProductInfo product={product} />
              <div className="my-7"><Suspense fallback={<ProductActions disabled={true} product={product} region={region} />}><ProductActionsWrapper id={product.id} region={region} /></Suspense></div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[var(--color-border)] border border-[var(--color-border)] bg-transparent p-4 text-center">
              <div className="space-y-2 px-2 text-xs text-[var(--color-text-secondary)]"><ShieldCheck size={24} color="var(--color-accent-muted)" className="mx-auto" /><span>ضمانت کیفیت</span><small className="block text-[11px] text-[var(--color-text-muted)]">محصول اورجینال</small></div>
              <div className="space-y-2 px-2 text-xs text-[var(--color-text-secondary)]"><Refresh size={24} color="var(--color-accent-muted)" className="mx-auto" /><span>بازگشت آسان</span><small className="block text-[11px] text-[var(--color-text-muted)]">تا ۷ روز</small></div>
              <div className="space-y-2 px-2 text-xs text-[var(--color-text-secondary)]"><FastDelivery size={24} color="var(--color-accent-muted)" className="mx-auto" /><span>ارسال مطمئن</span><small className="block text-[11px] text-[var(--color-text-muted)]">۲ تا ۴ روز کاری</small></div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-container mt-8 small:mt-14"><ProductTabs product={product} /></div>
      <div
        className="my-12 small:my-20"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </main>
  )
}

export default ProductTemplate
