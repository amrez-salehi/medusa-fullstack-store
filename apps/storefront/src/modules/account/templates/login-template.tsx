"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import BrandLogo from "@modules/common/components/brand-logo"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="relative flex min-h-[640px] w-full flex-col items-center justify-center overflow-hidden bg-[var(--color-background)] px-5 py-12 small:px-10">
      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center">
        <BrandLogo className="mb-8 w-[190px]" imageClassName="max-h-14" />
        <div className="w-full border border-[var(--color-border)] bg-[var(--color-light-cream)] px-5 py-7 small:px-9 small:py-9">
          {currentView === "sign-in" ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
