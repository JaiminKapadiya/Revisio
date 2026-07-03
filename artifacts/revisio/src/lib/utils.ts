import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const REVISION_DAYS = [1, 3, 7, 15, 30, 60];

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function scheduleRevisionDates(startDate: Date): string[] {
  // Day 1 = today (offset 0), Day 3 = +2 days, etc. — subtract 1 so first revision shows immediately
  return REVISION_DAYS.map((day) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + day - 1);
    return localDateStr(d);
  });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getTodayStr(): string {
  return localDateStr(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return localDateStr(d);
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr();
}

export function isMissed(dateStr: string): boolean {
  return dateStr < getTodayStr();
}
