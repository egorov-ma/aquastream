import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["msw"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
  async headers() {
    return process.env.NEXT_PUBLIC_APP_ENV === "prod"
      ? [
          {
            source: "/(.*)",
            headers: [
              { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "X-Frame-Options", value: "SAMEORIGIN" },
              { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
              {
                key: "Content-Security-Policy",
                value: [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob: https:",
                  "connect-src 'self' https: http://localhost:3000 http://localhost:3100",
                  "frame-ancestors 'self'",
                  "form-action 'self'",
                ].join("; "),
              },
            ],
          },
        ]
      : [];
  },
};

export default withSentryConfig(nextConfig, { silent: true });
