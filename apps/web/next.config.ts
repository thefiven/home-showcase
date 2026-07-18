import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise next/image à charger les médias servis par Strapi
    // (dev local : localhost:1337 ; réseau Docker interne : cms:1337).
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "1337" },
      { protocol: "http", hostname: "cms", port: "1337" },
    ],
    // Strapi est toujours joint sur un réseau privé (Docker Compose en dev,
    // ClusterIP k3s en prod — jamais d'accès public direct, cf. CLAUDE.md) :
    // "cms"/"localhost" s'y résolvent en IP privée (172.x/127.x), ce que
    // l'optimiseur d'images de Next 16 bloque par défaut (garde-fou SSRF,
    // pensé pour des `remotePatterns` pointant vers une source non maîtrisée).
    // Ici la source est notre propre CMS interne, listée explicitement
    // ci-dessus — sans ce flag, aucune photo de logement ne s'affiche.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
