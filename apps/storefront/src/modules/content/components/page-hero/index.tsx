import Image from "next/image"

type PageHeroProps = {
  eyebrow?: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  compact?: boolean
}

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  compact = false,
}: PageHeroProps) {
  if (!image) {
    return (
      <header className="content-container py-5 small:py-8">
        <div className="grid gap-6 rounded-[14px] border border-[var(--color-border-soft)] bg-[var(--color-light-cream)] px-5 py-8 xsmall:px-7 small:grid-cols-[1.05fr_.95fr] small:items-end small:gap-12 small:px-10 small:py-10 medium:px-12">
          <div>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1
              className={`mt-4 max-w-3xl font-medium leading-[1.45] tracking-[-.035em] text-[var(--color-ink)] ${
                compact
                  ? "text-[29px] small:text-[38px]"
                  : "text-[31px] small:text-[42px]"
              }`}
            >
              {title}
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--color-text-secondary)] small:pb-1 small:text-[15px] small:leading-8">
            {description}
          </p>
        </div>
      </header>
    )
  }

  return (
    <header className="content-container py-5 small:py-8">
      <div className="grid overflow-hidden rounded-[14px] border border-[var(--color-border-soft)] bg-[var(--color-light-cream)] small:grid-cols-[minmax(0,.88fr)_minmax(420px,1.12fr)]">
        <div className="flex flex-col justify-center px-5 py-8 xsmall:px-7 small:px-10 small:py-12 medium:px-14">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-4 max-w-3xl text-[31px] font-medium leading-[1.45] tracking-[-.035em] text-[var(--color-ink)] small:text-[42px]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] small:text-[15px] small:leading-8">
            {description}
          </p>
        </div>
        <div className="relative aspect-[4/3] min-h-[300px] overflow-hidden small:aspect-auto small:min-h-[460px]">
          <Image
            src={image}
            alt={imageAlt || ""}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 56vw"
            className="object-cover"
          />
        </div>
      </div>
    </header>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-accent-dark)]">
      <span className="h-px w-8 bg-[var(--color-accent)]" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
