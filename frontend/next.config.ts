import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["msw"],
  webpack: (config) => {
    // Turbopack предупреждает про webpack-конфиг — для dev оставляем только instrumentation.ts
    return config;
  },
};

export default nextConfig;
