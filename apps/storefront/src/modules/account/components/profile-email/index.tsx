"use client"

import React from "react";

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
// import { updateCustomer } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  return (
    <div className="w-full">
      <AccountInfo
        label="ایمیل"
        currentInfo={`${customer.email}`}
        editable={false}
        clearState={() => undefined}
        data-testid="account-email-editor"
      />
    </div>
  )
}

export default ProfileEmail
