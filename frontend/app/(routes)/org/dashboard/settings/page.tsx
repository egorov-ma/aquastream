"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <section className="grid gap-4" data-test-id="page-org-settings">
      <h1 className="text-xl font-semibold">Настройки организатора</h1>
      <Tabs defaultValue="brand">
        <TabsList>
          <TabsTrigger value="brand">Brand</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Brand</CardTitle>
              <CardDescription>Логотип и описание бренда. Сохраните изменения или откройте предпросмотр.</CardDescription>
            </CardHeader>
            <CardContent>
              <BrandForm />
            </CardContent>
            <CardFooter className="justify-end">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.open(`/org/your-slug`, "_blank")}>Предпросмотр</Button>
                <Button form="brand-form" type="submit">Сохранить</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>Добавьте участников команды с описанием и фото.</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamEditor />
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" onClick={() => window.open(`/org/your-slug/team`, "_blank")}>Предпросмотр</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>Вопросы и ответы для блока «Для участников».</CardDescription>
            </CardHeader>
            <CardContent>
              <FaqEditor />
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" onClick={() => window.open(`/org/your-slug/for-participants`, "_blank")}>Предпросмотр</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function BrandForm() {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  React.useEffect(() => {
    fetch("/api/organizer/brand").then((r) => r.json()).then((b) => { setName(b.name ?? ""); setDescription(b.description ?? ""); setLogoUrl(b.logoUrl ?? ""); });
  }, []);
  const onSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // эмуляция upload: если выбран файл — сделаем фейковый URL
    const finalLogo = logoFile ? `/uploads/${encodeURIComponent(logoFile.name)}` : logoUrl;
    await fetch("/api/organizer/brand", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, logoUrl: finalLogo }) });
  };
  return (
    <form id="brand-form" onSubmit={onSave} className="grid gap-3 max-w-xl">
      <div className="grid gap-2">
        <Label>Название бренда</Label>
        <Input placeholder="Название бренда" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Описание</Label>
        <Textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Логотип</Label>
        <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
        <div className="text-sm text-muted-foreground">или URL:</div>
        <Input placeholder="Ссылка на логотип" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
      </div>
    </form>
  );
}

function TeamEditor() {
  const [items, setItems] = React.useState<Array<{ id: string; name: string; role: string }>>([]);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [photo, setPhoto] = React.useState<File | null>(null);
  const load = React.useCallback(() => { fetch("/api/organizer/team").then((r) => r.json()).then((d) => setItems(d.items)); }, []);
  React.useEffect(() => { load(); }, [load]);
  const add = async () => { await fetch("/api/organizer/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, role, bio, photo: photo?.name ?? null }) }); setName(""); setRole(""); setBio(""); setPhoto(null); load(); };
  const del = async (id: string) => { await fetch(`/api/organizer/team/${id}`, { method: "DELETE" }); load(); };
  return (
    <div className="grid gap-3 max-w-xl">
      <div className="grid gap-2 md:grid-cols-2">
        <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Роль" value={role} onChange={(e) => setRole(e.target.value)} />
      </div>
      <Textarea placeholder="Описание (опц.)" value={bio} onChange={(e) => setBio(e.target.value)} />
      <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      <div><Button onClick={add} disabled={!name || !role}>Добавить</Button></div>
      <ul className="grid gap-2">
        {items.map((m) => (
          <li key={m.id}>
            <Card>
              <CardContent className="flex items-center justify-between py-3">
                <span>{m.name} — {m.role}</span>
                <Button variant="secondary" size="sm" onClick={() => del(m.id)}>Удалить</Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqEditor() {
  const [items, setItems] = React.useState<Array<{ id: string; question: string; answer: string }>>([]);
  const [q, setQ] = React.useState("");
  const [a, setA] = React.useState("");
  const load = React.useCallback(() => { fetch("/api/organizer/faq").then((r) => r.json()).then((d) => setItems(d.items)); }, []);
  React.useEffect(() => { load(); }, [load]);
  const add = async () => { await fetch("/api/organizer/faq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, answer: a }) }); setQ(""); setA(""); load(); };
  const del = async (id: string) => { await fetch(`/api/organizer/faq/${id}`, { method: "DELETE" }); load(); };
  return (
    <div className="grid gap-3 max-w-2xl">
      <Input placeholder="Вопрос" value={q} onChange={(e) => setQ(e.target.value)} />
      <Textarea placeholder="Ответ" value={a} onChange={(e) => setA(e.target.value)} />
      <div><Button onClick={add} disabled={!q || !a}>Добавить</Button></div>
      <ul className="grid gap-2">
        {items.map((it) => (
          <li key={it.id}>
            <Card>
              <CardContent className="py-3">
                <div className="font-medium">{it.question}</div>
                <div className="text-sm text-muted-foreground">{it.answer}</div>
                <div className="mt-2"><Button variant="secondary" size="sm" onClick={() => del(it.id)}>Удалить</Button></div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}


