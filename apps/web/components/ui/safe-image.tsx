"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"
import { ImageOff } from "lucide-react"

export function SafeImage({ alt, src, className, ...props }: ImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className || ""}`}>
        <div className="flex flex-col items-center gap-2">
          <ImageOff size={24} className="opacity-50" />
        </div>
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
