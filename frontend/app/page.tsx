export const revalidate = 60;

import { HomeCatalog } from "@/components/home/HomeCatalog";

export default function HomePage() {
  return (
    <section data-test-id="page-home" className="space-y-4">
      <HomeCatalog />
    </section>
  );
}
