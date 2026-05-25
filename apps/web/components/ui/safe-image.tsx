"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"

interface SafeImageProps extends ImageProps {
  hideOnError?: boolean
}

export function SafeImage({ alt, src, className, hideOnError = false, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    if (hideOnError) return null
    return (
      <div className={`flex items-center justify-center bg-muted/50 ${className || ""}`} />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}
