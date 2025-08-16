import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MswProvider } from "@/components/msw-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaStream",
  description: "AquaStream MVP UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}>
        {/* Preload не нужен для статической главной */}
        {process.env.NEXT_PUBLIC_USE_MOCKS === "true" && process.env.NODE_ENV !== "production" ? (
          <MswProvider />
        ) : null}
        <ThemeProvider>
          <Header />
          <main className="mx-auto flex-1 max-w-6xl p-4">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
