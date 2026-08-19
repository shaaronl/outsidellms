export type ScheduleInterval = {
  id: string;
  name: string;
  startAt?: number;
  endAt?: number;
};

export type ScheduleConflict = {
  key: string;
  firstId: string;
  secondId: string;
  firstName: string;
  secondName: string;
  kind: "definite" | "possible";
  overlapMinutes?: number;
};

const UNKNOWN_DURATION_MS = 90 * 60 * 1000;

export function detectScheduleConflicts(items: ScheduleInterval[]): ScheduleConflict[] {
  const scheduled = items.filter((item) => Number.isFinite(item.startAt)).sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0));
  const conflicts: ScheduleConflict[] = [];
  for (let firstIndex = 0; firstIndex < scheduled.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < scheduled.length; secondIndex += 1) {
      const first = scheduled[firstIndex];
      const second = scheduled[secondIndex];
      const firstStart = first.startAt as number;
      const secondStart = second.startAt as number;
      const firstEnd = first.endAt;
      const secondEnd = second.endAt;
      const firstComparisonEnd = firstEnd ?? firstStart + UNKNOWN_DURATION_MS;
      if (secondStart >= firstComparisonEnd) break;
      const overlapEnd = Math.min(firstComparisonEnd, secondEnd ?? secondStart + UNKNOWN_DURATION_MS);
      if (overlapEnd <= secondStart) continue;
      const [firstId, secondId] = [first.id, second.id].sort();
      conflicts.push({
        key: `${firstId}:${secondId}`,
        firstId: first.id,
        secondId: second.id,
        firstName: first.name,
        secondName: second.name,
        kind: firstEnd !== undefined && secondEnd !== undefined ? "definite" : "possible",
        overlapMinutes: firstEnd !== undefined && secondEnd !== undefined ? Math.ceil((overlapEnd - secondStart) / 60_000) : undefined,
      });
    }
  }
  return conflicts;
}
