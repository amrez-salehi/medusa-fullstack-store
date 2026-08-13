"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"
import { getPersianCategoryName } from "@lib/i18n/category-copy"
import BrandLogo from "@modules/common/components/brand-logo"


type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  categories: HttpTypes.StoreProductCategory[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, categories, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const isPersian = currentLocale?.toLowerCase().startsWith("fa")
  const copy = isPersian
    ? {
        menu: "دسته‌بندی کالاها",
        close: "بستن منو",
        eyebrow: "هارمن دکور / خانه‌ای که شما را بازتاب می‌دهد",
        title: "فضای خود را بسازید",
        shop: "خرید همه محصولات",
        decor: "دکوراسیون خانه",
        edit: "منتخب فصل",
        account: "حساب کاربری",
        cart: "سبد خرید",
        language: "زبان",
        country: "کشور",
        footer: "© هارمن دکور. همه حقوق محفوظ است.",
      }
    : {
        menu: "Categories",
        close: "Close menu",
        eyebrow: "HARMENDECOR / For beautiful living",
        title: "Shape your space",
        shop: "Shop all pieces",
        decor: "Home decoration",
        edit: "The seasonal edit",
        account: "Account",
        cart: "Cart",
        language: "Language",
        country: "Country",
        footer: "© HARMENDECOR. All rights reserved.",
      }

  const menuItems = [
    { name: copy.shop, href: "/store", featured: true },
    { name: copy.decor, href: "/categories/home-decoration" },
    ...(categories || []).slice(0, 6).filter((category) => category.handle !== "home-decoration").map((category) => ({ name: isPersian ? getPersianCategoryName(category.handle, category.name) : category.name, href: `/categories/${category.handle}` })),
    { name: copy.edit, href: "/store" },
    { name: copy.account, href: "/account" },
    { name: copy.cart, href: "/cart" },
  ]

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"
                  >
                  <span className="flex items-center gap-2">
                    <span className="flex flex-col gap-1" aria-hidden="true">
                      <span className="h-px w-4 bg-current" />
                      <span className="h-px w-2 bg-current" />
                    </span>
                    {copy.menu}
                  </span>
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/0 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className={clx(
                  "flex flex-col fixed top-[86px] w-full h-[calc(100vh-102px)] z-[51] text-sm text-white m-0 backdrop-blur-2xl sm:w-[460px]",
                  isPersian ? "right-0 left-auto" : "left-0"
                )}>
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full justify-between rounded-b-2xl bg-[#27231f]/[.98] p-7 shadow-2xl backdrop-blur-xl small:p-10"
                  >
                    <div className="flex items-start justify-between" id="xmark">
                      <div>
                        <BrandLogo className="mb-6 w-[180px]" imageClassName="max-h-12" />
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#d2ad8c]">
                          {copy.eyebrow}
                        </p>
                        <p className="mt-3 font-serif text-3xl italic tracking-[-0.04em]">
                          {copy.title}
                        </p>
                      </div>
                      <button
                        aria-label={copy.close}
                        data-testid="close-menu-button"
                        onClick={close}
                        className="rounded-full border border-white/20 p-2 transition-colors hover:bg-white/10"
                      >
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col items-start justify-start gap-5">
                      {menuItems.map(({ name, href, featured }) => {
                        return (
                          <li key={name} className="group">
                            <LocalizedClientLink
                              href={href}
                              className={clx(
                                "flex items-center gap-3 leading-tight transition-colors hover:text-[#d2ad8c]",
                                featured ? "text-4xl font-light" : "text-2xl text-white/75"
                              )}
                              onClick={close}
                              data-testid={`${name.toLowerCase().replaceAll(" ", "-")}-link`}
                            >
                              {name}
                              <span className="text-lg opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">↗</span>
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                            label={copy.language}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                        <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                            label={copy.country}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small text-white/45">
                        {copy.footer}
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
