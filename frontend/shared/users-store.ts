export type RbacRole = "user" | "organizer" | "admin";

export type User = {
  id: string;
  name: string;
  username: string;
  role: RbacRole;
};

const users = new Map<string, User>();

function seed() {
  if (users.size > 0) return;
  const seedData: User[] = [
    { id: "u_admin", name: "Администратор", username: "admin", role: "admin" },
    { id: "u_org", name: "Организатор", username: "organizer", role: "organizer" },
    { id: "u_user1", name: "Пользователь 1", username: "user1", role: "user" },
    { id: "u_user2", name: "Пользователь 2", username: "user2", role: "user" },
  ];
  for (const u of seedData) users.set(u.id, u);
}

export function listUsers(): User[] {
  seed();
  return Array.from(users.values());
}

export function getUser(id: string): User | null {
  seed();
  return users.get(id) ?? null;
}

export function setUserRole(id: string, role: RbacRole): User | null {
  seed();
  const current = users.get(id);
  if (!current) return null;
  const next: User = { ...current, role };
  users.set(id, next);
  return next;
}


