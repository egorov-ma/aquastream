import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["msw"],
  },
  webpack: (config) => {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      config.entry = async () => {
        const entries = typeof config.entry === "function" ? await config.entry() : config.entry;
        if (entries && typeof entries === "object" && !Array.isArray(entries)) {
          if (!Array.isArray(entries.main)) entries.main = [entries.main as string];
          if (!(entries.main as string[]).includes("./server.msw.ts")) {
            (entries.main as string[]).unshift("./server.msw.ts");
          }
        }
        return entries;
      };
    }
    return config;
  },
};

export default nextConfig;
