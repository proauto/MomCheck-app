export function gestWeekFromWeek(week: number): number {
  return Math.min(Math.max(week, 4), 42);
}