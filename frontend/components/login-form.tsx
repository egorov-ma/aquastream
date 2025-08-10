"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
  role: z.enum(["user", "organizer", "admin"]),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "user" } });

  const onSubmit = async (values: FormValues) => {
      const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
      if (res.ok) {
        if (values.role === "organizer" || values.role === "admin") {
          router.push("/org/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Вход в аккаунт</CardTitle>
          <CardDescription>Введите имя пользователя и пароль</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  name="username"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="grid gap-3">
                      <FormLabel>Имя пользователя</FormLabel>
                      <FormControl>
                        <Input autoComplete="username" {...field} />
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
                        <Input type="password" autoComplete="current-password" {...field} />
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
                    Войти
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


