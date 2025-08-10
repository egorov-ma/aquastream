export type Brand = {
  name?: string;
  description?: string;
  logoUrl?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const brand: Brand = { name: "", description: "", logoUrl: "" };
const team = new Map<string, TeamMember>();
const faq = new Map<string, FaqItem>();

export function getBrand(): Brand {
  return { ...brand };
}

export function setBrand(patch: Partial<Brand>): Brand {
  Object.assign(brand, patch);
  return getBrand();
}

export function listTeam(): TeamMember[] {
  return Array.from(team.values());
}

export function addTeamMember(data: Omit<TeamMember, "id">): TeamMember {
  const id = `tm_${Math.random().toString(36).slice(2, 8)}`;
  const member: TeamMember = { id, ...data };
  team.set(id, member);
  return member;
}

export function updateTeamMember(id: string, patch: Partial<Omit<TeamMember, "id">>): TeamMember | null {
  const cur = team.get(id);
  if (!cur) return null;
  const next = { ...cur, ...patch };
  team.set(id, next);
  return next;
}

export function deleteTeamMember(id: string): boolean {
  return team.delete(id);
}

export function listFaq(): FaqItem[] {
  return Array.from(faq.values());
}

export function addFaqItem(data: Omit<FaqItem, "id">): FaqItem {
  const id = `fq_${Math.random().toString(36).slice(2, 8)}`;
  const item: FaqItem = { id, ...data };
  faq.set(id, item);
  return item;
}

export function updateFaqItem(id: string, patch: Partial<Omit<FaqItem, "id">>): FaqItem | null {
  const cur = faq.get(id);
  if (!cur) return null;
  const next = { ...cur, ...patch };
  faq.set(id, next);
  return next;
}

export function deleteFaqItem(id: string): boolean {
  return faq.delete(id);
}


