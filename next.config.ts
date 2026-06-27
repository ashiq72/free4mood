import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "picsum.photos" },
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "res.cloudinary.com" },
  { protocol: "https", hostname: "via.placeholder.com" },
];

try {
  const apiUrl = new URL(
    process.env.NEXT_PUBLIC_API_CORE_URL || "http://localhost:4000/api/v1",
  );
  remotePatterns.push({
    protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
    hostname: apiUrl.hostname,
    port: apiUrl.port,
    pathname: "/uploads/**",
  });
} catch {
  // Environment validation in the API client will provide the actionable error.
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
