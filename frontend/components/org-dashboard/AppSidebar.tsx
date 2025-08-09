"use client";
import Link from "next/link";

export function AppSidebar() {
  return (
    <nav className="text-sm grid gap-2">
      <div className="text-muted-foreground px-2">Навигация</div>
      <Link href="/org/dashboard" className="hover:underline px-2">Обзор</Link>
      <Link href="/org/dashboard/events" className="hover:underline px-2">События</Link>
      <Link href="/org/dashboard/team" className="hover:underline px-2">Команда</Link>
      <Link href="/org/dashboard/settings" className="hover:underline px-2">Настройки</Link>
    </nav>
  );
}


