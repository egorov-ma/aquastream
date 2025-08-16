"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditorJs, EditorPreview } from "@/components/ui/editorjs";
import { InfoIcon, UsersIcon, MapPinIcon, CalendarIcon, ImageIcon, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
  shortDescription: z.string().min(3, "Минимум 3 символа"),
  dateStart: z.string().min(1, "Укажите дату начала"),
  dateEnd: z.string().optional(),
  location: z.string().optional(),
  price: z.number().min(0),
  capacity: z.number().min(1),
  longDescription: z.any().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewEventPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", shortDescription: "", dateStart: "", dateEnd: "", location: "", price: 0, capacity: 10, longDescription: undefined },
  });

  // Дополнительно к форме (MVP): тип события, площадка, теги, файлы
  // const [eventType, setEventType] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [files, setFiles] = React.useState<File[]>([]);

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (values) => {
    const res = await fetch("/api/organizer/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) router.push("/org/dashboard");
  };

  return (
    <section className="grid gap-8" data-test-id="page-org-new">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">Создание события</h1>
        <p className="text-muted-foreground">Заполните форму ниже, чтобы опубликовать событие</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><InfoIcon className="size-5" /> Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" placeholder="Введите название" {...form.register("title")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="short">Краткое описание</Label>
              <Textarea id="short" rows={3} placeholder="Краткое описание..." {...form.register("shortDescription")} />
            </div>
          </CardContent>
        </Card>

        {/* Venue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><MapPinIcon className="size-5" /> Площадка</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Тип площадки</Label>
              <Select value={venue} onValueChange={setVenue}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Выберите площадку" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Площадки</SelectLabel>
                    <SelectItem value="convention-center">Конгресс-центр</SelectItem>
                    <SelectItem value="hotel-ballroom">Зал отеля</SelectItem>
                    <SelectItem value="online">Онлайн</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Локация</Label>
              <Input id="location" placeholder="Город/место" {...form.register("location")} />
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><CalendarIcon className="size-5" /> Даты</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Начало</Label>
              <Input type="datetime-local" {...form.register("dateStart")} />
            </div>
            <div className="space-y-2">
              <Label>Окончание (опц.)</Label>
              <Input type="datetime-local" {...form.register("dateEnd")} />
            </div>
          </CardContent>
        </Card>

        {/* Params */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><UsersIcon className="size-5" /> Параметры</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Цена</Label>
              <Input type="number" placeholder="Цена" {...form.register("price", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Вместимость</Label>
              <Input type="number" placeholder="Вместимость" {...form.register("capacity", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        {/* Подробное описание + Теги и изображения */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><TagIcon className="size-5" /> Подробности, теги и изображения</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>Подробное описание</Label>
              <EditorJs onChange={(data) => form.setValue("longDescription", data)} />
            </div>
            <div className="space-y-2">
              <Label>Предпросмотр (безопасный)</Label>
              <Card>
                <CardContent className="pt-0 text-sm">
                  <EditorPreview data={form.watch("longDescription")} />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-2">
              <Label>Теги</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((t) => (
                  <span key={t} className="rounded-md border px-2 py-1 text-xs">
                    {t}
                    <Button type="button" variant="link" size="sm" className="ml-2 h-auto p-0 text-muted-foreground" onClick={() => setSelectedTags(selectedTags.filter((x) => x !== t))}>×</Button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Добавить тег и Enter" onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val) { setSelectedTags((p) => Array.from(new Set([...p, val]))); (e.target as HTMLInputElement).value=''; } }
                }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><ImageIcon className="size-4" /> Изображения</Label>
              <Input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
              {files.length > 0 && <div className="text-sm text-muted-foreground">Выбрано файлов: {files.length}</div>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Сохранить как черновик</Button>
          <Button type="submit">Создать событие</Button>
        </div>
      </form>
    </section>
  );
}


