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

export interface ServiceColorTheme {
  swatch: string;
  bg: string;
}

const themeCache = new Map<string, ServiceColorTheme>();

export function getServiceTheme(serviceUuid?: string, serviceName?: string, serviceColor?: string): ServiceColorTheme {
  const identifier = serviceUuid || serviceName || '';
  const cacheKey = serviceColor ? `${identifier}_${serviceColor}` : identifier;

  if (!cacheKey) {
    return {
      swatch: 'hsl(0, 0%, 45%)',
      bg: 'hsl(0, 0%, 96%)',
    };
  }

  if (themeCache.has(cacheKey)) {
    return themeCache.get(cacheKey)!;
  }

  let theme: ServiceColorTheme;
  if (serviceColor && serviceColor.startsWith('#')) {
    theme = {
      swatch: serviceColor,
      bg: serviceColor + '1a',
    };
  } else {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = (hash << 5) - hash + identifier.charCodeAt(i);
      hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    theme = {
      swatch: `hsl(${hue}, 65%, 42%)`,
      bg: `hsl(${hue}, 65%, 96%)`,
    };
  }

  themeCache.set(cacheKey, theme);
  return theme;
}

export function getServiceColor(serviceUuid?: string, serviceName?: string, serviceColor?: string): string {
  return getServiceTheme(serviceUuid, serviceName, serviceColor).swatch;
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
