"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  phone: z
    .string()
    .min(6, "Укажите телефон")
    .regex(/^[0-9+()\s-]+$/, "Только цифры и символы +()-"),
  telegram: z
    .string()
    .regex(/^$|^@?[a-zA-Z0-9_]{5,32}$/i, "Логин Telegram, например @nickname"),
  extra: z.string().max(200).optional(),
  verified: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm() {
  const [loading, setLoading] = React.useState(false);
  const [verified, setVerified] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", telegram: "", extra: "", verified: false },
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as FormValues;
        if (!cancelled) {
          form.reset(data);
          setVerified(Boolean(data.verified));
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [form]);

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const saved = (await res.json()) as FormValues;
        form.reset(saved);
        setVerified(Boolean(saved.verified));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Профиль</CardTitle>
        <Badge variant={verified ? "default" : "secondary"} data-test-id="profile-status">
          {verified ? "Verified" : "Unverified"}
        </Badge>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 max-w-md">
            <FormField name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input placeholder="+7 (999) 123-45-67" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-destructive" />
              </FormItem>
            )} />
            <FormField name="telegram" render={({ field }) => (
              <FormItem>
                <FormLabel>Telegram</FormLabel>
                <FormControl>
                  <Input placeholder="@nickname" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-destructive" />
              </FormItem>
            )} />
            <FormField name="extra" render={({ field }) => (
              <FormItem>
                <FormLabel>Доп. информация</FormLabel>
                <FormControl>
                  <Input placeholder="Комментарий" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-destructive" />
              </FormItem>
            )} />
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Подключить бота Telegram:</span>
              <a className="text-primary underline" href="https://t.me/aquastream_bot" target="_blank" rel="noreferrer">
                @aquastream_bot
              </a>
            </div>
            <div>
              <Button type="submit" disabled={loading} data-test-id="profile-save">
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


