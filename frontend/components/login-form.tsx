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
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
  role: z.enum(["user", "organizer", "admin"]),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "user" } });

  const onSubmit: Parameters<typeof handleSubmit>[0] = async (values) => {
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input id="username" autoComplete="username" {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Пароль</Label>
                  <Link
                    href="/auth/recovery"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                </div>
                <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  Войти
                </Button>
              </div>
              <div className="grid gap-3">
                <Label>Роль (dev)</Label>
                <Select value={watch("role")} onValueChange={(v) => setValue("role", v as FormValues["role"])}>
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
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Нет аккаунта?{" "}
              <Link href="/auth/register" className="underline underline-offset-4">
                Зарегистрируйтесь
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


