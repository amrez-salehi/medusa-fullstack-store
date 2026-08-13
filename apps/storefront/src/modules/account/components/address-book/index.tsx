import React from "react"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  const addresses = customer.addresses || []

  return (
    <div className="w-full">
      {addresses.length === 0 ? (
        <AddAddress region={region} variant="empty" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {addresses.map((address) => (
            <EditAddress region={region} address={address} key={address.id} />
          ))}
          <AddAddress region={region} variant="card" />
        </div>
      )}
    </div>
  )
}

export default AddressBook
