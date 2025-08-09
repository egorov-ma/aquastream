"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <section data-test-id="page-auth-login" className="max-w-sm space-y-4">
      <h1 className="text-xl font-semibold">Вход</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Input autoComplete="username" placeholder="Имя пользователя" {...register("username")} />
          {errors.username && (
            <p className="mt-1 text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>
        <div>
          <Input type="password" autoComplete="current-password" placeholder="Пароль" {...register("password")} />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          Войти
        </Button>
      </form>
    </section>
  );
}


