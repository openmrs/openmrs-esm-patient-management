import {
  Checkmark,
  CheckmarkFilled,
  CloseFilled,
  Help,
  Pending,
  TimeFilled,
  type CarbonIconType,
} from '@carbon/react/icons';

export type CarbonTagType = 'blue' | 'cyan' | 'green' | 'gray' | 'magenta' | 'purple' | 'red' | 'teal' | 'warm-gray';

export const STATUS_TAG_TYPES: Readonly<Record<string, CarbonTagType>> = {
  Scheduled: 'blue',
  CheckedIn: 'teal',
  Completed: 'green',
  Missed: 'red',
  Cancelled: 'warm-gray',
  Requested: 'magenta',
} as const;

export const STATUS_TAG_ICONS: Readonly<Record<string, CarbonIconType>> = {
  Scheduled: TimeFilled,
  CheckedIn: Pending,
  Completed: CheckmarkFilled,
  Missed: CloseFilled,
  Cancelled: Checkmark,
  Requested: Help,
} as const;

export const DEFAULT_STATUS_TAG_TYPE: CarbonTagType = 'gray';

const SERVICE_COLOR_PALETTE: ReadonlyArray<string> = [
  'var(--cds-support-info)',
  'var(--cds-support-success)',
  'var(--cds-support-error)',
  'var(--cds-support-warning)',
  'var(--cds-interactive)',
  'var(--cds-link-primary)',
  'var(--cds-ai-aura-start)',
  'var(--cds-focus)',
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
