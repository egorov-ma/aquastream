import { OrgHeader } from "@/components/org/OrgHeader";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <div className="space-y-4" data-test-id="org-layout">
      <OrgHeader slug={orgSlug} />
      <div>{children}</div>
    </div>
  );
}


