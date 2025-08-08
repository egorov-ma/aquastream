import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
        data-test-id="header"
      >
        <Link href="/" className="font-semibold">
          AquaStream
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard">Кабинет</Link>
          <Link href="/auth/login">Войти</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}


