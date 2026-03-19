/**
 * calendar-constants.ts
 *
 * Shared visual constants for the improved appointments calendar.
 * Status colours match Carbon Design System accessibility guidelines.
 * Service colours cycle through a fixed palette when a service is not explicitly mapped.
 */

export interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
}

export const STATUS_STYLES: Record<string, StatusStyle> = {
  Scheduled: { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
  CheckedIn: { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  Completed: { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  Missed: { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
  Cancelled: { bg: '#fdf4ff', text: '#7e22ce', dot: '#a855f7' },
  Requested: { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
  WaitList: { bg: '#fefce8', text: '#854d0e', dot: '#eab308' },
};

/** Fallback status style when status string is not in the map */
export const DEFAULT_STATUS_STYLE: StatusStyle = STATUS_STYLES.Scheduled;

/**
 * A rotating palette of colours used to give each service a consistent hue.
 * The first N services encountered on a given day are assigned one of these.
 */
export const SERVICE_COLOR_PALETTE = [
  '#0ea5e9', // sky-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
];

/** Returns a deterministic colour for a service name by hashing its characters. */
export function getServiceColor(serviceName: string): string {
  let hash = 0;
  for (let i = 0; i < serviceName.length; i++) {
    hash = (hash << 5) - hash + serviceName.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % SERVICE_COLOR_PALETTE.length;
  return SERVICE_COLOR_PALETTE[idx];
}

/** Hours shown in weekly / daily views (7 AM – 6 PM by default). */
export const CALENDAR_HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7..18

/** Label for an hour number (e.g. 7 → "7 AM", 13 → "1 PM") */
export function formatHourLabel(hour: number): string {
  const h12 = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12} ${ampm}`;
}
