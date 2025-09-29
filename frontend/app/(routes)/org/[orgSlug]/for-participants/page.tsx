export const revalidate = 60;
export const metadata = { title: "FAQ организатора" };

import { FaqList } from "@/components/org/FaqList";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export default async function OrganizerFaqPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const { orgSlug } = params;
  void orgSlug;

  return (
    <Section data-test-id="page-org-faq" gap="md">
      <PageHeader>
        <PageHeaderHeading>FAQ для участников</PageHeaderHeading>
        <PageHeaderDescription>Ответы на популярные вопросы по организации.</PageHeaderDescription>
      </PageHeader>
      <FaqList />
    </Section>
  );
}
