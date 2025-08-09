"use client";
import * as React from "react";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Панель организатора</h1>
      <div className="text-sm text-muted-foreground">Сегодня: {new Date().toLocaleDateString()}</div>
    </header>
  );
}


