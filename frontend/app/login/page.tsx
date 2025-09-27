import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { Center } from "@/components/ui/center";

export const metadata: Metadata = {
  title: "Вход — AquaStream",
  description: "Войдите через OAuth2 провайдера или демо-форму для dev.",
  robots: { index: false },
};

export default function Page() {
  return (
    <Center maxWidth="sm">
      <LoginForm />
    </Center>
  );
}

