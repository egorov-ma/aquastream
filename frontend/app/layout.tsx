import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MswProvider } from "@/components/msw-provider";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fontSerif = Source_Serif_4({
  variable: "--font-serif",
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
      <body className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} min-h-screen bg-background text-foreground antialiased`}>
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
