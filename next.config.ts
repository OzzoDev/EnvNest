import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["envnest.com"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "envnest.com" }],
        destination: "https://www.envnest.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
