"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormValues = { username: string; password: string; role: "user" | "organizer" | "admin" };

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm<FormValues>({ defaultValues: { role: "user", username: "", password: "" } });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Вход в аккаунт</CardTitle>
          <CardDescription>Введите имя пользователя и пароль</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: values.username, password: values.password, role: values.role }),
                  });
                  if (res.ok) {
                    // локальное хранение токена как дублирующая стратегия (dev)
                    const data = await res.json();
                    try { sessionStorage.setItem("token", data.token); } catch {}
                    const target = values.role === "organizer" || values.role === "admin" ? "/org/dashboard" : "/dashboard";
                    router.push(target);
                    form.reset({ username: "", password: "", role: values.role });
                  } else {
                    const err = await res.json().catch(() => ({ error: "Ошибка соединения" }));
                    alert(err.error || "Ошибка авторизации");
                  }
                } catch {
                  alert("Ошибка соединения с сервером");
                }
              })}
            >
              <div className="flex flex-col gap-6">
                <FormField
                  name="username"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="grid gap-3">
                      <FormLabel>Имя пользователя</FormLabel>
                      <FormControl>
                        <Input autoComplete="username" disabled={form.formState.isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="grid gap-3">
                      <div className="flex items-center">
                        <FormLabel>Пароль</FormLabel>
                        <Link href="/auth/recovery" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">Забыли пароль?</Link>
                      </div>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" disabled={form.formState.isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  name="role"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="grid gap-3">
                      <FormLabel>Роль (dev)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Роль</SelectLabel>
                            <SelectItem value="user">Пользователь</SelectItem>
                            <SelectItem value="organizer">Организатор</SelectItem>
                            <SelectItem value="admin">Администратор</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-destructive" />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Входим..." : "Войти"}
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Нет аккаунта?{" "}
                <Link href="/auth/register" className="underline underline-offset-4">
                  Зарегистрируйтесь
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


