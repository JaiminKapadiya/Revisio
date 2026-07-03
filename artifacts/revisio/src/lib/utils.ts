import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const REVISION_DAYS = [1, 3, 7, 15, 30, 60];

export function scheduleRevisionDates(startDate: Date): string[] {
  return REVISION_DAYS.map((day) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + day);
    return d.toISOString().split("T")[0];
  });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr();
}

export function isMissed(dateStr: string): boolean {
  return dateStr < getTodayStr();
}
