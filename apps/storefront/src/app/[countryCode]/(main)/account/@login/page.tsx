import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "ورود به حساب کاربری | هارمن دکور",
  description: "برای مشاهده سفارش‌ها و ادامه خرید وارد شوید.",
}

export default function Login() {
  return <LoginTemplate />
}
