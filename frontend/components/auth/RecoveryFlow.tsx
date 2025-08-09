"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

type Method = "telegram" | "backup";

const initSchema = z.object({
  method: z.enum(["telegram", "backup"]),
  identifier: z.string().min(3, "Минимум 3 символа"),
});

const verifySchema = z.object({
  code: z.string().min(4, "Минимум 4 символа"),
});

const resetSchema = z.object({
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Должны быть буквы и цифры"),
});

export function RecoveryFlow() {
  const router = useRouter();
  const [step, setStep] = React.useState<"init" | "verify" | "reset">("init");
  const [method, setMethod] = React.useState<Method>("telegram");
  const [token, setToken] = React.useState<string>("");

  // INIT
  const initForm = useForm<z.infer<typeof initSchema>>({ resolver: zodResolver(initSchema), defaultValues: { method: "telegram" } });
  // VERIFY
  const verifyForm = useForm<z.infer<typeof verifySchema>>({ resolver: zodResolver(verifySchema) });
  // RESET
  const resetForm = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  const submitInit: Parameters<typeof initForm.handleSubmit>[0] = async (values) => {
    const res = await fetch("/api/auth/recovery/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      const data = (await res.json()) as { token: string };
      setToken(data.token);
      setMethod(values.method);
      setStep("verify");
    }
  };

  const submitVerify: Parameters<typeof verifyForm.handleSubmit>[0] = async (values) => {
    const res = await fetch("/api/auth/recovery/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, token, method }),
    });
    if (res.ok) setStep("reset");
  };

  const submitReset: Parameters<typeof resetForm.handleSubmit>[0] = async (values) => {
    const res = await fetch("/api/auth/recovery/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, token }),
    });
    if (res.ok) router.push("/auth/login");
  };

  return (
    <div className="max-w-md">
      {step === "init" && (
        <Card>
          <CardHeader>
            <CardTitle>Восстановление доступа</CardTitle>
            <CardDescription>Выберите способ и укажите идентификатор</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={initForm.handleSubmit(submitInit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Способ</Label>
                <Select value={initForm.watch("method")} onValueChange={(v) => initForm.setValue("method", v as Method)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите способ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Способ восстановления</SelectLabel>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="backup">Резервный код</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="identifier">Имя пользователя или @telegram</Label>
                <Input id="identifier" {...initForm.register("identifier")} />
                {initForm.formState.errors.identifier && (
                  <p className="text-sm text-destructive">{initForm.formState.errors.identifier.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full">Продолжить</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === "verify" && (
        <Card>
          <CardHeader>
            <CardTitle>Подтверждение</CardTitle>
            <CardDescription>
              {method === "telegram" ? "Введите код из Telegram" : "Введите один из резервных кодов"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={verifyForm.handleSubmit(submitVerify)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Код</Label>
                <Input id="code" {...verifyForm.register("code")} />
                {verifyForm.formState.errors.code && (
                  <p className="text-sm text-destructive">{verifyForm.formState.errors.code.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep("init")}>Назад</Button>
                <Button type="submit" className="flex-1">Продолжить</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === "reset" && (
        <Card>
          <CardHeader>
            <CardTitle>Новый пароль</CardTitle>
            <CardDescription>Минимум 8 символов, буквы и цифры</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={resetForm.handleSubmit(submitReset)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" type="password" {...resetForm.register("password")} />
                {resetForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep("verify")}>Назад</Button>
                <Button type="submit" className="flex-1">Сбросить</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


