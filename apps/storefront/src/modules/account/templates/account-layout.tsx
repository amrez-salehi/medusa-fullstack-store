import React from "react"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  isPersian?: boolean
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  isPersian = false,
  children,
}) => {
  return (
    <div
      dir={isPersian ? "rtl" : "ltr"}
      className="flex-1 bg-[var(--color-background)] py-6 small:py-10"
      data-testid="account-page"
    >
      <div
        className={
          customer
            ? "content-container account-layout-grid"
            : "mx-auto w-full max-w-[760px] px-4 small:px-6"
        }
      >
        <main
          className={
            customer
              ? "account-main"
              : "min-w-0 overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-light-cream)]"
          }
          dir={isPersian ? "rtl" : "ltr"}
        >
          {children}
        </main>
        {customer && (
          <aside
            dir={isPersian ? "rtl" : "ltr"}
            className="account-sidebar"
          >
            <AccountNav customer={customer} isPersian={isPersian} />
          </aside>
        )}
      </div>
    </div>
  )
}

export default AccountLayout
