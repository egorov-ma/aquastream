import { RecoveryFlow } from "@/components/auth/RecoveryFlow";

export default function RecoveryPage() {
  return (
    <section data-test-id="page-auth-recovery" className="grid gap-4">
      <h1 className="text-xl font-semibold">Восстановление доступа</h1>
      <RecoveryFlow />
    </section>
  );
}


