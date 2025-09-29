export const revalidate = 60;
export const dynamic = "force-static";

import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizerGridSkeleton } from "@/components/organizers/OrganizerGridSkeleton";
import { HomeCatalog } from "@/components/home/HomeCatalog";
import type { ApiResponse } from "@/components/home/HomeCatalog";
import { Section } from "@/components/ui/section";

const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
// RSC: нельзя ssr:false, поэтому оставляем обычный Suspense в клиентском компоненте

export const metadata: Metadata = {
  title: "AquaStream — главная",
  description: "Каталог организаторов и событий. Запись и оплата участия.",
};

export default async function HomePage() {
  let initialData: ApiResponse | undefined;
  if (useMocks) {
    const { defaultOrganizers } = await import("@/shared/static-home");
    initialData = { items: defaultOrganizers.slice(0, 6), total: defaultOrganizers.length };
  }
  return (
    <Section data-test-id="page-home" width="5xl" gap="md">
      <h1 className="text-2xl font-semibold [contain:content]">Каталог организаторов</h1>
      <Suspense fallback={<OrganizerGridSkeleton /> }>
        <HomeCatalog initialData={initialData} initialPage={1} initialQ="" />
      </Suspense>
    </Section>
  );
}
