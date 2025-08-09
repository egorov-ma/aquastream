export const revalidate = 60;
import { FaqList } from "@/components/org/FaqList";

export default async function OrganizerFaqPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  await params;
  return (
    <section data-test-id="page-org-faq">
      <FaqList />
    </section>
  );
}


