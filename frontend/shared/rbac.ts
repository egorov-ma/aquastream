export type Role = "user" | "organizer" | "admin";

export const ACCESS_RULES: Record<string, Role[]> = {
  "/dashboard": ["user", "organizer", "admin"],
  "/org/dashboard": ["organizer", "admin"],
  "/org/": ["organizer", "admin"],
  "/admin": ["admin"],
  "/admin/": ["admin"],
};

export function isAllowed(pathname: string, role: Role | null): boolean {
  const entries = Object.entries(ACCESS_RULES);
  const match = entries
    .filter(([route]) => pathname === route || pathname.startsWith(route))
    .sort((a, b) => b[0].length - a[0].length)[0];
  if (!match) return true;
  const [, roles] = match;
  return role !== null && roles.includes(role);
}


