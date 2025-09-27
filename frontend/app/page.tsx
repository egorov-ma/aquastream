export const revalidate = 60;
export const dynamic = "force-static";

import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizerGridSkeleton } from "@/components/organizers/OrganizerGridSkeleton";
import { HomeCatalog } from "@/components/home/HomeCatalog";
import { defaultOrganizers } from "@/shared/static-home";
import { Section } from "@/components/ui/section";
// RSC: нельзя ssr:false, поэтому оставляем обычный Suspense в клиентском компоненте

export const metadata: Metadata = {
  title: "AquaStream — главная",
  description: "Каталог организаторов и событий. Запись и оплата участия.",
};

export default async function HomePage() {
  const initialData = { items: defaultOrganizers.slice(0, 6), total: defaultOrganizers.length };
  return (
    <Section data-test-id="page-home" width="wide" gap="md">
      <h1 className="text-2xl font-semibold [contain:content]">Каталог организаторов</h1>
      <Suspense fallback={<OrganizerGridSkeleton /> }>
        <HomeCatalog initialData={initialData} initialPage={1} initialQ="" />
      </Suspense>
    </Section>
  );
}
