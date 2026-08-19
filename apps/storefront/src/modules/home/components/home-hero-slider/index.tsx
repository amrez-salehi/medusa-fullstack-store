"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const slides = [
  {
    image: "/images/harmendecor/hero-living-room.webp",
    alt: "نشیمن معاصر هارمن دکور با مبلمان بوکله و میز تراورتن",
    position: "object-[42%_center] small:object-center",
  },
  {
    image: "/images/home-decor/armes-home-hero-dining.png",
    alt: "فضای غذاخوری مینیمال هارمن دکور",
    position: "object-center",
  },
  {
    image: "/images/home-decor/armes-home-hero-reading.png",
    alt: "گوشه مطالعه آرام با صندلی بوکله",
    position: "object-[38%_center] small:object-center",
  },
]

export default function HomeHeroSlider() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 5500)

    return () => window.clearInterval(interval)
  }, [paused])

  return (
    <div
      className="home-minimal-hero"
      aria-roledescription="carousel"
      aria-label="تصاویر منتخب هارمن دکور"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="home-minimal-visual">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`home-minimal-slide ${index === active ? "is-active" : ""}`}
            aria-hidden={index !== active}
          >
            <Image
              src={slide.image}
              alt={index === active ? slide.alt : ""}
              fill
              priority={index === 0}
              sizes="(max-width: 1023px) 100vw, 94vw"
              className={`object-cover ${slide.position}`}
            />
          </div>
        ))}

      </div>

      <div className="home-minimal-signature">
        <LocalizedClientLink href="/store" className="home-minimal-action">
          مشاهده مجموعه
        </LocalizedClientLink>
        <h1 id="home-hero-title" className="home-minimal-brand" aria-label="Harmen Decor">
          <Image src="/brand/harmendecor-mark.png" alt="" width={48} height={48} />
          <span>
            <strong>HARMEN</strong>
            <small>DECOR</small>
          </span>
        </h1>
        <div className="home-minimal-dots" role="tablist" aria-label="انتخاب تصویر">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              className={index === active ? "is-active" : ""}
              onClick={() => setActive(index)}
              role="tab"
              aria-selected={index === active}
              aria-label={`نمایش تصویر ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
