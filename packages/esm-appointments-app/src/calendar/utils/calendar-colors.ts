export type CarbonTagType = 'blue' | 'cyan' | 'green' | 'gray' | 'magenta' | 'purple' | 'red' | 'teal' | 'warm-gray';

export const STATUS_TAG_TYPES: Readonly<Record<string, CarbonTagType>> = {
  Scheduled: 'blue',
  CheckedIn: 'teal',
  Completed: 'green',
  Missed: 'red',
  Cancelled: 'warm-gray',
  Requested: 'magenta',
} as const;

export const DEFAULT_STATUS_TAG_TYPE: CarbonTagType = 'gray';

const SERVICE_COLOR_PALETTE: ReadonlyArray<string> = [
  'var(--cds-blue-60)',
  'var(--cds-purple-60)',
  'var(--cds-teal-60)',
  'var(--cds-magenta-60)',
  'var(--cds-cyan-60)',
  'var(--cds-green-60)',
  'var(--cds-orange-60)',
  'var(--cds-cool-gray-60)',
] as const;

export function getServiceColor(serviceName: string): string {
  let hash = 0;
  for (let i = 0; i < serviceName.length; i++) {
    hash = (hash << 5) - hash + serviceName.charCodeAt(i);
    hash |= 0;
  }
  return SERVICE_COLOR_PALETTE[Math.abs(hash) % SERVICE_COLOR_PALETTE.length];
}

export const CALENDAR_HOURS: ReadonlyArray<number> = Array.from({ length: 24 }, (_, i) => i) as ReadonlyArray<number>;

export function formatHourLabel(hour: number): string {
  const h = hour % 12 || 12;
  const period = hour < 12 ? 'AM' : 'PM';
  return `${h} ${period}`;
}

export interface TimeBlock {
  label: string;
  startHour: number;
  endHour: number;
}

export const TIME_BLOCKS: ReadonlyArray<TimeBlock> = [
  { label: '12 AM – 6 AM', startHour: 0, endHour: 6 },
  { label: '6 AM – 12 PM', startHour: 6, endHour: 12 },
  { label: '12 PM – 6 PM', startHour: 12, endHour: 18 },
  { label: '6 PM – 12 AM', startHour: 18, endHour: 24 },
];
