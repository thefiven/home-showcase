import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise next/image à charger les médias servis par Strapi
    // (dev local : localhost:1337 ; réseau Docker interne : cms:1337).
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "1337" },
      { protocol: "http", hostname: "cms", port: "1337" },
    ],
  },
};

export default nextConfig;
