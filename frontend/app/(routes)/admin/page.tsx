"use client";

import * as React from "react";

import { Section } from "@/components/ui/section";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

type User = { id: string; name: string; username: string; role: "user" | "organizer" | "admin" };

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Не удалось загрузить пользователей");
      }
      const payload = (await res.json()) as { items?: User[] };
      setUsers(payload.items ?? []);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error(err);
      }
      setUsers([]);
      setError("Не удалось загрузить пользователей");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const changeRole = React.useCallback(
    async (id: string, role: User["role"]) => {
      await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      await load();
    },
    [load],
  );

  return (
    <Section data-test-id="page-admin-users" gap="lg">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Администрирование</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление ролями пользователей</p>
        </div>
      </div>
      <DataTableShell title="Пользователи">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Логин</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead className="w-[200px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableEmpty colSpan={4} className="bg-background/40">
                <LoadingState />
              </TableEmpty>
            ) : error ? (
              <TableEmpty colSpan={4}>
                <ErrorState message={error} onRetry={load} />
              </TableEmpty>
            ) : users.length === 0 ? (
              <TableEmpty colSpan={4}>
                <EmptyState title="Пока нет пользователей" />
              </TableEmpty>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(v: User["role"]) => void changeRole(u.id, v)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="organizer">organizer</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => void load()}>
                      Обновить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </Section>
  );
}
