import { OrgHeader } from "@/components/org/OrgHeader";
import { OrgSubnav } from "@/components/org/OrgSubnav";

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
      <OrgSubnav slug={orgSlug} />
      <div>{children}</div>
    </div>
  );
}


