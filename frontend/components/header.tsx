"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, Info, CalendarDays, Users, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
const ThemeToggle = dynamic(() => import("@/components/theme-toggle").then(m => m.ThemeToggle), { ssr: false });
import { useRole, isLoggedIn } from "@/shared/client-auth";
// removed duplicate useRouter import

export function Header() {
  const role = useRole();
  const loggedIn = isLoggedIn();
  const pathname = usePathname();
  const orgMatch = pathname?.match(/^\/org\/([^/]+)(?:$|\/(events|team|for-participants).*?$)?/);
  const orgSlug = orgMatch && orgMatch[1] !== "dashboard" ? orgMatch[1] : null;
  const orgItems = orgSlug
    ? [
        { href: `/org/${orgSlug}`, label: "Инфо", icon: Info, match: (p: string) => p === `/org/${orgSlug}` },
        { href: `/org/${orgSlug}/events`, label: "События", icon: CalendarDays, match: (p: string) => p.startsWith(`/org/${orgSlug}/events`) },
        { href: `/org/${orgSlug}/team`, label: "Команда", icon: Users, match: (p: string) => p.startsWith(`/org/${orgSlug}/team`) },
        { href: `/org/${orgSlug}/for-participants`, label: "FAQ", icon: HelpCircle, match: (p: string) => p.startsWith(`/org/${orgSlug}/for-participants`) },
      ]
    : [];

  return (
    <header className="border-b bg-background/80 supports-[backdrop-filter]:bg-background/60 p-2">
      <div
        className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center h-14 rounded-3xl bg-background ring-1 ring-border shadow-sm px-4 md:px-6"
        data-test-id="header"
      >
        {/* Лево: лого */}
        <Link prefetch={false} href="/" className="shrink-0" aria-label="AquaStream">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background text-xs font-bold [contain:content]">
            AQ
          </span>
        </Link>

        {/* Центр: сабнавигация организатора */}
        {/* Центр: навигация организатора (shadcn/navbar-01 стиль) */}
        <div className="justify-self-center">
          {orgSlug && (
            <>
              <nav className="hidden md:flex items-center gap-2">
                {orgItems.map((item) => {
                  const active = item.match(pathname ?? "");
                  return (
                    <Link
                      prefetch={false}
                      key={item.href}
                      href={item.href}
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <nav className="flex md:hidden items-center gap-1">
                {orgItems.map((item) => {
                  const active = item.match(pathname ?? "");
                  const Icon = item.icon;
                  return (
                    <Link
                      prefetch={false}
                      key={item.href}
                      href={item.href}
                      aria-label={item.label}
                      className={`flex size-8 items-center justify-center rounded-md bg-background transition-colors ${
                        active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Право: auth + тема */}
        <div className="ml-auto flex min-w-0 items-center gap-3 justify-self-end">
          {/* Вход / Кабинет */}
          {loggedIn ? (
            <nav className="flex items-center gap-3 text-sm">
              <Link
                prefetch={false}
                href={role === "organizer" || role === "admin" ? "/org/dashboard" : "/dashboard"}
                className="rounded-md px-3 py-1.5 hover:bg-muted/60"
              >
                Кабинет
              </Link>
              {role === "admin" ? (
                <Link prefetch={false} href="/admin" className="rounded-md px-3 py-1.5 hover:bg-muted/60">
                  Админ
                </Link>
              ) : null}
              <Link prefetch={false} href="/api/auth/logout" className="rounded-md px-3 py-1.5 hover:bg-muted/60">
                Выйти
              </Link>
            </nav>
          ) : (
            <nav className="flex items-center gap-3 text-sm">
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link prefetch={false} href="/auth/login" aria-label="Войти" title="Войти">
                  <UserRound className="h-4 w-4" />
                  <span className="sr-only">Войти</span>
                </Link>
              </Button>
            </nav>
          )}

          {/* Переключатель темы */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}


