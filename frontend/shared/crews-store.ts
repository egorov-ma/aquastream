export type GroupType = "crew" | "boat" | "tent";

export type Participant = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  eventId: string;
  type: GroupType;
  name: string;
  capacity: number;
  memberIds: string[];
};

type EventKey = string; // eventId

const participantsByEvent = new Map<EventKey, Map<string, Participant>>();
const groupsByEvent = new Map<EventKey, Map<string, Group>>();

function ensureEvent(eventId: string) {
  if (!participantsByEvent.has(eventId)) {
    // seed some demo participants
    const map = new Map<string, Participant>();
    for (let i = 1; i <= 20; i++) {
      const id = `p_${i.toString().padStart(2, "0")}`;
      map.set(id, { id, name: `Участник ${i}` });
    }
    participantsByEvent.set(eventId, map);
  }
  if (!groupsByEvent.has(eventId)) {
    groupsByEvent.set(eventId, new Map());
  }
}

export function listParticipants(eventId: string): Participant[] {
  ensureEvent(eventId);
  return Array.from(participantsByEvent.get(eventId)!.values());
}

export function listGroups(eventId: string, type?: GroupType): Group[] {
  ensureEvent(eventId);
  let arr = Array.from(groupsByEvent.get(eventId)!.values());
  if (type) arr = arr.filter((g) => g.type === type);
  // sort by name
  return arr.sort((a, b) => a.name.localeCompare(b.name));
}

export function getGroup(eventId: string, groupId: string): Group | null {
  ensureEvent(eventId);
  return groupsByEvent.get(eventId)!.get(groupId) ?? null;
}

export function createGroup(eventId: string, data: { type: GroupType; name: string; capacity: number }): Group {
  ensureEvent(eventId);
  const id = `g_${Math.random().toString(36).slice(2, 8)}`;
  const group: Group = { id, eventId, type: data.type, name: data.name, capacity: Math.max(0, data.capacity), memberIds: [] };
  groupsByEvent.get(eventId)!.set(id, group);
  return group;
}

export function updateGroup(eventId: string, id: string, patch: Partial<Pick<Group, "name" | "capacity" >>): Group | null {
  ensureEvent(eventId);
  const cur = groupsByEvent.get(eventId)!.get(id);
  if (!cur) return null;
  const next: Group = { ...cur, ...patch, capacity: patch.capacity != null ? Math.max(0, patch.capacity) : cur.capacity };
  groupsByEvent.get(eventId)!.set(id, next);
  return next;
}

export function deleteGroup(eventId: string, id: string): boolean {
  ensureEvent(eventId);
  return groupsByEvent.get(eventId)!.delete(id);
}

export function assignMember(eventId: string, groupId: string, participantId: string): { ok: boolean; reason?: string; group?: Group } {
  ensureEvent(eventId);
  const group = groupsByEvent.get(eventId)!.get(groupId);
  if (!group) return { ok: false, reason: "not_found" };
  if (group.memberIds.includes(participantId)) return { ok: true, group };
  if (group.memberIds.length >= group.capacity) return { ok: false, reason: "capacity_exceeded" };
  group.memberIds = [...group.memberIds, participantId];
  groupsByEvent.get(eventId)!.set(groupId, group);
  return { ok: true, group };
}

export function unassignMember(eventId: string, groupId: string, participantId: string): { ok: boolean; group?: Group } {
  ensureEvent(eventId);
  const group = groupsByEvent.get(eventId)!.get(groupId);
  if (!group) return { ok: false };
  group.memberIds = group.memberIds.filter((id) => id !== participantId);
  groupsByEvent.get(eventId)!.set(groupId, group);
  return { ok: true, group };
}

export function summarizeByType(eventId: string) {
  ensureEvent(eventId);
  const byType: Record<GroupType, { groups: number; used: number; capacity: number }> = {
    crew: { groups: 0, used: 0, capacity: 0 },
    boat: { groups: 0, used: 0, capacity: 0 },
    tent: { groups: 0, used: 0, capacity: 0 },
  };
  for (const g of listGroups(eventId)) {
    const s = byType[g.type];
    s.groups += 1;
    s.used += g.memberIds.length;
    s.capacity += g.capacity;
  }
  return byType;
}


