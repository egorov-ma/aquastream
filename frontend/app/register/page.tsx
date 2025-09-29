import type { Metadata } from "next";
import { Center } from "@/components/ui/center";
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Регистрация — AquaStream",
  description: "Регистрация выполняется у OAuth2 провайдера.",
  robots: { index: false },
};
export default function Page() {
  return (
    <Center maxWidth="sm">
      <PageHeader className="w-full text-center">
        <PageHeaderHeading className="mx-auto">Регистрация</PageHeaderHeading>
        <PageHeaderDescription>Регистрация выполняется на стороне OAuth2 провайдера.</PageHeaderDescription>
      </PageHeader>
    </Center>
  );
}

