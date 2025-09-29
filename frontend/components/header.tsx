"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { CalendarDays, HelpCircle, Info, UserRound, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Toolbar, ToolbarGroup, ToolbarSpacer } from "@/components/ui/toolbar";
import { useRole, isLoggedIn } from "@/shared/client-auth";

const ThemeToggle = dynamic(() => import("@/components/theme-toggle").then((m) => m.ThemeToggle), {
  ssr: false,
});

export function Header() {
  const role = useRole();
  const loggedIn = isLoggedIn();
  const pathname = usePathname();

  const orgMatch = pathname?.match(/^\/org\/([^/]+)(?:$|\/(events|team|for-participants).*?$)?/);
  const orgSlug = orgMatch && orgMatch[1] !== "dashboard" ? orgMatch[1] : null;
  const orgItems = orgSlug
    ? [
        { href: `/org/${orgSlug}`, label: "Инфо", icon: Info, match: (p: string) => p === `/org/${orgSlug}` },
        {
          href: `/org/${orgSlug}/events`,
          label: "События",
          icon: CalendarDays,
          match: (p: string) => p.startsWith(`/org/${orgSlug}/events`),
        },
        {
          href: `/org/${orgSlug}/team`,
          label: "Команда",
          icon: Users,
          match: (p: string) => p.startsWith(`/org/${orgSlug}/team`),
        },
        {
          href: `/org/${orgSlug}/for-participants`,
          label: "FAQ",
          icon: HelpCircle,
          match: (p: string) => p.startsWith(`/org/${orgSlug}/for-participants`),
        },
      ]
    : [];

  return (
    <header className="border-b bg-background/80 supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-2 py-2 md:px-4">
        <div
          data-test-id="header"
          className="rounded-3xl bg-background px-4 py-2 shadow-sm ring-1 ring-border md:px-6"
        >
          <Toolbar
            border={false}
            justify="start"
            className="w-full flex-wrap gap-3 px-0 py-0 md:flex-nowrap"
          >
            <ToolbarGroup className="gap-3">
              <Link
                prefetch={false}
                href="/"
                aria-label="AquaStream"
                className="inline-grid h-10 w-10 place-items-center rounded-xl bg-foreground text-xs font-bold text-background"
              >
                AQ
              </Link>
            </ToolbarGroup>

            {orgItems.length ? (
              <>
                <ToolbarGroup className="hidden flex-1 justify-center md:flex">
                  <NavigationMenu className="max-w-none">
                    <NavigationMenuList className="gap-1">
                      {orgItems.map((item) => {
                        const active = item.match(pathname ?? "");
                        return (
                          <NavigationMenuItem key={item.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                prefetch={false}
                                href={item.href}
                                data-active={active ? "true" : undefined}
                              >
                                {item.label}
                              </Link>
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        );
                      })}
                    </NavigationMenuList>
                  </NavigationMenu>
                </ToolbarGroup>

                <ToolbarGroup className="flex w-full items-center gap-2 md:hidden">
                  {orgItems.map((item) => {
                    const active = item.match(pathname ?? "");
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.href}
                        asChild
                        variant={active ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9"
                      >
                        <Link prefetch={false} href={item.href} aria-label={item.label}>
                          <Icon className="h-4 w-4" />
                        </Link>
                      </Button>
                    );
                  })}
                </ToolbarGroup>
              </>
            ) : null}

            <ToolbarSpacer className="hidden md:block" />

            <ToolbarGroup className="ml-auto items-center gap-3">
              {loggedIn ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link
                      prefetch={false}
                      href={role === "organizer" || role === "admin" ? "/org/dashboard" : "/dashboard"}
                    >
                      Кабинет
                    </Link>
                  </Button>
                  {role === "admin" ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link prefetch={false} href="/admin">
                        Админ
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="ghost" size="sm">
                    <Link prefetch={false} href="/api/auth/logout">
                      Выйти
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                  <Link prefetch={false} href="/auth/login" aria-label="Войти" title="Войти">
                    <UserRound className="h-4 w-4" />
                    <span className="sr-only">Войти</span>
                  </Link>
                </Button>
              )}

              <ThemeToggle />
            </ToolbarGroup>
          </Toolbar>
        </div>
      </div>
    </header>
  );
}

