import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async redirects() {
    return [
      { source: "/courses", destination: "/teachers", permanent: true },
      { source: "/courses/:slug", destination: "/teachers", permanent: true },
    ];
  },
};

export default nextConfig;
