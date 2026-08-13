import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import PageHero from "@modules/content/components/page-hero"

export const metadata: Metadata = { title:"پیشنهادهای هارمن", description:"پیشنهادهای محدود و محصولات منتخب هارمن دکور." }
export default async function OffersPage({params}:{params:Promise<{countryCode:string}>}){const {countryCode}=await params;const region=await getRegion(countryCode);if(!region)return null;const {response}=await listProducts({countryCode,queryParams:{limit:12,fields:"*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options"}});return <main><PageHero eyebrow="پیشنهادهای هارمن" title="محصولات منتخب با قیمت ویژه" description="پیشنهادهای این صفحه تا پایان موجودی فعال‌اند و قیمت نهایی هر محصول در همان کارت نمایش داده می‌شود." compact/><section className="content-container pb-20 small:pb-28"><div className="mb-8 flex items-center justify-between border-y border-[var(--color-border)] py-4 text-xs text-[var(--color-muted)]"><span>{response.products.length.toLocaleString("fa-IR")} محصول</span><span>تا پایان موجودی</span></div><ul className="grid grid-cols-2 gap-x-3 gap-y-10 small:grid-cols-4 small:gap-x-5 small:gap-y-14">{response.products.map(product=><li key={product.id}><ProductPreview product={product} region={region}/></li>)}</ul></section></main>}
