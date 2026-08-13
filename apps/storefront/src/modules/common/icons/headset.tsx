import React from "react"
import { IconProps } from "types/icon"

const Headset: React.FC<IconProps> = ({ size = 24, color = "currentColor", ...attributes }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...attributes}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <path d="M4 13h2.2A1.8 1.8 0 0 1 8 14.8v1.4A1.8 1.8 0 0 1 6.2 18H6a2 2 0 0 1-2-2v-3Zm16 0h-2.2a1.8 1.8 0 0 0-1.8 1.8v1.4a1.8 1.8 0 0 0 1.8 1.8h.2a2 2 0 0 0 2-2v-3Z" stroke={color} strokeWidth="1.7" />
    <path d="M16 19c-.7.7-1.7 1-3 1h-1" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

export default Headset
