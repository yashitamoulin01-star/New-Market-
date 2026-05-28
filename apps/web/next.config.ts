import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Ad banner images come from admin-uploaded URLs (unknown domains)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig
