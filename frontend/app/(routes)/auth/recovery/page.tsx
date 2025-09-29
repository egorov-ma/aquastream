import { RecoveryFlow } from "@/components/auth/RecoveryFlow";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export default function RecoveryPage() {
  return (
    <Section data-test-id="page-auth-recovery" width="3xl" gap="md">
      <PageHeader>
        <PageHeaderHeading>Восстановление доступа</PageHeaderHeading>
        <PageHeaderDescription>Получите ссылку для сброса пароля и продолжайте работу.</PageHeaderDescription>
      </PageHeader>
      <RecoveryFlow />
    </Section>
  );
}

