"use client"

import React, { useEffect, useRef, useState } from "react"

export default function RelatedProductsCarousel({ children }: { children: React.ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)

  const updateControls = () => {
    const element = listRef.current
    if (!element) return
    setPageCount(Math.max(1, Math.ceil(element.scrollWidth / element.clientWidth)))
  }

  useEffect(() => {
    updateControls()
    const element = listRef.current
    if (!element) return
    element.addEventListener("scroll", updateControls, { passive: true })
    const observer = new ResizeObserver(updateControls)
    observer.observe(element)
    return () => {
      element.removeEventListener("scroll", updateControls)
      observer.disconnect()
    }
  }, [])

  const move = (distance: number) => {
    const element = listRef.current
    if (!element) return
    const max = Math.max(0, element.scrollWidth - element.clientWidth)
    const position = Math.abs(element.scrollLeft)
    const targetPage = Math.max(0, Math.min(pageCount - 1, page + (distance > 0 ? 1 : -1)))
    const nextPosition = targetPage === pageCount - 1
      ? max
      : targetPage === 0
        ? 0
        : Math.max(0, Math.min(max, position + (distance > 0 ? 520 : -520)))
    const isRtl = getComputedStyle(element).direction === "rtl"
    element.scrollTo({ left: isRtl ? -nextPosition : nextPosition, behavior: "smooth" })
    setPage(targetPage)
  }

  const canMovePrevious = page > 0
  const canMoveNext = page < pageCount - 1

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => move(canMovePrevious ? -520 : 520)}
        aria-label={canMovePrevious ? "مشاهده کالاهای قبلی" : "مشاهده کالاهای بعدی"}
        className={`${canMoveNext ? "small:flex" : "hidden"} absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full ${canMovePrevious ? "border border-[#e2d8cc] bg-white text-[#625a51] hover:border-[#9a6947] hover:text-[#9a6947]" : "bg-[#bd7a45] text-white hover:bg-[#9a6947]"} text-2xl leading-none shadow-[0_5px_16px_rgba(39,35,31,0.12)] transition`}
      >
        {canMovePrevious ? "‹" : "›"}
      </button>
      <div ref={listRef} className="no-scrollbar overflow-x-auto py-2">
        {children}
      </div>
      <button
        type="button"
        onClick={() => move(canMoveNext ? 520 : -520)}
        aria-label={canMoveNext ? "مشاهده کالاهای بعدی" : "بازگشت به کالاهای قبلی"}
        className={`${canMovePrevious ? "small:flex" : "hidden"} absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full ${canMoveNext ? "bg-[#bd7a45] text-white hover:bg-[#9a6947]" : "border border-[#e2d8cc] bg-white text-[#625a51] hover:border-[#9a6947] hover:text-[#9a6947]"} text-2xl leading-none shadow-[0_5px_16px_rgba(65,48,35,0.16)] transition`}
      >
        {canMoveNext ? "›" : "‹"}
      </button>
    </div>
  )
}
