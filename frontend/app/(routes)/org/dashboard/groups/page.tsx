"use client";

import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type Group = { id: string; name: string; capacity: number; memberIds: string[]; type: "crew" | "boat" | "tent" };
type Participant = { id: string; name: string };

export default function GroupsPage() {
  const [eventId, setEventId] = React.useState<string>("ev_demo");
  const [type, setType] = React.useState<"crew" | "boat" | "tent">("crew");
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [newName, setNewName] = React.useState("");
  const [newCapacity, setNewCapacity] = React.useState<number>(4);

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/organizer/events/${eventId}/groups?type=${type}`, { cache: "no-store" });
    if (res.ok) setGroups((await res.json()).items as Group[]);
    const rp = await fetch(`/api/organizer/events/${eventId}/participants`, { cache: "no-store" });
    if (rp.ok) setParticipants((await rp.json()).items as Participant[]);
  }, [eventId, type]);

  React.useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!newName) return;
    await fetch(`/api/organizer/events/${eventId}/groups`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, name: newName, capacity: newCapacity }) });
    setNewName("");
    setNewCapacity(4);
    load();
  };

  return (
    <Section gap="lg" data-test-id="page-organizer-groups">
      <PageHeader>
        <PageHeaderHeading>Группы события</PageHeaderHeading>
        <PageHeaderDescription>Управляйте экипажами, лодками и палатками.</PageHeaderDescription>
      </PageHeader>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="grid gap-2">
          <Label>Событие</Label>
          <Input value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="ID события" />
        </div>
        <div className="grid gap-2">
          <Label>Тип групп</Label>
          <Select value={type} onValueChange={(v: "crew" | "boat" | "tent") => setType(v)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Тип" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="crew">Экипажи</SelectItem>
              <SelectItem value="boat">Лодки</SelectItem>
              <SelectItem value="tent">Палатки</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Название</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Новая группа" />
          </div>
          <div className="grid gap-2">
            <Label>Вместимость</Label>
            <Input type="number" value={newCapacity} onChange={(e) => setNewCapacity(Number(e.target.value || 0))} />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={create} disabled={!newName}>Создать</Button>
          <Button variant="outline" onClick={async () => {
            const res = await fetch(`/api/organizer/events/${eventId}/waitlist/free`, { method: "POST" });
            const data = await res.json().catch(() => ({}));
            toast.success(data?.notifiedUserId ? `Уведомлён: ${data.notifiedUserId}` : "Очередь пуста");
          }}>Освободить место</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <Card key={g.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{g.name}</span>
                <span className="text-sm text-muted-foreground">{g.memberIds.length} / {g.capacity}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MembersTable eventId={eventId} group={g} participants={participants} onChange={load} />
            </CardContent>
            <CardFooter className="justify-end">
              <DangerDeleteButton eventId={eventId} groupId={g.id} onDeleted={load} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function MembersTable({ eventId, group, participants, onChange }: { eventId: string; group: Group; participants: Participant[]; onChange: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const list = participants.filter((p) => !group.memberIds.includes(p.id) && (!search || p.name.toLowerCase().includes(search.toLowerCase())));
  const assigned = participants.filter((p) => group.memberIds.includes(p.id));

  const assign = async (participantId: string) => {
    const res = await fetch(`/api/organizer/events/${eventId}/groups/${group.id}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participantId }) });
    if (res.status === 409) {
      toast.error("Вместимость превышена");
      return;
    }
    onChange();
  };
  const unassign = async (participantId: string) => {
    await fetch(`/api/organizer/events/${eventId}/groups/${group.id}/unassign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participantId }) });
    onChange();
  };

  return (
    <div className="grid gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Участник</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assigned.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="secondary" onClick={() => unassign(p.id)}>Убрать</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex justify-end">
          <DialogTrigger asChild>
            <Button variant="outline">Назначить</Button>
          </DialogTrigger>
        </div>
        <DialogContent>
          <DialogHeader><DialogTitle>Назначить участника</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Поиск" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="max-h-64 overflow-auto border rounded-md">
              <Table>
                <TableBody>
                  {list.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => assign(p.id)}>
                      <TableCell>{p.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="secondary">Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DangerDeleteButton({ eventId, groupId, onDeleted }: { eventId: string; groupId: string; onDeleted: () => void }) {
  const remove = async () => {
    await fetch(`/api/organizer/events/${eventId}/groups/${groupId}`, { method: "DELETE" });
    onDeleted();
  };
  return <Button variant="destructive" onClick={remove}>Удалить группу</Button>;
}
