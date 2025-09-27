import type { Metadata } from "next";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";

export const metadata: Metadata = {
  title: "Регистрация — AquaStream",
  description: "Регистрация выполняется у OAuth2 провайдера.",
  robots: { index: false },
};
export default function Page() {
  return (
    <Center maxWidth="sm">
      <Stack gap="sm" align="center" className="text-center">
        <h1 className="text-xl font-semibold">Регистрация</h1>
        <p className="text-sm text-muted-foreground">Регистрация выполняется на стороне OAuth2 провайдера.</p>
      </Stack>
    </Center>
  );
}

