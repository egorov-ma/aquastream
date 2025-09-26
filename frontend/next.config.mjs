import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      // Хранилище загруженных лого/файлов (S3 совместимое)
      { protocol: "https", hostname: "s3.aquastream.app" },
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
                  "base-uri 'self'",
                  "object-src 'none'",
                  "frame-ancestors 'self'",
                  "form-action 'self'",
                  "img-src 'self' data: blob: https:",
                  "font-src 'self' https: data:",
                  "style-src 'self' 'unsafe-inline'",
                  "script-src 'self'",
                  "connect-src 'self' https: http://localhost:3000 http://localhost:3100",
                ].join("; "),
              },
            ],
          },
        ]
      : [];
  },
};

export default withSentryConfig(nextConfig, { silent: true });
