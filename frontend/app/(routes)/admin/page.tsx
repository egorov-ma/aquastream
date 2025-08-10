"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type User = { id: string; name: string; username: string; role: "user" | "organizer" | "admin" };

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const load = React.useCallback(async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (res.ok) setUsers(((await res.json()).items ?? []) as User[]);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const changeRole = async (id: string, role: User["role"]) => {
    await fetch(`/api/admin/users/${id}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    load();
  };

  return (
    <section className="grid gap-4" data-test-id="page-admin-users">
      <h1 className="text-lg font-semibold">Админ — роли пользователей</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Логин</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead className="w-[200px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v: User["role"]) => changeRole(u.id, v)}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Роль" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">user</SelectItem>
                      <SelectItem value="organizer">organizer</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => load()}>Обновить</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}


