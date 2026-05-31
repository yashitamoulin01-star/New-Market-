"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"
import { ImageIcon } from "lucide-react"

interface SafeImageProps extends ImageProps {
  hideOnError?: boolean
}

export function SafeImage({ alt, src, className, hideOnError = false, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    if (hideOnError) return null
    return (
      <div className={`flex items-center justify-center bg-muted/40 ${className || ""}`}>
        <ImageIcon size={20} className="text-muted-foreground/30" />
      </div>
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
