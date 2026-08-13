import React from "react"
import { IconProps } from "types/icon"

const ShieldCheck: React.FC<IconProps> = ({ size = 24, color = "currentColor", ...attributes }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...attributes}>
    <path d="M12 3.5 19 6v5.2c0 4.3-2.8 7.9-7 9.3-4.2-1.4-7-5-7-9.3V6l7-2.5Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    <path d="m8.8 12 2.1 2.1 4.4-4.4" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default ShieldCheck
