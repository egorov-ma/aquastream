export const revalidate = 60;

import { HomeCatalog } from "@/components/home/HomeCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AquaStream — главная",
  description: "Каталог организаторов и событий. Запись и оплата участия.",
};

export default function HomePage() {
  return (
    <section data-test-id="page-home" className="space-y-4">
      <HomeCatalog />
    </section>
  );
}
