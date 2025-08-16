"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <Input
      placeholder="Поиск по имени... (нажмите /)"
      defaultValue={defaultValue}
      onChange={(e) => {
        const q = e.target.value;
        const next = new URLSearchParams(params.toString());
        if (q) next.set("q", q); else next.delete("q");
        next.set("page", "1");
        router.replace(`/?${next.toString()}`);
      }}
      data-test-id="search-input"
    />
  );
}


