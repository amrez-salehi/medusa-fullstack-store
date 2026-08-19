"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import AdminShell from "@modules/admin/components/admin-shell"
import AdminIcon from "@modules/admin/components/admin-icon"
import { adminSdk, AdminProduct, toman } from "@modules/admin/lib/sdk"

type ProductForm = { title: string; handle: string; description: string; price: string; inventory: string; image: string; images: string[]; status: "published" | "draft" }
const empty: ProductForm = { title: "", handle: "", description: "", price: "", inventory: "", image: "", images: [], status: "published" }
const PAGE_SIZE = 10

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const pageSize = 100
      const allProducts: AdminProduct[] = []
      let offset = 0
      let total = 0

      do {
        const data = await adminSdk.admin.product.list({
          limit: pageSize,
          offset,
          fields: "+variants,+variants.prices,+variants.inventory_items,+images",
        })
        const page = (data.products || []) as AdminProduct[]
        allProducts.push(...page)
        total = data.count || allProducts.length
        offset += page.length

        if (!page.length || offset >= total) break
      } while (offset < total)

      setProducts(allProducts)
      setCount(total)
      setError("")
    } catch {
      setError("دریافت محصولات انجام نشد. اتصال API را بررسی کنید.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])
  const filtered = useMemo(() => products.filter((p) => `${p.title} ${p.handle || ""}`.toLowerCase().includes(search.toLowerCase())), [products, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])
  useEffect(() => { setPage(1) }, [search])
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [page, totalPages])
  const update = (key: keyof ProductForm, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const openCreate = () => { setEditingId(null); setForm(empty); setMessage(""); setOpen(true) }
  const openEdit = (product: AdminProduct) => {
    const variant = product.variants?.[0]
    const images = Array.from(new Set([...(product.images || []).map((image) => image.url), product.thumbnail].filter((image): image is string => Boolean(image))))
    setEditingId(product.id)
    setForm({ title: product.title || "", handle: product.handle || "", description: product.description || "", price: String(variant?.prices?.[0]?.amount || ""), inventory: String(variant?.inventory_quantity || 0), image: images[0] || "", images, status: product.status === "draft" ? "draft" : "published" })
    setMessage(""); setOpen(true)
  }

  const uploadImages = async (files?: FileList | null) => {
    if (!files?.length) return
    const selected = Array.from(files)
    if (selected.some((file) => !file.type.startsWith("image/"))) return setMessage("لطفاً فقط فایل تصویری انتخاب کنید.")
    if (selected.some((file) => file.size > 10 * 1024 * 1024)) return setMessage("حجم هر تصویر باید کمتر از ۱۰ مگابایت باشد.")
    setUploading(true); setMessage("")
    try {
      const uploaded = await Promise.all(selected.map(async (file) => {
        const response = await adminSdk.admin.upload.create({ files: [file] })
        const url = response.files?.[0]?.url
        if (!url) throw new Error("آدرس تصویر از سرور دریافت نشد.")
        return url
      }))
      setForm((current) => { const images = Array.from(new Set([...current.images, ...uploaded])); return { ...current, images, image: current.image || images[0] || "" } })
      setMessage(`${uploaded.length.toLocaleString("fa-IR")} تصویر با موفقیت بارگذاری شد.`)
    } catch (e) { setMessage(e instanceof Error ? e.message : "بارگذاری تصویر انجام نشد.") } finally { setUploading(false) }
  }

  const removeImage = (url: string) => setForm((current) => { const images = current.images.filter((image) => image !== url); return { ...current, images, image: images[0] || "" } })

  const requestDelete = (product: AdminProduct) => {
    setDeleteError("")
    setDeleteTarget(product)
  }

  const deleteProduct = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setDeleteError("")
    try {
      await adminSdk.admin.product.delete(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "حذف محصول انجام نشد.")
    } finally {
      setDeleting(false)
    }
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    setMessage("")
    if (!form.title || !form.price || !form.inventory) return setMessage("عنوان، قیمت و موجودی الزامی هستند.")
    setSaving(true)
    try {
      if (editingId) {
        const product = products.find((item) => item.id === editingId)
        const variant = product?.variants?.[0]
        await adminSdk.admin.product.update(editingId, { title: form.title, handle: form.handle || undefined, description: form.description || undefined, status: form.status, ...(form.images.length ? { thumbnail: form.images[0], images: form.images.map((url) => ({ url })) } : {}) })
        if (variant?.id) await adminSdk.admin.product.updateVariant(editingId, variant.id, { prices: [{ id: variant.prices?.[0]?.id, amount: Number(form.price), currency_code: variant.prices?.[0]?.currency_code || "irr" }] })
        const inventoryItemId = variant?.inventory_items?.[0]?.inventory_item_id || variant?.inventory_items?.[0]?.inventory_item?.id
        if (inventoryItemId) { const locations = await adminSdk.admin.stockLocation.list({ limit: 1, offset: 0 }); const locationId = locations.stock_locations?.[0]?.id; if (locationId) await adminSdk.admin.inventoryItem.updateLevel(inventoryItemId, locationId, { stocked_quantity: Number(form.inventory) || 0 }) }
        setMessage("محصول با موفقیت ویرایش شد.")
      } else {
        const sku = form.handle ? `HARMEN-${form.handle.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}` : `HARMEN-${Date.now()}`
        const locations = await adminSdk.admin.stockLocation.list({ limit: 1, offset: 0 })
        const locationId = locations.stock_locations?.[0]?.id
        if (!locationId) throw new Error("برای ثبت محصول، محل انبار بسازید.")
        const inventory = await adminSdk.admin.inventoryItem.create({ sku, title: form.title, requires_shipping: true, location_levels: [{ location_id: locationId, stocked_quantity: Number(form.inventory) || 0 }] })
        try { await adminSdk.admin.product.create({ title: form.title, handle: form.handle || undefined, description: form.description || undefined, status: form.status, images: form.images.length ? form.images.map((url) => ({ url })) : undefined, options: [{ title: "مدل", values: ["پایه"] }], variants: [{ title: "مدل پایه", sku, manage_inventory: true, inventory_items: [{ inventory_item_id: inventory.inventory_item.id, required_quantity: 1 }], prices: [{ amount: Number(form.price), currency_code: "irr" }] }] }) } catch (e) { await adminSdk.admin.inventoryItem.delete(inventory.inventory_item.id).catch(() => undefined); throw e }
        setMessage("محصول با موفقیت ثبت شد.")
      }
      setOpen(false); setForm(empty); load()
    } catch (e) { setMessage(e instanceof Error ? e.message : "ذخیره محصول انجام نشد.") } finally { setSaving(false) }
  }

  return <AdminShell title="محصولات" description="مدیریت محصولات، قیمت‌ها و موجودی در یک فضای ساده.">
    <div className="admin-toolbar admin-products-toolbar"><button className="admin-btn admin-btn-primary admin-add-product" onClick={openCreate}><span aria-hidden="true">+</span> افزودن محصول</button><label className="admin-search-wrap"><AdminIcon name="search" size={19} /><input className="admin-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جست‌وجوی محصول یا شناسه…" /></label><div className="admin-product-count"><strong>{count.toLocaleString("fa-IR")}</strong><span>محصول</span></div></div>
    <section className="admin-card">
      <div className="admin-section-head"><div><h2 className="admin-section-title">فهرست محصولات</h2><p className="admin-section-note">نمایش ۱۰ محصول در هر صفحه؛ داده‌ها مستقیماً از Medusa خوانده می‌شوند.</p></div><button className="admin-btn admin-btn-light" onClick={load}>به‌روزرسانی</button></div>
      {loading ? <div className="admin-loading">در حال دریافت محصولات…</div> : error ? <div className="admin-error">{error}</div> : filtered.length === 0 ? <div className="admin-empty">محصولی مطابق جست‌وجو پیدا نشد.</div> : <>
        <div className="admin-table-wrap"><table className="admin-table admin-products-table"><thead><tr><th>محصول</th><th>شناسه</th><th>قیمت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{paginated.map((product) => { const price = product.variants?.[0]?.prices?.[0]?.amount || 0; return <tr key={product.id}><td data-label="محصول"><div className="admin-product">{product.thumbnail ? <Image className="admin-thumb" src={product.thumbnail} alt="" width={48} height={48} sizes="48px" /> : <div className="admin-thumb" />}<strong>{product.title}</strong></div></td><td data-label="شناسه" className="admin-muted" dir="ltr">{product.handle || "—"}</td><td data-label="قیمت">{toman(price)}</td><td data-label="وضعیت"><span className={`admin-status ${product.status !== "published" ? "off" : ""}`}>{product.status === "published" ? "منتشر شده" : "پیش‌نویس"}</span></td><td data-label="عملیات"><div className="admin-row-actions"><button className="admin-btn admin-btn-light admin-btn-small" onClick={() => openEdit(product)}>ویرایش</button><button className="admin-btn admin-btn-delete admin-btn-small" onClick={() => requestDelete(product)}>حذف</button></div></td></tr> })}</tbody></table></div>
        <div className="admin-pagination"><span>نمایش {((page - 1) * PAGE_SIZE + 1).toLocaleString("fa-IR")} تا {Math.min(page * PAGE_SIZE, filtered.length).toLocaleString("fa-IR")} از {filtered.length.toLocaleString("fa-IR")}</span><div><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>قبلی</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={number === page ? "active" : ""} aria-current={number === page ? "page" : undefined} onClick={() => setPage(number)}>{number.toLocaleString("fa-IR")}</button>)}<button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>بعدی</button></div></div>
      </>}
    </section>
    {open && <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}><div className="admin-modal admin-product-modal"><div className="admin-modal-head"><div><span className="admin-modal-eyebrow">HARMENDECOR / کاتالوگ</span><h2 className="admin-section-title">{editingId ? "ویرایش محصول" : "افزودن محصول جدید"}</h2><p className="admin-section-note">اطلاعات محصول، قیمت و موجودی را مدیریت کنید.</p></div><button className="admin-close" onClick={() => setOpen(false)} aria-label="بستن">×</button></div><form className="admin-product-form" onSubmit={save}><div className="admin-form-grid"><div className="admin-field"><label>عنوان محصول <em>*</em></label><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="مثلاً گلدان سنگی زیتون" /></div><div className="admin-field"><label>شناسه انگلیسی</label><input dir="ltr" value={form.handle} onChange={(e) => update("handle", e.target.value)} placeholder="stoneware-olive-planter" /></div><div className="admin-field admin-form-full"><label>توضیحات</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="توضیح کوتاه و فارسی محصول" /></div><div className="admin-field"><label>قیمت (تومان) <em>*</em></label><input dir="ltr" type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} /></div><div className="admin-field"><label>موجودی <em>*</em></label><input dir="ltr" type="number" min="0" value={form.inventory} onChange={(e) => update("inventory", e.target.value)} /></div><div className="admin-field"><label>وضعیت</label><select value={form.status} onChange={(e) => update("status", e.target.value as ProductForm["status"])}><option value="published">منتشر شده</option><option value="draft">پیش‌نویس</option></select></div><div className="admin-field admin-form-full"><label htmlFor="product-image-file">تصاویر محصول</label><div className="admin-upload-box"><input id="product-image-file" type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => uploadImages(e.target.files)} disabled={uploading} /><span>{uploading ? "در حال بارگذاری تصاویر…" : "انتخاب چند تصویر از سیستم"}</span></div><small className="admin-muted">چند تصویر را هم‌زمان انتخاب کنید · PNG، JPG، WEBP یا AVIF · حداکثر ۱۰ مگابایت برای هر تصویر</small>{form.images.length > 0 && <div className="admin-upload-gallery">{form.images.map((url, index) => <div className="admin-gallery-item" key={url}><Image src={url} alt={`تصویر محصول ${index + 1}`} width={160} height={160} sizes="160px" /><button type="button" onClick={() => removeImage(url)} aria-label="حذف تصویر">×</button>{index === 0 && <span>اصلی</span>}</div>)}</div>}</div></div>{message && <div className={message.includes("موفقیت") ? "admin-success" : "admin-error"}>{message}</div>}<div className="admin-form-footer"><button type="button" className="admin-btn admin-btn-light" onClick={() => setOpen(false)}>انصراف</button><button className="admin-btn admin-btn-primary" disabled={saving || uploading}>{uploading ? "در حال بارگذاری تصویر…" : saving ? "در حال ذخیره…" : editingId ? "ذخیره تغییرات" : "ثبت محصول"}</button></div></form></div></div>}
    {deleteTarget && <div className="admin-modal-backdrop" onMouseDown={(e) => !deleting && e.target === e.currentTarget && setDeleteTarget(null)}><div className="admin-modal admin-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title"><div className="admin-confirm-icon"><AdminIcon name="trash" size={25} /></div><h2 id="delete-product-title">حذف محصول</h2><p>آیا از حذف دائمی <strong>«{deleteTarget.title}»</strong> از فروشگاه مطمئن هستید؟ این عملیات قابل بازگشت نیست.</p>{deleteError && <div className="admin-error">{deleteError}</div>}<div className="admin-confirm-actions"><button className="admin-btn admin-btn-light" disabled={deleting} onClick={() => setDeleteTarget(null)}>انصراف</button><button className="admin-btn admin-btn-danger-solid" disabled={deleting} onClick={deleteProduct}>{deleting ? "در حال حذف…" : "بله، حذف شود"}</button></div></div></div>}
  </AdminShell>
}
