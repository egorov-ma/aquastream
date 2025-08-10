"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRole, isLoggedIn } from "@/shared/client-auth";

export function Header() {
  const role = useRole();
  const loggedIn = isLoggedIn();
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
          {loggedIn ? (
            <>
              <Link href={role === "organizer" || role === "admin" ? "/org/dashboard" : "/dashboard"}>Кабинет</Link>
              {role === "admin" ? <Link href="/admin">Админ</Link> : null}
              <Link href="/api/auth/logout">Выйти</Link>
            </>
          ) : (
            <Link href="/auth/login">Войти</Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}


