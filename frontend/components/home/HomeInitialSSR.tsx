import { OrganizerGrid } from "@/components/organizers/OrganizerGrid";

export default async function HomeInitialSSR() {
  const origin = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const url = `${origin}/organizers?q=&page=1&pageSize=6`;
  let data: { items: { id: string; slug: string; name: string }[]; total: number } = { items: [], total: 0 };
  try {
    const res = await fetch(url, { cache: "force-cache", next: { revalidate: 60 } });
    if (res.ok) data = await res.json();
  } catch {}
  return <OrganizerGrid items={data.items} />;
}


