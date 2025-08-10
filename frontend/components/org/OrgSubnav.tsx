"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function OrgSubnav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/org/${slug}`;
  const items = [
    { href: base, label: "Инфо" },
    { href: `${base}/events`, label: "События" },
    { href: `${base}/team`, label: "Команда" },
    { href: `${base}/for-participants`, label: "FAQ" },
  ];
  return (
    <div data-test-id="org-subnav" className="flex items-center justify-between">
      <nav className="hidden gap-4 sm:flex px-2">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-11 px-4">Меню</Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col gap-4 mt-6">
              {items.map((it) => (
                <Link key={it.href} href={it.href} className="text-base" prefetch>
                  {it.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}


