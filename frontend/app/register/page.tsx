import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация — AquaStream",
  description: "Регистрация выполняется у OAuth2 провайдера.",
  robots: { index: false },
};
export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="grid gap-4 text-center">
          <h1 className="text-xl font-semibold">Регистрация</h1>
          <p className="text-sm text-muted-foreground">Регистрация выполняется на стороне OAuth2 провайдера.</p>
        </div>
      </div>
    </div>
  );
}


