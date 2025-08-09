import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["msw"],
  // Не используем кастомный webpack-конфиг в dev с Turbopack, чтобы убрать предупреждение
  // Оставляем поле пустым: Next сам подставит дефолтную функцию
};

export default nextConfig;
