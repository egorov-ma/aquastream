import { RecoveryFlow } from "@/components/auth/RecoveryFlow";
import { Section } from "@/components/ui/section";

export default function RecoveryPage() {
  return (
    <Section data-test-id="page-auth-recovery" width="3xl" gap="md">
      <h1 className="text-xl font-semibold">Восстановление доступа</h1>
      <RecoveryFlow />
    </Section>
  );
}

