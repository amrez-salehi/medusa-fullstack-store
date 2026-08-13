import { HttpTypes } from "@medusajs/types"

const copy: Record<string, { title: string; description: string }> = {
  "sculptural-ceramic-lamp": { title: "چراغ سرامیکی فرم‌دار", description: "چراغی با بافت نرم و نور گرم؛ انتخابی آرام برای میز کنار تخت یا گوشه مطالعه." },
  "ribbed-terracotta-vase": { title: "گلدان سفالی شیاردار", description: "گلدانی سفالی با فرم دست‌ساز و بافتی چشم‌نواز برای کنسول، قفسه یا میز غذاخوری." },
  "walnut-round-mirror": { title: "آینه گرد قاب‌چوبی", description: "آینه‌ای ساده با قاب گردوی گرم که به فضا عمق و نور بیشتری می‌دهد." },
  "wool-geometric-area-rug": { title: "گلیم پشمی هندسی", description: "گلیمی دست‌بافت با ترکیب کرم، آجری و زغالی برای فضایی گرم و امروزی." },
  "boucle-accent-chair": { title: "صندلی راحتی بوکله", description: "صندلی‌ای نرم با فرم گرد و پایه‌های چوب بلوط؛ مناسب گوشه‌های دنج خانه." },
  "sculptural-candle-pair": { title: "جفت شمع فرم‌دار", description: "دو شمع عاجی دست‌ساز با فرم معماری؛ زیبا روی سینی، روشن یا خاموش." },
  "abstract-line-art-print": { title: "تابلو خطی انتزاعی", description: "چاپ هنری قاب‌شده با خطوط مشکی و اُخرایی برای تازه‌کردن دیوار گالری خانه." },
  "natural-rattan-basket": { title: "سبد حصیری طبیعی", description: "سبدی جادار و دست‌بافت برای پتو، اسباب‌بازی، لباس یا افزودن بافت طبیعی به خانه." },
  "chunky-knit-throw": { title: "شال مبل بافت درشت", description: "شالی نرم با بافت پنبه‌ای درشت و رنگ جو دوسری برای گرمای بیشتر روی مبل یا تخت." },
  "stoneware-olive-planter": { title: "گلدان سنگی زیتون", description: "گلدانی مات از جنس سنگ‌نما با درختچه زیتون؛ پایانی تازه و آرام برای دکور خانه." },
  "linen-floor-lamp": { title: "آباژور ایستاده کتان", description: "آباژوری بلند با پارچه کتان و پایه برنجی که نوری نرم و آرام در فضا پخش می‌کند." },
  "travertine-coffee-table": { title: "میز جلو مبلی تراورتن", description: "میزی گرد و کوتاه از تراورتن با فرمی مجسمه‌وار برای مرکز نشیمن." },
  "boucle-ottoman": { title: "پاف بوکله", description: "پافی جمع‌وجور با فرم گرد؛ مناسب برای استراحت پا، نشستن یا کامل‌کردن گوشه خانه." },
  "smoked-glass-vase": { title: "گلدان شیشه‌ای دودی", description: "گلدانی دست‌ساز با شیشه دودی و رنگ کهربایی برای میز غذاخوری یا کنسول." },
  "arched-oak-bookshelf": { title: "کتابخانه بلوط قوس‌دار", description: "کتابخانه‌ای از چوب بلوط روشن با بالای قوس‌دار و سه طبقه برای نمایش وسایل محبوب شما." },
  "ceramic-wall-sconce": { title: "چراغ دیواری سرامیکی", description: "چراغی از سرامیک عاجی با فرمی نرم و ارگانیک برای نورپردازی آرام راهرو و دیوار." },
  "woven-cotton-cushion-set": { title: "ست کوسن پنبه‌ای بافت‌دار", description: "دو کوسن بافت‌دار از پنبه در طیف شن و آجری برای افزودن گرما به نشیمن." },
  "green-marble-candle-holder": { title: "جاشمعی مرمر سبز", description: "جاشمعی‌ای از مرمر سبز جنگلی، مناسب چیدمان میز و قفسه‌های دکوراتیو." },
  "jute-woven-pendant": { title: "چراغ آویز جوت بافتنی", description: "چراغ آویزی با فرم گرد و جوت طبیعی که گرما و بافتی دلنشین به سقف می‌دهد." },
  "modern-oak-sideboard": { title: "کنسول بلوط مدرن", description: "کنسولی از بلوط روشن با گوشه‌های گرد، چهار در و پایه‌های ظریف برای فضای غذاخوری." },
}

export function getPersianProductCopy(product: Pick<HttpTypes.StoreProduct, "handle" | "title" | "description">) {
  return copy[product.handle || ""] || {
    title: product.title || "محصول",
    description: product.description || "انتخابی زیبا و کاربردی برای خانه شما.",
  }
}
