"use client";

import * as React from "react";
import type { Role } from "@/shared/rbac";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getClientRole(): Role | null {
  const val = readCookie("role");
  return val === "user" || val === "organizer" || val === "admin" ? (val as Role) : null;
}

export function useRole(): Role | null {
  const [role, setRole] = React.useState<Role | null>(null);
  React.useEffect(() => {
    setRole(getClientRole());
  }, []);
  return role;
}

export function isLoggedIn(): boolean {
  return readCookie("sid") !== null;
}


